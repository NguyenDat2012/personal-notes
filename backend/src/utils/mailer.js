const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendDeadlineReminderEmail = async ({ to, userName, taskTitle, deadline }) => {
    const deadlineStr = new Date(deadline).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        dateStyle: 'full',
        timeStyle: 'short',
    });

    const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: {
                name: 'Nhiệm Vụ',
                email: process.env.BREVO_SENDER_EMAIL,
            },
            to: [{ email: to, name: userName }],
            subject: `⏰ Nhắc nhở: "${taskTitle}" sắp đến hạn`,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8f7ff; border-radius: 12px;">
                    <h2 style="color:#7c3aed; margin-top:0;">⏰ Nhắc nhở nhiệm vụ</h2>
                    <p>Xin chào <strong>${userName}</strong>,</p>
                    <p>Nhiệm vụ dưới đây của bạn sắp đến hạn trong vòng 24 giờ tới:</p>
                    <div style="background:#fff; padding:16px; border-radius:8px; border-left:4px solid #7c3aed; margin:16px 0;">
                        <p style="margin:0; font-size:16px; font-weight:600; color:#1e1e1e;">${taskTitle}</p>
                        <p style="margin:6px 0 0; color:#666; font-size:14px;">Hạn chót: ${deadlineStr}</p>
                    </div>
                    <p style="color:#555;">Đừng quên hoàn thành nhé! 💪</p>
                </div>
            `,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo API lỗi (${response.status}): ${errorBody}`);
    }
};
