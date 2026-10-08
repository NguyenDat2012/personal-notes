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

const signUpSchema = z.object({
  firstname: z.string().min(1,'Tên bắt buộc phải có'),
  lastname: z.string().min(1,'Họ bắt buộc phải có'),
  username: z.string().min(3,'Tên đăng nhập phải có ít nhất 3 ký tự'),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6,"Mật khẩu phải có ít nhất 6 ký tự")
});

type SignUpFormValues = z.infer<typeof signUpSchema>

export function SignupForm({className,...props}: React.ComponentProps<"div">) {
  const { signUp, googleAuth } = useAuthStore();
  const navigate = useNavigate();

  const {register, handleSubmit, formState: { errors, isSubmitting}} = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema)
  });

  const onSubmit = async (data: SignUpFormValues) =>{
    const { firstname, lastname, username, email, password} = data;
    //gọi api từ backend
    await signUp(username, password, email, firstname, lastname);

    navigate("/signin");
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
            Tạo tài khoản
          </h1>
          <p className="text-sm text-muted-foreground">
            Bắt đầu quản lý nhiệm vụ của riêng bạn
          </p>
        </div>

        <div className="mb-4">
          <GoogleButton onCredential={handleGoogleCredential} text="signup_with" />
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lastname">Họ</Label>
              <Input
                id="lastname"
                type="text"
                placeholder="Nguyễn"
                className="h-11"
                {...register("lastname")}
              />
              {errors.lastname && (
                <p className="text-sm text-destructive">{errors.lastname.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="firstname">Tên</Label>
              <Input
                id="firstname"
                type="text"
                placeholder="Văn A"
                className="h-11"
                {...register("firstname")}
              />
              {errors.firstname && (
                <p className="text-sm text-destructive">{errors.firstname.message}</p>
              )}
            </div>
          </div>
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nguyenvana@gmail.com"
              className="h-11"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ít nhất 6 ký tự"
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
            {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-center text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link to="/signin" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  )
}
