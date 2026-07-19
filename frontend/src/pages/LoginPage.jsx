import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        setIsSubmitting(true);
        try {
            await login(email, password);
            toast.success("Đăng nhập thành công!");
            navigate("/");
        } catch (error) {
            const message = error?.response?.data?.message || "Đăng nhập thất bại";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-[#fefcff] relative p-6">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
                        radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
                }}
            />
            <Card className="relative z-10 w-full max-w-sm p-6 border-0 bg-gradient-card shadow-custom-lg">
                <div className="mb-6 space-y-2 text-center">
                    <h1 className="text-3xl font-bold text-transparent bg-primary bg-clip-text">
                        Đăng nhập
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Chào mừng quay lại với Nhiệm Vụ
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="ban@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                            Mật khẩu
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11"
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="gradient"
                        size="xl"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                </form>
                <p className="mt-6 text-sm text-center text-muted-foreground">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="font-medium text-primary hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default LoginPage;
