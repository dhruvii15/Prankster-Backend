const sanitizeBody = (req, res, next) => {
    const sanitizedBody = Object.keys(req.body).reduce((acc, key) => {
        const value = req.body[key];
        acc[key] = typeof value === 'string' ? value.trim() : value;
        return acc;
    }, {});

    req.body = sanitizedBody;
    console.log(sanitizedBody);
    
    next(); // Pass control to the next middleware
};

module.exports = sanitizeBody;