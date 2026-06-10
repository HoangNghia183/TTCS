import { useState } from "react";
import Sidebar from "@/components/common/Sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

const ProfilePage = () => {
    const { user, fetchMe } = useAuthStore();
    const {handleSubmit,register} = useForm({
        defaultValues:{
            ...user
        }
    });
    const [saving, setSaving] = useState(false);
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [changingPwd, setChangingPwd] = useState(false);

    const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]/40 focus:border-[var(--pet-coral)] transition-all placeholder:text-muted-foreground";

    const onSaveSubmit = async (data:any) => {
        setSaving(true);
        try {
            await userService.updateProfile(data);
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
            const res = await userService.changePassword(oldPwd, newPwd);
            if(res.check) toast.success(res.message);
            else toast.error(res.message);
            setOldPwd(""); setNewPwd("");
        } catch {
            toast.error("Mật khẩu cũ không đúng hoặc đã xảy ra lỗi.");
        } finally {
            setChangingPwd(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
            <Sidebar mode="user" />
            <main className="flex-1 flex flex-col gap-6">
                <h1 className="section-title">👤 Tài Khoản</h1>

                {/* Profile form */}
                <div className="bg-white dark:bg-card rounded-2xl border border-border p-6">
                    <h2 className="font-bold mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Thông tin cá nhân</h2>
                    <form onSubmit={handleSubmit(onSaveSubmit)} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email</label>
                                <input className={inputCls} {...register("email")} disabled />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tên hiển thị</label>
                                <input className={inputCls} placeholder="Tên của bạn" {...register("displayName")} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Số điện thoại</label>
                                <input className={inputCls} {...register("phone")} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">role</label>
                                <input className={inputCls} {...register("role")} disabled />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">address</label>
                                <input className={inputCls} {...register("address")} placeholder="xx - yy - huyện - tỉnh" />
                            </div>
                            
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Giới thiệu</label>
                            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Vài dòng về bạn..." {...register("bio")} />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={saving} className="btn-pet-primary disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
                        </div>
                    </form>
                </div>

                {/* Change password */}
                <div className="bg-white dark:bg-card rounded-2xl border border-border p-6">
                    <h2 className="font-bold mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>🔒 Đổi mật khẩu</h2>
                    <form onSubmit={handleChangePwd} className="flex flex-col gap-4 max-w-md">
                        <input type="password" className={inputCls} placeholder="Mật khẩu hiện tại" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
                        <input type="password" className={inputCls} placeholder="Mật khẩu mới" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                        <div className="flex justify-end">
                            <button type="submit" disabled={changingPwd || !oldPwd || !newPwd} className="btn-pet-secondary disabled:opacity-50">{changingPwd ? "Đang xử lý..." : "Đổi mật khẩu"}</button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;