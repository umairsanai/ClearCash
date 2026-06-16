import pool from "../database.js";
import { AppError, handleAsyncError } from "../error.js";
import { fetchCurrentMonthNotifications } from "./notification.js";
import { fetchMe, fetchCurrentMonthTransactions } from "./users.js"

export const createPocket = handleAsyncError(async (req, res, next) => {

    let {pocket_name, pocket_limit, color} = req.body;
    
    if (!pocket_name || !pocket_limit || !color)
        return next(new AppError("Please provide all the required details to create a pocket.", 400));
    
    pocket_name = pocket_name.trim();

    if ((await pool.query("SELECT pocket_id FROM pockets WHERE user_id=$1 AND pocket_name=$2", [req.user.user_id, pocket_name])).rows.length)
        return next(new AppError("You have already a pocket with that name. Please provide a unique name", 400));

    const createdPocket = (await pool.query("INSERT INTO pockets (user_id, pocket_name, pocket_limit, color) VALUES ($1, $2, $3, $4) RETURNING pocket_id, pocket_name, pocket_balance, pocket_limit, color", [req.user.user_id, pocket_name, pocket_limit, color])).rows[0];
    
    await pool.query("INSERT INTO notifications (user_id, message) VALUES ($1, $2)", [req.user.user_id, `New Pocket Created: ${pocket_name}`]);

    const notifications = await fetchCurrentMonthNotifications(req.user.user_id);

    res.status(200).json({
        status: "success",
        data: {
            createdPocket,
            notifications
        }
    });
});

export const udpatePocket = handleAsyncError(async (req, res, next) => {
    let {old_pocket_name, new_pocket_name, new_pocket_limit, new_pocket_color} = req.body;
    
    if (!old_pocket_name || !new_pocket_name || !new_pocket_limit || !new_pocket_color)
        return next(new AppError("Please provide all the required details to update this pocket.", 400));
    
    new_pocket_name = new_pocket_name.trim();
    old_pocket_name = old_pocket_name.trim();

    if (old_pocket_name === 'Main')
        return next(new AppError("You can't edit Main pocket.", 400));

    const pocket = (await pool.query("SELECT pocket_name, pocket_balance, pocket_limit FROM pockets WHERE user_id=$1 AND pocket_name=$2", [req.user.user_id, old_pocket_name])).rows[0];
    
    if (!pocket) 
        return next(new AppError("The pocket you're trying to edit, doesn't exist.", 400));

    if (old_pocket_name !== new_pocket_name && (await pool.query("SELECT pocket_id FROM pockets WHERE user_id=$1 AND pocket_name=$2", [req.user.user_id, new_pocket_name])).rows.length)
        return next(new AppError("You have already a pocket with that name. Please provide a unique name", 400));

    if (pocket.pocket_balance > new_pocket_limit) 
        return next(new AppError("You can't have Pocket Limit less than your current Pocket Balance.", 400));

    const newPocket = (await pool.query("UPDATE pockets SET pocket_name=$3, pocket_limit=$4, color=$5 WHERE user_id=$1 AND pocket_name=$2 RETURNING pocket_name", [req.user.user_id, old_pocket_name, new_pocket_name, new_pocket_limit, new_pocket_color])).rows[0];

    await pool.query("INSERT INTO notifications (user_id, message) VALUES ($1, $2)", [req.user.user_id, `${newPocket.pocket_name} Pocket Updated!`]);

    const user = await fetchMe(req.user);

    res.status(200).json({
        status: "success",
        data: user
    });
});

export const deletePocket = handleAsyncError(async (req, res, next) => {    
    const pocket = (await pool.query("SELECT user_id, pocket_name AS name, pocket_balance AS balance FROM pockets WHERE pocket_id=$1", [req.params.pocket_id])).rows[0];

    if (!pocket) 
        return next(new AppError("This pocket doesn't exist!", 400));
    if (pocket.user_id !== req.user.user_id)
        return next(new AppError("You can't delete someone else's pocket BABY!", 401));
    if (pocket.name === "Main")
        return next(new AppError("You can't delete your 'Main' pocket!", 400));

    /*
        1. Transfer money to Main pocket
        2. Update Transactions, and Add them in Main Pocket 
        3. Delete pocket
        4. Create a notification for this pocket deletion.
    */

    try {
        await pool.query(`BEGIN; UPDATE pockets SET pocket_balance=pocket_balance+${pocket.balance} WHERE user_id=${req.user.user_id} AND pocket_name='Main'; UPDATE transactions SET sender_pocket_id=(SELECT pocket_id FROM pockets WHERE user_id=${req.user.user_id} AND pocket_name='Main') WHERE sender_pocket_id=${req.params.pocket_id}; DELETE FROM pockets WHERE user_id=${req.user.user_id} AND pocket_id=${req.params.pocket_id}; INSERT INTO notifications (user_id, message) VALUES (${req.user.user_id}, '${pocket.name} Pocket Deleted!'); COMMIT`);
    } catch (error) {
        console.log(error);
        await pool.query("ROLLBACK");
        return next(new AppError("Couldn't Delete Pocket.", 400));
    }

    const user  = await fetchMe(req.user);
    
    res.status(200).json({
        status: "success",
        data: user
    });
});

export const getAllUserPockets = handleAsyncError(async (req, res, next) => {
    const pockets = await fetchAllPockets(req.user.user_id);
    res.status(200).json({
        status: "success",
        data: pockets
    });
});

export async function fetchAllPockets(user_id) {
    let pockets = (await pool.query("SELECT pocket_id, pocket_name, pocket_balance, pocket_limit, color FROM pockets WHERE user_id=$1", [user_id])).rows;
    pockets = pockets.map(pocket => {
        if (pocket.pocket_name === "Main") 
            delete pocket.pocket_limit;
        return pocket;
    });
    return pockets;
}