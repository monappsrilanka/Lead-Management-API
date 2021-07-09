const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET || 'secret';

module.exports.generateJWT = (doc) => {
    return jwt.sign({id:doc._id},SECRET,{expiresIn : '168h'});
}

module.exports.authAdmin = (req, res, next) => {
    const secret = req.body.secret;
    if (secret=="ADMIN_SECRET"){next()}
    else{res.sendStatus(401)}
};

module.exports.authAgent = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, tokenData) => {
            if (err) {return res.sendStatus(403);}
            else {
                req.tokenData = tokenData;
                next();
            }
        });
    } else {res.sendStatus(401);}
};