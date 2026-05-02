import { AppError, handleAsyncError } from "../error.js";
import pool from "../database.js";
import argon from "argon2";
import jwt from "jsonwebtoken";
import { INT_MAX } from "../helpers.js";

const signJwtToken = (email, username) => {
    return jwt.sign({ email, username }, process.env.JWT_SIGN_SECRET, {
        expiresIn: "7 days"
    });
}

const signTokenAndSetInCookie = (email, username, res) => {
    res.cookie("clearcash-login-token", signJwtToken(email, username), {
        httpOnly: true,
        sameSite: "strict",
        path: "/api",
        maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days
        secure: process.env.MODE === "prod"
    });
}

const hashPassword = async (password) => {
    try {
        return (await argon.hash(password, {
            hashLength: 32,
            type: argon.argon2id,
            secret: Buffer.from(process.env.PASSWORD_HASH_SECRET)
        }));
    } catch(err) {
        console.error("Error in hashing passwrod: \n", err);
        return err;
    }
}

const verifyPassword = async (actual_password, input_password) => {
    return await argon.verify(actual_password, input_password, {
        secret: Buffer.from(process.env.PASSWORD_HASH_SECRET)
    });
}

export const protect = handleAsyncError(async (req, res, next) => {
    const token = req.cookies["clearcash-login-token"];

    if (!token) 
        return next(new AppError("You're not logged in!", 401));

    const payload = jwt.verify(token, process.env.JWT_SIGN_SECRET);
    const user = (await pool.query("SELECT user_id, name, email, username, password_changed_at FROM users WHERE email=$1 AND username=$2", [payload.email, payload.username])).rows[0];

    if (!user)
        return next(new AppError("This user doesn't exist", 404));
    if (payload.iat*1000 <= user.password_changed_at)
        return next(new AppError("You have changed your password. Please log in again!", 401));
    
    req.user = user;
    next();
});


export const signup = handleAsyncError(async (req, res, next) => {
    let {name, email, username, phone, password} = req.body;

    if (!name || !email || !username || !password || !phone)
        return next(new AppError("Incomplete Data for Signup!", 400));
    
    username += '@clearcash';
    password = await hashPassword(password);

    const user_id = (await pool.query("INSERT INTO users (name, email, username, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING user_id", [name, email, username, phone, password])).rows[0].user_id;
    let pocket;
    try {
        pocket = (await pool.query("INSERT INTO pockets (user_id, pocket_name, pocket_limit, color) VALUES ($1, 'Main', $2, 'RED') RETURNING pocket_id, pocket_name, pocket_balance, color", [user_id, INT_MAX])).rows[0];
    } catch (err) {
        (await pool.query("DELETE FROM users WHERE user_id=$1", [user_id]));        
        throw err;
    }

    signTokenAndSetInCookie(email, username, res);
    res.status(200).json({
        status: "success",
        data: {
            name, email, username, pocket
        }
    });
});

export const login = handleAsyncError(async (req, res, next) => {
    let user = null;
    const {username: input_username, email: input_email, password: input_password} = req.body;

    if ((!input_email && !input_username) || !input_password) 
        return next(new AppError("Please provide complete credentials", 400));

    if (input_email)
        user = (await pool.query("SELECT name, username, email, password FROM users WHERE email=$1", [input_email])).rows[0];
    else
        user = (await pool.query("SELECT name, username, email, password FROM users WHERE username=$1", [input_username])).rows[0];

    if (!user || !await verifyPassword(user.password, input_password))
        return next(new AppError("Incorrect username/email or password!", 401));

    signTokenAndSetInCookie(user.email, user.username, res);
    
    res.status(200).json({
        status: "success",
        data: {
            name: user.name,
            email: user.email,
            username: user.username
        }
    });
});

export const logout = (req, res, next) => {
    res.cookie("clearcash-login-token", "", {
        sameSite: "strict",
        path: "/api",
        maxAge: 0
    });
    res.status(200).json({
        status: "success",
        message: "Logged out!"
    });
};