const ADMIN = require('../models/admin')
const PRANK = require('../models/prank')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


exports.sequre = async function (req, res, next) {
  try {
    let token = req.headers.authorization
    if (!token) {
      throw new Error('please send Token')
    }
    var decoded = jwt.verify(token, 'KEY');  // invalid signature (for wrong key) , jwt malformed(For wrong token)
    let userCheck = await ADMIN.findById(decoded.id) //if id is wrong throw this msg
    if (!userCheck) {
      throw new Error("user not found")
    }
    req.userId = decoded.id
    next()
  } catch (error) {
    res.status(404).json({
      status: 0,
      message: error.message
    })
  }
}


//ADMIN
exports.AdminSignup = async function (req, res, next) {
  try {
    if (!req.body.email || !req.body.pass) {
      throw new Error('Email & Pass value are required')
    }


    req.body.pass = await bcrypt.hash(req.body.pass, 8)
    req.body.AdsStatus = false
    let dataCreate = await ADMIN.create(req.body)

    res.status(201).json({
      status: 1,
      message: "Admin Signup Successfully",
      data: dataCreate
    })
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: error.message
    })
  }
}


exports.AdminLogin = async function (req, res, next) {
  try {
    if (!req.body.email || !req.body.pass) {
      throw new Error('Enter All Fields')
    }
    let dataFind = await ADMIN.findOne({ email: req.body.email })
    if (!dataFind) {
      throw new Error("Email Id Not Found")
    }
    let passwordverify = await bcrypt.compare(req.body.pass, dataFind.pass)
    if (!passwordverify) {
      throw new Error("password is worng")
    }
    var token = jwt.sign({ id: dataFind._id }, 'KEY')
    res.status(201).json({
      status: 1,
      message: "Admin login Successfully",
      data: dataFind,
      token
    })
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: error.message
    })
  }
}

exports.AdminRead = async function (req, res, next) {
  try {
    const dataFind = await ADMIN.find();
    res.status(200).json({
      status: "Success!",
      message: "Data Found Successfully",
      data: dataFind
    });
  } catch (error) {
    console.error('Error finding Admin:', error);
    res.status(400).json({
      status: "Fail!",
      message: error.message
    });
  }
};


exports.AdminUpdate = async function (req, res, next) {
  try {
    let dataUpdate = await ADMIN.findByIdAndUpdate(req.params.id, req.body, { new: true })

    res.status(201).json({
      status: 1,
      message: "Update Successfully",
      data: dataUpdate
    })
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: error.message
    })
  }
}



exports.Forgetpass = async function (req, res, next) {
  try {
    if (!req.body.email || !req.body.confirmpass || !req.body.pass) {
      throw new Error('Please enter fields')
    }
    if (req.body.pass !== req.body.confirmpass) {
      throw new Error('Password Is Not Match')
    }
    req.body.pass = await bcrypt.hash(req.body.pass, 8)
    req.body.confirmpass = await bcrypt.hash(req.body.confirmpass, 8)
    let dataupdate = await ADMIN.findOneAndUpdate({ email: req.body.email }, req.body, { new: true })

    if (!dataupdate) {
      throw new Error('Email id Not Found!')
    }
    res.status(201).json({
      status: 1,
      message: "Password Change Successfully",
      data: dataupdate
    })
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: error.message
    })
  }
}


// Admin Spin Prank
function generateUniqueName(baseWord, length = 15) {
  const randomPart = crypto.randomBytes(length).toString('hex').slice(0, length);
  return `${baseWord}&&${randomPart}$${randomPart}$$${randomPart}&$${randomPart}&${randomPart}&${randomPart}$${randomPart}$$${randomPart}&$${randomPart}&${randomPart}`;
}

// Check if the URL is unique across both PRANK and ADMIN collections
async function isUrlUnique(url) {
  const prankCount = await PRANK.countDocuments({ Link: url });
  const adminCount = await ADMIN.countDocuments({ Link: url });
  return prankCount === 0 && adminCount === 0;
}

// Generate a unique URL by appending the unique name to a base URL
async function createUniqueUrl(baseWord) {
  let isUnique = false;
  let url;
  while (!isUnique) {
    const uniqueName = generateUniqueName(baseWord);
    url = `https://pslink.world/${uniqueName}`;
    isUnique = await isUrlUnique(url);
  }
  return url;
}

exports.Create = async function (req, res, next) {
  try {
    const hasWhitespaceInKey = obj => {
      return Object.keys(obj).some(key => /\s/.test(key));
    };
    if (hasWhitespaceInKey(req.body)) {
      throw new Error('Field names must not contain whitespace.');
    }

    // Check if Type is required (only if PrankType isn't "message")
    if (!req.body.Type) {
      throw new Error('Type is required.');
    }

    if (req.files && req.files.CoverImage) {
      const CoverImageFilename = req.files.CoverImage.map((el) => el.filename);
      req.body.CoverImage = `https://pslink.world/api/public/images/adminPrank/${CoverImageFilename}`;
    } else if (typeof req.body.CoverImage === 'string') {
      req.body.CoverImage = req.body.CoverImage; // Use the string directly
    } else {
      throw new Error('CoverImage is required.');
    }

    // Handle File
    if (req.files && req.files.File) {
      const FileFilename = req.files.File.map((el) => el.filename);
      req.body.File = `https://pslink.world/api/public/images/adminPrank/${FileFilename}`;
    } else if (typeof req.body.File === 'string') {
      req.body.File = req.body.File; 
    } else {
      throw new Error('File is required.');
    }

    // Generate and add unique URL
    const baseWord = "prank"; 
    req.body.Link = await createUniqueUrl(baseWord);

    const dataCreate = await ADMIN.create(req.body);

    res.status(201).json({
      status: 1,
      message: 'Prank Created Successfully',
      data: dataCreate
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: error.message,
    });
  }
};


exports.SpinRead = async function (req, res, next) {
  try {
    const types = ["audio", "video", "gallery"];
    const UserData = await ADMIN.find({ Type: { $in: types } }).select('-__v');

    res.status(200).json({
      status: 1,
      message: 'Data Found Successfully',
      data: UserData,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: error.message,
    });
  }
};


exports.SpinUpdate = async function (req, res, next) {
  try {
    const hasWhitespaceInKey = obj => {
      return Object.keys(obj).some(key => /\s/.test(key));
    };
    if (hasWhitespaceInKey(req.body)) {
      throw new Error('Field names must not contain whitespace.');
    }

    if (req.files) {
      if (req.files.CoverImage) {
        const CoverImageFilename = req.files.CoverImage.map(el => el.filename).join(',');
        req.body.CoverImage = `https://pslink.world/api/public/images/adminPrank/${CoverImageFilename}`;
      }
      if (req.files.File) {
        const FileFilename = req.files.File.map(el => el.filename).join(',');
        req.body.File = `https://pslink.world/api/public/images/adminPrank/${FileFilename}`;

      }
    }

    const dataUpdate = await ADMIN.findByIdAndUpdate(req.params.id, req.body, { new: true });
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


exports.SpinDelete = async function (req, res, next) {
  try {
    await ADMIN.findByIdAndDelete(req.params.id);
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