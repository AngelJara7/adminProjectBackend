import express from "express";
const router = express.Router();
import { 
    addProject, 
    getProjects, 
    getProject, 
    updateProject, 
    deleteProject, 
    addColumn, 
    updateColumn, 
    deleteColumn, 
    projectTasks } 
    from "../controllers/projectsControllers.js";
import checkAuth from "../middleware/checkAuth.js";

// Rutas Privadas
router.route('/').post(checkAuth, addProject).get(checkAuth, getProjects);
router.route('/:id_project').get(checkAuth, getProject).put(checkAuth, updateProject).delete(checkAuth, deleteProject);
router.route('/tasks/:_id').get(checkAuth, projectTasks);

router.route('/columns').post(checkAuth, addColumn);
router.route('/columns/:id_column').put(checkAuth, updateColumn).delete(checkAuth, deleteColumn);

export default router;