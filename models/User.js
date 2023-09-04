import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generateID from "../helpers/generateID.js";

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
        default: generateID()
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

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.checkPassword = async function(formPassword) {
    return await bcrypt.compare(formPassword, this.password);
}

const User = mongoose.model('User', userSchema);
export default User;