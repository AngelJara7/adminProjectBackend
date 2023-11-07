import jwt from "jsonwebtoken";
import User from "../models/User.js";

const checkAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        
        try {
            token = req.headers.authorization.split(' ')[1];
            const decored = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decored.id).select('-password -token -verificada');

            return next();

        } catch (error) {
            return res.status(403).json('Token no válido');
        }
    }

    if (!token) {
        return res.status(403).json('Sesión no válida');
    }

    next();
};

export default checkAuth;