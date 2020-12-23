import mongoose from 'mongoose';
import config from 'config'

const db = config.get('mongoURI');

//Connecting to the database:
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log("MongoDB connected!")
    }
    catch(err) {
        console.log(err.message);
        //Exit process with failure
        process.exit(1);
    }
}

export default connectDB;