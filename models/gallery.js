const mongoose = require('mongoose');
const { connection1 } = require('../db');

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
const GALLERY = connection1.model('Gallery', gallerySchemaData);

module.exports =  GALLERY ;