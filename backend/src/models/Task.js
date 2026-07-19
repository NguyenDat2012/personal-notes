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