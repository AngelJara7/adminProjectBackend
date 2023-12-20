import Project from "../models/Project.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Funciones para administrar Proyectos
const addProject = async (req, res) => {
    
    const projecteExist = await Project.findOne({ usuario: req.user._id, nombre: req.body.nombre });

    if (projecteExist) {
        return res.status(400).json(`El proyecto '${req.body.nombre}' ya existe`);
    }

    try {
        const project = new Project(req.body);
        project.usuario = req.user._id;
        project.columnas = [ // Columnas se agregan al proyecto por defecto
            { nombre: 'Por hacer' },
            { nombre: 'En curso' },
            { nombre: 'Finalizada' }
        ];

        await project.save();

        return res.status(200).json('Proyecto creado');
    } catch (error) {
        return res.status(500).json('Algo salió mal, no se pudo crear el proyecto');
    }
}

const getProjects = async (req, res) => {
    
    try {
        // const projects = await Project.aggregate([
        //     {
        //         $match: { 
        //             $or: [
        //                 { usuario: new mongoose.Types.ObjectId(req.user._id) }, 
        //                 { colaboradores: new mongoose.Types.ObjectId(req.user._id) }
        //             ],
        //             nombre: { 
        //                 $regex: req.query.project || '', $options: 'i'
        //             }
        //         }
        //     }, {
        //         $lookup: {
        //             from: 'users', 
        //             localField: 'usuario', 
        //             foreignField: '_id', 
        //             as: 'user'
        //         }
        //     }, {
        //         $project: {
        //             _id: "$_id",
        //             nombre: '$nombre', 
        //             clave: '$clave', 
        //             descripcion: '$descripcion', 
        //             fecha: '$fecha_creacion',
        //             usuario: {
        //                 _id: '$user._id', 
        //                 nombre: '$user.nombre', 
        //                 email: '$user.email'
        //             }
        //         }
        //     }
        // ]).sort({ _id: 1 });

        const projects = await Project.find({
            $or: [
                { usuario: new mongoose.Types.ObjectId(req.user._id) },
                { 'colaboradores.usuario': new mongoose.Types.ObjectId(req.user._id) }
            ],
            nombre: {
                $regex: req.query.id_project || '', $options: 'i'
            }
        }).populate('usuario', '_id nombre email foto').sort({ _id: 1 })
        .select('_id nombre descripcion usuario clave');
        
        return res.status(200).json(projects);
        
    } catch (error) {
        console.log({ error });
        return res.status(500).json('Ocurrio un error al obtener los proyectos');
    }

}

const getProject = async (req, res) => {
    
    try {
        const project = await Project.findOne({ nombre: req.params.id_project })
            .populate('usuario', '_id nombre email foto')
            // .populate({ path: 'tareas', select: '-__v', populate: [
            //     { path: 'usuario', select: '_id nombre email foto' },
            //     { path: 'responsable', select: '_id nombre email foto' },
            // ]})
            .populate({
                path:'colaboradores', 
                populate: { path: 'usuario', select: '_id nombre email foto' }
            })
            .populate({
                path: 'columnas', populate: {
                    path: 'tareas', populate: [
                        { path: 'usuario', select: '_id nombre email foto' }, 
                        { path: 'responsable', select: '_id nombre email foto' },
                    ]
                },
            })
            .populate({
                path: 'tareas', populate: [
                    { path: 'usuario', select: '_id nombre email foto' }, 
                    { path: 'responsable', select: '_id nombre email foto' },
                ] 
            })
            .select('-__v');

        if (!project) {
            return res.status(400).json('Proyecto no encontrado');
        }
    
        if (project.usuario._id.toString() !== req.user._id.toString() &&
            !project.colaboradores.some(
                colaborador => colaborador.usuario._id.toString() === req.user._id.toString()
            )) {
            return res.status(400).json('Acción no válida');
        }

        res.status(200).json(project);

    } catch (error) {
        console.log({error});
        res.status(500).json('Algó salio mal');
    }

}

const updateProject = async (req, res) => {
    const { id_project } = req.params;
    const { nombre, clave, descripcion } = req.body;
    
    // Obtener todas los proyectos de un usuario
    const projects = await Project.find({ usuario: req.user._id }).sort({ _id: 1 });
    let cont = 0;
    
    /* Evitar duplicados en los nombre de los proyectos por usuario.
      Se compara el nombre del prpyecto y su id. de ser cierta la comparacion significa 
      que ya existe un proyecto con el mismo nombre y no se puede cambiar el nombre del proyecto indicada */
    while (cont < projects.length) {
        
        if (projects[cont].nombre.toUpperCase() === nombre.toUpperCase() 
        && projects[cont]._id.toString() !== id_project.toString()) {
            return res.json({ status: 403, msg: `Ya existe un proyecto registrado con este nombre` });
        }
        cont ++;
    }

    // Verifica si el proyecto existe por su id
    const project = await Project.findById(req.params.id_project);
    
    if (!project) {
        return res.json({ status: 403, msg: 'Sin resultados' });
    }

    //  Verifica si el id usuario del proyecto coincide con el id de usuario logueado
    if (project.usuario._id.toString() !== req.user._id.toString()) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    project.nombre = nombre;
    project.clave = clave;
    project.descripcion = descripcion;

    try {
        const updateProject = await project.save();

        return res.json({ status: 200, msg: updateProject });
    } catch (error) {
        return res.json({ status: 500, msg: error, projects });
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
        await project.deleteOne();
        res.status(200).json('Proyecto eliminado');
    } catch (error) {
        return res.jstatu(500).json('Algó salio mal, no se pudo eliminar el proyecto');
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

    // *columna que guardara las tareas existentes de la columna a eliminar
    const replaceColumn = project.columnas.find(columna => columna.id === req.body.columna);

    if (!replaceColumn) {
        return res.status(400).json('Algo solio mal, no hemos podido eliminar la columna. Intentalo de nuevo');
    }
    
    replaceColumn.tareas = replaceColumn.tareas.concat(deleteColumn.tareas);

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
    }).select("-password -verificada -token -foto -__v");
    
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
        
        if (project.usuario.toString() !== req.user._id.toString() &&
            !project.colaboradores.some(
                colaborador => colaborador.usuario._id.toString() === req.user._id.toString()
                && colaborador.rol === 'Administrador'
            )) {
            return res.status(400).json('No esta autorizado para realizar esta acción');
        }
        
        const user = await User.findOne({ email: req.body.email }).select(
            "-password -verificada -token -foto -__v");
        
        if (!user) {
            return res.status(400).json('Usuario no encontrado');
        }
        
        if (project.usuario.toString() === user._id.toString()) {
            return res.status(400).json('El creador del proyecto no puede ser un colaborador');
        }
        
        if (project.colaboradores.find(colaborador => colaborador.usuario.toString() === user._id.toString())) {
            return res.status(400).json(`El usuario '${user.email}' ya pertenece al proyecto`);
        }
        
        project.colaboradores.push({ usuario: user, rol: req.body.rol });
        // project.colaboradores.push(user);
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

// Funciones para administrar Tareas por Columnas y Proyectos
const projectTasks = async (req, res) => {
    const projects = await Project.aggregate([
        {
            $lookup: {
                from: 'tasks', 
                localField: '_id', 
                foreignField: 'proyecto', 
                as: 'projectTasks'
            }
        }, {
            $match: {
                _id: new mongoose.Types.ObjectId(req.params.id_project), usuario: req.user._id
            }
        }
    ]);

    return res.json({ status: 200, msg: projects });
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
    projectTasks
};