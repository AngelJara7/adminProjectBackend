import Project from "../models/Project.js";
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
            { nombre: 'Sin iniciar' },
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
        const projects = await Project.aggregate([
            {
              $match: { usuario: new mongoose.Types.ObjectId(req.user._id) }
            }, {
              $lookup: {
                from: 'users', 
                localField: 'usuario', 
                foreignField: '_id', 
                as: 'user'
              }
            }, {
              $project: {
                _id: "$_id",
                nombre: '$nombre', 
                clave: '$clave', 
                descripcion: '$descripcion', 
                fecha: '$fecha_creacion',
                usuario: {
                    _id: '$user._id', 
                    nombre: '$user.nombre', 
                    email: '$user.email'
                }
              }
            }
          ]).sort({ _id: 1 });
    
        return res.status(200).json(projects);
        
    } catch (error) {
        console.log({ error });
        return res.status(500).json('Ocurrio un error al obtener los proyectos');
    }

}

const getProject = async (req, res) => {
    
    const project = await Project.findById(req.params.id_project);
    
    if (!project) {
        return res.json({ status: 404, msg: 'Sin resultados' });
    }

    if (project.usuario._id.toString() !== req.user._id.toString()) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    res.json({ status: 200, msg: project });
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
        return res.json({ status: 403, msg: 'Sin resultados' });
    }

    if (project.usuario._id.toString() !== req.user._id.toString()) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    try {
        await project.deleteOne();
        res.json({ status: 200, msg: 'Proyecto eliminado' });
    } catch (error) {
        return res.json({ status: 500, msg: error });
    }
}

// Funciones para administrar Columnas por Proyecto
const addColumn = async (req, res) => {
    const { nombre } = req.body;

    // Verifica que el proyecto al que se agrega la columna existe
    const project = await Project.findById(req.params.id_project);

    if (!project) {
        return res.json({ status:403, msg: 'Sin resultados' });
    }

    // Verifica si el nombre de la columna que se agrega al proyecto existe
    if (project.columnas.some(e => e.nombre === nombre)) {
        return res.json({ status:403, msg: `La columna '${nombre}' ya existe` });
    }

    try {
        const newColumn = await Project.updateOne({ _id: id }, { $push: { columnas: { nombre } } });

        return res.json({ status: 200, msg: newColumn });
    } catch (error) {
        return res.json({ status: 500, msg: error });
    }
}

const updateColumn = async (req, res) => {
    const { id_column, id_project } = req.params;
    const { nombre } = req.body;

    const project = await Project.findById(id_project);
    const columnas = project.columnas;
    let cont = 0;
    // Verifica si el proyecto al que pertenece la columna existe
    if (!project) {
        return res.json({ status:403, msg: 'Sin resultados' });
    }
    // Verifica si el nombre de la columna que se actualiza existe dentro del proyecto
    // if (project.columnas.some(e => e.nombre === nombre) && project.columnas.some(e => e._id.toString() !== id_column.toString())) {
    //     return res.json({ status:403, msg: `La columna '${nombre}' ya existe en el Proyecto: ${project.nombre}`, project });
    // }
    
    while (cont < columnas.length) {
        if (columnas[cont].nombre.toUpperCase() === nombre.toUpperCase() 
        && columnas[cont]._id.toString() !== id_column.toString()) {
            return res.json({ status: 403, msg: `La columna ${nombre} ya existe`});
        }
        cont ++;
    }

    try {
        const updateColumn = await Project.updateOne(
            { _id: id_project, "columnas._id": id_column }, { $set: { "columnas.$.nombre": nombre } });
        
        return res.json({ status: 200, msg: updateColumn });
    } catch (error) {
        return res.json({ status: 500, msg: error });
    }
}

const deleteColumn = async (req, res) => {
    const { id_column, id_project } = req.params;

    const project = await Project.findById(id_project);
    
    // Verifica si el proyecto al que pertenece la columna existe
    if (!project) {
        return res.json({ status:403, msg: 'Sin resultados' });
    }
    // Verifica si el id de la columna que se actualiza existe dentro del proyecto
    if (!project.columnas.some(e => e.id === id_column)) {
        return res.json({ status:404, msg: `Sin resultados` });
    }

    try {
        const updateColumn = await Project.updateOne({ _id: id_project }, { $pull: { columnas: { _id: id_column } } });
        
        return res.json({ status: 200, msg: updateColumn });
    } catch (error) {
        return res.json({ status: 500, msg: error });
    }
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
    projectTasks
};