import mongoose from "mongoose";

const columnSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    proyecto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }
});

const Column = mongoose.model('Column', columnSchema);
export default Column;