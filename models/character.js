const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const characterSchemaData = new Schema({
    CharacterName: String,
    CharacterImage: String,
    Category: String,
    CharacterId: Number,
});


const CHARACTER = mongoose.model('Character', characterSchemaData);

module.exports = CHARACTER;