import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const addTask = async (req, res) => {
    const { nombre } = req.body;
    const { id_project, id_column } = req.params;
    
    const project = await Project.findById(id_project);
    
    if (!project) {
        return res.status(400).json('El proyecto no existe');
    }
    console.log(project.columnas);
    const column = project.columnas.find(column => column._id.toString() === id_column.toString());
    console.log({column});
    if (!column) {
        return res.status(400).json('La columna no existe');
    }
    if (project.usuario.toString() !== req.user._id.toString()) {
        return res.status(400).json('No esta autorizado para realizar esta acción');
    }

    const user = await User.findById(req.body.responsable).select(
        "-password -verificada -token -foto -__v");
    
    if (!user) {
        return res.status(400).json('Usuario no encontrado');
    }

    if (!project.colaboradores.find(colaborador => colaborador.usuario.toString() === user._id.toString())) {
        return res.status(400).json(`El usuario '${user.email}' no pertenece al proyecto`);
    }
    
    const taskExist = await Task.findOne({ proyecto: id_project, nombre });
    
    if (taskExist) {
        return res.status(400).json(`La tarea '${nombre}' ya existe`);
    }

    try {
        const task = await new Task(req.body);
        task.usuario = req.user._id;
        task.responsable = req.body.responsable;
        task.proyecto = id_project;
        task.columna = id_column;

        const newTask = await task.save();
        project.tareas.push(newTask._id);
        column.tareas.push(newTask._id);
        await project.save();
        return res.json({ status: 200, msg: newTask });
    } catch (error) {
        console.log({error});
        return res.json({ status: 500, msg: error });
    }
}

const getTask = async(req, res) => {
    
    const task = await Task.findById(req.params.id_task);

    if (!task) {
        return res.json({ status: 403, msg: 'Sin resultados' });
    }

    if (task.usuario._id.toString() !== req.user._id.toString()) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    res.json({ status: 200, msg: task });
}

const getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.aggregate([
            { $lookup: {
                    from: 'projects', 
                    localField: 'proyecto', 
                    foreignField: '_id', 
                    as: 'Project'
                }
            }, { $match: { proyecto: new mongoose.Types.ObjectId(req.params.id_project) } }
        ]);
    
        if (!tasks) {
            return res.json({ status: 403, msg: 'Sin resultados' });
        }

        return res.json({ status: 200, msg: tasks });
    } catch (error) {
        console.log(error);
        return res.json({ status: 500, msg: error });
    }
}

const updateTask = async(req, res) => {

    const { id_task, id_project } = req.params;
    const { nombre } = req.body;

    // Obtener todas las tareas de un proyecto
    const tasks = await Task.find({ proyecto: id_project });
    let cont = 0;

    /* Evitar duplicados en los nombre de las tareas por proyecto.
      Se compara el nombre de la tarea y su id. de ser cierta la comparacion significa 
      que ya existe una tarea con el mismo nombre y no se puede cambiar el nombre de la tarea indicada */
    while (cont < tasks.length) {
        if (tasks[cont].nombre.toUpperCase() === nombre.toUpperCase() 
        && tasks[cont]._id.toString() !== id_task.toString()) {
            return res.json({ status: 403, msg: `Ya existe una tarea registrada con este nombre` });
        }
        cont ++;
    }
    
    // Busca la tarea por id
    const task = await Task.findById(id_task);

    if (!task) {
        return res.json({ status: 403, msg: 'Sin resultados' });
    }

    //  Verifica si el id usuario de la tarea coincide con el id de usuario logueado
    if (task.usuario._id.toString() !== req.user._id.toString()) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    task.nombre = req.body.nombre || task.nombre;
    task.descripcion = req.body.descripcion || task.descripcion;
    task.asignacion = req.body.asignacion || task.asignacion;
    task.vencimiento = req.body.vencimiento || task.vencimiento;
    task.columna = req.body.columna || task.columna;

    try {
        const updateTask = await task.save();

        return res.json({ status: 200, msg: updateTask });
    } catch (error) {
        console.log(error);
        return res.json({ status: 500, msg: error, tasks });
    }

}

const deleteTask = async (req, res) => {

    const task = await Task.findById(req.params.id_task);

    if (!task) {
        return res.json({ status: 403, msg: 'Sin resultados' });
    }

    //  Verifica si el id usuario de la tarea coincide con el id de usuario logueado
    if (task.usuario._id.toString() !== req.user._id.toString()) {
        return res.json({ status: 403, msg: 'Acción no válida' });
    }

    try {
        await task.deleteOne();
        return res.json({ status: 200, msg: 'Tarea Eliminada' });
    } catch (error) {
        return res.json({ statys: 500, msg: error });
    }
}

export { 
    addTask, 
    getTask, 
    getTasksByProject, 
    updateTask, 
    deleteTask
}