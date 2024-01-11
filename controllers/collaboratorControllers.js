import mongoose from "mongoose";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Collaborator from "../models/Collaborator.js";

const searchCollaborator = async (req, res) => {

    try {
        const users = await User.find({ 
            email: 
            {
                $regex: req.query.email || '', $options: 'i' 
            }
        }).limit(5).select("-password -verificada -token -__v");
        
        if (!users) {
            return res.status(400).json('Usuario no encontrado');
        }
        
        res.status(200).json(users);
        
    } catch (error) {
        console.log(error);
    }
    
}

const addCollaborator = async (req, res) => {
    
    try {
        const project = await Project.findById(req.body.proyecto);
        
        if (!project) {
            return res.status(400).json('Proyecto no encontrado');
        }
        
        if (project.usuario.toString() !== req.user._id.toString()) {
            return res.status(400).json('No esta autorizado para realizar esta acción');
        }
        
        const user = await User.findOne({ email: req.body.usuario }).select(
            "-password -verificada -token -foto -__v");
        
        if (!user) {
            return res.status(400).json('Usuario no encontrado');
        }
        
        const collaborator = await Collaborator.findOne({ 
            proyecto: new mongoose.Types.ObjectId(project._id),
            usuario: new mongoose.Types.ObjectId(user._id) 
        });

        if (collaborator) {
            return res.status(400).json(`El usuario '${user.email}' ya pertenece al proyecto`);
        }

        const newCollaborator = await Collaborator.create({
            proyecto: project._id,
            usuario: user._id,
            rol: req.body.rol
        });

        project.colaboradores.push(newCollaborator);

        await project.save();
        return res.status(200).json(`El usuario '${user.email}' ha sido agregado al proyecto '${project.nombre}'`);

    } catch (error) {
        return res.status(500).json('Algo salio mal, no se pudo agregar al colaborador');
    }

}

const updateCollaborator = async(req, res) => {
    
    try {
        const project = await Project.findById(req.body.proyecto);
        if (!project) {
            return res.status(400).json('Proyecto no encontrado');
        }

        if (project.usuario.toString() !== req.user.id.toString()) {
            return res.status(400).json('No esta autorizado para realizar esta acción');
        }

        if (!project.colaboradores.find(colaborador => colaborador.toString() === req.params.id_collaborator.toString())) {
            return res.status(400).json(`El usuario '${req.body.usuario.email}' no pertenece al proyecto`);
        }

        const collaborator = await Collaborator.findById(req.params.id_collaborator);

        if (!collaborator) {
            return res.status(400).json('Colaborador no encontrado');
        }

        if (req.body.rol === 'Colaborador') {
            const collaborator = await Collaborator.findOne({ usuario: project.usuario });
            
            await Task.updateMany({ usuario: req.params.id_collaborator }, { $set: { usuario: collaborator._id } });
        }

        collaborator.rol = req.body.rol;

        await collaborator.save();
        return res.status(200).json(`Se ha cambiado el rol del usuario '${req.body.usuario.email}'`);
    } catch (error) {
        return res.status(500).json(error);
    }
}

const deleteColaborator = async (req, res) => {
    
    const collaborator = await Collaborator.findById(req.params.id_collaborator)
        .populate('usuario', '-password -verificada -token -foto -__v');

    if (!collaborator) {
        return res.status(400).json('Colaborador no encontrado');
    }

    const project = await Project.findById(collaborator.proyecto);

    if (!project) {
        return res.status(400).json('Proyecto no encontrado');
    }

    if (project.usuario.toString() === collaborator.usuario._id.toString()) {
        return res.status(400).json('El creador del proyecto no puede ser eliminado del mismo');
    }

    if (project.usuario.toString() !== req.user._id.toString()) {
        return res.status(400).json('No esta autorizado para realizar esta acción');
    }
    
    if (!project.colaboradores.find(colaborador => colaborador.toString() === req.params.id_collaborator.toString())) {
        return res.status(400).json(`El usuario '${collaborator.usuario.email}' no pertenece al proyecto`);
    }

    project.colaboradores.pull(req.params.id_collaborator);

    await Promise.allSettled([await project.save(), await collaborator.deleteOne()]);
    return res.status(200).json(`Se ha eliminado a '${collaborator.usuario.email}' del proyecto '${project.nombre}'`);
}

export {
    searchCollaborator,
    addCollaborator,
    updateCollaborator,
    deleteColaborator,
}