import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
    //   setUser: (user) => {
    //     set({ user });
    //   },
      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        localStorage.clear();
        sessionStorage.clear();
      },
      signUp: async (username, password, email, firstName, lastName) => {
        try {
          set({ loading: true });

          //  gọi api
          await authService.signUp(username, password, email, firstName, lastName);

          toast.success(
            "Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập."
          );
        } catch (error) {
          console.error(error);
          toast.error("Đăng ký không thành công");
        } finally {
          set({ loading: false });
        }
      },
      signIn: async (username, password) => {
        try {
          get().clearState();
          set({ loading: true });

          const { accessToken } = await authService.signIn(username, password);
          get().setAccessToken(accessToken);

          await get().fetchMe();

          toast.success("Chào mừng bạn quay lại với Nhiệm Vụ 🎉");
        } catch (error) {
          console.error(error);
          toast.error("Đăng nhập không thành công!");
        } finally {
          set({ loading: false });
        }
      },
      signOut: async () => {
        try {
          get().clearState();
          await authService.signOut();
          toast.success("Logout thành công!");
        } catch (error) {
          console.error(error);
          toast.error("Lỗi xảy ra khi logout. Hãy thử lại!");
        }
      },
      fetchMe: async () => {
        try {
          set({ loading: true });
          const user = await authService.fetchMe();

          set({ user });
        } catch (error) {
          console.error(error);
          set({ user: null, accessToken: null });
          toast.error("Lỗi xảy ra khi lấy dữ liệu người dùng. Hãy thử lại!");
        } finally {
          set({ loading: false });
        }
      },
      refresh: async () => {
        try {
          set({ loading: true });
          const { user, fetchMe, setAccessToken } = get();
          const accessToken = await authService.refresh();

          setAccessToken(accessToken);

          if (!user) {
            await fetchMe();
          }
        } catch (error) {
          console.error(error);
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          get().clearState();
        } finally {
          set({ loading: false });
        }
      },
      googleAuth: async (credential) => {
        try {
          set({ loading: true });

          const data = await authService.googleAuth(credential);

          if (data.accessToken) {
            //chưa đăng nhập -> đăng nhập bằng Google: lưu access token rồi lấy user, giống signIn
            get().setAccessToken(data.accessToken);
            await get().fetchMe();
            toast.success("Đăng nhập bằng Google thành công!");
          } else {
            //đang đăng nhập -> liên kết Google vào tài khoản hiện tại, giữ nguyên access token
            set({ user: data.user });
            toast.success("Đã liên kết Google! Từ giờ bạn sẽ nhận email nhắc nhở deadline.");
          }
          return true;
        } catch (error: any) {
          console.error(error);
          toast.error(error?.response?.data?.message || "Đăng nhập Google thất bại");
          return false;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }), // chỉ persist user
    }
  )
);
