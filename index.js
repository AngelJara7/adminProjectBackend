import express  from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import columnRoutes from "./routes/columnRoutes.js";

const app = express();

app.use(express.json());

dotenv.config();

connectDB();

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/columns', columnRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log('Servidor iniciado en el puerto: ' + PORT);
});