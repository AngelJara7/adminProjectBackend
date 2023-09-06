import Project from "../models/Projects.js";

const addProject = async (req, res) => {
    const project = new Project(req.body);
    project.usuario = req.user._id;

    try {
        const newProject = await project.save();

        res.json({ status: 200, msg: newProject });
    } catch (error) {
        console.log(error);
    }
}

export {
    addProject
};