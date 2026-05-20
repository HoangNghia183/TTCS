import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

//file này dùng để cấu hình axios instance với các interceptor để tự động thêm token xác thực vào header của các yêu cầu và xử lý làm mới token khi hết hạn.  

const api = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
    withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } 

    return config;
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    //những api không cần check
    if(originalRequest.url.includes("/auth/signin") || originalRequest.url.includes("/auth/signup") || originalRequest.url.includes("/auth/refresh")){ 
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    // Xử lý 401 (access token hết hạn) hoặc 403 (refresh token hết hạn)
    if ((error.response.status === 401 || error.response.status === 403) && originalRequest._retryCount < 1) {
      originalRequest._retryCount += 1;

      console.log("Attempting to refresh token...", originalRequest._retryCount);

      try {
        const res = await api.post("/auth/refresh", {}, { withCredentials: true });
        const { accessToken } = res.data;

        if (!accessToken) {
          throw new Error('No access token returned from refresh');
        }

        useAuthStore.getState().setAccessToken(accessToken);
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        };

        return api(originalRequest);
      } 
      catch (err) {
        console.log("Refresh failed, clearing auth state");
        useAuthStore.getState().clearState();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);


export default api;