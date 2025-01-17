const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');
const CATEGORY = require('../models/category');
const USERAUDIO = require('../models/userAudio');
const GALLERY = require('../models/gallery');

exports.CreateAudio = async function (req, res, next) {
    try {
      console.log(req.compressedAudioFile);
      
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
        // If files are uploaded, map the filenames and use the first file
        const audioImageFilename = req.audioImageFile; // Combine filenames if multiple
        req.body.AudioImage = `https://pslink.world/api/public/images/audio/${audioImageFilename}`;
    } else if (typeof req.body.AudioImage === 'string' && req.body.AudioImage.trim()) {
        // Use the provided string if it is a valid non-empty string
        req.body.AudioImage = req.body.AudioImage.trim();
    } else {
        // Fallback to a random default image if no AudioImage is provided
        const randomIndex = Math.floor(Math.random() * defaultAudioImages.length);
        req.body.AudioImage = defaultAudioImages[randomIndex];
    }
      
        if (req.files && req.files.Audio) {
          const audioFilename = req.compressedAudioFile;
          req.body.Audio = `https://pslink.world/api/public/images/audio/${audioFilename}`;
      } else if (typeof req.body.Audio === 'string') {
          req.body.Audio = req.body.Audio; // Use the string directly
      } else {
          throw new Error('Audio is required.');
      }

        // Get the highest existing ItemId
        const highestItem = await AUDIO.findOne().sort('-ItemId').exec();
        const nextId = highestItem ? highestItem.ItemId + 1 : 1;

        // Assign the new ID to req.body.ItemId
        req.body.ItemId = nextId;

        const dataCreate = await AUDIO.create(req.body);

        if (req.body.role) {
          await USERAUDIO.findByIdAndDelete(req.body.role);
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

exports.ReadAudio = async function (req, res, next) {
  try {
    const categoryData = await CATEGORY.find({ Type: "audio" }).select('CategoryName CategoryId -_id');
    
    const AudioData = await AUDIO.find();

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
                const audioFilename = req.compressedAudioFile;
                req.body.Audio = `https://pslink.world/api/public/images/audio/${audioFilename}`;
            }
            if (req.files.AudioImage) {
              const audioImageFilename = req.audioImageFile;
              req.body.AudioImage = `https://pslink.world/api/public/images/audio/${audioImageFilename}`;
          }
        }

        const dataUpdate = await AUDIO.findByIdAndUpdate(req.params.id, req.body, { new: true });
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



//     try {
//      if (req.headers['x-forwarded-proto'] !== 'https') {
//            throw new Error('Please use HTTPS protocol')
//          }
//         const hasWhitespaceInKey = (obj) => {
//             return Object.keys(obj).some((key) => /\s/.test(key));
//         };

//         if (hasWhitespaceInKey(req.body)) {
//             throw new Error('Field names must not contain whitespace.');
//         }

//         if (!req.body.CategoryId || !req.body.TypeId) {
//             throw new Error('CategoryId & TypeId values are required.');
//         }

//         const userId = req.User; // Assuming this is set in your authentication middleware
//         if (!userId) {
//             throw new Error('User not authenticated');
//         }

//         // Fetch user's favorite lists and collect fields
//         const user = await USER.findById(userId).select('FavouriteAudio FavouriteVideo FavouriteGallery SpinAudio SpinVideo SpinGallery');
//         if (!user) {
//             throw new Error('User not found');
//         }

//         let data;
//         let favoriteList;
//         let collectField;
//         let premiumField; // To handle category-specific premium field

//         // Fetch data based on TypeId
//         switch (req.body.TypeId) {
//             case '1': // Audio
//                 data = await AUDIO.find({ CategoryId: req.body.CategoryId }).select('-__v -CategoryId -_id');
//                 favoriteList = user.FavouriteAudio;
//                 collectField = 'SpinAudio';
//                 premiumField = 'AudioPremium'; 
//                 if (!data || data.length === 0) {
//                     throw new Error('Audio Not Found');
//                 }
//                 break;
//             case '2': // Video
//                 data = await VIDEO.find({ CategoryId: req.body.CategoryId }).select('-__v -CategoryId -_id');
//                 favoriteList = user.FavouriteVideo;
//                 collectField = 'SpinVideo';
//                 premiumField = 'VideoPremium'; 
//                 if (!data || data.length === 0) {
//                     throw new Error('Video Not Found');
//                 }
//                 break;
//             case '3': // Gallery
//                 data = await GALLERY.find({ CategoryId: req.body.CategoryId }).select('-__v -CategoryId -_id');
//                 favoriteList = user.FavouriteGallery;
//                 collectField = 'SpinGallery';
//                 premiumField = 'GalleryPremium';
//                 if (!data || data.length === 0) {
//                     throw new Error('Gallery Image Not Found');
//                 }
//                 break;
//             default:
//                 throw new Error('Invalid Category');
//         }

//         let dataWithUpdatedStatus
//          dataWithUpdatedStatus = data.map((item) => {
//             const itemObject = item.toObject();

//             let updatedItem = { ...itemObject, isFavorite: favoriteList.includes(item.ItemId) };

//             if (user[collectField].includes(item.ItemId)) {
//                 updatedItem[premiumField] = false; // If collected, set premium to false
//             } else if (item[premiumField] !== undefined) {
//                 updatedItem[premiumField] = item[premiumField]; // Use category-specific premium field
//             }


//             return updatedItem;
//         });

//         if (req.body.collect) {
//             const collectNumber = parseInt(req.body.collect);
//             if (isNaN(collectNumber)) {
//                 throw new Error('Invalid collect value');
//             }
//             if (!user[collectField].includes(collectNumber)) {
//                 await USER.findByIdAndUpdate(userId, { $addToSet: { [collectField]: collectNumber } });
//             }

//              dataWithUpdatedStatus = data.map((item) => {
//                 const itemObject = item.toObject();
    
//                 let updatedItem = { ...itemObject, isFavorite: favoriteList.includes(item.ItemId) };
    
//                 if (user[collectField].includes(item.ItemId)) {
//                     updatedItem[premiumField] = false; // If collected, set premium to false
//                 } else if (item[premiumField] !== undefined) {
//                     updatedItem[premiumField] = item[premiumField]; // Use category-specific premium field
//                 }
    
    
//                 return updatedItem;
//             });
//         }

//         res.status(200).json({
//             status: 1,
//             message: 'Data Found Successfully',
//             data: dataWithUpdatedStatus,
//         });
//     } catch (error) {
//         console.error('Error in FoundAudio:', error);
//         res.status(400).json({
//             status: 0,
//             message: error.message,
//         });
//     }
// };
