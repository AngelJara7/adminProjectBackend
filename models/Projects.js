import mongoose from "mongoose";

const projectsShcema = mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    nombre: {
        type: String,
        required: true
    },
    clave: {
        type: String,
        required: false
    },
    descripcion: {
        type: String,
        required: true
    },
    fecha_creacion: {
        type: Date,
        default: new Date()
    }
});

const Project = mongoose.model('Project', projectsShcema);

export default Project;