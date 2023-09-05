import jwt from "jsonwebtoken";
import User from "../models/user.js";

const checkAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decored = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decored.id).select('-password -token -verificada');

            return next();

        } catch (error) {
            return res.json({ status: 403, msg: 'Token no válido' });
        }
    }

    if (!token) {
        return res.json({ status: 403, msg: 'Sesión no válida' });
    }

    next();
};

export default checkAuth;