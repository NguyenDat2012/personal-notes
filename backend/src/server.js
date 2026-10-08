import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from "path";
import dns from "node:dns";
import { connectDB } from './config/db.js';
import authRoute from './routes/authRoutes.js';
import userRoute from './routes/userRoute.js';
import tasksRoutes from './routes/tasksRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import { protectedRoute } from './middleware/authMiddleware.js';

dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.options("*", cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

//middlewares
app.use(express.json());
app.use(cookieParser());
//app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));

//public routes
app.use("/api/auth", authRoute);
app.use("/api/cron", reminderRoutes); //cron tự xác thực bằng CRON_SECRET, không dùng access token

//phục vụ frontend đã build (phải đặt TRƯỚC protectedRoute, và không được nuốt các đường dẫn /api)
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get(/^\/(?!api(\/|$)).*/,(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
    });
}

//private routes
app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/tasks", tasksRoutes);


connectDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
