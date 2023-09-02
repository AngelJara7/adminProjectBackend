import express  from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(express.json());

dotenv.config();

connectDB();

app.use('/api/register', userRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log('Servidor iniciado en el puerto: ' + PORT);
});