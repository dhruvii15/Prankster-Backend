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
    FavouriteCover: [String],
    // Spin : {
    //     type: Number,
    //     default: 4
    // },
    // SpinAudio: [Number],
    // SpinVideo: [String],
    // SpinGallery: [String],
    // SpinCover: [String]
},
{ timestamps: true });

module.exports = mongoose.model('register',userData)