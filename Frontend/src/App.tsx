import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { useEffect } from "react";
import AppRoutes from "@/routes/AppRoutes";
import ChatWidget from "@/components/features/ai/ChatWidget";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AuthLayout from "./layouts/AuthLayout";
import { useAuthStore } from "@/stores/useAuthStore";

function App() {
	const { refresh } = useAuthStore();

	useEffect(() => {
		// Restore auth state on app mount from refresh token in cookie
		refresh().catch(() => {
			// Silently fail if no valid refresh token
			console.log("No valid session to restore");
		});
	}, [refresh]);

	return (
		<>
			<Toaster position="top-left" richColors expand />
			<BrowserRouter>
				<Routes>
					{/* Auth routes use AuthLayout */}
					<Route element={<AuthLayout />}>
						<Route path="/signin" element={<SignInPage />} />
						<Route path="/signup" element={<SignUpPage />} />
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
