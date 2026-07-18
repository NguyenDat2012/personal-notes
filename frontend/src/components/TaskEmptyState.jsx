import React from "react";
import { Card } from "./ui/card";
import { Circle } from "lucide-react";

export const TaskEmptyState = ({filter}) =>{
    return (
        <Card className="p-8 text-center border-0 bg-gradient-card shadow-custom-md">
            <div className="space-y-3">
                <Circle className="mx-auto size-12 text-muted-foreground"/>
                <div>
                    <h3 className='font-medium text-foreground'>
                        {
                            filter === 'active' ? "Không có nhiệm vụ nào đang làm.":
                            filter === 'complete' ? "Chưa có nhiệm vụ nào hoàn thành." :
                            "Chưa có nhiệm vụ."
                        }
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {
                            filter === 'all' ? "Thêm nhiệm vụ đầu tiền vào để bắt đầu!": 
                            `Chuyển sang "Tất cả" để thấy những nhiệm vụ ${filter=== 'active' ? "đã hoàn thành" : "đang làm"}`
                        }
                    </p>
                </div>
            </div>
        </Card>
    );
};