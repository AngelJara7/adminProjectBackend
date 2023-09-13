import Task from "../models/Task.js";

const addTask = async (req, res) => {
    const { proyecto, nombre } = req.body;

    const taskExist = await Task.findOne({ proyecto, nombre });

    if (taskExist) {
        return res.json({ status: 403, msg: `La tarea '${nombre}' ya existe` });
    }

    try {
        const task = await new Task(req.body);
        task.usario = req.user._id;

        const newTask = await task.save();
        return res.json({ status: 200, msg: newTask });
    } catch (error) {
        console.log(error);
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
            return res.json({ status: 403, msg: `Ya existe una tarea registrada con este nombre`, tasks });
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

export { 
    addTask, 
    getTask, 
    updateTask, 
}