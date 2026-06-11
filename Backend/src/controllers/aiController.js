import OpenAI from "openai";
import Product from "../models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export const chatWithAI = async (req, res) => {
    try {
        const { message,history } = req.body;
        // console.log(message);

        const products = await Product.find()
            // .select("name price");

        const productContext = products
            .map((p) => `${p.name} giá ${p.price}đ id ${p._id}`)
            .join(",");

        const systemPrompt = `
                Bạn là trợ lý AI của Book Shop.

                Thông tin sản phẩm hiện có:
                ${productContext}

                Nhiệm vụ:
                - Tư vấn sản phẩm cho khách hàng.
                - Trả lời thân thiện bằng tiếng Việt.
                - Nếu không biết thì nói rõ không có thông tin.

                `;

        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                ...(history || []).map(mes=>{
                    return {
                        role:mes.role,
                        content:mes.content
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