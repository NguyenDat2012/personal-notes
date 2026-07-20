import React, { useEffect, useRef } from "react";

/**
 * Nút "Đăng nhập bằng Google" dùng Google Identity Services (script đã nhúng ở index.html).
 * Dùng chung cho: trang Login, trang Register, và banner "liên kết Google" ở HomePage
 * — vì bản chất gọi cùng 1 endpoint /api/auth/google, chỉ khác ở việc có Bearer token sẵn hay không.
 */
const GoogleButton = ({ onCredential, text = "signin_with" }) => {
    const buttonRef = useRef(null);

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
                callback: (response) => onCredential(response.credential),
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
