const mongoose = require('mongoose');

const { connection1 } = require('../db');
const Schema = mongoose.Schema;

const userGallerySchemaData = new Schema({
    GalleryImage: String,
    GalleryName: String,
});
const USERGALLERY = connection1.model('UserGallery', userGallerySchemaData);

module.exports =  USERGALLERY;