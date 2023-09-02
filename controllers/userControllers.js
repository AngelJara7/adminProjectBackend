import User from "../models/user.js";

const register = async (req, res) => {
    const { nombre, email, contraseña } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
        return res.json({ status: 400, msg: 'Ya existe un usuario con este E-mail' });
    }

    try {
        const user = new User(req.body);
        const userSave = await user.save();
        console.log(req.body);
        return res.json({ stats: 200, msg: req.body });
    } catch (error) {
        console.log(error);
    }
}

export {
    register
};