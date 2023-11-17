import express from "express";
const router = express.Router();
import {
    register,
    confirmAccount,
    authenticate,
    profile, 
    editProfile, 
    changePassword,
    checkToken, 
    newPassword,
    updatePassword,
    savePhoto, } 
    from "../controllers/userControllers.js";
import checkAuth from "../middleware/checkAuth.js";
import upload from "../libs/multer.js";

// Rutas Públicas
router.post('/register', register);
router.get('/confirm-account/:token', confirmAccount);
router.post('/login', authenticate);
router.post('/reset-password', changePassword);

router.route('/reset-password/:token').get(checkToken).post(newPassword);

// Rutas Privadas
router.get('/profile', checkAuth, profile);

// Pendiente
router.put('/profile', checkAuth, editProfile);

router.put('/upload-img', checkAuth, upload.single('image'), savePhoto);

router.put('/update-password', checkAuth, updatePassword);

export default router;