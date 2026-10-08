import React from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import Logout from "@/components/auth/Logout";

export const Header = () =>{
    const { user } = useAuthStore();

    return <div className="relative space-y-3 text-center">
        {user && (
            <>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/15">
                    <span>👋</span>
                    <span>Xin chào, {user.displayName}</span>
                </div>
                <Logout />
            </>
        )}
        <div className="space-y-2">
            <h1 className="text-4xl font-bold text-transparent bg-primary bg-clip-text">NHIỆM VỤ</h1>
            <p className="text-muted-foreground">Không có việc gì khó, chỉ sợ mình không làm</p>
        </div>
    </div>
};