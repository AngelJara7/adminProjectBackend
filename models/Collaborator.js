import mongoose from "mongoose";

const collaboratorSchema = mongoose.Schema({
    proyecto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rol: {
        type: String,
        enum: ['Administrador', 'Colaborador'],
        default: 'Administrador',
        required: true
    }
});

collaboratorSchema.index({ proyecto: 1, usuario: 1 }, { unique: true });

const Collaborator = mongoose.model('Collaborator', collaboratorSchema);

export default Collaborator;