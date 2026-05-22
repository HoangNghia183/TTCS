import { useState } from "react";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";
import { toast } from "sonner";

interface Props {
    onClose: () => void;
    onCreated: (p: Product) => void;
}

const AddProductModal = ({ onClose, onCreated }: Props) => {
    const [form, setForm] = useState({
        name: "",
        price: "",
        stock: 0,
        imgFile: null as File | null,
        bookFile: null as File | null
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: files ? files[0] : name === "stock" ? +value : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.price) {
            toast.error("Vui lòng nhập tên và giá sản phẩm");
            return;
        }

        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value as string | Blob);
        });

        try {
            setSubmitting(true);
            const created = await productService.create(formData);
            toast.success("Tạo sản phẩm thành công");
            onCreated(created);
            // Reset form
            setForm({
                name: "",
                price: "",
                stock: 0,
                imgFile: null,
                bookFile: null
            });
            onClose();
        } catch (err) {
            toast.error("Tạo sản phẩm thất bại. Vui lòng thử lại");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4"
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        Thêm sản phẩm
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>
                <input
                    name="name"
                    placeholder="Tên sản phẩm"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                    name="price"
                    type="number"
                    placeholder="Giá"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />

                <input
                    name="stock"
                    type="number"
                    placeholder="Số lượng"
                    value={form.stock}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Ảnh sản phẩm
                    </label>

                    <input
                        name="imgFile"
                        type="file"
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-700
            file:mr-3 file:px-3 file:py-1
            file:border-0 file:rounded
            file:bg-indigo-100 file:text-indigo-700"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        File sách
                    </label>

                    <input
                        name="bookFile"
                        type="file"
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-700
            file:mr-3 file:px-3 file:py-1
            file:border-0 file:rounded
            file:bg-indigo-100 file:text-indigo-700"
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
                        {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductModal;