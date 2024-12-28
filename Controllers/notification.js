const NOTIFICATION = require('../models/notification');
const PUSHNOTIFICATION = require('../models/pushnotification');
const axios = require('axios');


exports.Create = async function (req, res, next) {
    try {
        if (req.body.type === "push") {
            // Create data in the PUSHNOTIFICATION collection
            const pushData = await PUSHNOTIFICATION.create(req.body);

            // Call sendPushNotification function
            await sendPushNotification(pushData.Title, pushData.Description);

            res.status(201).json({
                status: 1,
                message: 'Push Notification Created and Sent Successfully',
                data: pushData,
            });
        } else {
            // Default handling for NOTIFICATION collection
            const data = await NOTIFICATION.create(req.body);

            res.status(201).json({
                status: 1,
                message: 'Data Created Successfully',
                data: data,
            });
        }
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.Read = async function (req, res, next) {
    try {
        let data;
        if (req.body.type === "push") {
             data = await PUSHNOTIFICATION.find();
        } else {
             data = await NOTIFICATION.find();
        }
        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: data,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.Update = async function (req, res, next) {
    try {
        const updatedAd = await NOTIFICATION.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({
            status: 1,
            message: 'Data Updated Successfully',
            data: updatedAd,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.Delete = async function (req, res, next) {
    try {
        await NOTIFICATION.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 1,
            message: 'Data Deleted Successfully',
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};



// =====================================================
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

// const sendRandomNotification = async () => {
//     try {
//         const notifications = await NOTIFICATION.find();
//         if (notifications.length === 0) {
//             console.log('No notifications available.');
//             return;
//         }

//         const randomIndex = Math.floor(Math.random() * notifications.length);
//         const { Title, Description } = notifications[randomIndex];

//         console.log(`Sending notification: ${Title} - ${Description}`);
//         await sendPushNotification(Title, Description);
//     } catch (error) {
//         console.error('Error fetching or sending notification:', error);
//     }
// };

// // // Function to calculate time difference and trigger at 8 PM
// const scheduleNotificationAt8PM = () => {
//     const now = new Date();
//     const targetTime = new Date();
//     targetTime.setHours(20, 0, 0, 0); // 6 PM today

//     if (now > targetTime) {
//         // If it's already past 8 PM, schedule for 8 PM tomorrow
//         targetTime.setDate(targetTime.getDate() + 1);
//     }

//     const delay = targetTime - now;
//     console.log(`Scheduling notification for 8 PM in ${delay}ms`);

//     setTimeout(() => {
//         console.log('Sending scheduled notification...');
//         sendRandomNotification();
//         // Optionally schedule it again for the next day
//         scheduleNotificationAt8PM();
//     }, delay);
// };

// // // Call the function to start the process
// scheduleNotificationAt8PM();
