import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
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
    },
    descripcion: {
        type: String,
        required: true
    },
    columnas: [
        {
            nombre: {
                type: String,
                required: true
            }
        },
    ],
    fecha_creacion: {
        type: Date,
        default: new Date()
    },
});

projectSchema.index({ usuario: 1, nombre: 1 }, { unique: true });
projectSchema.index({ usuario: 1, nombre: 1, "columnas.nombre": 1 }, { unique: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;