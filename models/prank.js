const mongoose = require('mongoose');

const { connection1 } = require('../db');

const Schema = mongoose.Schema;

const prankSchemaData = new Schema({
    Link: String,
    CoverImage: String,
    ShareURL: String,
    File: String,
    Image: String,
    Type: String,
    Name: String,
    ItemId: Number,
});
const PRANK = connection1.model('Prank', prankSchemaData);

module.exports = PRANK;