import express from 'express';
import { sendDeadlineReminders } from '../controllers/reminderController.js';

const router = express.Router();

// GET /api/cron/send-deadline-reminders?secret=...
router.get('/send-deadline-reminders', sendDeadlineReminders);

export default router;
