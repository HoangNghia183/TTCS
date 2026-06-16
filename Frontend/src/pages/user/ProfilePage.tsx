import { useState, useRef } from "react";
import Sidebar from "@/components/common/Sidebar";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { userService } from "@/services/userService";
import { toast } from "sonner";

const ProfilePage = () => {
    const { user, fetchMe } = useAuthStore();
    const [form, setForm] = useState({
        displayName: user?.displayName ?? "",
        bio: (user as unknown as { bio?: string })?.bio ?? "",
        phone: (user as unknown as { phone?: string })?.phone ?? "",
    });
    const [saving, setSaving] = useState(false);
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [changingPwd, setChangingPwd] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            await userService.updateAvatar(file);
            await fetchMe?.();
            toast.success("Cập nhật ảnh đại diện thành công!");
        } catch {
            toast.error("Không thể cập nhật ảnh đại diện.");
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]/40 focus:border-[var(--pet-coral)] transition-all placeholder:text-muted-foreground";

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await userService.updateProfile(form);
            await fetchMe?.();
            toast.success("Cập nhật thông tin thành công!");
        } catch {
            toast.error("Không thể cập nhật. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePwd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPwd || !newPwd) return;
        setChangingPwd(true);
        try {
            await userService.changePassword(oldPwd, newPwd);
            toast.success("Đổi mật khẩu thành công!");
            setOldPwd(""); setNewPwd("");
        } catch {
            toast.error("Mật khẩu cũ không đúng hoặc đã xảy ra lỗi.");
        } finally {
            setChangingPwd(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
            <Sidebar mode="user" />
            <main className="flex-1 flex flex-col gap-6">
                <h1 className="section-title">👤 Quản Lý Tài Khoản</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Avatar & Quick Info */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-[var(--pet-coral)]/20 to-violet-500/20"></div>
                            
                            <div className="relative mt-6 mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <UserAvatar user={user} className="w-24 h-24 rounded-full border-4 border-white dark:border-card shadow-md transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">Thay ảnh</span>
                                </div>
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 rounded-full flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-[var(--pet-coral)] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/webp" 
                                onChange={handleAvatarChange} 
                            />

                            <h3 className="font-bold text-lg text-foreground">{user?.displayName || user?.username}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>

                            {((user as unknown as { phone?: string })?.phone || (user as unknown as { bio?: string })?.bio) && (
                                <div className="w-full bg-muted/30 rounded-xl p-4 text-left border border-border/50 space-y-3">
                                    {(user as unknown as { phone?: string })?.phone && (
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Số điện thoại</p>
                                            <p className="text-sm font-semibold text-foreground">{(user as unknown as { phone?: string }).phone}</p>
                                        </div>
                                    )}
                                    {(user as unknown as { bio?: string })?.bio && (
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Giới thiệu</p>
                                            <p className="text-sm text-foreground line-clamp-3">{(user as unknown as { bio?: string }).bio}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Forms */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Profile form */}
                        <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 shadow-sm">
                            <h2 className="font-bold mb-4 text-lg border-b border-border pb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>Thông tin cá nhân</h2>
                            <form onSubmit={handleSave} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">Email</label>
                                        <input className={`${inputCls} bg-muted opacity-70`} value={user?.email ?? ""} disabled />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">Tên hiển thị</label>
                                        <input className={inputCls} placeholder="Tên của bạn" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">Số điện thoại</label>
                                        <input className={inputCls} placeholder="0912 345 678" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">Giới thiệu bản thân</label>
                                    <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Vài dòng về bạn..." value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button type="submit" disabled={saving} className="btn-pet-primary disabled:opacity-50 min-w-[140px] shadow-md hover:shadow-lg">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
                                </div>
                            </form>
                        </div>

                        {/* Change password */}
                        <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 shadow-sm">
                            <h2 className="font-bold mb-4 text-lg border-b border-border pb-3 text-red-500" style={{ fontFamily: "'Nunito', sans-serif" }}>🔒 Đổi mật khẩu</h2>
                            <form onSubmit={handleChangePwd} className="flex flex-col gap-4 max-w-md">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">Mật khẩu hiện tại</label>
                                    <input type="password" className={inputCls} placeholder="••••••••" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wide">Mật khẩu mới</label>
                                    <input type="password" className={inputCls} placeholder="••••••••" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                                </div>
                                <div className="flex justify-start mt-2">
                                    <button type="submit" disabled={changingPwd || !oldPwd || !newPwd} className="btn-pet-secondary disabled:opacity-50 min-w-[140px] shadow-sm">{changingPwd ? "Đang xử lý..." : "Đổi mật khẩu"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;