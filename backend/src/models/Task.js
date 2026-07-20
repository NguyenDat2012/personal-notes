import mongoose from 'mongoose';  
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['active','complete'],
        default: 'active',
    },
    completedAt: {
        type: Date,
        default: null,
    },
    deadline: {
        type: Date,
        default: null,
    },
    reminderSent: {
        type: Boolean,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
},
{
        timestamps: true, //tự động thêm createdAt và updatedAt
}
);
const Task = mongoose.model('Task', taskSchema);
export default Task;