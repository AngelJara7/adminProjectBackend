import mongoose from "mongoose";

const taskSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: true
    },
    asignacion: {
        type: Date,
        default: new Date()
    },
    vencimiento: {
        type: Date,
        required: true
    },
    usuario: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    proyecto: {
        type: String,
        required: true
    },
    columna: {
        type: Boolean,
        default: false
    }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;