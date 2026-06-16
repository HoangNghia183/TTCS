import api from "@/lib/axios";
import type { WarrantyRequest, WarrantyStatus } from "@/types/warranty";
import type { ApiResponse } from "@/types/api";

export const warrantyService = {
    createRequest: async (data: FormData): Promise<WarrantyRequest> => {
        const res = await api.post<ApiResponse<WarrantyRequest>>("/warranty", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.data;
    },

    getMyRequests: async (): Promise<WarrantyRequest[]> => {
        const res = await api.get<ApiResponse<WarrantyRequest[]>>("/warranty/my-requests");
        return res.data.data ? res.data.data : (res.data as any);
    },

    getAllRequests: async (): Promise<WarrantyRequest[]> => {
        const res = await api.get<ApiResponse<WarrantyRequest[]>>("/warranty/admin");
        return res.data.data ? res.data.data : (res.data as any);
    },

    updateStatus: async (id: string, status: WarrantyStatus, adminNote?: string): Promise<WarrantyRequest> => {
        const res = await api.put<ApiResponse<WarrantyRequest>>(`/warranty/admin/${id}`, {
            status,
            adminNote,
        });
        return res.data.data ? res.data.data : (res.data as any);
    },
};