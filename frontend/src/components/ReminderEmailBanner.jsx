import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Mail, X } from "lucide-react";
import { toast } from "sonner";
import GoogleButton from "./GoogleButton";
import { useAuth } from "@/context/AuthContext";

/**
 * Hiện khi user CHƯA có email (chưa từng liên kết Google) — mời họ liên kết
 * để hệ thống có thể gửi email nhắc nhở deadline.
 * Ẩn hẳn nếu user đã có email (user.email tồn tại), hoặc khi tự đóng banner.
 */
export const ReminderEmailBanner = ({ onLinked }) => {
    const { user, continueWithGoogle } = useAuth();
    const [dismissed, setDismissed] = useState(false);

    if (!user || user.email || dismissed) return null;

    const handleGoogleCredential = async (credential) => {
        try {
            await continueWithGoogle(credential);
            toast.success("Đã liên kết Google! Từ giờ bạn sẽ nhận email nhắc nhở deadline.");
            onLinked?.();
        } catch (error) {
            const message = error?.response?.data?.message || "Liên kết Google thất bại";
            toast.error(message);
        }
    };

    return (
        <Card className="relative p-5 border-0 shadow-custom-lg bg-primary/5 ring-1 ring-primary/15">
            <button
                onClick={() => setDismissed(true)}
                className="absolute text-muted-foreground hover:text-foreground right-3 top-3"
                title="Đóng"
            >
                <X className="size-4" />
            </button>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center justify-center rounded-full size-10 shrink-0 bg-primary/10">
                    <Mail className="text-primary size-5" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-foreground">Bạn muốn nhận email nhắc nhở deadline?</p>
                    <p className="text-sm text-muted-foreground">
                        Liên kết tài khoản Google để hệ thống tự động gửi email nhắc bạn trước 1 ngày khi task sắp hết hạn.
                    </p>
                </div>
                <div className="shrink-0">
                    <GoogleButton onCredential={handleGoogleCredential} text="continue_with" />
                </div>
            </div>
        </Card>
    );
};
