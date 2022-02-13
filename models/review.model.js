const mongoose = required("mongoose");
const ReviewSchema = new mongoose.Schema({
    reviewID: {
        type: Number,
        required: true,
    },
    rating:{
        type: Number,
        required: true,
    },
    review:{
        type: String,
    },
});

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;