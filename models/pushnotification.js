const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PushNotificationSchemaData = new Schema({
    Title: String,
    Description: String
},
{ timestamps: true });

module.exports = mongoose.model('push-notification', PushNotificationSchemaData)