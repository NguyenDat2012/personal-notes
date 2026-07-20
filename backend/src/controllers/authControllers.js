import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { verifyGoogleToken } from '../utils/googleVerify.js';

export const registerUser = async (req, res) => {
    try {
        const { name, username, password } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }
        if (username.trim().length < 3) {
            return res.status(400).json({ message: 'Tên tài khoản phải có ít nhất 3 ký tự' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({ message: 'Tên tài khoản này đã được sử dụng' });
        }

        const user = await User.create({ name, username, password });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email || null,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const user = await User.findOne({ username: username.toLowerCase().trim() });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Tên tài khoản hoặc mật khẩu không đúng' });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email || null,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

export const getMe = async (req, res) => {
    //req.user đã được middleware "protect" gắn sẵn
    res.status(200).json(req.user);
};

/**
 * POST /api/auth/google
 * Route này dùng middleware "optionalAuth" (không bắt buộc đăng nhập), nên có 2 trường hợp:
 *
 * 1) req.user RỖNG (chưa đăng nhập) -> đây là hành động "Đăng nhập bằng Google":
 *    - Có googleId khớp sẵn -> đăng nhập luôn
 *    - Chưa có -> tạo tài khoản mới, tự sinh username từ email
 *
 * 2) req.user CÓ sẵn (đã đăng nhập bằng username/password) -> đây là hành động
 *    "Liên kết Google để bật nhận email nhắc nhở":
 *    - Gắn googleId + email thật vào TÀI KHOẢN HIỆN TẠI, không tạo tài khoản mới
 */
export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: 'Thiếu thông tin xác thực Google' });
        }

        const payload = await verifyGoogleToken(credential);
        const { sub: googleId, email, name } = payload;

        if (!email) {
            return res.status(400).json({ message: 'Không lấy được email từ tài khoản Google' });
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
                _id: req.user._id,
                name: req.user.name,
                username: req.user.username,
                email: req.user.email,
                token: generateToken(req.user._id),
            });
        }

        // ---------- Trường hợp 1: Đăng nhập bằng Google ----------
        let user = await User.findOne({ googleId });

        if (!user) {
            // Chưa từng đăng nhập Google, nhưng có thể email này đã liên kết từ trước
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
                name: name || baseUsername,
                username,
                email,
                googleId,
                // Không có password -> tài khoản này chỉ đăng nhập được qua Google
            });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Lỗi khi xác thực Google:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi xác thực Google' });
    }
};
