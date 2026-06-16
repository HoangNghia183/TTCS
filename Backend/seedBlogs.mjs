import mongoose from 'mongoose';
import User from './src/models/User.js';
import Post from './src/models/Post.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/BookDB';

const blogs = [
    {
        title: 'Review Sách: Kỹ Năng Phòng Tránh Bắt Nạt Và Bạo Lực Học Đường (Tú Anh)',
        content: `
<p>Bạo lực học đường luôn là một chủ đề nhức nhối không chỉ đối với nhà trường mà còn là nỗi băn khoăn lớn của các bậc phụ huynh. Cuốn sách <strong>“Kỹ Năng Phòng Tránh Bắt Nạt Và Bạo Lực Học Đường”</strong> của tác giả Tú Anh nổi lên như một vị cứu tinh, một cuốn cẩm nang thiết thực hướng dẫn cách đối diện và giải quyết vấn đề nhạy cảm này.</p>

<p>Được thiết kế một cách logic, tác giả đi từ việc phân tích tâm lý của cả nạn nhân lẫn kẻ đi bắt nạt, để từ đó chỉ ra những dấu hiệu nhận biết khi một đứa trẻ đang bị bạo hành. Cuốn sách không dừng lại ở lý thuyết mà đưa ra các tình huống đóng vai, những câu nói mẫu và cả các bài tập rèn luyện sự tự tin để trẻ biết cách nói "Không" một cách dứt khoát.</p>

<p>Điểm làm tôi thích nhất ở cuốn sách là lối viết vô cùng gần gũi, không phán xét, không giáo điều. Tú Anh hiểu được cảm giác đơn độc của các em học sinh khi bị cô lập, và giúp các em xây dựng một vòng tròn an toàn từ bạn bè và thầy cô. Đây thực sự là cuốn sách cần có trong tủ sách của mọi gia đình và trường học.</p>
        `,
        tags: ['Review Sách', 'Kỹ Năng Sống', 'Giáo dục']
    },
    {
        title: 'Bí kíp làm chủ Trí Tuệ Nhân Tạo qua cuốn PROMPT ĐIỀU KHIỂN AI (ĐƯỜNG CEOVIC)',
        content: `
<p>Kể từ sự trỗi dậy của ChatGPT, "Kỹ sư Prompt" (Prompt Engineering) đã trở thành một từ khóa vô cùng hot. Nếu bạn đang loay hoay không biết làm thế nào để AI trả lời đúng ý mình, làm thế nào để nó không "ảo giác", thì <strong>PROMPT ĐIỀU KHIỂN AI</strong> của tác giả Đường Ceovic chính là câu trả lời.</p>

<p>Sách không đi quá sâu vào thuật toán khô khan mà tập trung vào tính ứng dụng. Đường Ceovic cung cấp cho bạn các công thức Prompt theo cấu trúc rõ ràng: Định danh -> Ngữ cảnh -> Yêu cầu -> Ràng buộc. Áp dụng đúng công thức này, những câu trả lời từ AI trở nên vô cùng sắc bén và giải quyết đúng trọng tâm.</p>

<p>Bạn sẽ tìm thấy trong sách rất nhiều case-study thực tế từ ứng dụng AI để viết content, lập trình, cho đến xử lý dữ liệu và thiết kế ảnh. Đối với những ai làm marketing, lập trình viên hay content creator, đây là khoản đầu tư sinh lời ngay tức thì. Ai không học AI, người đó sẽ bị thụt lùi!</p>
        `,
        tags: ['Công nghệ', 'AI', 'Prompt Engineering', 'Review Sách']
    },
    {
        title: 'Đại Việt Thông Sử (Lê Quý Đôn) - Tác phẩm đồ sộ của lịch sử dân tộc',
        content: `
<p>Được chấp bút bởi nhà bác học lớn nhất thời Lê trung hưng - Lê Quý Đôn, <strong>Đại Việt thông sử</strong> không chỉ là một bộ sử, mà còn là một kho tàng văn hóa đồ sộ, một niềm tự hào của dân tộc Việt Nam.</p>

<p>Cuốn sách biên chép lại lịch sử từ thời kỳ nhà Lê bắt đầu khởi nghĩa Lam Sơn cho đến thời Lê Cung Hoàng. Đọc “Đại Việt thông sử”, ta không chỉ choáng ngợp trước kiến thức uyên bác của cụ Lê Quý Đôn mà còn phải nể phục khả năng đánh giá lịch sử sắc sảo, khách quan, và tinh thần dân tộc cao độ. Cụ không chỉ viết về các bậc vua chúa, mà còn ghi chép rất kỹ về các vị đại thần, tướng lĩnh, liệt nữ, và cả những kẻ phản thần, từ đó rút ra bài học nhân sinh sâu sắc.</p>

<p>Với các mọt sách yêu lịch sử, đây là một ấn bản không thể bỏ qua để hiểu thêm về gốc gác ngàn năm văn hiến của cha ông.</p>
        `,
        tags: ['Lịch Sử', 'Sách Kinh Điển', 'Lê Quý Đôn']
    },
    {
        title: 'Hành trình đến hành tinh cát Arrakis cùng DUNE (Frank Herbert)',
        content: `
<p>Tại sao <strong>DUNE (Xứ Cát)</strong> lại được vinh danh là tượng đài khoa học viễn tưởng vĩ đại nhất mọi thời đại? Câu trả lời nằm ở quy mô thế giới quan vô tiền khoáng hậu mà Frank Herbert đã cất công xây dựng.</p>

<p>Dune không chỉ xoay quanh những cuộc chiến không gian hay súng laser. Đó là một bản hùng ca phức tạp về sinh thái học, triết học, chính trị, tôn giáo và sự tha hóa của quyền lực. Hành tinh Arrakis khô cằn nhưng độc quyền chế tạo hương dược (spice) là hình ảnh phản chiếu hoàn hảo cho thế giới thực trị giá bằng dầu mỏ của chúng ta.</p>

<p>Qua ngòi bút tinh tế, Frank Herbert khắc họa nhân vật Paul Atreides không phải như một người hùng hoàn hảo, mà là một cá nhân bị giằng xé bởi định mệnh nghiệt ngã. Dù đã có phần 1 và 2 của bộ phim bom tấn chiếu rạp, tin tôi đi, trải nghiệm đọc sách nguyên tác mang lại một chiều sâu cảm xúc mà không thước phim nào có thể truyền tải hết. Xứ Cát vĩnh viễn là một biểu tượng!</p>
        `,
        tags: ['Khoa học viễn tưởng', 'Tiểu Thuyết', 'Frank Herbert', 'Review Sách']
    }
];

function generateSlug(title) {
    return title.toLowerCase()
        .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9 ]/g, '')
        .trim()
        .replace(/\\s+/g, '-');
}

async function runSeeder() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to Database');

        // Tìm hoặc tạo User Nguyễn A
        let user = await User.findOne({ username: 'nguyena' });
        if (!user) {
            user = new User({
                username: 'nguyena',
                email: 'nguyena@example.com',
                hashedPassword: 'hashed_password_dummy', // Chỉ dùng cho seed
                displayName: 'Nguyễn A',
                role: 'customer'
            });
            await user.save();
            console.log('Created User: Nguyễn A');
        } else {
            console.log('Found User: Nguyễn A');
        }

        for (const blog of blogs) {
            const slug = generateSlug(blog.title);
            
            // Xóa bài nếu đã tồn tại để tránh trùng
            await Post.deleteOne({ slug });

            const newPost = new Post({
                title: blog.title,
                slug: slug,
                content: blog.content,
                author: user._id,
                type: 'blog',
                tags: blog.tags,
                // Lấy random 1 cái hình cho đẹp
                thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
            });
            
            await newPost.save();
            console.log(`Inserted blog: ${blog.title}`);
        }

        console.log('✅ Seeding blogs successful!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding blogs:', error);
        process.exit(1);
    }
}

runSeeder();
