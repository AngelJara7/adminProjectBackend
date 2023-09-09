import mongoose from "mongoose";

const taskSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    verificada: {
        type: Boolean,
        default: false
    },
    foto: {
        type: String,
        required: false
    }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;