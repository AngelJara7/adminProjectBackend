import Project from "../models/Projects.js";

const addProject = async (req, res) => {
    const { nombre } = req.body;
    const { _id } = req.user._id;
    console.log('USUARIO: ',req.user, nombre);
    const projectsExist = await Project.findOne({ usuario: _id, nombre });

    if (projectsExist) {
        console.log('PROYECTO: ',projectsExist);
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
    const { id } = req.params;
    const project = await Project.findById(id);
    
    if (!project) {
        return res.json({ status: 404, msg: 'Sin resultados' });
    }

    if (project.usuario._id.toString() !== req.user._id.toString()) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    res.json({ status: 200, msg: project });
}

const updateProject = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
        return res.json({ status: 403, msg: 'Sin resultados' });
    }

    if (project.usuario._id.toString() !== req.user._id.toString()) {
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
    }
}

const deleteProject = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id);

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

    const project = await Project.findById(id);

    if (!project) {
        return res.json({ status:403, msg: 'Sin resultados' });
    }
    
    console.log('INCLUDE: ',project.columnas.some(e => e.nombre === nombre));
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

export {
    addProject, 
    getProjects, 
    getProject, 
    updateProject, 
    deleteProject,
    addColumn
};