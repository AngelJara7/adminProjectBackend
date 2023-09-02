import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const db = await mongoose.connect('mongodb+srv://angeljara96:Gallardo07@cluster0.8s5xvmb.mongodb.net/spm?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    
        const url = `${db.connection.host}:${db.connection.port}`;
        console.log(`Mongo DB Conectado en: ${url}`);

    } catch (error) {
        console.log(`error ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;