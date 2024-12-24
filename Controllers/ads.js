const ADS = require('../models/ads');
const ADMIN = require('../models/admin');

exports.Create = async function (req, res, next) {
    try {
        const sanitizedBody = Object.keys(req.body).reduce((acc, key) => {
            const value = req.body[key];
            acc[key] = typeof value === 'string' ? value.trim() : value;
            return acc;
        }, {});
        req.body = sanitizedBody
        const newAd = await ADS.create(req.body);

        res.status(201).json({
            status: 1,
            message: 'Ads Data Created Successfully',
            data: newAd,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.Read = async function (req, res, next) {
    try {
        const adminData = await ADMIN.find();
        const AdsStatus = adminData[0].AdsStatus;

        const adsData = await ADS.find();

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            AdsStatus: AdsStatus,
            data: adsData,
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};

exports.Found = async function (req, res, next) {
    try {
        const adminData = await ADMIN.find();
        const AdsStatus = adminData[0].AdsStatus;

        const adsData = await ADS.find().select('-_id -__v');

        res.status(200).json({
            status: 1,
            message: 'Data Found Successfully',
            AdsStatus: AdsStatus,
            data: adsData,
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
        const updatedAd = await ADS.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({
            status: 1,
            message: 'Ads Data Updated Successfully',
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
        await ADS.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 1,
            message: 'Ads Data Deleted Successfully',
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};
