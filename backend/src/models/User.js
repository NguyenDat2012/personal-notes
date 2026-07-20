import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
    },
    // Email KHÔNG bắt buộc nữa — chỉ có khi user đăng nhập/liên kết bằng Google.
    // "sparse: true" cho phép nhiều user cùng chưa có email (null) mà không vi phạm unique.
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không đúng định dạng'],
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    // Không bắt buộc nữa — user chỉ đăng nhập bằng Google thì không có password
    password: {
        type: String,
        minlength: 6,
    },
},
{
    timestamps: true, //tự động thêm createdAt và updatedAt
}
);
userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Hàm so sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false; // tài khoản chỉ đăng nhập bằng Google, không có password
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
