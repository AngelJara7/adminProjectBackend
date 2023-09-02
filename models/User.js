import mongoose from "mongoose";

const userSchema = mongoose.Schema({
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
    token: {
        type: String,
        default: null
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

const User = mongoose.model('User', userSchema);
export default User;