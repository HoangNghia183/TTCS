import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";
import { toast } from "sonner";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

interface Props {
    onClose: () => void;
    product: Product;
    loadProducts: () => void;
}

interface FormValues {
    name: string;
    price: string | number;
    stock: string | number;
    category: string;
    newCategoryName?: string; // 1. Thêm trường này vào FormValues
    newCategoryDescription?: string; // Mô tả cho thể loại mới
    imgFile: File | null;
    bookFile: File | null;
    specifications: string;
    description: string;
}

const convert = (spec: Object) => {
    if (spec) return Object?.entries(spec).map(([key, val]) => `${key} : ${val}`).join('\n');
    else return "";
};

const AddProductModal = ({ onClose, product={} as Product, loadProducts }: Props) => {
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
        defaultValues: {
            name: product?.name ?? "",
            price: product.price ?? "",
            stock: product.stock ?? "",
            category: product?.category?._id ?? "",
            newCategoryName: "",
            newCategoryDescription: "",
            imgFile: null,
            bookFile: null,
            specifications: convert(product?.specifications),
            description: product.description ?? ""
        }
    });

    const formValues = watch();

    useEffect(() => {
        loadCategoryList();
    }, []);

    const loadCategoryList = async () => {
        const catsList = await categoryService.getAll();
        setCategoriesList(catsList);
    };

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

        // 2. Kiểm tra nếu chọn thể loại mới mà để trống ô nhập tên
        if (data.category === "" && !data.newCategoryName?.trim()) {
            toast.error("Vui lòng nhập tên thể loại mới");
            return;
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            // Loại bỏ trường newCategoryName/newCategoryDescription nếu không phải đang chọn tạo thể loại mới
            if ((key === "newCategoryName" || key === "newCategoryDescription") && data.category !== "") {
                return;
            }

            if (value !== null && value !== undefined) {
                if (key === "stock" && value !== "") {
                    formData.append(key, String(+value));
                } else {
                    formData.append(key, value as string | Blob);
                }
            }
        });
        if (!product) {
            try {
                setSubmitting(true);
                await productService.create(formData);
                toast.success(product ? "Cập nhật sản phẩm thành công" : "Tạo sản phẩm thành công");
                loadProducts();
                onClose();
            } catch (err) {
                toast.error("Thao tác thất bại. Vui lòng thử lại");
                console.error(err);
            } finally {
                setSubmitting(false);
            }
        }
        else{
            try {
                setSubmitting(true);
                await productService.update(product._id,formData);
                loadProducts();
                onClose();
            } catch (error) {
                console.log(error);
            } finally{
                setSubmitting(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center sticky top-0 bg-white pb-2 z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {product._id ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
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
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                    {...register("price")}
                    type="number"
                    placeholder="Giá"
                    value={formValues.price}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                    {...register("stock")}
                    type="number"
                    placeholder="Số lượng"
                    value={formValues.stock}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <select
                    {...register("category")}
                    value={formValues.category}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="" className="text-indigo-600 font-semibold">
                        + Thêm thể loại mới
                    </option>
                    {categoriesList.map(val => (
                        <option key={val._id} value={val._id}>{val.name}</option>
                    ))}

                </select>
                {formValues.category === "" && (
                    <input
                        {...register("newCategoryName")}
                        type="text"
                        placeholder="Nhập tên thể loại mới..."
                        value={formValues.newCategoryName}
                        className="w-full p-2 rounded-lg border border-indigo-300 bg-indigo-50/30 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                )}
                {formValues.category === "" && (
                    <input
                        type="text"
                        {...register("newCategoryDescription")}
                        placeholder="Mô tả cho thể loại (tuỳ chọn)"
                        value={formValues.newCategoryDescription}
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                )}

                <textarea
                    {...register("specifications")}
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formValues.specifications}
                    placeholder={`nhập thông tin cụ thể khác dạng:\nname1 : value1\nname2 : value2`}
                    rows={3}
                />

                <input
                    type="text"
                    {...register("description")}
                    value={formValues.description}
                    placeholder="miêu tả"
                    className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Ảnh sản phẩm
                    </label>
                    <input
                        name="imgFile"
                        type="file"
                        onChange={handleFileChange}
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-700 file:mr-3 file:px-3 file:py-1 file:border-0 file:rounded file:bg-indigo-100 file:text-indigo-700"
                    />
                    {product && (
                        <p className="mt-1 p-1.5 bg-gray-50 rounded text-xs text-gray-500 break-all border border-gray-100">
                            {product?.images}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        File sách
                    </label>
                    <input
                        name="bookFile"
                        type="file"
                        onChange={handleFileChange}
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-700 file:mr-3 file:px-3 file:py-1 file:border-0 file:rounded file:bg-indigo-100 file:text-indigo-700"
                    />
                    {product && (
                        <p className="mt-1 p-1.5 bg-gray-50 rounded text-xs text-gray-500 break-all border border-gray-100">
                            {product?.dLoadLink}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white">
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
                        {submitting ? "Đang xử lý..." : product._id ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductModal;