const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');
const USERAUDIO = require('../models/userAudio');
const GALLERY = require('../models/gallery');

const AUDIO2 = require('../models2/audio');
const VIDEO2 = require('../models2/video');
const USERAUDIO2 = require('../models2/userAudio');
const GALLERY2 = require('../models2/gallery');

exports.CreateAudio = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.AudioName || !req.body.AudioPremium) {
            throw new Error('AudioName and AudioPremium are required.');
        }

        req.body.viewCount = 0

        const defaultAudioImages = [
          "https://pslink.world/api/public/images/audio1.png",
          "https://pslink.world/api/public/images/audio2.png",
          "https://pslink.world/api/public/images/audio3.png",
          "https://pslink.world/api/public/images/audio4.png",
          "https://pslink.world/api/public/images/audio5.png"
      ];
      
      if (req.files && req.files.AudioImage && req.files.AudioImage.length > 0) {
        const audioImageFilename = req.audioImageFile; 
        req.body.AudioImage = `https://pslink.world/api/public/images/audio/${audioImageFilename}`;
    } else if (typeof req.body.AudioImage === 'string' && req.body.AudioImage.trim()) {
        req.body.AudioImage = req.body.AudioImage.trim();
    } else {
        const randomIndex = Math.floor(Math.random() * defaultAudioImages.length);
        req.body.AudioImage = defaultAudioImages[randomIndex];
    }
      
        if (req.files && req.files.Audio) {
          const audioFilename = req.audioFile;
          req.body.Audio = `https://pslink.world/api/public/images/audio/${audioFilename}`;
      } else if (typeof req.body.Audio === 'string') {
          req.body.Audio = req.body.Audio;
      } else {
          throw new Error('Audio is required.');
      }

        // Get the highest existing ItemId
        const highestItem = await AUDIO2.findOne().sort('-ItemId').exec();
        const nextId = highestItem ? highestItem.ItemId + 1 : 1;

        // Assign the new ID to req.body.ItemId
        req.body.ItemId = nextId;

        const dataCreate = await AUDIO2.create(req.body);

        if (req.body.role) {
          await USERAUDIO2.findByIdAndDelete(req.body.role);
      }

        res.status(201).json({
            status: 1,
            message: 'Data Created Successfully',
            data: dataCreate,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.FoundAudio = async function (req, res, next) {
  try {
    const hasWhitespaceInKey = obj => {
      return Object.keys(obj).some(key => /\s/.test(key));
    };

    if (hasWhitespaceInKey(req.body)) {
      throw new Error('Field names must not contain whitespace.');
    }

    if (!req.body.CategoryId || !req.body.TypeId | !req.body.page) {
      throw new Error('CategoryId , TypeId & page values are required.');
    }

    const page = parseInt(req.body.page, 10) || 1;
      if (page < 1) {
           throw new Error('Invalid page number');
      }

    let data;
    let fileField, nameField, imageField, premiumField;
    const limit = 10;

    switch (req.body.TypeId) {
      case '1':
        data = await AUDIO.find({ CategoryId: req.body.CategoryId, Hide: false }).sort({ viewCount: -1,ItemId: 1 }).select('-__v -CategoryId -_id -Hide')
        .limit(limit *1)
        .skip((page-1) * limit)
        .exec();
        fileField = 'Audio';
        nameField = 'AudioName';
        imageField = 'AudioImage';
        premiumField = 'AudioPremium';
        if (!data) {
          throw new Error('Audio Not Found');
        }
        break;
      case '2':
        data = await VIDEO.find({ CategoryId: req.body.CategoryId, Hide: false }).sort({ viewCount: -1,ItemId: 1 }).select('-__v -CategoryId -_id -Hide')
        .limit(limit *1)
        .skip((page-1) * limit)
        .exec();
        fileField = 'Video';
        nameField = 'VideoName';
        imageField = 'VideoImage';
        premiumField = 'VideoPremium';
        if (!data) {
          throw new Error('Video Not Found');
        }
        break;
      case '3':
        data = await GALLERY.find({ CategoryId: req.body.CategoryId, Hide: false }).sort({ viewCount: -1,ItemId: 1 }).select('-__v -CategoryId -_id -Hide')
        .limit(limit *1)
        .skip((page-1) * limit)
        .exec();
        fileField = 'Gallery';
        nameField = 'GalleryName';
        imageField = 'GalleryImage';
        premiumField = 'GalleryPremium';
        if (!data) {
          throw new Error('Gallery Image Not Found');
        }
        break;
      default:
        throw new Error('Invalid Category');
    }

    // Add favorite status to each item
    const dataWithFavoriteStatus = data.map(item => ({
      File: item[fileField] || " ",
      Name: item[nameField] || " ",
      Image: item[imageField] || " ",
      Premium: item[premiumField] || false,
      ItemId: item.ItemId || " ",
      ArtistName: item.ArtistName || " ",
    }));

    res.status(200).json({
      status: 1,
      message: 'Data Found Successfully',
      data: dataWithFavoriteStatus,
    });

  } catch (error) {
    console.error('Error in FoundAudio:', error);
    res.status(400).json({
      status: 0,
      message: error.message,
    });
  }
};

exports.FoundAudio2 = async function (req, res, next) {
    try {
      const hasWhitespaceInKey = obj => {
        return Object.keys(obj).some(key => /\s/.test(key));
      };
  
      if (hasWhitespaceInKey(req.body)) {
        throw new Error('Field names must not contain whitespace.');
      }

      if (!req.body.categoryid || !req.body.prankid  || !req.body.languageid || !req.body.page) {
        throw new Error('categoryid , prankid , languageid & page values are required.');
      }

      const page = parseInt(req.body.page, 10) || 1;
        if (page < 1) {
             throw new Error('Invalid page number');
        }

      let data;
      let fileField, nameField, imageField, premiumField;
      const limit = 10;
  
      switch (req.body.prankid) {
        case '1':
          data = await AUDIO2.find({ CategoryId: req.body.categoryid, LanguageId: req.body.languageid, Hide: false }).sort({ ItemId: -1, viewCount: -1 }).select('-__v -CategoryId -_id -Hide')
          .limit(limit *1)
          .skip((page-1) * limit)
          .exec();
          fileField = 'Audio';
          nameField = 'AudioName';
          imageField = 'AudioImage';
          premiumField = 'AudioPremium';
          if (!data) {
            throw new Error('Audio Not Found');
          }
          break;
        case '2':
          data = await VIDEO2.find({ CategoryId: req.body.categoryid, LanguageId: req.body.languageid, Hide: false }).sort({ ItemId: -1, viewCount: -1 }).select('-__v -CategoryId -_id -Hide')
          .limit(limit *1)
          .skip((page-1) * limit)
          .exec();
          fileField = 'Video';
          nameField = 'VideoName';
          imageField = 'VideoImage';
          premiumField = 'VideoPremium';
          if (!data) {
            throw new Error('Video Not Found');
          }
          break;
        case '3':
          data = await GALLERY2.find({ CategoryId: req.body.categoryid, LanguageId: req.body.languageid, Hide: false }).sort({ ItemId: -1, viewCount: -1 }).select('-__v -CategoryId -_id -Hide')
          .limit(limit *1)
          .skip((page-1) * limit)
          .exec();
          fileField = 'GalleryImage';
          nameField = 'GalleryName';
          imageField = 'Gallery';
          premiumField = 'GalleryPremium';
          if (!data) {
            throw new Error('Gallery Image Not Found');
          }
          break;
        default:
          throw new Error('Invalid Category');
      }
  
      // Add favorite status to each item
      const dataWithFavoriteStatus = data.map(item => ({
        File: item[fileField] || " ",
        Name: item[nameField] || " ",
        Image: item[imageField] || " ",
        Premium: item[premiumField] || false,
        ItemId: item.ItemId || " ",
        ArtistName: item.ArtistName || " ",
      }));
  
      res.status(200).json({
        status: 1,
        message: 'Data Found Successfully',
        data: dataWithFavoriteStatus,
      });

    } catch (error) {
      console.error('Error in FoundAudio:', error);
      res.status(400).json({
        status: 0,
        message: error.message,
      });
    }
  };

exports.ReadAudio = async function (req, res, next) {
  try {
    const categoryData = await CATEGORY.find({ Type: "audio" }).select('CategoryName CategoryId -_id');
    
    const AudioData = await AUDIO2.find();

    const categoryMap = {};
    categoryData.forEach(category => {
      categoryMap[category.CategoryId] = category.CategoryName;
    });

    const processedAudioData = AudioData.map(item => ({
      ...item.toObject(),
      CategoryName: categoryMap[item.CategoryId] 
    }));
    
    res.status(200).json({
      status: 1,
      message: 'Data Found Successfully',
      data: processedAudioData,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: error.message,
    });
  }
};

exports.UpdateAudio = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (req.files) {
            if (req.files.Audio) {
                const audioFilename = req.audioFile;
                req.body.Audio = `https://pslink.world/api/public/images/audio/${audioFilename}`;
            }
            if (req.files.AudioImage) {
              const audioImageFilename = req.audioImageFile;
              req.body.AudioImage = `https://pslink.world/api/public/images/audio/${audioImageFilename}`;
          }
        }

        const dataUpdate = await AUDIO2.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({
            status: 1,
            message: 'Data Updated Successfully',
            data: dataUpdate,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};


exports.DeleteAudio = async function (req, res, next) {
    try {
        await AUDIO.findByIdAndDelete(req.params.id);
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
