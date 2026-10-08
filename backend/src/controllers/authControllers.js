import bcrypt from 'bcrypt';
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/Session.js';
import { verifyGoogleToken } from '../utils/googleVerify.js';

const ACCESS_TOKEN_TTL = '30m'; //thường là 15m -> < 15m
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

//Dùng chung cho signIn và googleAuth: tạo accessToken (JWT), tạo refresh token,
//lưu refresh token vào Session và trả refresh token về trong cookie. Trả về accessToken.
const createSession = async (res, userId) => {
    //tạo accessToken với JWT
    const accessToken = jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL});

    //tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');

    //tạo session mới để lưu refresh token
    await Session.create({
        userId,
        refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    //trả refresh token về trong cookie
    res.cookie('refreshToken', refreshToken,{
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: REFRESH_TOKEN_TTL,
    });

    return accessToken;
};

export const signUp = async (req, res) => {
    try {
        const { username, password, email, firstname, lastname} = req.body;

        if(!username || !password || !email || !firstname || !lastname){
            return res.status(400).json(
                {message:
                    "Vui lòng điền đầy đủ"

                });
        }

        //kiểm tra user name có tồn tại chưa
        const duplicate = await User.findOne({username});
        if(duplicate){
            return res.status(409).json({
                message: "Username đã tồn tại"
            });
        }
        // mã hóa password
        const hashedPassword = await bcrypt.hash(password,10);

        //tạo user mới
        await User.create({
            username,
            hashedPassword,
            email,
            displayName: `${lastname} ${firstname}`
        });

        return res.sendStatus(204);

    } catch (error) {
        console.error('Lỗi khi gọi signUp',error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
};

export const signIn = async (req, res) =>{
    try {
        //lấy inputs
        const { username, password }=req.body;

        if(!username || !password){
            return res.status(400).json({
                message: "Thiếu username hoặc password"
            });
        }

        //lấy hashedPassword trong db để so với password
        //(tài khoản chỉ đăng nhập bằng Google không có hashedPassword -> coi như sai thông tin)
        const user = await User.findOne({username});
        if(!user || !user.hashedPassword){
            return res.status(401).json({
                message: "username hoặc password không chính xác"
            });
        }

        //kiểm tra password
        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

        if(!passwordCorrect){
            return res.status(401).json({
                message: "username hoặc password không chính xác"
            });
        }

        //nếu khớp: tạo accessToken, refresh token, Session và cookie
        const accessToken = await createSession(res, user._id);

        //trả access token về trong body
        return res.status(200).json({
            message: `User ${user.displayName} đã loggoed in`, accessToken
        });
    } catch (error) {
        console.error('Lỗi khi gọi signIn',error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
};

export const signOut = async ( req, res)=>{
    try {
        //Lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;

        if(token){
            //xóa refresh token trong Seesion
            await Session.deleteOne({refreshToken: token});

            //xóa cookie
            res.clearCookie("refreshToken");
        }
        return res.sendStatus(204);

    } catch (error) {
        console.error('Lỗi khi gọi signOut',error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
};

//tạo access token mới từ refresh token
export const refreshToken = async (req, res)=>{
    try {
        //lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;
        if(!token){
            return res.status(401).json({
                message: "Token không tồn tại."
            });
        }
        //so với refresh token trong db
        const session = await Session.findOne({refreshToken: token});
        if(!session){
            return res.status(403).json({
                message: "token không hợp lệ hoặc hết hạn"
            });
        }
        //kiểm tra refresh token hết hạn chưa
        if (session.expiresAt < new Date()) {
            return res.status(403).json({
                message: "Token đã hết hạn"
            });
        }
        //tạo access token mới
        const accessToken = jwt.sign({userId: session.userId},process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL});

        //return
        return res.status(200).json({
            accessToken
        });
    } catch (error) {
        console.error('Lỗi khi gọi refreshToken',error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
}

/**
 * POST /api/auth/google  (middleware "optionalAuth", không bắt buộc đăng nhập)
 *
 * 1) Chưa đăng nhập (không có access token) -> "Đăng nhập bằng Google":
 *    - Có googleId khớp sẵn -> đăng nhập luôn
 *    - Chưa có -> gắn vào user có cùng email (chỉ khi Google xác nhận email_verified),
 *      hoặc tạo tài khoản mới (tự sinh username từ email)
 *    - Tạo Session + cookie refreshToken, trả { message, accessToken } như signIn
 *      (FE gọi tiếp /users/me để lấy user, giống luồng signIn)
 *
 * 2) Đã đăng nhập (access token hợp lệ) -> "Liên kết Google để nhận email nhắc nhở":
 *    - Gắn googleId + email vào TÀI KHOẢN HIỆN TẠI
 *    - KHÔNG tạo Session mới, KHÔNG trả accessToken, trả { message, user }
 *    - Nếu access token hết hạn, optionalAuth trả 403 -> FE tự refresh rồi gọi lại
 */
export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential || typeof credential !== 'string') {
            return res.status(400).json({ message: 'Thiếu thông tin xác thực Google' });
        }

        let payload;
        try {
            payload = await verifyGoogleToken(credential);
        } catch (err) {
            return res.status(401).json({ message: 'Thông tin xác thực Google không hợp lệ' });
        }
        const { sub: googleId, email, name, email_verified: emailVerified } = payload;

        if (!email) {
            return res.status(400).json({ message: 'Không lấy được email từ tài khoản Google' });
        }
        //email chưa xác minh thì không được dùng để gộp/liên kết tài khoản
        if (!emailVerified) {
            return res.status(400).json({ message: 'Email Google chưa được xác minh' });
        }

        // ---------- Trường hợp 2: Liên kết vào tài khoản đang đăng nhập ----------
        if (req.user) {
            const emailTakenByOther = await User.findOne({ email, _id: { $ne: req.user._id } });
            if (emailTakenByOther) {
                return res.status(409).json({ message: 'Email Google này đã được liên kết với tài khoản khác' });
            }
            const googleIdTakenByOther = await User.findOne({ googleId, _id: { $ne: req.user._id } });
            if (googleIdTakenByOther) {
                return res.status(409).json({ message: 'Tài khoản Google này đã được liên kết với người dùng khác' });
            }

            req.user.email = email;
            req.user.googleId = googleId;
            await req.user.save();

            return res.status(200).json({
                message: 'Đã liên kết Google',
                user: req.user,
            });
        }

        // ---------- Trường hợp 1: Đăng nhập bằng Google ----------
        let user = await User.findOne({ googleId });

        if (!user) {
            // Chưa từng đăng nhập Google, nhưng có thể email này đã có tài khoản từ trước
            user = await User.findOne({ email });
            if (user) {
                user.googleId = googleId;
                await user.save();
            }
        }

        if (!user) {
            // Hoàn toàn mới -> tạo tài khoản, tự sinh username duy nhất từ email
            const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
            let username = baseUsername;
            let suffix = 0;
            while (await User.findOne({ username })) {
                suffix += 1;
                username = `${baseUsername}${suffix}`;
            }

            user = await User.create({
                username,
                email,
                googleId,
                displayName: name || baseUsername,
                // Không có hashedPassword -> tài khoản này chỉ đăng nhập được qua Google
            });
        }

        const accessToken = await createSession(res, user._id);

        return res.status(200).json({
            message: `User ${user.displayName} đã loggoed in`, accessToken
        });
    } catch (error) {
        console.error('Lỗi khi gọi googleAuth', error);
        return res.status(500).json({ message: 'Lỗi hệ thống khi xác thực Google' });
    }
};
