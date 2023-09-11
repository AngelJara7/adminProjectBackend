import Task from "../models/Task.js";

const addTask = async (req, res) => {
    const { proyecto, nombre } = req.body;

    const taskExist = await Task.findOne({ proyecto, nombre });

    if (taskExist) {
        return res.json({ status: 403, msg: `La tarea '${nombre}' ya existe`, m: taskExist });
    }

    try {
        const task = await new Task(req.body);
        task.usario = req.user._id;

        const newTask = await task.save();
        return res.json({ status: 200, newTask });
    } catch (error) {
        console.log(error);
    }
}

export { 
    addTask,
    
}