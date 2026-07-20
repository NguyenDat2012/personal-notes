import { OAuth2Client } from 'google-auth-library';

/**
 * Xác thực "credential" (ID Token dạng JWT) mà Google trả về sau khi user
 * bấm nút "Đăng nhập bằng Google" ở frontend.
 * Cần biến môi trường GOOGLE_CLIENT_ID (lấy từ Google Cloud Console).
 */
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // payload gồm: sub (Google ID duy nhất), email, name, email_verified, picture...
    return payload;
};
