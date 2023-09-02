import express from "express";
const router = express.Router();
import {
    register
} from "../controllers/userControllers.js";

router.post('/', register);

export default router;