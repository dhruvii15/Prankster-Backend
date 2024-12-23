const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const prankSchemaData = new Schema({
    Link: String,
    CoverImage: String,
    ShareURL: String,
    File: String,
    Type: String,
    Name: String,
    ItemId: Number,
});
const PRANK = mongoose.model('Prank', prankSchemaData);

module.exports = PRANK;