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
