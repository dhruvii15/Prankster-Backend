const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const prankSchemaData = new Schema({
    UserId: String,
    Link: String,
    CoverImage: String,
    File: String,
    Type: String,
    Name: String,
    View: {
        type: Number,
        default: 0
    }
});
const PRANK = mongoose.model('Prank', prankSchemaData);

module.exports = PRANK;