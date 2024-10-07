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
    CharacterId: Number,
    ItemId: Number,
});
const GALLERY = mongoose.model('Gallery', gallerySchemaData);

module.exports =  GALLERY ;