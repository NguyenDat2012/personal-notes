import crypto from 'crypto';

/**
 * Module mã hóa/giải mã nội dung nhạy cảm (VD: title của task) trước khi lưu vào MongoDB.
 * Dùng AES-256-GCM: vừa mã hóa, vừa có "authTag" giúp phát hiện nếu dữ liệu bị chỉnh sửa trái phép.
 *
 * Lưu ý quan trọng:
 * - Đây là mã hóa "server-side": khóa (ENCRYPTION_KEY) nằm trên server, nên bảo vệ được
 *   trước việc lộ database/backup, nhưng KHÔNG bảo vệ trước người có quyền truy cập server.
 * - Bắt buộc phải có biến ENCRYPTION_KEY trong file .env (chuỗi hex dài 64 ký tự = 32 byte).
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // độ dài khuyến nghị cho GCM

const getKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error(
            'ENCRYPTION_KEY không hợp lệ. Cần là chuỗi hex dài đúng 64 ký tự trong file .env. ' +
            'Tạo bằng lệnh: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }
    return Buffer.from(key, 'hex');
};

/**
 * Mã hóa 1 chuỗi văn bản.
 * Kết quả trả về dạng: "iv:authTag:ciphertext" (đều ở dạng hex), lưu thẳng vào MongoDB.
 */
export const encrypt = (text) => {
    if (text === null || text === undefined) return text;

    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
};

/**
 * Giải mã lại chuỗi đã mã hóa bởi encrypt().
 * Nếu gặp dữ liệu CŨ (tạo trước khi bật tính năng mã hóa, chưa đúng định dạng) thì
 * trả về nguyên bản, coi như văn bản thường — tránh crash toàn bộ API vì data cũ.
 */
export const decrypt = (payload) => {
    if (payload === null || payload === undefined) return payload;

    const parts = String(payload).split(':');
    if (parts.length !== 3) {
        // Không đúng định dạng "iv:authTag:ciphertext" -> coi như dữ liệu cũ chưa mã hóa
        return payload;
    }

    try {
        const [ivHex, authTagHex, dataHex] = parts;
        const key = getKey();
        const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(dataHex, 'hex')),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Lỗi khi giải mã dữ liệu:', error.message);
        return '[Không thể giải mã nội dung]';
    }
};
