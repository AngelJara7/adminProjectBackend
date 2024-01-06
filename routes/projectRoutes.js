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
    searchCollaborator, 
    addCollaborator, 
    updateCollaborator, 
    deleteColaborator, } 
    from "../controllers/projectControllers.js";
import checkAuth from "../middleware/checkAuth.js";

// Rutas Privadas
router.route('/').post(checkAuth, addProject).get(checkAuth, getProjects);
router.route('/:id_project').get(checkAuth, getProject).put(checkAuth, updateProject).delete(checkAuth, deleteProject);

router.route('/columns/:id_project').post(checkAuth, addColumn);
router.route('/columns/:id_column/:id_project').put(checkAuth, updateColumn).post(checkAuth, deleteColumn);

router.post('/collaborators', checkAuth, searchCollaborator);
router.post('/collaborators/:id_project', checkAuth, addCollaborator);
router.put('/collaborators/:id_project', checkAuth, updateCollaborator);
router.post('/delete-collaborator/:id_project', checkAuth, deleteColaborator);

export default router;