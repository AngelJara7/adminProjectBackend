import User from "../models/user.js";
import emailRegistration from "../helpers/emailRegistration.js";
import generateID from "../helpers/generateID.js";
import generateJWT from "../helpers/generateJWT.js";
import passwordChangeRequest from "../helpers/passwordChangeRequest.js";

const register = async (req, res) => {
    const { nombre, email, contraseña } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
        return res.json({ status: 400, msg: 'Ya existe un usuario con este E-mail' });
    }

    try {
        const user = new User(req.body);
        const userSave = await user.save();
        // Envia correo al usuario para que este confirme su cuenta
        emailRegistration({
            email,
            nombre,
            token: userSave.token
        });

        return res.json({ stats: 200, msg: userSave });
    } catch (error) {
        console.log(error);
    }
}

// Corregir la respuesta de error al confirmar cuenta
const confirmAccount = async (req, res) => {
    const { token } = req.params;
    const confirmUser = await User.findOne({ token });

    if (!confirmUser) {
        return res.json({ status: 404, msg: 'Token no válido' });
    }

    try {
        confirmUser.token = null;
        confirmUser.verificada = true;
        await confirmUser.save();
        
        res.json({ status: 200, msg: 'Cuenta confirmada' });
    } catch (error) {
        console.log(error);
    }
}

const authenticate = async (req, res) => {
    const { email, password } = req.body;

    //Comprobar si el usuario esta registrado
    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ status: 403, msg: 'No esta registrado, registrese para acceder'});
    }

    // Comprobar si la cuenta esta confirmada
    if (!user.verificada) {
        return res.json({ status: 403, msg: 'No has confirmado tu cuenta, revisa la bandeja entrada de tu email donde hemos enviado un mensaje para que confirmes tu cuenta.'});
    }

    // Revisar la contraseña
    if (await user.checkPassword(password)) {
        res.json({
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            token: generateJWT(user.id)
        });
    } else {
        res.json({ status: 403, msg: 'Contraseña incorrecta'});
    }
}

const profile = async (req, res) => {
    const { user } = req;
    res.json( user );
}

// Realiza la solicitud de cambio de contraseña si el usuario la olvido
const changePassword = async (req, res) => {
    const { email } = req.body;

    const userExists = await User.findOne({ email });

    if (!userExists) {
        return res.json({ status: 404, msg: 'El email indicado no existe.' });
    }

    try {
        userExists.token = generateID();
        await userExists.save();

        // Emial para cambiar contraseña
        passwordChangeRequest({
            email,
            nombre: User.nombre,
            token: userExists.token
        });

        res.json({ msg: 'Se ha envia un mensaje al email indicado con una solicitud de cambio de contraseña.' });
    } catch (error) {
        console.log(error);
    }
}

const checkToken = async (req, res) => {
    const { token } = req.params;
    
    const validToken = await User.findOne({ token });

    if (validToken) {
        res.json({ msg: 'Token válido' });
    } else {
        res.json({ status: 403, msg: 'Token no válido' });
    }
}

const newPassword = async (req, res) => {
    const { token } = req.params;

    const { password } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
        return res.json({ status: 403, msg: 'Algo salió mal' });
    }

    try {
        user.token = null;
        user.password = password;
        await user.save();

        res.json({ msg: 'Se ha cambiado la contraseña' });
    } catch (error) {
        console.log(error);
    }
}

export {
    register,
    confirmAccount,
    authenticate,
    profile,
    changePassword,
    checkToken,
    newPassword
};