import Task from '../models/Task.js';
import { decrypt } from '../utils/encryption.js';
import { sendDeadlineReminderEmail } from '../utils/mailer.js';

export const sendDeadlineReminders = async (req, res) => {
    const secret = req.query.secret || req.headers['x-cron-secret'];
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ message: 'Không có quyền truy cập' });
    }
    
    try {
        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const tasksNeedingReminder = await Task.find({
            status: 'active',
            reminderSent: false,
            deadline: { $gte: now, $lte: in24h },
        }).populate('user', 'displayName email');

        let sentCount = 0;
        for (const task of tasksNeedingReminder) {
            if (!task.user?.email) continue;
            try {
                await sendDeadlineReminderEmail({
                    to: task.user.email,
                    userName: task.user.displayName,
                    taskTitle: decrypt(task.title),
                    deadline: task.deadline,
                });
                task.reminderSent = true;
                await task.save();
                sentCount++;
            } catch (mailError) {
                console.error(`Lỗi gửi email nhắc nhở cho task ${task._id}:`, mailError.message);
            }
        }

        res.status(200).json({
            message: `Đã gửi ${sentCount} email nhắc nhở`,
            checked: tasksNeedingReminder.length,
        });
    } catch (error) {
        console.error('Lỗi khi quét & gửi email nhắc nhở:', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};
