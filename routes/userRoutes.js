import express from "express";
const router = express.Router();
import {
    register,
    confirm,
    authenticate,
    profile } 
    from "../controllers/userControllers.js";
import checkAuth from "../middleware/checkAuth.js";

// Rutas Públicas
router.post('/', register);
router.get('/confirmar/:token', confirm);
router.post('/login', authenticate);

// Rutas Privadas
router.get('/perfil', checkAuth, profile);

export default router;