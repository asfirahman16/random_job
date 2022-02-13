const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    categoryID:{
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
});

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;