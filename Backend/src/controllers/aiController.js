import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Chat với Bot
// @route   POST /api/ai/chat
export const chatWithAI = async (req, res) => {
    const { message } = req.body;

    try {
        // (Optional) Lấy 5 sản phẩm mới nhất để làm context cho AI
        const products = await Product.find().limit(5).select('name price');
        const productContext = products.map(p => `${p.name} giá ${p.price}đ`).join(', ');

        const systemPrompt = `Bạn là trợ lý ảo của BookStore. Hãy tư vấn thân thiện. Cửa hàng đang có các sản phẩm: ${productContext}.`;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            systemInstruction: systemPrompt 
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ message: "Success", data: { reply: text } });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ message: "AI đang bận, vui lòng thử lại sau" });
    }
};