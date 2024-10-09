const USER = require('../models/users')
const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');
const GALLERY = require('../models/gallery');
const COVER = require('../models/cover');
const cron = require('node-cron');


exports.Spin = async function (req, res, next) {
  try {
    // Check for whitespace in field names
    const hasWhitespaceInKey = obj => {
      return Object.keys(obj).some(key => /\s/.test(key));
    };
    if (hasWhitespaceInKey(req.body)) {
      throw new Error('Field names must not contain whitespace.');
    }

    // Check if CategoryId is provided
    if (!req.body.CategoryId) {
      throw new Error('CategoryId value is required');
    }

    // Find user and check spin count
    const user = await USER.findById(req.User);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.Spin <= 0) {
      throw new Error('No spins left');
    }

    let data;
    switch (req.body.CategoryId) {
      case '1':
        data = await AUDIO.find({ AudioPremium: true }).select('AudioName AudioImage ItemId -_id');
        if (!data || data.length === 0) {
          throw new Error('Premium Audio Not Found');
        }
        break;
      case '2':
        data = await VIDEO.find({ VideoPremium: true }).select('VideoName VideoImage ItemId -_id');
        if (!data || data.length === 0) {
          throw new Error('Premium Video Not Found');
        }
        break;
      case '3':
        data = await GALLERY.find({ GalleryPremium: true }).select('GalleryName GalleryImage ItemId -_id');
        if (!data || data.length === 0) {
          throw new Error('Premium Gallery Image Not Found');
        }
        break;
      case '4':
        data = await COVER.find({ CoverPremium: true }).select('CoverURL ItemId -_id');
        if (!data || data.length === 0) {
          throw new Error('Premium Cover Image Not Found');
        }
        break;
      default:
        throw new Error('Invalid Category');
    }

    const randomItem = data[Math.floor(Math.random() * data.length)];

    // Decrease spin count and update user
    const updatedUser = await USER.findByIdAndUpdate(
      req.User,
      { $inc: { Spin: -1 } },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user spin count');
    }

    res.status(201).json({
      status: 1,
      message: 'Spin Successful',
      data: randomItem,
      remainingSpins: updatedUser.spinCount
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: error.message,
    });
  }
};


exports.Count = async function (req, res, next) {
    try {
        const spinData = await USER.findById(req.User);

        if (!spinData) {
            throw new Error("User Not Found")
        }

        if (!spinData.Spin === 0) {
            throw new Error("Spin Value is 0. No more spins left.")
        }
        
        res.status(201).json({
            status: 1,
            message: 'Data Found Successfully',
            data: spinData.Spin
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

async function updateSpin() {
    try {
        await USER.updateMany({}, { $set: { spin: 4 } });
        
        
    } catch (error) {
        console.log(error);
        
    }
}


cron.schedule('* * * * *', async () => {
    try {
        await updateSpin();
    } catch (error) {
        console.error('Error during scheduled task:', error);
    }
});
