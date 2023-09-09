import express from "express";
const router = express.Router();
import { 
    addProject, 
    getProjects, 
    getProject, 
    updateProject, 
    deleteProject, 
    addColumn } 
    from "../controllers/projectsControllers.js";
import checkAuth from "../middleware/checkAuth.js";

// Rutas Privadas
router.route('/').post(checkAuth, addProject).get(checkAuth, getProjects);
router.route('/:id').get(checkAuth, getProject).put(checkAuth, updateProject).delete(checkAuth, deleteProject);
router.route('/columns').post(checkAuth, addColumn);

export default router;