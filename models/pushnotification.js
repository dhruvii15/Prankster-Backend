const mongoose = require('mongoose');
const { connection1 } = require('../db');

const Schema = mongoose.Schema;

const PushNotificationSchemaData = new Schema({
    Title: String,
    Description: String
},
{ timestamps: true });

module.exports = connection1.model('push-notification', PushNotificationSchemaData)