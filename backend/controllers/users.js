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

    // TODO: TEST THIS ROUTE !!!

    // Money will always be transferred to the Main pocket of the Recipient.

    const { sender_pocket_id, recipient_user_id, amount } = req.body;

    if (!recipient_user_id || !sender_pocket_id || !amount)
        return next(new AppError("Insufficient Data: Please provide complete data !", 400));    
    if (amount <= 0)
        return next(new AppError("Incorrect Amount !", 400));

    // Check if recipient has that much money in that pocket.
    const sender_pocket = (await pool.query("SELECT user_id, pocket_balance FROM pockets WHERE user_id=$1 AND pocket_id=$2", [req.user.user_id, sender_pocket_id])).rows[0];

    if (!sender_pocket)
        return next(new AppError("Please provide a valid Pocket!", 400));
    if (sender_pocket.pocket_balance < amount) 
        return next(new AppError("Sorry! You have insufficient funds.", 400));

    // Deduct funds from sender, and transfer funds in Main pocket of the recipient.
    (await pool.query("BEGIN; UPDATE pockets SET pocket_balance=pocket_balance-$3 WHERE user_id=$1 AND pocket_id=$2; UPDATE pockets SET pocket_balance=pocket_balance+$3 WHERE user_id=$4 AND pocket_name='Main'; COMMIT", [req.user.user_id, sender_pocket_id, amount, recipient_user_id]));

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

async function getSpendings(user_id, start_date, end_date) {
    return (await pool.query("SELECT pocket_name, spending::INT FROM (SELECT sender_pocket_id AS pocket_id, SUM(amount) AS spending FROM transactions WHERE sender_user_id=$1 AND transaction_date >= $2 AND transaction_date <= $3 GROUP BY sender_pocket_id) AS sub_table INNER JOIN pockets ON sub_table.pocket_id=pockets.pocket_id", [user_id, start_date, end_date])).rows;
}

async function getTransactions(user_id, limit=500) {
    return (await pool.query("SELECT transaction_date::TEXT, pocket_name, CASE WHEN transactions.sender_user_id=$1 THEN -amount ELSE amount END AS transaction_amount, CASE WHEN transactions.sender_user_id=$1 THEN CONCAT('Send Money to ', recipient.name) ELSE CONCAT('Received Money from ', sender.name) END AS transaction_message FROM transactions INNER JOIN users recipient ON recipient.user_id = transactions.recipient_user_id INNER JOIN users sender ON sender.user_id = transactions.sender_user_id INNER JOIN pockets ON pockets.pocket_id=transactions.sender_pocket_id WHERE (transactions.sender_user_id=$1 OR transactions.recipient_user_id=$1) AND DATE_TRUNC('month', transactions.transaction_date)::DATE = DATE_TRUNC('month', CURRENT_DATE)::DATE ORDER BY transactions.transaction_date DESC LIMIT $2", [user_id, limit])).rows;
}
