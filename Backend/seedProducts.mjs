// seedProducts.mjs
// IMPORTANT: Run seedCategories.mjs first so that categories already exist.
import 'dotenv/config';
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    { name: String, slug: String, image: String, description: String },
    { strict: false, timestamps: true },
);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        images: [{ type: String }],
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        specifications: { type: Map, of: String },
        stock: { type: Number, required: true, default: 0 },
        sold: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
    },
    { timestamps: true },
);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const toSlug = (s) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
        .replace(/\s+/g, '-').replace(/-+/g, '-');

const productsByCategoryName = {
    'Tiểu Thuyết': [
        {
            name: 'Cây Cam Ngọt Của Tôi',
            description: 'Vị chua chát của cái nghèo hòa trộn với vi ngọt ngào khi khám phá ra những điều khiến cuộc đời này đáng sống. Một tác phẩm kinh điển của Brazil.',
            price: 88000,
            originalPrice: 108000,
            images: [
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=800&fit=crop',
            ],
            specifications: new Map([
                ['Tác giả', 'José Mauro de Vasconcelos'],
                ['Nhà xuất bản', 'NXB Hội Nhà Văn'],
                ['Số trang', '244'],
                ['Hình thức', 'Bìa mềm'],
                ['Năm xuất bản', '2020'],
            ]),
            stockBase: 150, soldBase: 1200,
        },
        {
            name: 'Hai Số Phận',
            description: 'Là một câu chuyện hấp dẫn về khát vọng và tham vọng, một cuộc phiêu lưu ngoạn mục của tâm hồn. Cuốn sách kể về hai người đàn ông sinh ra cùng một ngày nhưng có hoàn cảnh trái ngược.',
            price: 135000,
            originalPrice: 160000,
            images: [
                'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800&h=800&fit=crop',
            ],
            specifications: new Map([
                ['Tác giả', 'Jeffrey Archer'],
                ['Nhà xuất bản', 'NXB Văn Học'],
                ['Số trang', '680'],
                ['Hình thức', 'Bìa cứng'],
                ['Năm xuất bản', '2021'],
            ]),
            stockBase: 50, soldBase: 800,
        },
        {
            name: 'Trăm Năm Cô Đơn',
            description: 'Trăm năm cô đơn là một trong những tác phẩm nổi tiếng nhất thế giới nói về gia đình Buendia qua 7 thế hệ ở ngôi làng Macondo hư cấu.',
            price: 150000,
            originalPrice: 180000,
            images: [
                'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop',
            ],
            specifications: new Map([
                ['Tác giả', 'Gabriel García Márquez'],
                ['Nhà xuất bản', 'NXB Văn Học'],
                ['Số trang', '400'],
                ['Hình thức', 'Bìa cứng'],
            ]),
            stockBase: 100, soldBase: 500,
        }
    ],
    'Phát Triển Bản Thân': [
        {
            name: 'Đắc Nhân Tâm',
            description: 'Cuốn sách nổi tiếng nhất, có ảnh hưởng nhất của mọi thời đại, đưa ra các lời khuyên về cách ứng xử và giao tiếp.',
            price: 76000,
            originalPrice: 95000,
            images: [
                'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop',
            ],
            specifications: new Map([
                ['Tác giả', 'Dale Carnegie'],
                ['Nhà xuất bản', 'NXB Tổng Hợp TPHCM'],
                ['Số trang', '320'],
                ['Hình thức', 'Bìa mềm'],
            ]),
            stockBase: 200, soldBase: 2500,
        },
        {
            name: 'Nhà Lãnh Đạo Không Chức Danh',
            description: 'Cung cấp những bài học sâu sắc để giúp bạn vượt qua những giới hạn và trở thành phiên bản tốt nhất trong công việc và cuộc sống.',
            price: 65000,
            originalPrice: 80000,
            images: [
                'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=800&fit=crop',
            ],
            specifications: new Map([
                ['Tác giả', 'Robin Sharma'],
                ['Nhà xuất bản', 'NXB Trẻ'],
                ['Số trang', '280'],
            ]),
            stockBase: 120, soldBase: 650,
        }
    ],
    'Khoa Học': [
        {
            name: 'Vũ Trụ',
            description: 'Carl Sagan mô tả lại quá trình hình thành của vũ trụ, sự tiến hóa của không gian và thời gian với những góc nhìn sâu sắc.',
            price: 155000,
            originalPrice: 185000,
            images: [
                'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=800&h=800&fit=crop',
            ],
            specifications: new Map([
                ['Tác giả', 'Carl Sagan'],
                ['Nhà xuất bản', 'NXB Thế Giới'],
                ['Số trang', '500'],
            ]),
            stockBase: 40, soldBase: 310,
        },
        {
            name: 'Sapiens - Lược Sử Loài Người',
            description: 'Yuval Noah Harari đưa người đọc đi sâu vào lịch sử phát triển của nhân loại từ thời kỳ đồ đá cho đến thế kỷ 21.',
            price: 210000,
            originalPrice: 250000,
            images: [
                'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=800&fit=crop',
            ],
            specifications: new Map([
                ['Tác giả', 'Yuval Noah Harari'],
                ['Nhà xuất bản', 'NXB Tri Thức'],
            ]),
            stockBase: 90, soldBase: 1540,
        }
    ],
    'Lịch Sử': [
        {
            name: 'Súng, Vi Trùng Và Thép',
            description: 'Một cái nhìn bao quát về lịch sử nhân loại, giải đáp nguyên nhân vì sao xã hội loài người lại phát triển không đồng đều.',
            price: 180000,
            originalPrice: 220000,
            images: [
                'https://images.unsplash.com/photo-1461301214746-1e109215d6d3?w=800&h=800&fit=crop',
            ],
            specifications: new Map([
                ['Tác giả', 'Jared Diamond'],
                ['Nhà xuất bản', 'NXB Thế Giới'],
            ]),
            stockBase: 60, soldBase: 420,
        }
    ]
};

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    const categories = await Category.find();
    if (categories.length === 0) {
        console.error('❌ No categories found. Please run seedCategories.mjs first.');
        process.exit(1);
    }

    const categoryMap = {};
    for (const c of categories) {
        categoryMap[c.name] = c._id;
    }

    // Optional: Delete existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared all products.');

    let insertedCount = 0;
    
    for (const [catName, prodList] of Object.entries(productsByCategoryName)) {
        const catId = categoryMap[catName];
        if (!catId) {
            console.warn(`⚠️ Warning: Category "${catName}" not found in DB. Skipping products.`);
            continue;
        }

        for (const p of prodList) {
            let slugStr = p.slug;
            if (!slugStr) {
                slugStr = toSlug(p.name);
            }

            const exists = await Product.findOne({ slug: slugStr });
            if (exists) {
                console.log(`⏩ Product "${p.name}" already exists, skipping...`);
                continue;
            }

            const stockInfo = p.stockBase ? Math.floor(p.stockBase + Math.random() * 50) : Math.floor(Math.random() * 100) + 10;
            const soldInfo = p.soldBase ? Math.floor(p.soldBase + Math.random() * 100) : Math.floor(Math.random() * 500);

            const newProduct = {
                name: p.name,
                slug: slugStr,
                description: p.description,
                price: p.price,
                originalPrice: p.originalPrice || p.price * 1.2,
                images: p.images,
                category: catId,
                specifications: p.specifications,
                stock: stockInfo,
                sold: soldInfo,
                views: soldInfo + Math.floor(Math.random() * 2000),
                averageRating: Math.floor(Math.random() * 2) + 4, // 4-5
                reviewCount: Math.floor(Math.random() * 100)
            };

            await Product.create(newProduct);
            insertedCount++;
            console.log(`✅ Created product: ${p.name}`);
        }
    }

    console.log(`\n🎉 Done! Added ${insertedCount} products successfully.`);
    await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
