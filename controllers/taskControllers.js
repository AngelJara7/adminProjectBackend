import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Collaborator from "../models/Collaborator.js";

const addTask = async (req, res) => {
    const { nombre, proyecto, columna } = req.body;
    
    const project = await Project.findById(proyecto._id).populate('tareas');
    
    if (!project) {
        return res.status(400).json('El proyecto no existe');
    }

    const responsable = await Collaborator.findById(req.body.responsable);
    const usuario = await Collaborator.findById(req.body.usuario);

    if (!responsable && !usuario) {
        return res.status().json('Usuarios no encontrados');
    }
   
    if (project.usuario.toString() !== req.user._id.toString() && !project.colaboradores.some(
        colaborador => colaborador.toString() === req.user._id.toString()
        && colaborador.rol === 'Administrador'
    )) {
        return res.status(400).json('No esta autorizado para realizar esta acción');
    }

    if (project.tareas.find(task => task.nombre === nombre)) {
        return res.status(400).json(`La tarea '${nombre}' ya existe en el proyecto ${project.nombre}`);
    }
    
    if (!project.columnas.find(column => column._id.toString() === columna.toString())) {
        return res.status(400).json('La columna no existe');
    }

    if (!project.colaboradores.find(
            colaborador => colaborador.toString() === responsable._id.toString()
        )) {
        return res.status(400).json(`El usuario responsable no pertenece al proyecto '${project.nombre}'`);
    }

    if (!project.colaboradores.find(
            colaborador => colaborador.toString() === usuario._id.toString()
        )) {
        return res.status(400).json(`El usuario informador no pertenece al proyecto '${project.nombre}'`);
    }

    try {
        const newTask = await Task.create(req.body);

        project.tareas.push(newTask._id);

        await project.save();
        return res.status(200).json(`Se ha agregado la tarea '${newTask.nombre}' al proyecto '${project.nombre}'`);
    } catch (error) {
        return res.status(500).json('Algo salio mal, no se pudo crear la tarea');
    }
}

const getTask = async(req, res) => {
    
    const task = await Task.findById(req.params.id_task)
        .populate('proyecto.columnas', 'nombre _id')
        // .populate('proyecto')

    if (!task) {
        return res.json({ status: 403, msg: 'Sin resultados' });
    }

    if (task.usuario._id.toString() !== req.user._id.toString()) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    res.json({ status: 200, msg: task });
}

const updateTask = async(req, res) => {
    const { nombre, proyecto, columna } = req.body;
    
    let responsable = req.body.responsable._id ? req.body.responsable._id : req.body.responsable;
    let usuario = req.body.usuario._id ? req.body.usuario._id : req.body.usuario;
    
    const project = await Project.findById(proyecto._id).populate('tareas');
    
    if (!project) {
        return res.status(400).json('Proyecto no encontrado');
    }
   
    if (project.tareas.find(task => task.nombre === nombre && task._id.toString() !== req.params.id_task.toString())) {
        return res.status(400).json(`La tarea '${nombre}' ya existe en el proyecto '${project.nombre}'`);
    }

    const task = await Task.findById(req.params.id_task).populate('responsable');
    
    if (!task) {
        return res.status(400).json('Tarea de encontrada');
    }

    if (!project.columnas.find(column => column._id.toString() === columna.toString())) {
        return res.status(400).json('Columna no encontrada');
    }

    if (!project.colaboradores.find(colaborador => colaborador.toString() === responsable.toString())) {
        return res.status(400).json(`El usuario colaborador no pertenece al proyecto '${project.nombre}'`);
    }

    if (!project.colaboradores.find(colaborador => colaborador.toString() === usuario.toString())) {
        return res.status(400).json(`El usuario informador no pertenece al proyecto '${project.nombre}'`);
    }

    if (project.usuario._id.toString() !== req.user._id.toString() && 
        !project.colaboradores.some(
            colaborador => colaborador.toString() === req.user._id.toString() && 
            colaborador.rol === 'Administrador'
    ) && req.user._id.toString() !== task.responsable.usuario.toString()) {
        return res.status(400).json('No está autorizado para realizar esta acción');
    }

    task.nombre = req.body.nombre || task.nombre;
    task.descripcion = req.body.descripcion || task.descripcion;
    task.vencimiento = req.body.vencimiento || task.vencimiento;
    task.usuario = req.body.usuario || task.usuario;
    task.responsable = req.body.responsable || task.responsable;
    task.columna = req.body.columna || task.columna;

    try {
        await task.save();

        return res.status(200).json(`Se ha actualizado la tarea`);
    } catch (error) {
        return res.status(500).json('Algo salio mal, no se ha podido actualizar la tarea');
    }

}

const deleteTask = async (req, res) => {

    const task = await Task.findById(req.params.id_task).populate('proyecto');

    if (!task) {
        return res.status(400).json('Tarea no encontrada');
    }

    if (task.proyecto.usuario.toString() !== req.user._id.toString()) {
        return res.status(400).json('no está autorizado para realizar esta acción');
    }

    try {
        const project = await Project.findById(task.proyecto);
        project.tareas.pull(req.params.id_task);

        await Promise.allSettled([await project.save(), await task.deleteOne()]);
        return res.status(200).json(`La tarea '${task.nombre}' ha sido eliminada del proyecto '${project.nombre}'`);
    } catch (error) {
        return res.status(500).json('Algo solio mal, no se pudo eliminar la tarea');
    }
}

export { 
    addTask, 
    getTask, 
    updateTask, 
    deleteTask
}