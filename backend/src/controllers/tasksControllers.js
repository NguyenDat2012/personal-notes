import Task from '../models/Task.js';
import { encrypt, decrypt } from '../utils/encryption.js';

export const getAllTasks = async (req, res) => {
    const {filter = 'today'} =req.query;
    const now = new Date();
    let startDate;
    switch (filter) {
        case 'today': {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        }
        case 'week': {
            const mondayDate = now.getDate() - (now.getDay()- 1) - (now.getDay()=== 0 ? 7 : 0);
            startDate = new Date(now.getFullYear(), now.getMonth(), mondayDate);
            break;
        }
        case 'month':{
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        }
        case 'all':
        default: {
            startDate = null;
        }
    }

    const query = startDate
        ? { createdAt: {$gte: startDate}, user: req.user._id }
        : { user: req.user._id };

    try{
        const result = await Task.aggregate([
            {$match: query},
            {
                $facet: {
                    tasks: [{$sort: {createdAt: -1}}],
                    activeCount: [{$match: {status: "active"}}, {$count: "count"}],
                    completeCount: [{$match: {status: "complete"}}, {$count: "count"}],
                },
            },
        ]);
        const tasks = result[0].tasks.map((task) => ({
            ...task,
            title: decrypt(task.title),
        }));
        const activeCount = result[0].activeCount[0]?.count || 0;
        const completeCount = result[0].completeCount[0]?.count || 0;

        res.status(200).json({tasks, activeCount, completeCount});

    }catch(error){
        console.error('Lỗi khi gọi:', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
export const createTask = async (req, res) => {
    try{
        const { title, deadline } = req.body;
        const task = new Task({ title: encrypt(title), user: req.user._id, deadline: deadline || null });
        const newTask = await task.save();

        const responseTask = newTask.toObject();
        responseTask.title = decrypt(responseTask.title);

        res.status(201).json(responseTask);
    }catch(error){
        console.error('Lỗi khi tạo task:', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}

export const updateTask = async (req, res) => {
    try{
        const {title, status, completedAt, deadline} = req.body;
        const update = {
            title: title !== undefined ? encrypt(title) : undefined,
            status,
            completedAt,
        };
        // Nếu deadline thay đổi, reset lại reminderSent để hệ thống có thể gửi nhắc nhở mới
        if (deadline !== undefined) {
            update.deadline = deadline;
            update.reminderSent = false;
        }
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            update,
            { new: true }
        );
        if(!updatedTask) {
            return res.status(404).json({ message: 'Nhiệm vụ không tồn tại' });
        }

        const responseTask = updatedTask.toObject();
        responseTask.title = decrypt(responseTask.title);

        res.status(200).json(responseTask);
    }catch(error){
        console.error('Lỗi khi cập nhật task:', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}

export const deleteTask = async (req, res) => {
    try{
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if(!deletedTask) {
            return res.status(404).json({ message: 'Nhiệm vụ không tồn tại' });
        }

        const responseTask = deletedTask.toObject();
        responseTask.title = decrypt(responseTask.title);

        res.status(200).json(responseTask);
    }catch(error){
        console.error('Lỗi khi xóa task:', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
