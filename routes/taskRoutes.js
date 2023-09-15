import express from "express";
const router = express.Router();
import { 
    addTask,  
    getTask, 
    getTasksByProject, 
    updateTask, 
    deleteTask } 
    from "../controllers/taskControllers.js";
import checkAuth from "../middleware/checkAuth.js";

// Rutas privadas
router.route('/:id_project/:id_column').post(checkAuth, addTask);
router.route('/:id_task/:id_project').get(checkAuth, getTask).put(checkAuth, updateTask);
router.route('/:id_task').delete(checkAuth, deleteTask);
router.route('/:id_project').get(checkAuth, getTasksByProject);

export default router;