const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userData = new Schema({
    Premium:
    {
        type: Boolean,
        required: true
    },
    FavouriteAudio: [Number],
    FavouriteVideo: [String],
    FavouriteGallery: [String],
    FavouriteCover: [String]
});

module.exports = mongoose.model('register',userData)