const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userGallerySchemaData = new Schema({
    GalleryImage: String,
    GalleryName: String,
});
const USERGALLERY = mongoose.model('UserGallery', userGallerySchemaData);

module.exports =  USERGALLERY;