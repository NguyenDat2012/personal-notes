import crypto from 'crypto';

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
 */
export const decrypt = (payload) => {
    if (payload === null || payload === undefined) return payload;

    const parts = String(payload).split(':');
    if (parts.length !== 3) {
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
