import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectDB = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_CONNECTIONSTRING
        );
        console.log('Connected to MongoDB');

    }catch (error) {
        console.error('Error connecting to MongoDB:', error);       
        process.exit(1);
    }
}
