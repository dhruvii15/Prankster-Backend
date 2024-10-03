const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userData = new Schema({
    Premium:
    {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('register',userData)