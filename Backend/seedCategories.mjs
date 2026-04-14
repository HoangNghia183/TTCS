// seedCategories.mjs  — run with: node seedCategories.mjs
// Reseeds bookstore categories.
// ⚠️  Drops all existing categories and products first for a clean slate.
import 'dotenv/config';
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        image: { type: String },
        description: { type: String },
    },
    { timestamps: true },
);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Also clear products so stale category ObjectId refs don't linger
const productSchema = new mongoose.Schema({ name: String }, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const categories = [
    {
        name: 'Tiểu Thuyết',
        slug: 'fiction',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop',
        description: 'Các tác phẩm văn học hư cấu, tiểu thuyết lãng mạn, giả tưởng và trinh thám đặc sắc.',
    },
    {
        name: 'Thiếu Nhi',
        slug: 'children',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop',
        description: 'Sách tranh, truyện kể và kiến thức bổ ích giúp khơi dậy trí tưởng tượng cho trẻ nhỏ.',
    },
    {
        name: 'Phát Triển Bản Thân',
        slug: 'self-help',
        image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=400&fit=crop',
        description: 'Những cuốn sách truyền cảm hứng, hướng dẫn kỹ năng sống và phát triển sự nghiệp.',
    },
    {
        name: 'Khoa Học',
        slug: 'science',
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=400&fit=crop',
        description: 'Kiến thức về vũ trụ, công nghệ sinh học, máy tính và các phát minh vĩ đại.',
    },
    {
        name: 'Lịch Sử',
        slug: 'history',
        image: 'https://images.unsplash.com/photo-1461301214746-1e109215d6d3?w=600&h=400&fit=crop',
        description: 'Nhìn lại quá khứ qua góc nhìn lịch sử và những bài học vô giá.',
    },
    {
        name: 'Truyện Tranh',
        slug: 'manga',
        image: 'https://images.unsplash.com/photo-1598466667104-1296bd2068aa?w=600&h=400&fit=crop',
        description: 'Thế giới truyện tranh Nhật Bản, Hàn Quốc đầy màu sắc và hấp dẫn.',
    },
];

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Wipe existing categories & products for a clean slate
    await Product.deleteMany({});
    console.log('🗑️  Cleared all products.');
    await Category.deleteMany({});
    console.log('🗑️  Cleared all categories.');

    let created = 0;
    for (const c of categories) {
        await Category.create(c);
        console.log(`✅ Created: ${c.name} (slug: ${c.slug})`);
        created++;
    }

    console.log(`\n🎉 Done! ${created} categories created.`);
    await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
