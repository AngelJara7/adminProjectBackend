import express from "express";
const router = express.Router();
import {
    register,
    confirm,
    authenticate } 
    from "../controllers/userControllers.js";

// Rutas Públicas
router.post('/', register);
router.get('/confirmar/:token', confirm);
router.post('/login', authenticate);

// Rutas Privadas

export default router;