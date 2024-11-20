const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subcategoryData = new Schema({
   SubCategory : {
        type: String,
        require: true
   }
});

module.exports = mongoose.model('subcategory',subcategoryData)