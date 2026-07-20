import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//Middleware kiểm tra người dùng đã đăng nhập chưa (dựa vào Bearer token)
export const protect = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Chưa đăng nhập, vui lòng đăng nhập lại' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        req.user = user; //gắn user vào request để controller phía sau dùng
        next();
    } catch (error) {
        console.error('Lỗi xác thực:', error);
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

//Middleware "mềm": nếu có token hợp lệ thì gắn req.user, không có/token sai thì BỎ QUA
//(không trả lỗi) — dùng cho các endpoint có thể gọi cả khi đã đăng nhập lẫn chưa đăng nhập,
//ví dụ /api/auth/google (vừa dùng để đăng nhập, vừa dùng để liên kết tài khoản Google).
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user) req.user = user;
        }
    } catch (error) {
        // Token sai/hết hạn -> coi như chưa đăng nhập, không chặn request
    }
    next();
};
