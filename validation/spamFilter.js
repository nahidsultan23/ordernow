const requestIp = require('request-ip');
const threshold = 500;

const isSpam = (req,res,responseObject,cb) => {
    const visitorIpModel = require('../models/visitorIpModel');
    var clientIp = requestIp.getClientIp(req);
    visitorIpModel.findOne({ip: clientIp,route: req.originalUrl},(err,visit) => {
        if(err) {
            responseObject.message.fatalError = 'Something went wrong!!';
            return res.json(responseObject);
        }
        
        if(visit === null) {
            new visitorIpModel({
                ip: clientIp,
                route: req.originalUrl
            }).save();
            cb(req,res);
        }
        else {
            var interval = Math.abs(new Date() - visit.time);
            if(interval >= threshold) {
                visit.time = new Date();
                visit.save();
                cb(req,res);
            }
            else {
                responseObject.message.fatalError = 'Invalid request';
                res.json(responseObject);
            }
        }
    });
}

module.exports = isSpam;