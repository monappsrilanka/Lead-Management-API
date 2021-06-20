const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

const generateJWT = (doc, type) => {
    return jwt.sign({id:doc._id, package:doc.package, type:type},SECRET,{expiresIn : '168h'});
}

const authenticateJWT = (req, res, next) => {
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

const authorizeAdmin = (req, res, next) => {
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

const authorizeAgent = (req, res, next) => {
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

const authorizeClient = (req, res, next) => {
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

module.exports.authenticateJWT =  authenticateJWT;
module.exports.authorizeAdmin =  authorizeAdmin;
module.exports.authorizeAgent =  authorizeAgent;
module.exports.authorizeClient =  authorizeClient;
module.exports.generateJWT =  generateJWT;