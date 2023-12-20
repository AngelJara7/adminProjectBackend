import express from "express";
const router = express.Router();
import { 
    addTask,  
    getTask, 
    updateTask, 
    deleteTask } 
    from "../controllers/taskControllers.js";
import checkAuth from "../middleware/checkAuth.js";

// Rutas privadas
router.route('/').post(checkAuth, addTask);
router.route('/:id_task').get(checkAuth, getTask).put(checkAuth, updateTask);
router.route('/:id_task').delete(checkAuth, deleteTask);

export default router;