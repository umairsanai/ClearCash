import pool from "../database.js";
import { AppError, handleAsyncError } from "../error.js";
import { extractDate } from "../helpers.js";

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export const getMe = handleAsyncError(async (req, res, next) => {

    const user = {
        id: req.user.user_id,
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        total_balance: 0
    };
    user.pockets = (await pool.query(" SELECT pocket_id, pocket_name, pocket_balance, pocket_limit, color, SUM(pocket_balance) OVER ()::INT AS total_balance FROM pockets WHERE user_id=$1", [req.user.user_id])).rows;

    user.pockets = user.pockets.map(pocket => {
        user.total_balance = pocket.total_balance;
        delete pocket.total_balance
        if (pocket.pocket_name === "Main") delete pocket.pocket_limit;
        return pocket;
    });

    user.spendings = await getSpendings(req.user.user_id, extractDate(new Date(Date.now()- 6*MILLISECONDS_IN_A_DAY)), extractDate(new Date()));
    user.transactions = await getTransactions(req.user.user_id, 5);

    res.status(200).json({
        status: "success",
        data: {user}
    });
});

export const sendMoney = handleAsyncError(async (req, res, next) => {

    // Money will always be transferred to the Main pocket of the Recipient.

    let { sender_pocket_id, recipient_user_id, amount } = req.body;
    if (!recipient_user_id || !sender_pocket_id || !amount)
        return next(new AppError("Insufficient Data: Please provide complete data !", 400));    

    [sender_pocket_id, recipient_user_id, amount] = [sender_pocket_id, recipient_user_id, amount].map(i => +i);
    
    if (!Number.isInteger(amount) || !Number.isInteger(recipient_user_id) || !Number.isInteger(sender_pocket_id) || amount <= 0)
        return next(new AppError("Incorrect Amount!", 400));

    // Check if sender has that much money in that pocket.
    const sender_pocket = (await pool.query("SELECT user_id, pocket_balance FROM pockets WHERE user_id=$1 AND pocket_id=$2", [req.user.user_id, sender_pocket_id])).rows[0];
    
    if (!sender_pocket)
        return next(new AppError("Please provide a valid Pocket!", 400));
    if (sender_pocket.pocket_balance < amount) 
        return next(new AppError("Sorry! You have insufficient funds.", 400));
    
    // Check if recipient exists.
    const recipient_pocket = (await pool.query("SELECT pocket_id FROM pockets WHERE user_id=$1 AND pocket_name='Main'", [recipient_user_id])).rows[0];

    if (!recipient_pocket)
        return next (new AppError("The user you're trying to send money to, doesn't exist!", 400));

    /*
        1. Deduct funds from sender. 
        2. Transfer funds in Main pocket of the recipient.
        3. Create transaction record.        
    */

    (await pool.query(`BEGIN; UPDATE pockets SET pocket_balance=pocket_balance-${amount} WHERE user_id=${req.user.user_id} AND pocket_id=${sender_pocket_id}; UPDATE pockets SET pocket_balance=pocket_balance+${amount} WHERE user_id=${recipient_user_id} AND pocket_id=${recipient_pocket.pocket_id}; INSERT INTO transactions(sender_user_id, recipient_user_id, sender_pocket_id, amount) VALUES (${req.user.user_id}, ${recipient_user_id}, ${sender_pocket_id}, ${amount}); COMMIT`));

    res.status(200).json({
        status: "success"
    });
});

export const getCurrentMonthTransactions = handleAsyncError(async (req, res, next) => {
    const data = await getTransactions(req.user.user_id, 1000);
    res.status(200).json({
        status: "success",
        data,        
    });
});

export const getWeeklySpendings = handleAsyncError(async (req, res, next) => {

    // users/weekly-spendings?start_date=2026-04-20&end_date=2026-04-26

    const {start_date, end_date} = req.query;
    const spendings = await getSpendings(req.user.user_id, start_date, end_date);
    res.status(200).json({
        status: "success",
        data: spendings
    });    
});

export const findRecipient = handleAsyncError(async (req, res, next) => {
    const search = req.query?.search;
    const recipients = (await pool.query(`SELECT user_id, name, username, phone FROM users WHERE phone ILIKE '${`%${search}%`}' OR name ILIKE '${`%${search}%`}' OR username ILIKE '${`%${search}%@clearcash`}'`)).rows;
    res.status(200).json({
        status: "success",
        data: recipients
    });
});

export const transferMoneyToAnotherPocket = handleAsyncError(async (req, res, next) => {

    let { sender_pocket, receiver_pocket, amount } = req.body;

    if (!sender_pocket || !receiver_pocket || !amount || !Number.isInteger(sender_pocket) || !Number.isInteger(receiver_pocket) || !Number.isInteger(amount) || amount <= 0)
        return next(new AppError("Insufficient or Incorrect Query Data!", 400));

    // Do both pockets belong to logged in user?
    const pockets = (await pool.query("SELECT pocket_id, pocket_balance, pocket_limit FROM pockets WHERE pocket_id = ANY($2) AND user_id=$1", [req.user.user_id, [sender_pocket, receiver_pocket]])).rows;
    if (pockets.length !== 2) 
        return next(new AppError("Incorrect Pocket(s)!", 400));

    sender_pocket = pockets.find((pocket) => pocket.pocket_id === sender_pocket);
    receiver_pocket = pockets.find((pocket) => pocket.pocket_id === receiver_pocket);

    // Check balance from sender pocket.    
    if (sender_pocket.pocket_balance < amount)
        return next(new AppError("The pocket you're sending from, has not sufficient funds to transfer.", 400));
    
    // Check receiver pocket's limit
    if (receiver_pocket.pocket_limit - receiver_pocket.pocket_balance < amount)
        return next(new AppError("The pocket you're sending to, has not enough room left.", 400));

    // Transfer (With No Transaction Record)
    (await pool.query(`BEGIN; UPDATE pockets SET pocket_balance = pocket_balance - ${amount} WHERE pocket_id = ${sender_pocket.pocket_id}; UPDATE pockets SET pocket_balance = pocket_balance + ${amount} WHERE pocket_id = ${receiver_pocket.pocket_id}; COMMIT`))

    // Response.
    res.status(200).json({
        status: "success"
    });
});

async function getSpendings(user_id, start_date, end_date) {
    return (await pool.query("SELECT pocket_name, spending::INT FROM (SELECT sender_pocket_id AS pocket_id, SUM(amount) AS spending FROM transactions WHERE sender_user_id=$1 AND transaction_date >= $2 AND transaction_date <= $3 GROUP BY sender_pocket_id) AS sub_table INNER JOIN pockets ON sub_table.pocket_id=pockets.pocket_id", [user_id, start_date, end_date])).rows;
}

async function getTransactions(user_id, limit=500) {
    return (await pool.query("SELECT transaction_date::TEXT, pocket_name, CASE WHEN transactions.sender_user_id=$1 THEN -amount ELSE amount END AS transaction_amount, CASE WHEN transactions.sender_user_id=$1 THEN CONCAT('Send Money to ', recipient.name) ELSE CONCAT('Received Money from ', sender.name) END AS transaction_message FROM transactions INNER JOIN users recipient ON recipient.user_id = transactions.recipient_user_id INNER JOIN users sender ON sender.user_id = transactions.sender_user_id INNER JOIN pockets ON pockets.pocket_id=transactions.sender_pocket_id WHERE (transactions.sender_user_id=$1 OR transactions.recipient_user_id=$1) AND DATE_TRUNC('month', transactions.transaction_date)::DATE = DATE_TRUNC('month', CURRENT_DATE)::DATE ORDER BY transactions.transaction_date DESC LIMIT $2", [user_id, limit])).rows;
}
