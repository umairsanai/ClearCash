import express from "express";
import passport from "passport";
import { login, logout, protect, signup, authenticateUserAfterOAuth } from "../controllers/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/google/login", passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    session: false 
}));
router.get("/google/verify", passport.authenticate('google', { 
    failureRedirect: '/', 
    session: false 
}), authenticateUserAfterOAuth);

export default router;