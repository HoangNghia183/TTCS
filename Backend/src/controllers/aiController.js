import OpenAI from "openai";
import Product from "../models/Product.js";
import dotenv from "dotenv";
import { getEmbedding } from "../utils/embed.js";
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export const chatWithAI = async (req, res) => {
    try {
        const { message, history=[] } = req.body;
        // console.log(message);
        const rewriteResponse = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: `Bạn là trợ lý xử lý ngôn ngữ. Nhiệm vụ của bạn là lấy câu nói của khách hàng và chuyển nó thành một chuỗi từ khóa ngắn gọn, tập trung hoàn toàn vào tên sách, tác giả, thể loại hoặc nội dung ngắn gọn để phục vụ việc tìm kiếm database vector. 
Xóa bỏ hoàn toàn từ chào hỏi, từ thừa (chào shop, ạ, nhé, không biết...). 
Chỉ trả về chuỗi từ khóa tìm kiếm cốt lõi hoặc suy luận ra từ khoá tìm kiếm cốt lõi liên quan, không giải thích gì thêm.

Ví dụ: "Dạ chào shop, không biết bên mình có cuốn đắc nhân tâm ko ạ" -> "Đắc Nhân Tâm"
Ví dụ: "tư vấn mình truyện ma nào rùng rợn tí" -> "truyện ma kinh dị rùng rợn"
Ví dụ: "tôi muốn học code" -> "công nghệ thông tin"`
                },
                { role: "user", content: message }
            ],
            temperature: 0.1 // Giữ nhiệt độ thấp để AI làm việc chính xác, không bịa chữ
        });

        const optimizedSearchQuery = rewriteResponse.choices[0].message.content.trim();
        console.log("Câu tìm kiếm sau khi tối ưu:", optimizedSearchQuery); 

        const queryVector = await getEmbedding(optimizedSearchQuery);

        const relatedProducts = await Product.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": queryVector,
                    "numCandidates": 20,
                    "limit": 5
                }
            },
            { "$project": { "name": 1, "description": 1, "price": 1, "slug": 1 ,"category":1} }
        ]);
        await Product.populate(relatedProducts,{
            path:'category'
        })
        // console.log(relatedProducts);
        // console.log(relatedProducts);
        // const products = await Product.find()
        //     .limit(5)
        //     .select("name price");
        
        const productContext = relatedProducts
            .map((p) => `${p.name} giá ${p.price}đ thể loại ${p.category.name} mô tả sách ${p.description}`)
            .join(",\n");
        

        const systemPrompt = `
                Bạn là trợ lý AI của Book Shop.

                sản phẩm đã có:
                ${productContext}                

                Nhiệm vụ:
                - Tư vấn sản phẩm cho khách hàng.
                - Trả lời thân thiện và ngắn gọn bằng tiếng Việt.
                - Nếu không có thông tin trong những thông tin được cung cấp hãy trả lời là không có thông tin.
                `;

        const completion = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {   
                    role: "system",
                    content: systemPrompt,
                },
                ...history.map(value=>{
                    return {
                        role:value.role,
                        content:value.content
                    }
                }),
                {
                    role: "user",
                    content: message,
                },
            ],
            temperature: 0.7,
        });
        // console.log(completion.choices[0].message.content);
        return res.status(200).json({
            message: completion.choices[0].message.content,
        });
    } catch (error) {
        console.error("Groq Error:", error);

        return res.status(500).json({
            message: error.message,
        });
    }
};