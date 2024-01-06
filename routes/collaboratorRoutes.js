import express from "express";
const router = express.Router();
import {
    searchCollaborator,
    addCollaborator,
    updateCollaborator,
    deleteColaborator,
} from "../controllers/collaboratorControllers.js";
import checkAuth from "../middleware/checkAuth.js";

router.route('/').get(checkAuth, searchCollaborator).post(checkAuth, addCollaborator);
router.route('/:id_collaborator').put(checkAuth, updateCollaborator).delete(checkAuth, deleteColaborator);

export default router;