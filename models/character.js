const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const characterSchemaData = new Schema({
    CharacterName: String,
    CharacterImage: String,
    Category: String,
});


const CHARACTER = mongoose.model('Character', characterSchemaData);

module.exports = CHARACTER;