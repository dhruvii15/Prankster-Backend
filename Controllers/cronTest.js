const axios = require('axios');
const mongoose = require('mongoose');
const NOTIFICATION = require('../models/notification'); // Assuming the Notification model is correctly defined.

let isNotificationSending = false;

const sendPushNotification = async (Title, Description) => {
    const appId = 'd8e64d76-dc16-444f-af2d-1bb802f7bc44';
    const apiKey = 'os_v2_app_3dte25w4czce7lzndo4af554irheutetk6yu72u7q4jssozmmiylifff5oy26cv4oevduf7qr5x3gff33torqwqa56cwjuri4tfsyyq';

    const url = 'https://onesignal.com/api/v1/notifications';

    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${apiKey}`,
    };

    const data = {
        app_id: appId,
        included_segments: ['All'],
        headings: { en: Title },
        contents: { en: Description },
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log('Push Notification Response:', response.data);
    } catch (error) {
        console.error('Error Sending Push Notification:', error.response?.data || error.message);
    }
};

const sendRandomNotification = async () => {
    if (isNotificationSending) {
        console.log('Notification sending is already in progress. Skipping execution.');
        return;
    }

    isNotificationSending = true; // Set the lock

    try {
        const notifications = await NOTIFICATION.find();
        if (notifications.length === 0) {
            console.log('No notifications available.');
            return;
        }

        const randomIndex = Math.floor(Math.random() * notifications.length);
        const { Title, Description } = notifications[randomIndex];

        console.log(`Sending notification: ${Title} - ${Description}`);
        // await sendPushNotification(Title, Description);
    } catch (error) {
        console.error('Error fetching or sending notification:', error);
    } finally {
        isNotificationSending = false; // Release the lock
    }
};

// Call the function once per cron job execution (no need for setInterval)
sendRandomNotification();


// /home/plexustechnology/nodevenv/pslink.world/api/20/bin/node /home/plexustechnology/pslink.world/api/Controllers/cronTest.js > /home/plexustechnology/pslink.world/api/Controllers/cron-output.log 2>&1