import mongoose from "mongoose";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, clientOptions);
        console.log('MONGODB_URI:', process.env.MONGODB_URI); // Temporary log
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.log('DB Connection Error:', error);
    }
};

export default connectDB;
