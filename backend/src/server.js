import express from 'express';
import tasksRoutes from './routes/tasksRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();



//middlewares
app.use(express.json());

if(process.env.NODE_ENV !== "production"){
    app.use(cors({origin: "http://localhost:5173"}));
}


app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/cron", reminderRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
    });
}


connectDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});