import { useCallback } from "react"
import { Link } from "react-router"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from "../ui/label"
import { useAuthStore } from "@/stores/useAuthStore"
import { useNavigate } from "react-router"
import GoogleButton from "@/components/GoogleButton"

const signInSchema = z.object({
  username: z.string().min(3,'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().min(6,"Mật khẩu phải có ít nhất 6 ký tự")
});
type SignInFormValues = z.infer<typeof signInSchema>

export function SigninForm({className,...props}: React.ComponentProps<"div">) {
    const {signIn, googleAuth} = useAuthStore();
    const navigate = useNavigate()
    const {register, handleSubmit, formState: { errors, isSubmitting}} = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema)
      });

    const onSubmit = async (data: SignInFormValues) =>{
    //gọi api từ backend
      const {username, password} = data;
      await signIn(username, password);
      navigate("/");
    }

    const handleGoogleCredential = useCallback(async (credential: string) => {
      const ok = await googleAuth(credential);
      if (ok) navigate("/");
    }, [googleAuth, navigate]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="relative z-10 w-full max-w-sm mx-auto p-6 border-0 bg-gradient-card shadow-custom-lg">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-primary bg-clip-text">
            Đăng nhập
          </h1>
          <p className="text-sm text-muted-foreground">
            Chào mừng quay lại với Nhiệm Vụ
          </p>
        </div>

        <div className="mb-4">
          <GoogleButton onCredential={handleGoogleCredential} text="signin_with" />
        </div>
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-white text-muted-foreground">hoặc</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Tên tài khoản</Label>
            <Input
              id="username"
              type="text"
              placeholder="nguyenvana"
              className="h-11"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
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
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </Card>
    </div>
  )
}
