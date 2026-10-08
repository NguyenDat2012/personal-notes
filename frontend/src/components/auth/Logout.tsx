import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';

const Logout= ()=>{
    const { signOut} = useAuthStore();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/signin');
        }catch (error) {
            console.error('Đăng xuất không thành công:', error);
        }
    };
    return (
        <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
            title="Đăng xuất"
        >
            <LogOut className="size-4"/>
        </Button>
    )
}

export default Logout;
