import express from "express";
const router = express.Router();
import {
    register,
    confirmAccount,
    authenticate,
    profile, 
    changePassword,
    checkToken, 
    newPassword, } 
    from "../controllers/userControllers.js";
import checkAuth from "../middleware/checkAuth.js";

// Rutas Públicas
router.post('/register', register);
router.get('/confirm-account/:token', confirmAccount);
router.post('/login', authenticate);
router.post('/password-reset', changePassword);

router.route('/password-reset/:token').get(checkToken).post(newPassword);

// Rutas Privadas
router.get('/profile', checkAuth, profile);

export default router;