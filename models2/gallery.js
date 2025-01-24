const mongoose = require('mongoose');
const { connection2 } = require('../db'); 


const Schema = mongoose.Schema;

const gallerySchemaData = new Schema({
    GalleryName: String,
    GalleryImage : String,
    GalleryPremium:
    {
        type: Boolean,
        required: true
    },
    CategoryId: Number,
    LanguageId: Number,
    ItemId: Number,
    Hide: 
    {
        type: Boolean,
        required: true
    },
    Unsafe: 
    {
        type: Boolean,
        required: true
    },
    viewCount: 
    {
        type: Number
    }
});
const GALLERY = connection2.model('Gallery', gallerySchemaData);

module.exports =  GALLERY ;