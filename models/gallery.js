const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const gallerySchemaData = new Schema({
    GalleryName: String,
    GalleryImage : String,
    GalleryPremium:
    {
        type: Boolean,
        required: true
    },
    ArtistName: String,
    CategoryId: Number,
    ItemId: Number,
    Hide: 
    {
        type: Boolean,
        required: true
    },
    viewCount: 
    {
        type: Number,
        default: 0
    }
});
const GALLERY = mongoose.model('Gallery', gallerySchemaData);

module.exports =  GALLERY ;