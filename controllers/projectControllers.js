import mongoose from "mongoose";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Collaborator from "../models/Collaborator.js";

// Funciones para administrar Proyectos
const addProject = async (req, res) => {
    
    const projectExist = await Project.findOne({ usuario: req.user._id, nombre: req.body.nombre });

    if (projectExist) {
        return res.status(400).json(`El proyecto '${req.body.nombre}' ya existe`);
    }

    try {
        const newProject = new Project(req.body);
        newProject.usuario = req.user._id;
        
        newProject.columnas = [
            { nombre: 'Por hacer' },
            { nombre: 'En curso' },
            { nombre: 'Finalizada' }
        ];

        const collaborator = await Collaborator.create({
            proyecto: newProject,
            usuario: req.user,
            rol: 'Administrador'
        });

        newProject.colaboradores.push(collaborator);

        const project = await newProject.save();

        return res.status(200).json(`Se ha agregado el proyecto '${project.nombre}' correctamente`);
    } catch (error) {
        return res.status(500).json('Algo salió mal, no se pudo crear el proyecto');
    }
}

const getProjects = async (req, res) => {
    
    try {

        // const collaborator = await Collaborator.findOne({ usuario: req.user });
        
        // const projects = await Project.find({
        //     $or: [
        //         { usuario: { $in: req.user._id } },
        //         { 'colaboradores': req.user._id  }
        //     ],
        //     nombre: {
        //         $regex: req.query.id_project || '', $options: 'i'
        //     }
        // }).populate('usuario', '_id nombre email foto')
        // .populate('colaboradores').sort({ _id: 1 })
        // .select('_id nombre descripcion usuario clave');
        const projects = await Project.aggregate([
            {
                $lookup: {
                    from: 'collaborators', 
                    localField: 'colaboradores', 
                    foreignField: '_id', 
                    as: 'colaboradores'
                }
            }, {
              $match: {
                $or: [
                  { usuario: req.user._id }, 
                  { 'colaboradores.usuario': req.user._id }
                ]
              }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'usuario',
                    foreignField: '_id',
                    as: 'usuario'
                }
            }, {
              $project: {
                _id: 1, 
                nombre: 1, 
                descripcion: 1, 
                clave: 1,
                'usuario._id': 1,
                'usuario.nombre': 1,
                'usuario.email': 1,
                'usuario.foto': 1
              }
            }, { $unwind: '$usuario' }
          ]);
        
        return res.status(200).json(projects);
        
    } catch (error) {
        return res.status(500).json('Ocurrió un error al obtener los proyectos');
    }

}

const getProject = async (req, res) => {
    
    try {
        const project = await Project.findById(req.params.id_project)
            .populate('usuario', '_id nombre email foto')
            .populate({
                path:'colaboradores', 
                populate: { path: 'usuario', select: '_id nombre email foto' }
            })
            .populate({
                path: 'tareas', populate: [
                    { 
                        path: 'usuario', populate: { 
                            path: 'usuario', select: '_id nombre email foto' 
                        } 
                    }, { 
                        path: 'responsable', populate: { 
                            path: 'usuario', select: '_id nombre email foto' 
                        } 
                    },
                ] 
            }).select('-__v');

            
        if (!project) {
            return res.status(400).json('Proyecto no encontrado');
        }
            
        const collaborator = await Collaborator.findOne({ usuario: req.user, proyecto: project._id });
        
        if (project.usuario._id.toString() !== req.user._id.toString() &&
            !project.colaboradores.some(
                colaborador => colaborador._id.toString() === collaborator._id.toString()
            )) {
            return res.status(400).json('Acción no válida');
        }

        res.status(200).json(project);

    } catch (error) {
        res.status(500).json('Algó salio mal');
    }
    
}

const updateProject = async (req, res) => {
    
    try {

        const project = await Project.findById(req.params.id_project);
        
        if (!project) {
            return res.status(400).json('Proyecto no encontrado');
        }

        const projectUser = await Project.find({ usuario: req.body.usuario._id });
        console.log('EXISTE', projectUser);
        if (projectUser.find(proyecto => proyecto._id === project._id && 
            proyecto.nombre === project.nombre && proyecto.usuario === project.usuario)) {
            return res.status(400).json(`El proyecto '${req.body.nombre}' ya existe `);
        }

        if (project.usuario._id.toString() !== req.user._id.toString()) {
            return res.status(400).json('No esta autorizado para realizar esta acción');
        }

        project.nombre = req.body.nombre || project.nombre;
        project.descripcion = req.body.descripcion || project.descripcion;
        project.clave = req.body.clave || project.clave;

        await project.save();

        return res.status(200).json('Se ha actualizado correctamente el proyecto');
    } catch (error) {
        return res.status(500).json('Algo salió mal, no se pudo actualizar el proyecto');
    }
}

const deleteProject = async (req, res) => {
    
    const project = await Project.findById(req.params.id_project);

    if (!project) {
        return res.status(404).json('El proyecyo indicado no existe');
    }

    if (project.usuario._id.toString() !== req.user._id.toString()) {
        return res.status(404).json('No está autorizado para realizar esta acción');
    }

    try {
        await Promise.allSettled([await Task.deleteMany({ proyecto: project._id }), await project.deleteOne()]);
        res.status(200).json(`Se ha eliminado el proyecto '${project.nombre}' correctamente`);
    } catch (error) {
        return res.status(500).json('Algó salio mal, no se pudo eliminar el proyecto');
    }
}

// Funciones para administrar Columnas por Proyecto
const addColumn = async (req, res) => {

    const project = await Project.findById(req.params.id_project);

    if (!project) {
        return res.status(400).json('Proyecto no encontrado');
    }

    if (project.usuario.toString() !== req.user.id.toString()) {
        return res.status(400).json('No esta autorizado para realizar esta acción');
    }

    if (project.columnas.some(e => e.nombre === req.body.nombre)) {
        return res.status(400).json(`La columna '${req.body.nombre}' ya existe`);
    }

    try {
        project.columnas.push({ nombre: req.body.nombre });
        await project.save();
        
        return res.status(200).json(`Se ha agregado la columna '${req.body.nombre}'`);
    } catch (error) {
        return res.status(500).json('Algo salio mal, no se pudo crear la columna');
    }
}

const updateColumn = async (req, res) => {

    const project = await Project.findById(req.params.id_project);

    if (!project) {
        return res.status(400).json('Proyecto no encontrado');
    }

    if (project.usuario.toString() !== req.user.id.toString()) {
        return res.status(400).json('No esta autorizado para realizar esta acción');
    }

    if (project.columnas.some(e => e.nombre === req.body.nombre)) {
        return res.status(400).json(`La columna '${req.body.nombre}' ya existe`);
    }

    if (project.columnas.some(columna => columna.nombre === req.body.nombre)) {
        return res.status(400).json(`La columna '${req.body.nombre}' ya existe en el proyecto '${project.nombre}'`);
    }

    try {
        const column = project.columnas.find(columna => columna.id === req.params.id_column);
        
        column.nombre = req.body.nombre;
        await project.save();
        
        return res.status(200).json(`Se ha cambiado el nombre de la columna en el proyecto '${project.nombre}'`);
    } catch (error) {
        return res.status(500).json('Algo solio mal, no se pudo cambiar el nombre de la columna');
    }
}

const deleteColumn = async (req, res) => {

    const project = await Project.findById(req.params.id_project);
    
    if (!project) {
        return res.status(400).json('Proyecto no encontrado');
    }

    const deleteColumn = project.columnas.find(columna => columna.id === req.params.id_column);
    
    if (!deleteColumn) {
        return res.status(400).json('Columna no encontrada');
    }

    const replaceColumn = project.columnas.find(columna => columna.id === req.body.columna);

    if (!replaceColumn) {
        return res.status(400).json('Algo solio mal, no hemos podido eliminar la columna. Intentalo de nuevo');
    }

    const tareas = await Task.updateMany({ 
        columna: req.params.id_column 
    }, { $set: { columna: replaceColumn._id }});

    try {
        project.columnas.pull(req.params.id_column);

        await project.save();
        return res.status(200).json(`Se ha eliminado la columna en el proyecto '${project.nombre}'`);
    } catch (error) {
        return res.status(500).json('Algo solio mal, no se pudo cambiar el nombre de la columna');
    }
}

const searchCollaborator = async (req, res) => {
    
    const users = await User.find({ 
        email: 
        {
            $regex: req.body.email || '', $options: 'i' 
        }
    }).limit(5).select("-password -verificada -token -__v");
    
    if (!users) {
        return res.status(400).json('Usuario no encontrado');
    }

    res.status(200).json(users);
}

const addCollaborator = async (req, res) => {

    try {
        const project = await Project.findById(req.params.id_project);
        
        if (!project) {
            return res.status(400).json('Proyecto no encontrado');
        }
        
        if (project.usuario.toString() !== req.user._id.toString()) {
            return res.status(400).json('No esta autorizado para realizar esta acción');
        }
        
        const user = await User.findOne({ email: req.body.email }).select(
            "-password -verificada -token -foto -__v");
        
        if (!user) {
            return res.status(400).json('Usuario no encontrado');
        }
        
        if (project.colaboradores.find(colaborador => colaborador.usuario.toString() === user._id.toString())) {
            return res.status(400).json(`El usuario '${user.email}' ya pertenece al proyecto`);
        }

        project.colaboradores.push({ usuario: user, rol: req.body.rol });
        const collaborator = new Collaborator({
            proyecto: project._id,
            usuario: user,
            rol: req.body.rol
        });
        const col = await collaborator.save();
        console.log('COLABORADOR: ',{ col });
        
        await project.save();
        return res.status(200).json(`El usuario '${user.email}' ha sido agregado al proyecto '${project.nombre}'`);
    } catch (error) {
        return res.status(500).json('Algo salio mal, no se pudo agregar al colaborador');
    }

}

const updateCollaborator = async(req, res) => {

    try {
        const project = await Project.findById(req.params.id_project);
        if (!project) {
            return res.status(400).json('Proyecto no encontrado');
        }

        if (project.usuario.toString() !== req.user.id.toString()) {
            return res.status(400).json('No esta autorizado para realizar esta acción');
        }

        const user = project.colaboradores.find(
            colaborador => colaborador.usuario._id.toString() === req.body.usuario._id.toString());
        if (!user) {
            return res.status(400).json(`El usuario '${req.body.usuario.email}' no pertenece al proyecto`);
        }
        
        user.rol = req.body.rol;
        await project.save();
        return res.status(200).json(`Se ha cambiado el rol del usuario '${req.body.usuario.email}'`);
    } catch (error) {
        return res.status(500).json(error);
    }
}

const deleteColaborator = async (req, res) => {
    
    const project = await Project.findById(req.params.id_project);

    if (!project) {
        return res.status(400).json('Proyecto no encontrado');
    }

    if (project.usuario.toString() === req.body.usuario._id.toString()) {
        return res.status(400).json('El creador del proyecto no puede ser eliminado del mismo');
    }

    if (project.usuario.toString() !== req.user._id.toString()) {
        return res.status(400).json('No esta autorizado para realizar esta acción');
    }

    const user = project.colaboradores.find(
        colaborador => colaborador.usuario._id.toString() === req.body.usuario._id.toString()
    );
    
    if (!user) {
        return res.status(400).json(`El usuario '${req.body.usuario.email}' no pertenece al proyecto`);
    }

    project.colaboradores.pull(user);
    await project.save();
    return res.status(200).json(`Se ha eliminado a '${req.body.usuario.email}' del proyecto '${project.nombre}'`);
}

export {
    addProject, 
    getProjects, 
    getProject, 
    updateProject, 
    deleteProject,
    addColumn, 
    updateColumn, 
    deleteColumn,
    searchCollaborator, 
    addCollaborator, 
    updateCollaborator, 
    deleteColaborator, 
};