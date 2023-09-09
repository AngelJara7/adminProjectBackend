import Column from "../models/Column.js";

const addColumn = async (req, res) => {
    const column = new Column(req.body);
    console.log(req.body);
    column.usuario = req.user._id;
    column.proyecto = req.body.proyecto;

    try {
        const newColumn = await column.save();
        res.json(newColumn);   
    } catch (error) {
        console.log(error);
    }
}

export {
    addColumn
};