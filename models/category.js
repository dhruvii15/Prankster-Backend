const mongoose = require('mongoose');
const { connection1 } = require('../db');

const Schema = mongoose.Schema;

const categorySchemaData = new Schema({
    CategoryName: String,
    CategoryImage: String,
    Type: String,
    CategoryId: Number,
});


const CATEGORY = connection1.model('Category', categorySchemaData);

module.exports = CATEGORY;