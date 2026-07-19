import express from 'express';
import { createTask, getAllTasks, updateTask, deleteTask } from '../controllers/tasksControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", protect, getAllTasks);

router.post("/", protect, createTask);

router.put("/:id", protect, updateTask);

router.delete("/:id", protect, deleteTask);
export default router;