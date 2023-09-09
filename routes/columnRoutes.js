import express from "express";
const router = express.Router();
import { addColumn } from "../controllers/columnControllers.js";
import checkAuth from "../middleware/checkAuth.js";

router.route('/').post(checkAuth, addColumn);

export default router;