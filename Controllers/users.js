const USER = require('../models/users')
const jwt = require('jsonwebtoken');



exports.secure = async function (req, res, next) {
    try {
        let token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer ')) {
            throw new Error('Please send a Bearer token');
        }

        token = token.split(' ')[1];
        var decoded = jwt.verify(token, 'Prankster');

        let userCheck = await USER.findById(decoded.id);

        if (!userCheck) {
            throw new Error("User not found");
        }

        next();
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
}


exports.Register = async function (req, res, next) {
    try {
        const hasWhitespaceInKey = obj => {
            return Object.keys(obj).some(key => /\s/.test(key));
        };
        if (hasWhitespaceInKey(req.body)) {
            throw new Error('Field names must not contain whitespace.');
        }

        if (!req.body.Premium) {
            throw new Error('Premium value are required')
        }

        let dataCreate = await USER.create(req.body)

        var token = jwt.sign({ id: dataCreate._id }, 'Prankster')

        res.status(201).json({
            status: 1,
            message: 'Registered Successfully',
            token  // Prefixing "Bearer" to the token
        });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: error.message,
        });
    }
};
