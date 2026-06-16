import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import AppRoutes from "@/routes/AppRoutes";
import ChatWidget from "@/components/features/ai/ChatWidget";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AuthLayout from "./layouts/AuthLayout";
import ScrollToTop from "@/components/common/ScrollToTop";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

function App() {
  const { initializeAuth, initialized } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--pet-coral)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors expand />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Auth routes use AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* All other routes handled by AppRoutes */}
          <Route path="/*" element={<AppRoutes />} />
        </Routes>

        {/* Floating AI chat bubble */}
        <ChatWidget />
      </BrowserRouter>
    </>
  );
}

export default App;
