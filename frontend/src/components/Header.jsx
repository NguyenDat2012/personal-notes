import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export const Header = () =>{
    const { user, logout } = useAuth();

    return <div className="relative space-y-3 text-center">
        {user && (
            <>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/15">
                    <span>👋</span>
                    <span>Xin chào, {user.name}</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={logout}
                    title="Đăng xuất"
                >
                    <LogOut className="size-4"/>
                </Button>
            </>
        )}
        <div className="space-y-2">
            <h1 className="text-4xl font-bold text-transparent bg-primary bg-clip-text">NHIỆM VỤ</h1>
            <p className="text-muted-foreground">Không có việc gì khó, chỉ sợ mình không làm</p>
        </div>
    </div>
};