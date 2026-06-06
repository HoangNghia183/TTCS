import api from "@/lib/axios";
import type { User } from "@/types/user";
import type { ApiResponse } from "@/types/api";
export interface UpdateProfilePayload {
    displayName?: string;
    bio?: string;
    phone?: string;
}

export const userService = {
    getProfile: async (): Promise<User> => {
        const res = await api.get<ApiResponse<User>>("/users/me");
        return res.data.data;
    },

    updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
        const res = await api.put<ApiResponse<User>>("/users/profile", payload);
        return res.data.data;
    },

    updateAvatar: async (file: File): Promise<User> => {
        const form = new FormData();
        form.append("avatar", file);
        const res = await api.put<ApiResponse<User>>("/users/me/avatar", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.data;
    },

    changePassword: async (oldPassword: string, newPassword: string): Promise<any> => {
        const res = await api.put("/users/password", { oldPassword, newPassword });
        return res.data;
    },

    getAllUsers: async (page = 1, limit = 20): Promise<User[]> => {
        const res = await api.get<any>(`/users?page=${page}&limit=${limit}`);
        return res.data;
    },

    blockUser: async (userId: string): Promise<void> => {
        await api.put(`/users/${userId}/block`);
    },

    unblockUser: async (userId: string): Promise<void> => {
        await api.put(`/users/${userId}/unblock`);
    },
    getOwnedBook: async (): Promise<any> => {
        const res = await api.get(`/products/owned-book`);
        return res.data;
    }
};