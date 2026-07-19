import jwt from 'jsonwebtoken';

//Tạo JWT token chứa id người dùng, hết hạn sau 30 ngày
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
