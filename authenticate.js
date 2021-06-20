const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET || 'secret';

module.exports.generateJWT = (doc, type) => {
    return jwt.sign({id:doc._id, package:doc.package, type:type},SECRET,{expiresIn : '168h'});
}

module.exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, tokenData) => {
            if (err) {return res.sendStatus(403);}
            req.tokenData = tokenData;
            next();
        });
    } else {res.sendStatus(401);}
};

module.exports.authorizeAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, tokenData) => {
            if (err) {return res.sendStatus(403);}
            else if (tokenData.type=="admin"){
                req.tokenData = tokenData;
                next();
            } else {return res.sendStatus(401);}
        });
    } else {res.sendStatus(401);}
};

module.exports.authorizeAgent = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, tokenData) => {
            if (err) {return res.sendStatus(403);}
            else if (tokenData.type=="agent"){
                req.tokenData = tokenData;
                next();
            } else {return res.sendStatus(401);}
        });
    } else {res.sendStatus(401);}
};

module.exports.authorizeClient = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, tokenData) => {
            if (err) {return res.sendStatus(403);}
            else if (tokenData.type=="client"){
                req.tokenData = tokenData;
                next();
            } else {return res.sendStatus(401);}
        });
    } else {res.sendStatus(401);}
};