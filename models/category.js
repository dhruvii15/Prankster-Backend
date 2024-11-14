const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchemaData = new Schema({
    CategoryName: String,
    CategoryImage: String,
    Type: String,
    CategoryId: Number,
});


const CATEGORY = mongoose.model('Category', categorySchemaData);

module.exports = CATEGORY;