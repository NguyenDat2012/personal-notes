import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); //đang kiểm tra token lúc mới load trang

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }
        //Xác thực token còn hạn không bằng cách gọi /auth/me
        api
            .get("/auth/me")
            .then((res) => setUser(res.data))
            .catch(() => {
                localStorage.removeItem("token");
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (username, password) => {
        const res = await api.post("/auth/login", { username, password });
        localStorage.setItem("token", res.data.token);
        setUser(res.data);
        return res.data;
    };

    const register = async (name, username, password) => {
        const res = await api.post("/auth/register", { name, username, password });
        localStorage.setItem("token", res.data.token);
        setUser(res.data);
        return res.data;
    };

    /**
     * Dùng chung cho 2 mục đích:
     * - Chưa đăng nhập (không có token trong localStorage) -> hoạt động như "Đăng nhập bằng Google"
     * - Đã đăng nhập sẵn (có token, axios tự đính kèm) -> hoạt động như "Liên kết Google"
     * Backend tự phân biệt 2 trường hợp này dựa vào có Bearer token hợp lệ hay không.
     */
    const continueWithGoogle = async (credential) => {
        const res = await api.post("/auth/google", { credential });
        localStorage.setItem("token", res.data.token);
        setUser(res.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, continueWithGoogle, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
