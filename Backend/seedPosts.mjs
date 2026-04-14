// seedPosts.mjs
// Inserts sample blog posts about books into MongoDB.
import 'dotenv/config';
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, unique: true },
        content: { type: String, required: true },
        excerpt: { type: String },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['blog', 'forum_topic'], default: 'blog' },
        thumbnail: { type: String },
        tags: [{ type: String }],
        views: { type: Number, default: 0 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true },
);
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

const User = mongoose.models.User ||
    mongoose.model('User', new mongoose.Schema({ username: String, role: String }, { strict: false }));

const slug = (s) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
        .replace(/\s+/g, '-').replace(/-+/g, '-');

const posts = [
    {
        title: 'Top 5 Cuốn Sách Phát Triển Bản Thân Nên Đọc',
        slug: 'top-5-cuon-sach-phat-trien-ban-than-nen-doc',
        tags: ['phát triển bản thân', 'sách hay', 'gợi ý'],
        thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=450&fit=crop',
        excerpt: 'Danh sách 5 cuốn sách sẽ thay đổi tư duy và giúp bạn nâng cấp bản thân.',
        content: `<h2>1. Đắc Nhân Tâm - Dale Carnegie</h2>
<p>Một cuốn sách bất hủ về giao tiếp và thu phục lòng người. Ai cũng nên đọc ít nhất một lần để thấu hiểu người khác.</p>
<h2>2. Nhà Lãnh Đạo Không Chức Danh - Robin Sharma</h2>
<p>Bạn không cần có chức danh hay quyền lực để trở thành một người lãnh đạo trong chính công việc và cuộc sống của mình.</p>
<h2>3. Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ - James Clear</h2>
<p>Cách những thói quen nhỏ từ nguyên tử ảnh hưởng đến sự thay đổi lớn lao.</p>`,
    },
    {
        title: 'Tác Giả Khuyên Đọc: Những Cuốn Sách Lịch Sử Hấp Dẫn',
        slug: 'tac-gia-khuyen-doc-nhung-cuon-sach-lich-su-hap-dan',
        tags: ['lịch sử', 'review sách', 'tác giả'],
        thumbnail: 'https://images.unsplash.com/photo-1461301214746-1e109215d6d3?w=800&h=450&fit=crop',
        excerpt: 'Khám phá quá khứ hào hùng của nhân loại qua những trang sách chân thực.',
        content: `<h2>1. Sapiens Lược Sử Loài Người</h2>
<p>Cách ngôn ngữ, văn hóa và niềm tin đã hình thành loài người (Homo Sapiens) trở thành giống loài thống trị trái đất.</p>
<h2>2. Súng, Vi Trùng Và Thép</h2>
<p>Jared Diamond giải thích cặn kẽ tại sao người Á-Âu lại là những người chinh phục toàn thế giới chứ không phải các khu vực khác.</p>`,
    }
];

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        console.error('❌ No admin user found. Create an admin account first, then re-run.');
        process.exit(1);
    }

    let created = 0;
    
    // Clear old posts
    await Post.deleteMany({});
    console.log('🗑️  Cleared old posts.');

    for (const p of posts) {
        await Post.create({ ...p, author: admin._id, type: 'blog', views: Math.floor(Math.random() * 800) + 50 });
        console.log(`✅ Created: ${p.title}`);
        created++;
    }

    console.log(`\n🎉 Done! ${created} posts created.`);
    await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
