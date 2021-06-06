const jwt = require('jsonwebtoken');
const SECRET = 'secret'

const generateJWT = (doc,type) => {
    if (type=="agent"){
        return jwt.sign({id:doc._id, package:doc.package, type:type},SECRET,{expiresIn : '168h'});
    } else{
        return jwt.sign({id:doc._id, type:type},SECRET,{expiresIn : '168h'});
    }
}

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'secret', (err, tokenData) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.tokenData = tokenData;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports.authenticateJWT =  authenticateJWT;
module.exports.generateJWT =  generateJWT;