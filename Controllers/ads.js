const ADS = require('../models/ads');
const ADMIN = require('../models/admin');
const ADS2 = require('../models2/ads');
const ADMIN2 = require('../models2/admin');

exports.Create = async function (req, res, next) {
    try {
        const newAd = await ADS2.create(req.body);

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
        const adminData = await ADMIN2.find();
        const AdsStatus = adminData[0].AdsStatus;

        const adsData = await ADS2.find();

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

exports.Found2 = async function (req, res, next) {
    try {
        const adminData = await ADMIN2.find();
        const AdsStatus = adminData[0].AdsStatus;

        let adsData;
        if (req.body.platform === "1") {
            adsData = await ADS2.find().select('-_id -__v -IosAdsId');
            adsData = adsData.map(ad => ({
                AdsName: ad.AdsName, 
                AdsId: ad.AndroidAdsId
            }));
        }

        if (req.body.platform === "2") {
            adsData = await ADS2.find().select('-_id -__v -AndroidAdsId');
            adsData = adsData.map(ad => ({
                AdsName: ad.AdsName,
                AdsId: ad.IosAdsId
            }));
        }

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
}

exports.Update = async function (req, res, next) {
    try {
        const updatedAd = await ADS2.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        await ADS2.findByIdAndDelete(req.params.id);
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
