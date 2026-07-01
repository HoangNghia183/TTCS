import OpenAI from 'openai';
import Product from '../models/Product.js';
import Ebook from '../models/Ebook.js';

// Khởi tạo client dùng thư viện chuẩn OpenAI nhưng trỏ endpoint về máy chủ của Groq
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

// @desc    Chat với Bot
// @route   POST /api/ai/chat
export const chatWithAI = async (req, res) => {
    const { message, history } = req.body;

    try {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const serverUrl = process.env.SERVER_URL || 'http://localhost:5001';

        // Trích xuất từ khóa từ câu hỏi để tìm kiếm sản phẩm liên quan (RAG đơn giản)
        const keywords = message.toLowerCase().split(/\s+/).filter(w => w.length > 2);

        const getImageUrl = (img) => {
            if (!img) return '';
            return img.startsWith('http') ? img : `${serverUrl}${img}`;
        };

        // Tìm kiếm sách thường
        const allProducts = await Product.find({ stock: { $gt: 0 } }).populate('category', 'name').select('_id name price slug images category');
        const scoredProducts = allProducts.map(p => {
            let score = 0;
            const pName = p.name.toLowerCase();
            const pCat = p.category ? p.category.name.toLowerCase() : '';
            keywords.forEach(kw => {
                if (pName.includes(kw)) score += 3;
                if (pCat.includes(kw)) score += 2;
            });
            score += Math.random(); // Trộn ngẫu nhiên nếu cùng điểm
            return { product: p, score };
        });
        scoredProducts.sort((a, b) => b.score - a.score);
        const products = scoredProducts.slice(0, 15).map(sp => sp.product);

        const productContext = products.map(p =>
            `- Sách: [${p.name}](${clientUrl}/product/${p._id}) - Giá: ${p.price}đ - Ảnh: ![${p.name}](${getImageUrl(p.images[0])})`
        ).join('\n');

        // --- TÌM KIẾM EBOOK ---
        const allEbooks = await Ebook.find().populate('category', 'name').select('name price slug images category');
        const scoredEbooks = allEbooks.map(p => {
            let score = 0;
            const pName = p.name.toLowerCase();
            const pCat = p.category ? p.category.name.toLowerCase() : '';
            keywords.forEach(kw => {
                if (pName.includes(kw)) score += 3;
                if (pCat.includes(kw)) score += 2;
            });
            score += Math.random();
            return { product: p, score };
        });
        scoredEbooks.sort((a, b) => b.score - a.score);
        const ebooks = scoredEbooks.slice(0, 15).map(sp => sp.product);

        const ebookContext = ebooks.map(p =>
            `- eBook: [${p.name}](${clientUrl}/ebook/${p.slug}) - Giá: ${p.price}đ - Ảnh: ![${p.name}](${getImageUrl(p.images[0])})`
        ).join('\n');

        // Định nghĩa nhân vật và kiến thức
        const systemPrompt = `Bạn là BookBot, một trợ lý ảo tư vấn khách hàng của cửa hàng sách trực tuyến BookStore.
Sứ mệnh của bạn là tư vấn nhiệt tình, thân thiện và chỉ cung cấp thông tin liên quan đến CỬA HÀNG SÁCH, các sản phẩm Sách thường, eBook, quy trình mua hàng, thanh toán, bảo hành.
NẾU KHÁCH HÀNG HỎI CÁC VẤN ĐỀ KHÔNG LIÊN QUAN ĐẾN SÁCH HOẶC CỬA HÀNG, bạn PHẢI TỪ CHỐI trả lời một cách lịch sự. Ví dụ: "Xin lỗi, tôi là trợ lý của BookStore nên chỉ có thể giải đáp các câu hỏi liên quan đến sách và dịch vụ của cửa hàng."

CỬA HÀNG HIỆN ĐANG CÓ CÁC SÁCH THƯỜNG SAU:
${productContext}

CỬA HÀNG HIỆN ĐANG CÓ CÁC EBOOK SAU:
${ebookContext}

HƯỚNG DẪN HIỂN THỊ:
Khi bạn muốn gợi ý một sản phẩm hoặc eBook cụ thể, hãy bắt buộc sử dụng định dạng Markdown sau để hiển thị hình ảnh và đường dẫn:
1. Hình ảnh: ![Tên sách](đường dẫn ảnh)
2. Đường dẫn chi tiết: [Xem chi tiết Tên sách](đường dẫn sản phẩm)
Hãy khéo léo chèn vào câu nói để trông tự nhiên nhất. Ví dụ:
"Bạn có thể tham khảo cuốn sách này nhé:
![Tên sách](${serverUrl}/uploads/image.webp)
[Xem chi tiết Tên sách](${clientUrl}/product/slug) - Giá: 150000đ"

HƯỚNG DẪN THAO TÁC:
1. Hướng dẫn mua eBook: "Để mua eBook, bạn chọn mục Cửa hàng eBook trên menu, sau đó chọn cuốn eBook bạn muốn, nhấn nút 'Mua Ngay với VNPay'. Hệ thống sẽ tự động chuyển sang trang thanh toán. Sau khi thanh toán thành công, bạn có thể tải file PDF/EPUB của sách về thiết bị."
2. Hướng dẫn thanh toán: "Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD) hoặc thanh toán online an toàn qua cổng VNPay đối với sách vật lý. Riêng eBook thì bắt buộc phải thanh toán online qua VNPay."
3. Hướng dẫn tạo đơn bảo hành: "Để yêu cầu bảo hành hoặc đổi trả, bạn vui lòng truy cập vào tài khoản cá nhân, xem Lịch sử đơn hàng, chọn đơn hàng có sách bị lỗi và nhấn nút 'Yêu cầu bảo hành', sau đó làm theo hướng dẫn."`;

        // Chuẩn bị mảng messages theo chuẩn OpenAI/LLaMA
        const messages = [
            { role: "system", content: systemPrompt }
        ];

        // Đưa lịch sử trò chuyện vào mảng messages
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                // Bỏ qua tin nhắn rỗng hoặc tin nhắn trùng lặp ở cuối
                if (msg.content && msg.content.trim() !== '' && msg.content !== message) {
                    messages.push({
                        role: msg.role === 'assistant' ? 'assistant' : 'user',
                        content: msg.content
                    });
                }
            });
        }

        // Đưa câu hỏi hiện tại của người dùng vào cuối mảng
        messages.push({ role: "user", content: message });

        // Gọi API LLaMA 3.3 (Phiên bản 70B cực kỳ thông minh của Meta)
        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 0.7, // Độ sáng tạo (0.0 đến 2.0)
            max_tokens: 1024,
        });

        const replyText = completion.choices[0].message.content;

        res.json({ message: "Success", data: { reply: replyText } });
    } catch (error) {
        console.error("LLaMA API Error:", error);
        res.status(500).json({ message: "Hệ thống AI đang bận hoặc quá tải, vui lòng thử lại sau" });
    }
};