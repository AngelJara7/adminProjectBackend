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
            },
            // tareas: [
            //     {
            //         type: mongoose.Schema.Types.ObjectId,
            //         ref: 'Task'
            //     }
            // ]
        },
    ],
    colaboradores: [
        // {
        //     usuario: {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: 'User',
        //         required: true
        //     },
        //     rol: {
        //         type: String,
        //         enum: ['Administrador', 'Colaborador'],
        //         default: 'colaborador',
        //         required: true
        //     }
        // }
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collaborator'
        }
    ],
    tareas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ],
    creacion: {
        type: Date,
        default: new Date()
    },
});

projectSchema.index({ usuario: 1, nombre: 1 }, { unique: true });
projectSchema.index({ usuario: 1, nombre: 1, "columnas.nombre": 1 }, { unique: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;