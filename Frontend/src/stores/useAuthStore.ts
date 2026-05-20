import {create} from "zustand";
import {toast} from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";

//file này dùng để quản lý trạng thái xác thực người dùng trong ứng dụng frontend bằng thư viện Zustand.

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null, 
    loading: false,
    setAccessToken: (accessToken) => {
        set({ accessToken });
    },

    clearState: () => {
        set({accessToken: null, user: null, loading: false});
    },

    signUp: async (username, password, email, firstname, lastname) => {
        try {
            set({ loading: true });
            // Gọi API đăng ký
            await authService.signUp(username, password, email, firstname, lastname);

            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        } catch (error) {
            console.error("Đăng ký thất bại:", error);
            toast.error("Đăng ký thất bại. Vui lòng thử lại.");
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    signIn: async (username, password) => {
        try {
            set({ loading: true });
            
            const {accessToken} = await authService.signIn(username, password);

            get().setAccessToken(accessToken);

            await get().fetchMe();

            toast.success("Đăng nhập thành công!");
        } catch (error) {
            console.error("Đăng nhập thất bại:", error);
            toast.error("Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.");
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        try {
            get().clearState();
            await authService.signOut();
            toast.success("Đăng xuất thành công!");
        } catch (error) {
            console.error("Đăng xuất thất bại:", error);
            toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    fetchMe: async () => {
        try {
            set({ loading: true });
            const res = await authService.fetchMe();
            
            console.log("Raw response from service:", res);

            // Giả sử res trả về object { user: {...} }, ta chỉ lấy phần ruột
            // Nếu res chính là user info thì giữ nguyên, nếu bọc trong 'user' thì lấy res.user
            const userData = res.user ? res.user : res; 
            
            set({ user: userData }); 
            
            console.log("User saved to store:", userData);
        } catch (error) {
            console.error("Lấy thông tin người dùng thất bại:", error);
            // Don't clear accessToken here - only clear user
            set({ user: null });
            toast.error("Lấy thông tin người dùng thất bại. Vui lòng đăng nhập lại.");
            throw error;
        } finally {
            set({ loading: false });
        }       
    },  
    refresh: async () => {
        try {
            set ({ loading: true });

            const response = await authService.refresh();
            const newAccessToken = typeof response === 'string' ? response : response?.accessToken;

            if (!newAccessToken) {
                throw new Error('Refresh did not return a valid access token');
            }

            get().setAccessToken(newAccessToken);
            
            // Only fetch user info if we don't have it yet
            const {user} = get();
            if (!user) {
                try {
                    await get().fetchMe();
                } catch (fetchErr) {
                    // Silently fail - user can still access some pages
                    console.warn("Could not restore user profile:", fetchErr);
                }
            }
            
            return newAccessToken;
        } catch (error) {
            console.error("Token refresh failed:", error);
            return false;
        } finally {
            set ({ loading: false });
        }
    }
}));
