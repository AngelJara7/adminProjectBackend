import mongoose from "mongoose";

const taskSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    asignacion: {
        type: Date,
        default: Date.now()
    },
    vencimiento: {
        type: Date,
        required: true,
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collaborator"
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collaborator"
    },
    proyecto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    columna: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project.columnas"
    }
});

taskSchema.index({ proyecto: 1, nombre: 1 }, { unique: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;