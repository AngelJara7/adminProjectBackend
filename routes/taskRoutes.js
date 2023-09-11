import express from "express";
const router = express.Router();
import { addTask } from "../controllers/taskControllers.js";
import checkAuth from "../middleware/checkAuth.js";

router.route('/').post(checkAuth, addTask);

export default router;
