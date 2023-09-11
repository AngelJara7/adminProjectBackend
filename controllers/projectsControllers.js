import Project from "../models/Projects.js";

const addProject = async (req, res) => {
    const { nombre } = req.body;
    const { _id } = req.user._id;
    
    const projectsExist = await Project.findOne({ usuario: _id, nombre });

    if (projectsExist) {
        return res.json({ status: 403, msg: `El proyecto '${req.body.nombre}' ya existe`, m: projectsExist });
    }

    try {
        const project = new Project(req.body);
        project.usuario = req.user._id;
        project.columnas = [
            { nombre: 'Sin iniciar' },
            { nombre: 'En curso' },
            { nombre: 'Finalizada' }
        ];

        const newProject = await project.save();

        res.json({ status: 200, msg: newProject });
    } catch (error) {
        console.log(error);
        return res.json(error);
    }
}

const getProjects = async (req, res) => {
    const projects = await Project.find().where('usuario').equals(req.user);
    res.json({ projects });
}

const getProject = async (req, res) => {
    const { id_project } = req.params;
    const project = await Project.findById(id_project);
    
    if (!project) {
        return res.json({ status: 404, msg: 'Sin resultados' });
    }

    if (project.usuario._id.toString() !== req.user._id.toString()) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    res.json({ status: 200, msg: project });
}

const updateProject = async (req, res) => {

    // Verifica si el proyecto exist por su nombre e id de usuario (evitar proyectos duplicados por usuario)
    const projectName = await Project.findOne({ nombre: req.body.nombre, usuario: req.user._id });

    if (projectName) {
        return res.json({ status: 403, msg: `El proyecto '${req.body.nombre}' ya existe`, project });
    }

    // Verifica si el proyecto existe por su id
    const project = await Project.findById(req.params.id_project);
    
    if (!project) {
        return res.json({ status: 403, msg: 'Sin resultados' });
    }

    //  Verifica si el id usuario del proyecto coincide con el id de usuario logueado
    if (project.usuario._id.toString() !== req.user._id.toString() && projectName) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    project.nombre = req.body.nombre || project.nombre;
    project.clave = req.body.clave || project.clave;
    project.descripcion = req.body.descripcion || project.descripcion;

    try {
        const updateProject = await project.save();
        return res.json({ status: 200, msg: updateProject });
    } catch (error) {
        console.log(error);
        return res.json({ status: 500, msg: error });
    }
}

const deleteProject = async (req, res) => {
    const { id_project } = req.params;
    const project = await Project.findById(id_project);

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
        console.log(error);
    }
}

const addColumn = async (req, res) => {
    const { id, nombre } = req.body;

    // Verifica que el proyecto al que se agrega la columna existe
    const project = await Project.findById(id);

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
        console.log(error);
    }
}

const updateColumn = async (req, res) => {
    const { id_column } = req.params;
    const { id, nombre } = req.body;

    const project = await Project.findById(id);
    
    // Verifica si el proyecto al que pertenece la columna existe
    if (!project) {
        return res.json({ status:403, msg: 'Sin resultados' });
    }
    // Verifica si el nombre de la columna que se actualiza existe dentro del proyecto
    if (project.columnas.some(e => e.nombre === nombre)) {
        return res.json({ status:403, msg: `La columna '${nombre}' ya existe en el Proyecto: ${project.nombre}`, project });
    }

    try {
        const updateColumn = await Project.updateOne({ _id: id, "columnas._id": id_column }, { $set: { "columnas.$.nombre": nombre } });
        
        return res.json({ status: 200, msg: updateColumn });
    } catch (error) {
        console.log(error);
    }
}

const deleteColumn = async (req, res) => {
    const { id_column } = req.params;
    const { id } = req.body;

    const project = await Project.findById(id);
    
    // Verifica si el proyecto al que pertenece la columna existe
    if (!project) {
        return res.json({ status:403, msg: 'Sin resultados' });
    }
    // Verifica si el id de la columna que se actualiza existe dentro del proyecto
    if (!project.columnas.some(e => e.id === id_column)) {
        return res.json({ status:404, msg: `Sin resultados`, project });
    }

    try {
        const updateColumn = await Project.updateOne({ _id: id }, { $pull: { columnas: { _id: id_column } } });
        
        return res.json({ status: 200, msg: updateColumn });
    } catch (error) {
        console.log(error);
        return res.json(error);
    }
}

const projectTasks = async (req, res) => {
    console.log('TAREAS POR PROYECTO');
    // const projects = await Project.find().where('usuario').equals(req.user);
    const projects = await Project.aggregate([
        {
            $match: { usuario: req.user._id }
        },
         {
             $lookup: {
                 from: 'tasks', 
                localField: '_id', 
                foreignField: 'proyecto', 
                as: 'projectTasks'
            }
        }
    ]);
    try {
        console.log('PROYECTOS: ', projects);
        return res.json(projects);   
    } catch (error) {
        return res.json(error);
    }
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