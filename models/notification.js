const mongoose = require('mongoose');
const { connection1 } = require('../db');

const Schema = mongoose.Schema;

const NotificationSchemaData = new Schema({
    Title: String,
    Description: String
},
{ timestamps: true });

module.exports = connection1.model('notification', NotificationSchemaData)