import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        setIsSubmitting(true);
        try {
            await register(name, email, password);
            toast.success("Tạo tài khoản thành công!");
            navigate("/");
        } catch (error) {
            const message = error?.response?.data?.message || "Đăng ký thất bại";
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
                        Tạo tài khoản
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Bắt đầu quản lý nhiệm vụ của riêng bạn
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                            Họ tên
                        </label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11"
                        />
                    </div>
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
                            placeholder="Ít nhất 6 ký tự"
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
                        {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
                    </Button>
                </form>
                <p className="mt-6 text-sm text-center text-muted-foreground">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default RegisterPage;
