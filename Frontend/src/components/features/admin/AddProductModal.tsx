import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";
import { toast } from "sonner";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

interface Props {
    onClose: () => void;
    onCreated: (p: Product) => void;
}

interface FormValues {
    name: string;
    price: string;
    stock: string | number;
    category: string;
    imgFile: File | null;
    bookFile: File | null;
    specifications: string;
    description: string;
}

const AddProductModal = ({ onClose, onCreated }: Props) => {
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Khởi tạo useForm từ react-hook-form
    const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
        defaultValues: {
            name: "",
            price: "",
            stock: "",
            category: "",
            imgFile: null,
            bookFile: null,
            specifications: "",
            description: ""
        }
    });

    // Watch values để gán vào thuộc tính value của các input (giúp giữ nguyên cơ chế hoạt động cũ của UI)
    const formValues = watch();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const catsList = await categoryService.getAll();
        setCategoriesList(catsList);
    };

    // Hàm xử lý thay đổi file riêng biệt cho react-hook-form
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setValue(name as "imgFile" | "bookFile", files[0]);
        }
    };

    const onSubmit = async (data: FormValues) => {
        if (!data.name || !data.price) {
            toast.error("Vui lòng nhập tên và giá sản phẩm");
            return;
        }

        const formData = new FormData();

        // Append tất cả dữ liệu vào FormData giống như logic ban đầu
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                // Chuyển stock thành số nếu tồn tại như hàm handleChange cũ
                if (key === "stock" && value !== "") {
                    formData.append(key, String(+value));
                } else {
                    formData.append(key, value as string | Blob);
                }
            }
        });

        try {
            setSubmitting(true);
            const created = await productService.create(formData);
            toast.success("Tạo sản phẩm thành công");
            onCreated(created);
            onClose();
        } catch (err) {
            toast.error("Tạo sản phẩm thất bại. Vui lòng thử lại");
            console.error(err);
        }  {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <form
                onSubmit={handleSubmit(onSubmit)}
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
                    {...register("name")}
                    placeholder="Tên sản phẩm"
                    value={formValues.name}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                    {...register("price")}
                    type="number"
                    placeholder="Giá"
                    value={formValues.price}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />

                <input
                    {...register("stock")}
                    type="number"
                    placeholder="Số lượng"
                    value={formValues.stock}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <select 
                    {...register("category")}
                    value={formValues.category}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">chọn thể loại</option>
                    {categoriesList.map(val => {
                        return <option key={val._id} value={val._id}>{val.name}</option>
                    })}
                </select>
                <textarea 
                    {...register("specifications")}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formValues.specifications}
                    placeholder={`nhập thông tin cụ thể khác dạng:\nname1 : value1\nname2 : value2`}
                >
                </textarea>
                <input 
                    type="text" 
                    {...register("description")}
                    value={formValues.description}
                    placeholder="miêu tả"
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Ảnh sản phẩm
                    </label>

                    <input
                        name="imgFile"
                        type="file"
                        onChange={handleFileChange}
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
                        onChange={handleFileChange}
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