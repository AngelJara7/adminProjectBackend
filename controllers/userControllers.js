import User from "../models/User.js";
import emailRegistration from "../helpers/emailRegistration.js";
import generateID from "../helpers/generateID.js";
import generateJWT from "../helpers/generateJWT.js";
import passwordChangeRequest from "../helpers/passwordChangeRequest.js";

const register = async (req, res) => {
    const { nombre, email } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
        return res.status(400).json('Este e-mail ya está vínculado a otra cuenta');
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

        return res.status(200).json('Su cuenta ha sido creada, revise su e-mail');
    } catch (error) {
        return res.status(500).json(error);
    }
}

const confirmAccount = async (req, res) => {
    const { token } = req.params;
    const confirmUser = await User.findOne({ token });

    if (!confirmUser) {
        return res.status(404).json('Token no válido');
    }

    try {
        confirmUser.token = null;
        confirmUser.verificada = true;
        await confirmUser.save();
        
        res.status(200).json({
            nombre: confirmUser.nombre
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}

// Verifica las credenciales del usuario al iniciar sesión
const authenticate = async (req, res) => {
    const { email, password } = req.body;

    //Comprobar si el usuario esta registrado
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json('Email no registrado, registrese para acceder');
    }

    // Comprobar si la cuenta esta confirmada
    if (!user.verificada) {
        return res.status(400).json('No ha confirmado su cuenta');
    }

    // Revisar la contraseña
    if (await user.checkPassword(password)) {
        res.status(200).json({
            user: {
                _id: user._id,
                nombre: user.nombre,
                email: user.email,
                verificada: user.verificada,
                foto: user.foto,
            },
            token: generateJWT(user.id)
        });
    } else {
        res.status(400).json('Contraseña incorrecta');
    }
}

const profile = async (req, res) => {
    const { user } = req;
    const token = generateJWT(user.id);

    res.status(200).json({user, token});
}

const editProfile = async(req, res) => {
    const { _id, nombre, email } = req.body;

    const users = await User.find();
    
    let cont = 0;
    
    while (cont < users.length) {
        if (users[cont].email.toUpperCase() === email.toUpperCase() 
        && users[cont]._id.toString() !== _id.toString()) {
            return res.status(400).json(`El email '${email}' esta vinculado a otra cuenta`);
        }
        cont++;
    }

    const user = await User.findById(_id);

    if (!user) return res.status(400).json('Usuario no encontrado');

    user.nombre = nombre;
    user.email = email;

    try {
        const updateUser = await user.save();

        res.status(200).json('Perfil actualizado');
    } catch (error) {
        console.log({error});
        res.status().json('Algó salio mal, no se pudo actualizar el perfil');
    }
}

// Realiza la solicitud de cambio de contraseña si el usuario la olvido
const changePassword = async (req, res) => {
    const { email } = req.body;

    const userExists = await User.findOne({ email });
    
    if (!userExists) {
        return res.status(400).json('El email indicado no existe');
    }

    if(userExists.verificada === false) {
        return res.status(400).json('Su cuenta no ha sido verificada');
    }

    try {
        userExists.token = generateID();
        await userExists.save();

        // Email para cambiar contraseña
        passwordChangeRequest({
            email,
            nombre: User.nombre,
            token: userExists.token
        });

        res.status(200).json('Se ha enviado una solicitud de cambio de contraseña a su e-mail');
    } catch (error) {
        return res.status(500).json(error);
    }
}

// Verifica el token del usuario que realizo la solicitud de cambio de contraseña
const checkToken = async (req, res) => {
    const { token } = req.params;
    
    const validToken = await User.findOne({ token });
    
    if (validToken) {
        res.status(200).json(validToken.nombre);
    } else {
        res.status(404).json('Algo salio mal');
    }
}

const newPassword = async (req, res) => {
    const { token } = req.params;

    const { password } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
        return res.status(404).json('Algo salio mal');
    }

    if(user.verificada === false) {
        return res.status(400).json('Su cuenta no ha sido verificada');
    }

    try {
        user.token = null;
        user.password = password;
        await user.save();

        res.status(200).json('Se ha cambiado la contraseña');
    } catch (error) {
        return res.status(500).json(error);
    }
}

const updatePassword = async (req, res) => {
    const { id } = req.user;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
        return res.status(400).json('Usuario no encontrado');
    }

    if (await user.checkPassword(newPassword)) {
        return res.status(400).json('La nueva contraseña no puede ser igual que la actual contraseña');
    }

    if (await user.checkPassword(currentPassword)) {
        user.password = newPassword;
        await user.save();
        
        return res.status(200).json('Contraseña actualizada');
    } else {
        return res.status(400).json('Contraseña actual incorrecta');
    }

}

const savePhoto = async (req, res) => {

    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json('No se encontro al usuario');
    }

    req.file 
    ? user.foto = req.file.path 
    : user.foto = null;

    try {
        await user.save();

        return res.status(200).json('Imagen cambiada');
    } catch (error) {
        return res.ststus(500).json('Algó salio mal');
    }
}

export {
    register,
    confirmAccount,
    authenticate,
    profile,
    editProfile,
    changePassword,
    checkToken,
    newPassword,
    updatePassword,
    savePhoto
};