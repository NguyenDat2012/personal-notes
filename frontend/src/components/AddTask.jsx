import React, { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Clock } from "lucide-react";

import { toast } from "sonner";
import api from "@/lib/axios";

export const AddTask = ({handleNewTaskAdded}) =>{
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [deadline, setDeadline] = useState("");

    const addTask = async () =>{
        if(newTaskTitle.trim()){
            try{
                await api.post("/tasks", {
                    title: newTaskTitle,
                    deadline: deadline ? new Date(deadline).toISOString() : null,
                });
                toast.success(`Nhiệm vụ ${newTaskTitle} đã được thêm vào.`);
                handleNewTaskAdded();
            }catch(error){
                console.error("Lỗi xảy ra khi thêm nhiệm vụ!", error);
                toast.error('Lỗi xảy ra khi thêm nhiệm vụ mới!');
            }
            setNewTaskTitle("");
            setDeadline("");
        }else{
            toast.error("Bạn cần nhập nội dung của nhiệm vụ.");
        }
    }
    const handleKeyPress = (event) => {
        if(event.key === 'Enter')
            addTask();
    };
    return (
        <Card className="p-6 border-0 bg-gradient-card shadow-custom-lg">
            <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                    type="text"
                    placeholder="Nhiệm vụ hệ thống hôm nay của bạn?"
                    className="h-12 text-base bg-slate-50 sm:flex-1 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    value={newTaskTitle}
                    onChange = {(even)=>setNewTaskTitle(even.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <div className="relative sm:w-56">
                    <Clock className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 size-4 text-muted-foreground"/>
                    <Input
                        type="datetime-local"
                        title="Hạn chót (tùy chọn) - hệ thống sẽ gửi email nhắc bạn trước 1 ngày"
                        className="h-12 pl-9 text-base bg-slate-50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        value={deadline}
                        onChange={(e)=>setDeadline(e.target.value)}
                    />
                </div>
                <Button 
                    variant="gradient"
                    size="xl"
                    className="px-6"
                    onClick={addTask}
                    disabled={!newTaskTitle.trim()}
                >
                    <Plus className="size-5"/>Thêm
                </Button>
            </div>
        </Card>
    );

};
