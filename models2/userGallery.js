const mongoose = require('mongoose');
const { connection2 } = require('../db'); 


const Schema = mongoose.Schema;

const userGallerySchemaData = new Schema({
    GalleryImage: String,
    GalleryName: String,
});
const USERGALLERY = connection2.model('UserGallery', userGallerySchemaData);

module.exports =  USERGALLERY;