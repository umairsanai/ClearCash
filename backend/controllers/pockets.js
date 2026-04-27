import pool from "../database.js";
import { AppError, handleAsyncError } from "../error.js";

export const createPocket = handleAsyncError(async (req, res, next) => {

    let {pocket_name, pocket_limit, color} = req.body;
    
    if (!pocket_name || !pocket_limit || !color)
        return next(new AppError("Please provide all the required details to create a pocket.", 400));
    
    pocket_name = pocket_name.trim();

    if ((await pool.query("SELECT pocket_id FROM pockets WHERE user_id=$1 AND pocket_name=$2", [req.user.user_id, pocket_name])).rows.length)
        return next(new AppError("You have already a pocket with that name. Please provide a unique name", 400));

    const data = (await pool.query("INSERT INTO pockets (user_id, pocket_name, pocket_limit, color) VALUES ($1, $2, $3, $4) RETURNING pocket_id, pocket_name, pocket_balance, pocket_limit, color", [req.user.user_id, pocket_name, pocket_limit, color])).rows[0];

    res.status(200).json({
        status: "success",
        data
    });
});

export const udpatePocket = handleAsyncError(async (req, res, next) => {
    let {new_pocket_name, old_pocket_name, new_pocket_limit, new_color} = req.body;
    
    if (!new_pocket_name || !old_pocket_name || !new_pocket_limit || !new_color)
        return next(new AppError("Please provide all the required details to update this pocket.", 400));
    
    new_pocket_name = new_pocket_name.trim();
    old_pocket_name = old_pocket_name.trim();

    if ((await pool.query("SELECT pocket_id FROM pockets WHERE user_id=$1 AND pocket_name=$2", [req.user.user_id, new_pocket_name])).rows.length)
        return next(new AppError("You have already a pocket with that name. Please provide a unique name", 400));

    (await pool.query("UPDATE pockets SET pocket_name=$3, pocket_limit=$4, color=$5 WHERE user_id=$1 AND pocket_name=$2", [req.user.user_id, old_pocket_name, new_pocket_name, new_pocket_limit, new_color]));

    res.status(200).json({
        status: "success"
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
        2. Delete pocket        
    */
    (await pool.query(`BEGIN; UPDATE pockets SET pocket_balance=pocket_balance+${pocket.balance} WHERE user_id=${req.user.user_id} AND pocket_name='Main'; DELETE FROM pockets WHERE user_id=${req.user.user_id} AND pocket_id=${req.params.pocket_id}; COMMIT`));
    
    res.sendStatus(204);
});