import { pipeline } from "@xenova/transformers";

// Khởi tạo hàm rút trích tính năng (feature-extraction)
export const getEmbedding = async (text) => {
    try {
        // pipeline sẽ tự động tải mô hình nếu chưa có sẵn trong cache
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        // Tiến hành biến chữ thành vector
        const output = await extractor(text, {
            pooling: 'mean',
            normalize: true
        });
        // console.log(output);
        // Chuyển kết quả định dạng Float32Array từ thư viện về mảng [Number] thông thường của JS
        return Array.from(output.data);
    } catch (error) {
        console.error("Lỗi tạo Embedding:", error);
        throw error;
    }
};
// const [name, description, category] = ["hai", 'truyện về hành trình của 1 nhân vật tên hai', 'phiêu lưu']

// const run = async () => {
//     const textToEmbed = `
//         tên sách: ${name}.
//         mô tả: ${description}.
//         thể loại: ${category}.
//     `
//     console.log(textToEmbed);
//     const vectorEmbed = await getEmbedding(textToEmbed);
//     console.log(vectorEmbed);
// }
// run();

