import { useEffect, useRef } from "react";

declare global {
    interface Window {
        google?: any; // Google Identity Services (script nhúng ở index.html)
    }
}

interface GoogleButtonProps {
    onCredential: (credential: string) => void;
    text?: "signin_with" | "signup_with" | "continue_with";
}

/**
 * Nút "Đăng nhập bằng Google" dùng Google Identity Services (script đã nhúng ở index.html).
 * Dùng chung cho: trang đăng nhập, trang đăng ký, và banner "liên kết Google" ở HomePage
 * — vì bản chất gọi cùng 1 endpoint /api/auth/google, chỉ khác ở việc có access token sẵn hay không.
 */
const GoogleButton = ({ onCredential, text = "signin_with" }: GoogleButtonProps) => {
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;

        const renderButton = () => {
            if (cancelled) return;
            if (!window.google || !buttonRef.current) {
                // Script accounts.google.com/gsi/client chưa load kịp -> thử lại sau
                setTimeout(renderButton, 200);
                return;
            }
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: (response: { credential: string }) => onCredential(response.credential),
            });
            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: "outline",
                size: "large",
                width: 320,
                text, // "signin_with" | "signup_with" | "continue_with"
            });
        };

        renderButton();
        return () => {
            cancelled = true;
        };
    }, [onCredential, text]);

    return <div ref={buttonRef} className="flex justify-center" />;
};

export default GoogleButton;
