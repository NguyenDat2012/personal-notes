import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

export const sendDeadlineReminderEmail = async ({ to, userName, taskTitle, deadline }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    const deadlineStr = new Date(deadline).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        dateStyle: "full",
        timeStyle: "short",
    });

    await transporter.sendMail({
        from: `"Nhiệm Vụ" <${process.env.EMAIL_USER}>`,
        to,
        subject: `⏰ Nhắc nhở: "${taskTitle}" sắp đến hạn`,
        html: `
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
    });
};
