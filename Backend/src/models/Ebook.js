import mongoose from "mongoose";

const ebookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    
    images: [{ type: String }],
    pdfFile: { type: String, required: true }, // The digital book file path
    
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    
    specifications: {
        type: Map,
        of: String 
    },

    sold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }

}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ebookSchema.pre('save', function() {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9 ]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }
});

ebookSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'ebook' // Assuming we might add 'ebook' field to Review model, or maybe not needed right now
});

ebookSchema.index({ name: 'text', description: 'text' });
ebookSchema.index({ category: 1, price: 1 });
ebookSchema.index({ sold: -1 });

export default mongoose.model("Ebook", ebookSchema);
