import express from "express";
const router = express.Router();
import { 
    addTask, 
    getTask, 
    updateTask } 
    from "../controllers/taskControllers.js";
import checkAuth from "../middleware/checkAuth.js";

// Rutas privadas
router.route('/').post(checkAuth, addTask);
router.route('/:id_task/:id_project').get(checkAuth, getTask).put(checkAuth, updateTask);

export default router;
