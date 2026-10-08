import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//authorization - xác minh user là ai
export const protectedRoute = (req, res,next)=>{
    try {
        //lấy token từ header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({
                message: "Không tìm thấy access token"
            });
        }

        //xác nhận token hợp lệ
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser)=>{
            if(err){
                console.error(err);
                return res.status(403).json({
                    message: 'Access token hết hạn hoặc không đúng'
                });
            }
            try {
                //tìm user
                const user = await User.findById(decodedUser.userId).select('-hashedPassword');
                if(!user){
                    return res.status(404).json({
                        message: 'Người dùng không tồn tại.'
                    });
                }

                //trả user về trong req
                req.user = user;
                next();
            } catch (error) {
                console.error("Lỗi khi tìm user trong authMiddleware", error);
                return res.status(500).json({
                    message: "Lỗi hệ thống"
                });
            }
        })
    } catch (error) {
        console.error("Lỗi khi xác minh jwt trong authMiddleware", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
}

//Middleware "mềm" cho /api/auth/google (vừa để đăng nhập, vừa để liên kết Google):
// - không có token -> đi tiếp như khách (req.user rỗng)
// - CÓ token nhưng sai/hết hạn -> trả 403 giống protectedRoute để FE tự refresh rồi gọi lại,
//   KHÔNG coi như khách (nếu không, người đang liên kết Google sẽ bị rẽ sang nhánh tạo/đăng nhập tài khoản)
export const optionalAuth = (req, res, next)=>{
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if(!token){
            return next();
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser)=>{
            if(err){
                return res.status(403).json({
                    message: 'Access token hết hạn hoặc không đúng'
                });
            }
            try {
                const user = await User.findById(decodedUser.userId).select('-hashedPassword');
                if(!user){
                    return res.status(404).json({
                        message: 'Người dùng không tồn tại.'
                    });
                }

                req.user = user;
                next();
            } catch (error) {
                console.error("Lỗi khi tìm user trong optionalAuth", error);
                return res.status(500).json({
                    message: "Lỗi hệ thống"
                });
            }
        })
    } catch (error) {
        console.error("Lỗi khi xác minh jwt trong optionalAuth", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
}
