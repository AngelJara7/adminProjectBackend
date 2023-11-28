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
    addCollaborator, 
    projectTasks, } 
    from "../controllers/projectControllers.js";
import checkAuth from "../middleware/checkAuth.js";

// Rutas Privadas
router.route('/').post(checkAuth, addProject).get(checkAuth, getProjects);
router.route('/:id_project').get(checkAuth, getProject).put(checkAuth, updateProject).delete(checkAuth, deleteProject);
router.route('/tasks/:id_project').get(checkAuth, projectTasks);

router.route('/columns/:id_project').post(checkAuth, addColumn);
router.route('/columns/:id_column/:id_project').put(checkAuth, updateColumn).delete(checkAuth, deleteColumn);

router.route('/colaboradores/:id_project').post(checkAuth, addCollaborator);

export default router;