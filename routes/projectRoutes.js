import express from "express";
const router = express.Router();
import { addProject } from "../controllers/projectsControllers.js";
import checkAuth from "../middleware/checkAuth.js";

router.route('/').post(checkAuth, addProject);

export default router;