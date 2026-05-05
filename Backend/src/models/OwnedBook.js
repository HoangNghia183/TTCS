import mongoose from 'mongoose'

const ownedBookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    myBooks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
})

export default mongoose.model(
    "OwnedBook",
    ownedBookSchema,
    "ownedBooks"
);