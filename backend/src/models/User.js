import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    // Không bắt buộc: user chỉ đăng nhập bằng Google thì không có mật khẩu
    hashedPassword:{
        type: String
    },
    // Không bắt buộc + sparse: user cũ chưa có email, nhiều user cùng chưa có email vẫn hợp lệ.
    // Form/API đăng ký vẫn bắt buộc nhập email (kiểm tra ở signUp)
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    },
    displayName:{
        type: String,
        required: true,
        trim: true
    },
    // Chỉ có khi user đăng nhập/liên kết bằng Google
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
},
{
    timestamps: true,
}
);
const User = mongoose.model("User", userSchema);
export default User;
