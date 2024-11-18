const AUDIO = require('../models/audio');
const VIDEO = require('../models/video');
const USERAUDIO = require('../models/userAudio');
const GALLERY = require('../models/gallery');

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

        if (!req.body.ArtistName) {
          req.body.ArtistName = null;
        }

        req.body.AudioImage = `https://pslink.world/api/public/images/AudioImage.jfif `;

        if (req.files && req.files.Audio) {
          const audioFilename = req.files.Audio.map((el) => el.filename);
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
  
      if (!req.body.CategoryId || !req.body.TypeId) {
        throw new Error('CategoryId & TypeId values are required.');
      }
  
      let data;
      let fileField, nameField, imageField, premiumField;
  
      switch (req.body.TypeId) {
        case '1':
          data = await AUDIO.find({ CategoryId: req.body.CategoryId, Hide: false }).select('-__v -CategoryId -_id -Hide');
          fileField = 'Audio';
          nameField = 'AudioName';
          imageField = 'AudioImage';
          premiumField = 'AudioPremium';
          if (!data || data.length === 0) {
            throw new Error('Audio Not Found');
          }
          break;
        case '2':
          data = await VIDEO.find({ CategoryId: req.body.CategoryId, Hide: false }).select('-__v -CategoryId -_id -Hide');
          fileField = 'Video';
          nameField = 'VideoName';
          imageField = 'VideoImage';
          premiumField = 'VideoPremium';
          if (!data || data.length === 0) {
            throw new Error('Video Not Found');
          }
          break;
        case '3':
          data = await GALLERY.find({ CategoryId: req.body.CategoryId, Hide: false }).select('-__v -CategoryId -_id -Hide');
          fileField = 'Gallery';
          nameField = 'GalleryName';
          imageField = 'GalleryImage';
          premiumField = 'GalleryPremium';
          if (!data || data.length === 0) {
            throw new Error('Gallery Image Not Found');
          }
          break;
        default:
          throw new Error('Invalid Category');
      }
  
      // Add favorite status to each item
      const dataWithFavoriteStatus = data.map(item => ({
        File: item[fileField],
        Name: item[nameField],
        Image: item[imageField],
        Premium: item[premiumField],
        ItemId: item.ItemId,
      }));

      function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    const allShuffledData = shuffle([...dataWithFavoriteStatus]); // Using spread to create a copy
  
      res.status(200).json({
        status: 1,
        message: 'Data Found Successfully',
        data: allShuffledData,
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
        const audioData = await AUDIO.find();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            data: audioData,
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
                const audioFilename = req.files.Audio.map((el) => el.filename);
                req.body.Audio = `https://pslink.world/api/public/images/audio/${audioFilename}`;
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
