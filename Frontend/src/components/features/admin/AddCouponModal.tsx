import { useState } from "react";
import { useForm } from "react-hook-form";
import { couponService } from "@/services/couponService";
// import type { Coupon } from "@/types/coupon";
import { toast } from "sonner";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

interface FormValues {
    code: string;
    discountType: "percent" | "fixed";
    value: string | number;
    minOrderValue: string | number;
    expirationDate: string;
    usageLimit: string | number;
}

const AddCouponModal = ({ onClose, onSuccess }: Props) => {
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit } = useForm<FormValues>({
        defaultValues: {
            code: "",
            discountType: "percent",
            value: "",
            minOrderValue: "0",
            expirationDate: "",
            usageLimit: "100"
        }
    });

    // const formValues = watch();

    const onSubmit = async (data: FormValues) => {
        if (!data.code?.trim() || !data.value || !data.expirationDate) {
            toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }

        try {
            setSubmitting(true);
            await couponService.createCoupon({
                code: data.code.toUpperCase(),
                discountType: data.discountType,
                value: Number(data.value),
                minOrderValue: Number(data.minOrderValue) || 0,
                expirationDate: data.expirationDate,
                usageLimit: Number(data.usageLimit) || 100,
                isActive: true
            } as any);

            toast.success("Tạo mã giảm giá thành công");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Tạo mã giảm giá thất bại");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4"
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Tạo mã giảm giá</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã *
                    </label>
                    <input
                        {...register("code")}
                        placeholder="VD: SUMMER20"
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại *
                        </label>
                        <select
                            {...register("discountType")}
                            className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="percent">Phần trăm (%)</option>
                            <option value="fixed">Số tiền cố định (đ)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị *
                        </label>
                        <input
                            {...register("value")}
                            type="number"
                            placeholder="VD: 20"
                            min="0"
                            className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn hàng tối thiểu (đ)
                    </label>
                    <input
                        {...register("minOrderValue")}
                        type="number"
                        placeholder="0"
                        min="0"
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hạn sử dụng *
                    </label>
                    <input
                        {...register("expirationDate")}
                        type="date"
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số lượt dùng
                    </label>
                    <input
                        {...register("usageLimit")}
                        type="number"
                        placeholder="100"
                        min="1"
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitting ? "Đang tạo..." : "Tạo mã"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCouponModal;
