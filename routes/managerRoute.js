const express = require('express');
const router = express.Router();

router.post('/get-manager-info',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
        },
        username: '',
        name: '',
        phoneNumber: '',
        email: '',
        accountCreationDate: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        let convert = require('../helper/convert');

        let offset = Number(req.body.offset);

        if(offset) {
            if((offset > 12) || (offset < -12)) {
                offset = 6;
            }
            else {
                offset = Math.round(offset * 100) / 100;
            }
        }
        else {
            offset = 6;
        }

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    return res.json({
                        ...responseObject,
                        status: 'success',
                        name: manager.name,
                        username: manager.username,
                        phoneNumber: manager.phoneNumber ? manager.phoneNumber : '',
                        email: manager.email ? manager.email : '',
                        accountCreationDate: convert.convertTime(manager.createdOn,offset)
                    });
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/update-manager-account',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            username: '',
            name: '',
            phoneNumber: '',
            email: '',
            profilePhoto: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const tempPhotoModel = require('../models/tempPhotoModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    const checkEmpty = require('../validation/checkEmpty');
                    const validateChangeInfoInput = require('../validation/managerChangeInfoValidation');
                    let username = checkEmpty(req.body.username);
                    let name = checkEmpty(req.body.name);
                    let phoneNumber = checkEmpty(req.body.phoneNumber);
                    let email = checkEmpty(req.body.email);
                    let tempPhotoID = checkEmpty(req.body.tempPhotoID);

                    let requestBodyObject = {
                        username: username,
                        name: name,
                        phoneNumber: phoneNumber,
                        email: email
                    }

                    let {isValid} = validateChangeInfoInput(requestBodyObject,responseObject.message);
                    if(!isValid) {
                        return res.json(responseObject);
                    }

                    managerModel.findOne({username: username},(err,allManager) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                        else if(allManager) {
                            if(allManager.id !== manager.id) {
                                responseObject.message.username = 'This username is taken. Try another one';
                                return res.json(responseObject);
                            }
                        }

                        tempPhotoModel.findOne({_id: tempPhotoID, userID: id, userType: 'manager', type: 'profile'},(err,photo) => {
                            let photoName = manager.photo ? manager.photo : '';

                            if(tempPhotoID && (err || !photo)) {
                                responseObject.message.profilePhoto = 'Photo was not found!!';
                                return res.json(responseObject);
                            }
                            else if(photo) {
                                photoName = photo.name;

                                if(manager.photo) {
                                    fs.unlink('photos/manager_profile/photo-50/' + manager.photo, (err) => {});
                                    fs.unlink('photos/manager_profile/photo-320/' + manager.photo, (err) => {});
                                    fs.unlink('photos/manager_profile/photo-640/' + manager.photo, (err) => {})
                                }

                                const fs = require("fs");
                                const storePhoto = require('../validation/storePhoto');

                                let photoDestinationDirectory = 'photos/manager_profile/';
                                let photoPath = 'photos/temp/' + photo.name;

                                if(fs.existsSync(photoPath)) {
                                    storePhoto(photo,photoDestinationDirectory);
                                }
                            }

                            manager.updateOne({
                                username: username,
                                name: name,
                                phoneNumber: phoneNumber,
                                email: email,
                                photo: photoName
                            }).then(managerT => {
                                photo.remove();

                                responseObject.status = 'success';
                                return res.json(responseObject);
                            });
                        });
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/get-restaurant-info',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        restaurantID: '',
        restaurantInitialUpdate: '',
        restaurantName: '',
        description: '',
        isPayFirst: '',
        governmentCharge: '',
        governmentChargeDescription: '',
        governmentChargeRegNo: '',
        serviceCharge: '',
        serviceChargeDescription: '',
        phoneNumber: [],
        email: [],
        coordinate: {},
        location: '',
        address: '',
        instruction: '',
        openingHours: '',
        isMidBreakApplicable: '',
        midBreaks: '',
        tableID: [],
        associates: [],
        discountCoupon: [],
        paymentMethod: {
            cash: [],
            card: [],
            mobileBanking: []
        },
        paymentMessage: '',
        serviceMessage: '',
        activeStatus: '',
        decimalRounding: '',
        createdOn: '',
        rating: '',
        numberOfRatings: '',
        comments: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const restaurantTempModel = require('../models/restaurantTempModel');
        let convert = require('../helper/convert');

        let offset = Number(req.body.offset);

        if(offset) {
            if((offset > 12) || (offset < -12)) {
                offset = 6;
            }
            else {
                offset = Math.round(offset * 100) / 100;
            }
        }
        else {
            offset = 6;
        }

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;
                    let restaurantInitialUpdate = manager.restaurantInitialUpdate;

                    if(restaurantInitialUpdate) {
                        restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                            if(err) {
                                responseObject.message.fatalError = "Something went wrong!!";
                                return res.json(responseObject);
                            }
    
                            if(restaurant !== null) {
                                let location = restaurant.location.replace(/ /g, '+');
                                let paymentMethod = {
                                    cash: [],
                                    card: [],
                                    mobileBanking: []
                                };

                                for(i in restaurant.paymentMethod) {
                                    if(restaurant.paymentMethod[i].type === 'Cash') {
                                        paymentMethod.cash.push({
                                            id: restaurant.paymentMethod[i].id,
                                            name: restaurant.paymentMethod[i].paymentMethod,
                                            photo: restaurant.paymentMethod[i].photo
                                        })
                                    }
                                    else if(restaurant.paymentMethod[i].type === 'Card') {
                                        paymentMethod.card.push({
                                            id: restaurant.paymentMethod[i].id,
                                            name: restaurant.paymentMethod[i].paymentMethod,
                                            photo: restaurant.paymentMethod[i].photo
                                        })
                                    }
                                    else if(restaurant.paymentMethod[i].type === 'Mobile Banking') {
                                        paymentMethod.mobileBanking.push({
                                            id: restaurant.paymentMethod[i].id,
                                            name: restaurant.paymentMethod[i].paymentMethod,
                                            photo: restaurant.paymentMethod[i].photo
                                        })
                                    }
                                }

                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    restaurantInitialUpdate: true,
                                    restaurantID: restaurant.id,
                                    restaurantName: restaurant.restaurantName,
                                    description: restaurant.description,
                                    isPayFirst: restaurant.isPayFirst,
                                    governmentCharge: restaurant.governmentCharge,
                                    governmentChargeDescription: restaurant.governmentChargeDescription,
                                    governmentChargeRegNo: restaurant.governmentChargeRegNo,
                                    serviceCharge: restaurant.serviceCharge,
                                    serviceChargeDescription: restaurant.serviceChargeDescription,
                                    phoneNumber: restaurant.phoneNumber,
                                    email: restaurant.email,
                                    coordinate: {
                                        lat: restaurant.lat,
                                        long: restaurant.long
                                    },
                                    location: location,
                                    address: restaurant.address,
                                    instruction: restaurant.instruction,
                                    openingHours: restaurant.openingHours,
                                    isMidBreakApplicable: restaurant.isMidBreakApplicable,
                                    midBreaks: restaurant.midBreaks,
                                    tableID: restaurant.tableID,
                                    associates: restaurant.associates,
                                    discountCoupon: restaurant.discountCoupon,
                                    paymentMethod: paymentMethod,
                                    paymentMessage: restaurant.paymentMessage,
                                    serviceMessage: restaurant.serviceMessage,
                                    activeStatus: restaurant.activeStatus,
                                    decimalRounding: restaurant.decimalRounding,
                                    createdOn: convert.convertTime(restaurant.createdOn,offset),
                                    rating: restaurant.avgRating,
                                    numberOfRatings: restaurant.numberOfRatings,
                                    comments: restaurant.comments
                                })
                            }
                            else {
                                responseObject.message.fatalError = "Something went wrong!!";
                                return res.json(responseObject);
                            }
                        })
                    }
                    else {
                        restaurantTempModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                            if(err) {
                                responseObject.message.fatalError = "Something went wrong!!";
                                return res.json(responseObject);
                            }
    
                            if(restaurant !== null) {
                                responseObject.status = 'success';
                                responseObject.restaurantInitialUpdate = false;
                                responseObject.restaurantID = restaurant.id;
                                responseObject.restaurantName = restaurant.restaurantName;
                                responseObject.createdOn = convert.convertTime(restaurant.createdOn,offset);

                                return res.json(responseObject)
                            }
                            else {
                                responseObject.message.fatalError = "Something went wrong!!";
                                return res.json(responseObject);
                            }
                        })
                    }
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/get-payment-methods',function(req,res) {
    var responseObject = {
        status: '',
        message: {
            fatalError: '',
        },
        paymentMethod: {
            cash: [],
            card: [],
            mobileBanking: []
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const paymentMethodModel = require('../models/paymentMethodModel');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(manager !== null) {
                    paymentMethodModel.find({},(err,paymentMethods) => {
                        if(err) {
                            responseObject.message.fatalError = "Invalid access token";
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(paymentMethods.length === 0) {
                            return res.json({
                                ...responseObject,
                                status: 'success'
                            });
                        }
                        
                        let paymentMethod = {
                            cash: [],
                            card: [],
                            mobileBanking: []
                        }

                        for(i in paymentMethods) {
                            let paymentMethodID = paymentMethods[i].id;
                            let paymentMethodName = paymentMethods[i].paymentMethod;
                            let paymentMethodPhoto = paymentMethods[i].photo;

                            if(paymentMethods[i].type === 'Cash') {
                                paymentMethod.cash.push({
                                    id: paymentMethodID,
                                    name: paymentMethodName,
                                    photo: paymentMethodPhoto
                                });
                            }
                            else if(paymentMethods[i].type === 'Card') {
                                paymentMethod.card.push({
                                    id: paymentMethodID,
                                    name: paymentMethodName,
                                    photo: paymentMethodPhoto
                                });
                            }
                            else if(paymentMethods[i].type === 'Mobile Banking') {
                                paymentMethod.mobileBanking.push({
                                    id: paymentMethodID,
                                    name: paymentMethodName,
                                    photo: paymentMethodPhoto
                                });
                            }
                        }

                        responseObject.status = 'success';
                        responseObject.paymentMethod = paymentMethod;

                        return res.json(responseObject)
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }
    })
});

router.post('/update-temp-restaurant',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            description: '',
            governmentCharge: '',
            governmentChargeDescription: '',
            governmentChargeRegNo: '',
            serviceCharge: '',
            serviceChargeDescription: '',
            phoneNumber: '',
            phoneNumberArray: [],
            email: '',
            emailArray: [],
            coordinate: '',
            address: '',
            instruction: '',
            openingHours: '',
            midBreaks: '',
            tableID: '',
            tableIDArray: [],
            associates: '',
            associatesArray: [],
            discountCoupon: '',
            discountCouponArray: [],
            paymentMethod: '',
            paymentMessage: '',
            serviceMessage: '',
            logo: '',
            banner: '',
            photo: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const restaurantTempModel = require('../models/restaurantTempModel');
        const paymentMethodModel = require('../models/paymentMethodModel');
        const tempPhotoModel = require('../models/tempPhotoModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantTempModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurantTemp) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurantTemp !== null) {
                            const pi = 3.1416;
                            const updateRestaurantInput = require('../validation/restaurantUpdateInfoValidation');

                            let ownerID = restaurantTemp.ownerID;
                            let restaurantName = restaurantTemp.restaurantName;
                            let createdOn = restaurantTemp.createdOn;

                            let {isValid} = updateRestaurantInput(req.body,responseObject.message);
                            if(!isValid) {
                                return res.json(responseObject);
                            }
                            else {
                                const checkEmpty = require('../validation/checkEmpty');

                                let description = checkEmpty(req.body.description);
                                let isPayFirst = req.body.isPayFirst ? true : false;
                                let governmentCharge = checkEmpty(req.body.governmentCharge);
                                let governmentChargeDescription = checkEmpty(req.body.governmentCharge) ? req.body.governmentChargeDescription : '';
                                let governmentChargeRegNo = checkEmpty(req.body.governmentCharge) ? req.body.governmentChargeRegNo : '';
                                let serviceCharge = checkEmpty(req.body.serviceCharge);
                                let serviceChargeDescription = checkEmpty(req.body.serviceCharge) ? req.body.serviceChargeDescription : '';
                                let phoneNumber = req.body.phoneNumber;
                                let email = req.body.email;
                                let lat = req.body.lat;
                                let long = req.body.long;
                                let coordinate = {
                                    type: 'Point',
                                    coordinates: [long,lat]
                                };
                                let address = req.body.address;
                                let instruction = checkEmpty(req.body.instruction);
                                let openingHours = {
                                    everyday: req.body.openingHours.everyday ? req.body.openingHours.everyday : null,
                                    sunday: req.body.openingHours.everyday ? null : (req.body.openingHours.sunday ? req.body.openingHours.sunday : null),
                                    monday: req.body.openingHours.everyday ? null : (req.body.openingHours.monday ? req.body.openingHours.monday : null),
                                    tuesday: req.body.openingHours.everyday ? null : (req.body.openingHours.tuesday ? req.body.openingHours.tuesday : null),
                                    wednesday: req.body.openingHours.everyday ? null : (req.body.openingHours.wednesday ? req.body.openingHours.wednesday : null),
                                    thursday: req.body.openingHours.everyday ? null : (req.body.openingHours.thursday ? req.body.openingHours.thursday : null),
                                    friday: req.body.openingHours.everyday ? null : (req.body.openingHours.friday ? req.body.openingHours.friday : null),
                                    saturday: req.body.openingHours.everyday ? null : (req.body.openingHours.saturday ? req.body.openingHours.saturday : null)
                                };
                                let isMidBreakApplicable = req.body.isMidBreakApplicable ? true : false;
                                let midBreaks = isMidBreakApplicable ? {
                                    everyday: req.body.midBreaks.everyday ? req.body.midBreaks.everyday : null,
                                    sunday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.sunday ? req.body.midBreaks.sunday : null),
                                    monday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.monday ? req.body.midBreaks.monday : null),
                                    tuesday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.tuesday ? req.body.midBreaks.tuesday : null),
                                    wednesday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.wednesday ? req.body.midBreaks.wednesday : null),
                                    thursday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.thursday ? req.body.midBreaks.thursday : null),
                                    friday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.friday ? req.body.midBreaks.friday : null),
                                    saturday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.saturday ? req.body.midBreaks.saturday : null)
                                } : null;
                                let tableID = req.body.tableID;
                                let associates = req.body.associates;
                                let discountCoupon = req.body.discountCoupon;
                                let paymentMethod = req.body.paymentMethod;
                                let paymentMessage = req.body.paymentMessage;
                                let serviceMessage = req.body.serviceMessage;
                                let decimalRounding = req.body.decimalRounding ? true : false;
                                let logo = checkEmpty(req.body.logo);
                                let banner = checkEmpty(req.body.banner);
                                let photo = checkEmpty(req.body.photo);

                                paymentMethodModel.find({_id: {$in : paymentMethod}},(err,paymentMethods) => {
                                    if(err) {
                                        responseObject.message.fatalError = "Something went wrong!!";
                                        return res.json(responseObject);
                                    }
                                    else if(paymentMethods.length !== paymentMethod.length) {
                                        responseObject.message.paymentMethod = "All payment methods are not valid";
                                        return res.json(responseObject);
                                    }

                                    let paymentMethodArray = [];
                                    for(i in paymentMethods) {
                                        paymentMethodArray.push({
                                            id: paymentMethods[i].id,
                                            paymentMethod: paymentMethods[i].paymentMethod,
                                            type: paymentMethods[i].type,
                                            photo: paymentMethods[i].photo
                                        });
                                    }

                                    var geocoding = new require('reverse-geocoding');
                                    var config = {
                                        'latitude': lat,
                                        'longitude': long,
                                        'key': 'AIzaSyDVgtd9tyrVFnNehBqEkCJlVa4wy0u-SGY'
                                    };

                                    geocoding(config, function (err, data){
                                        let location = 'No address';
                                        if(!err) {
                                            location = data.results[0].formatted_address;
                                        }

                                        tempPhotoModel.findOne({_id: logo, userID: id, userType: 'manager', type: 'logo'},(err,tempLogo) => {
                                            let databaseLogo = '';

                                            if(logo && (err || !tempLogo)) {
                                                responseObject.message.logo = 'Logo was not found!!';
                                                return res.json(responseObject);
                                            }
                                            else if(tempLogo) {
                                                databaseLogo = tempLogo.name;
                                            }

                                            tempPhotoModel.findOne({_id: banner, userID: id, userType: 'manager', type: 'banner'},(err,tempBanner) => {
                                                let databaseBanner = '';

                                                if(banner && (err || !tempBanner)) {
                                                    responseObject.message.banner = 'Banner was not found!!';
                                                    return res.json(responseObject);
                                                }
                                                else if(tempBanner) {
                                                    databaseBanner = tempBanner.name;
                                                }

                                                if(photo) {
                                                    if(!Array.isArray(photo)) {
                                                        responseObject.message.photo = 'Invalid photo array';
                                                        return res.json(responseObject);
                                                    }
                                                }
                                                else {
                                                    photo = [];
                                                }

                                                if(photo.length > 10) {
                                                    responseObject.message.photo = 'A restaurant can have maximum 10 photos';
                                                    return res.json(responseObject);
                                                }

                                                tempPhotoModel.find({"$and":[{ _id: {$in : photo}},{userID: id},{userType: 'manager'},{type: 'restaurant'}]},(err,photos) => {
                                                    let databasePhotoArray = [];

                                                    const fs = require("fs");
                                                    const storePhoto = require('../validation/storePhoto');
                                                    let photoDestinationDirectory = '';
                                                    let photoPath = '';

                                                    if(photo.length && (err || !photos.length || (photo.length !== photos.length))) {
                                                        responseObject.message.photo = 'All photos were not found!!';
                                                        return res.json(responseObject);
                                                    }
                                                    else if(photos.length) {
                                                        if(photos) {
                                                            for(i in photos) {
                                                                photoDestinationDirectory = 'photos/restaurant/';
                                                                photoPath = 'photos/temp/' + photos[i].name;
                                                                let photoObject = photos[i];
                                                                databasePhotoArray.push(photoObject.name);
                        
                                                                if(fs.existsSync(photoPath)) {
                                                                    storePhoto(photoObject,photoDestinationDirectory);
                                                                }

                                                                photos[i].remove();
                                                            }
                                                        }
                                                    }

                                                    photoDestinationDirectory = 'photos/logo/';
                                                    photoPath = 'photos/temp/' + tempLogo.name;

                                                    if(fs.existsSync(photoPath)) {
                                                        storePhoto(tempLogo,photoDestinationDirectory);
                                                        tempLogo.remove();
                                                    }

                                                    photoDestinationDirectory = 'photos/banner/';
                                                    photoPath = 'photos/temp/' + tempBanner.name;

                                                    if(fs.existsSync(photoPath)) {
                                                        storePhoto(tempBanner,photoDestinationDirectory);
                                                        tempBanner.remove();
                                                    }

                                                    const newRestaurant = new restaurantModel({
                                                        ownerID: ownerID,
                                                        restaurantName: restaurantName,
                                                        description: description,
                                                        isPayFirst: isPayFirst,
                                                        governmentCharge: governmentCharge,
                                                        governmentChargeDescription: governmentChargeDescription,
                                                        governmentChargeRegNo: governmentChargeRegNo,
                                                        serviceCharge: serviceCharge,
                                                        serviceChargeDescription: serviceChargeDescription,
                                                        phoneNumber: phoneNumber,
                                                        email: email,
                                                        lat: lat,
                                                        long: long,
                                                        latRad: lat*pi/180,
                                                        longRad: long*pi/180,
                                                        coordinate: coordinate,
                                                        location: location,
                                                        address: address,
                                                        instruction: instruction,
                                                        openingHours: openingHours,
                                                        isMidBreakApplicable: isMidBreakApplicable,
                                                        midBreaks: midBreaks,
                                                        tableID: tableID,
                                                        associates: associates,
                                                        discountCoupon: discountCoupon,
                                                        paymentMethod: paymentMethodArray,
                                                        paymentMessage: paymentMessage,
                                                        serviceMessage: serviceMessage,
                                                        decimalRounding: decimalRounding,
                                                        logo: databaseLogo,
                                                        banner: databaseBanner,
                                                        photo: databasePhotoArray,
                                                        createdOn: createdOn
                                                    });
            
                                                    newRestaurant
                                                    .save()
                                                    .then(restaurant => {
                                                        restaurantTemp.remove();
                                                        manager.updateOne({
                                                            restaurantID: restaurant.id,
                                                            restaurantInitialUpdate: true
                                                        }).then(managerT => {
                                                            responseObject.status = 'success';
                                                            return res.json(responseObject);
                                                        })
                                                    });
                                                });
                                            });
                                        });
                                    });
                                })
                            }
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/update-restaurant',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            description: '',
            governmentCharge: '',
            governmentChargeDescription: '',
            governmentChargeRegNo: '',
            serviceCharge: '',
            serviceChargeDescription: '',
            phoneNumber: '',
            phoneNumberArray: [],
            email: '',
            emailArray: [],
            coordinate: '',
            address: '',
            instruction: '',
            openingHours: '',
            midBreaks: '',
            tableID: '',
            tableIDArray: [],
            associates: '',
            associatesArray: [],
            discountCoupon: '',
            discountCouponArray: [],
            paymentMethod: '',
            paymentMessage: '',
            serviceMessage: '',
            logo: '',
            banner: '',
            photo: '',
            oldPhotoArray: []
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const paymentMethodModel = require('../models/paymentMethodModel');
        const tempPhotoModel = require('../models/tempPhotoModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            const pi = 3.1416;
                            const updateRestaurantInput = require('../validation/restaurantUpdateInfoValidation');

                            let {isValid} = updateRestaurantInput(req.body,responseObject.message);
                            if(!isValid) {
                                return res.json(responseObject);
                            }
                            else {
                                const checkEmpty = require('../validation/checkEmpty');

                                let description = checkEmpty(req.body.description);
                                let isPayFirst = req.body.isPayFirst ? true : false;
                                let governmentCharge = checkEmpty(req.body.governmentCharge);
                                let governmentChargeDescription = checkEmpty(req.body.governmentCharge) ? req.body.governmentChargeDescription : '';
                                let governmentChargeRegNo = checkEmpty(req.body.governmentCharge) ? req.body.governmentChargeRegNo : '';
                                let serviceCharge = checkEmpty(req.body.serviceCharge);
                                let serviceChargeDescription = checkEmpty(req.body.serviceCharge) ? req.body.serviceChargeDescription : '';
                                let phoneNumber = req.body.phoneNumber;
                                let email = req.body.email;
                                let lat = req.body.lat;
                                let long = req.body.long;
                                let coordinate = {
                                    type: 'Point',
                                    coordinates: [long,lat]
                                };
                                let address = req.body.address;
                                let instruction = checkEmpty(req.body.instruction);
                                let openingHours = {
                                    everyday: req.body.openingHours.everyday ? req.body.openingHours.everyday : null,
                                    sunday: req.body.openingHours.everyday ? null : (req.body.openingHours.sunday ? req.body.openingHours.sunday : null),
                                    monday: req.body.openingHours.everyday ? null : (req.body.openingHours.monday ? req.body.openingHours.monday : null),
                                    tuesday: req.body.openingHours.everyday ? null : (req.body.openingHours.tuesday ? req.body.openingHours.tuesday : null),
                                    wednesday: req.body.openingHours.everyday ? null : (req.body.openingHours.wednesday ? req.body.openingHours.wednesday : null),
                                    thursday: req.body.openingHours.everyday ? null : (req.body.openingHours.thursday ? req.body.openingHours.thursday : null),
                                    friday: req.body.openingHours.everyday ? null : (req.body.openingHours.friday ? req.body.openingHours.friday : null),
                                    saturday: req.body.openingHours.everyday ? null : (req.body.openingHours.saturday ? req.body.openingHours.saturday : null)
                                };
                                let isMidBreakApplicable = req.body.isMidBreakApplicable ? true : false;
                                let midBreaks = isMidBreakApplicable ? {
                                    everyday: req.body.midBreaks.everyday ? req.body.midBreaks.everyday : null,
                                    sunday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.sunday ? req.body.midBreaks.sunday : null),
                                    monday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.monday ? req.body.midBreaks.monday : null),
                                    tuesday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.tuesday ? req.body.midBreaks.tuesday : null),
                                    wednesday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.wednesday ? req.body.midBreaks.wednesday : null),
                                    thursday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.thursday ? req.body.midBreaks.thursday : null),
                                    friday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.friday ? req.body.midBreaks.friday : null),
                                    saturday: req.body.midBreaks.everyday ? null : (req.body.midBreaks.saturday ? req.body.midBreaks.saturday : null)
                                } : null;
                                let tableID = req.body.tableID;
                                let associates = req.body.associates;
                                let discountCoupon = req.body.discountCoupon;
                                let paymentMethod = req.body.paymentMethod;
                                let paymentMessage = req.body.paymentMessage;
                                let serviceMessage = req.body.serviceMessage;
                                let decimalRounding = req.body.decimalRounding ? true : false;
                                let logo = checkEmpty(req.body.logo);
                                let banner = checkEmpty(req.body.banner);
                                let oldPhoto = checkEmpty(req.body.oldPhoto);
                                let photo = checkEmpty(req.body.photo);

                                paymentMethodModel.find({_id: {$in : paymentMethod}},(err,paymentMethods) => {
                                    if(err) {
                                        responseObject.message.fatalError = "Something went wrong!!";
                                        return res.json(responseObject);
                                    }
                                    else if(paymentMethods.length !== paymentMethod.length) {
                                        responseObject.message.paymentMethod = "All payment methods are not valid";
                                        return res.json(responseObject);
                                    }

                                    let paymentMethodArray = [];
                                    for(i in paymentMethods) {
                                        paymentMethodArray.push({
                                            id: paymentMethods[i].id,
                                            paymentMethod: paymentMethods[i].paymentMethod,
                                            type: paymentMethods[i].type,
                                            photo: paymentMethods[i].photo
                                        });
                                    }

                                    var geocoding = new require('reverse-geocoding');
                                    var config = {
                                        'latitude': lat,
                                        'longitude': long,
                                        'key': 'AIzaSyDVgtd9tyrVFnNehBqEkCJlVa4wy0u-SGY'
                                    };
                                    geocoding(config, function (err, data){
                                        let location = 'No address';
                                        if(!err) {
                                            location = data.results[0].formatted_address;
                                        }

                                        tempPhotoModel.findOne({_id: logo, userID: id, userType: 'manager', type: 'logo'},(err,tempLogo) => {
                                            let databaseLogo = restaurant.logo ? restaurant.logo : '';

                                            if(logo && (err || !tempLogo)) {
                                                responseObject.message.logo = 'Logo was not found!!';
                                                return res.json(responseObject);
                                            }
                                            else if(tempLogo) {
                                                databaseLogo = tempLogo.name;
                                            }

                                            tempPhotoModel.findOne({_id: banner, userID: id, userType: 'manager', type: 'banner'},(err,tempBanner) => {
                                                let databaseBanner = restaurant.banner ? restaurant.banner : '';

                                                if(banner && (err || !tempBanner)) {
                                                    responseObject.message.banner = 'Banner was not found!!';
                                                    return res.json(responseObject);
                                                }
                                                else if(tempBanner) {
                                                    databaseBanner = tempBanner.name;
                                                }

                                                let numberOfOldPhoto = 0;
                                                let numberOfPhoto = 0;
                                                let deletablePhotoArray = restaurant.photo;

                                                if(oldPhoto) {
                                                    if(!Array.isArray(oldPhoto)) {
                                                        responseObject.message.photo = 'Invalid photo array';
                                                        return res.json(responseObject);
                                                    }
                                                    else if(oldPhoto.length) {
                                                        numberOfOldPhoto = oldPhoto.length;
                                                        let errorHappened = 0;
                                                        for(i=0; i<oldPhoto.length; i++) {
                                                            let index = deletablePhotoArray.findIndex(j => j === oldPhoto[i]);
                                                            if(index < 0) {
                                                                errorHappened = 1;
                                                                responseObject.message.oldPhotoArray.push({
                                                                    serial: i,
                                                                    oldPhoto: oldPhoto[i],
                                                                    message: 'Photo was not found!!'
                                                                })
                                                            }
                                                            else {
                                                                deletablePhotoArray.splice(index,1);
                                                            }
                                                        }
                                                        
                                                        if(errorHappened === 1) {
                                                            responseObject.message.photo = 'All photos were not found!!';
                                                            return res.json(responseObject);
                                                        }
                                                    }
                                                }
                                                else {
                                                    oldPhoto = [];
                                                }

                                                if(photo) {
                                                    if(!Array.isArray(photo)) {
                                                        responseObject.message.photo = 'Invalid photo array';
                                                        return res.json(responseObject);
                                                    }
                                                    else if(photo.length) {
                                                        numberOfPhoto = photo.length;
                                                    }
                                                }
                                                else {
                                                    photo = [];
                                                }

                                                if((numberOfOldPhoto + numberOfPhoto) > 10) {
                                                    responseObject.message.photo = 'A restaurant can have maximum 10 photos';
                                                    return res.json(responseObject);
                                                }

                                                tempPhotoModel.find({"$and":[{ _id: {$in : photo}},{userID: id},{userType: 'manager'},{type: 'restaurant'}]},(err,photos) => {
                                                    let databasePhotoArray = restaurant.photo ? restaurant.photo : [];

                                                    const fs = require("fs");
                                                    const storePhoto = require('../validation/storePhoto');
                                                    let photoDestinationDirectory = '';
                                                    let photoPath = '';

                                                    if(photo.length && (err || !photos.length || (photo.length !== photos.length))) {
                                                        responseObject.message.photo = 'All photos were not found!!';
                                                        return res.json(responseObject);
                                                    }
                                                    else if(photos.length) {
                                                        databasePhotoArray = oldPhoto;

                                                        if(photos) {
                                                            for(i in photos) {
                                                                photoDestinationDirectory = 'photos/restaurant/';
                                                                photoPath = 'photos/temp/' + photos[i].name;
                                                                let photoObject = photos[i];
                                                                databasePhotoArray.push(photoObject.name);
                        
                                                                if(fs.existsSync(photoPath)) {
                                                                    storePhoto(photoObject,photoDestinationDirectory);
                                                                }

                                                                photos[i].remove();
                                                            }
                                                        }
                        
                                                        if(deletablePhotoArray.length) {
                                                            for(i in deletablePhotoArray) {
                                                                let deletablePhoto = deletablePhotoArray[i];
                                                                fs.unlink('photos/restaurant/photo-50/' + deletablePhoto, (err) => {});
                                                                fs.unlink('photos/restaurant/photo-320/' + deletablePhoto, (err) => {});
                                                                fs.unlink('photos/restaurant/photo-640/' + deletablePhoto, (err) => {});
                                                            }
                                                        }
                                                    }

                                                    if(restaurant.logo) {
                                                        fs.unlink('photos/logo/photo-50/' + restaurant.logo, (err) =>{});
                                                        fs.unlink('photos/logo/photo-320/' + restaurant.logo, (err) =>{});
                                                        fs.unlink('photos/logo/photo-640/' + restaurant.logo, (err) =>{});
                                                    }

                                                    photoDestinationDirectory = 'photos/logo/';
                                                    photoPath = 'photos/temp/' + tempLogo.name;

                                                    if(fs.existsSync(photoPath)) {
                                                        storePhoto(tempLogo,photoDestinationDirectory);
                                                        tempLogo.remove();
                                                    }

                                                    if(restaurant.banner) {
                                                        fs.unlink('photos/banner/photo-250/' + restaurant.banner, (err) =>{});
                                                        fs.unlink('photos/banner/photo-1500/' + restaurant.banner, (err) =>{});
                                                        fs.unlink('photos/banner/photo-3000/' + restaurant.banner, (err) =>{});
                                                    }

                                                    photoDestinationDirectory = 'photos/banner/';
                                                    photoPath = 'photos/temp/' + tempBanner.name;

                                                    if(fs.existsSync(photoPath)) {
                                                        storePhoto(tempBanner,photoDestinationDirectory);
                                                        tempBanner.remove();
                                                    }
                                                    
                                                    restaurant.updateOne({
                                                        description: description,
                                                        isPayFirst: isPayFirst,
                                                        governmentCharge: governmentCharge,
                                                        governmentChargeDescription: governmentChargeDescription,
                                                        governmentChargeRegNo: governmentChargeRegNo,
                                                        serviceCharge: serviceCharge,
                                                        serviceChargeDescription: serviceChargeDescription,
                                                        phoneNumber: phoneNumber,
                                                        email: email,
                                                        lat: lat,
                                                        long: long,
                                                        latRad: lat*pi/180,
                                                        longRad: long*pi/180,
                                                        coordinate: coordinate,
                                                        location: location,
                                                        address: address,
                                                        instruction: instruction,
                                                        openingHours: openingHours,
                                                        isMidBreakApplicable: isMidBreakApplicable,
                                                        midBreaks: midBreaks,
                                                        tableID: tableID,
                                                        associates: associates,
                                                        discountCoupon: discountCoupon,
                                                        paymentMethod: paymentMethodArray,
                                                        paymentMessage: paymentMessage,
                                                        serviceMessage: serviceMessage,
                                                        decimalRounding: decimalRounding,
                                                        logo: databaseLogo,
                                                        banner: databaseBanner,
                                                        photo: databasePhotoArray,
                                                        updatedOn: new Date()
                                                    }).then(restaurantT => {
                                                        responseObject.status = 'success';
                                                        return res.json(responseObject);
                                                    });
                                                });
                                            });
                                        });
                                    });
                                })
                            }
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/toggle-restaurant-active-status',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            restaurant.updateOne({
                                activeStatus: !restaurant.activeStatus
                            })
                            .then((restaurantT) => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/get-food-item-info',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        category: '',
        subcategory: '',
        name: '',
        price: '',
        options: [],
        description: '',
        instatantService: '',
        parcelAvailable: '',
        availableHours: '',
        governmentChargeApplicable: '',
        createdOn: '',
        availability: '',
        rating: '',
        numberOfRatings: '',
        comments: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const checkEmpty = require('../validation/checkEmpty');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        let convert = require('../helper/convert');

        let offset = Number(req.body.offset);

        if(offset) {
            if((offset > 12) || (offset < -12)) {
                offset = 6;
            }
            else {
                offset = Math.round(offset * 100) / 100;
            }
        }
        else {
            offset = 6;
        }

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let foodItemID = checkEmpty(req.body.foodItemID);

                            if(!foodItemID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            foodItemsModel.findOne({_id: foodItemID,restaurantID: restaurant.id},(err,foodItem) => {
                                if(err || (foodItem === null)) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json(responseObject);
                                }

                                if(foodItem.isDeleted) {
                                    responseObject.message.fatalError = 'This food item has been deleted';
                                    return res.json(responseObject);
                                }
                                else {
                                    return res.json({
                                        ...responseObject,
                                        status: 'success',
                                        category: foodItem.category,
                                        subcategory: foodItem.subcategory,
                                        name: foodItem.name,
                                        price: foodItem.price,
                                        optios: foodItem.options,
                                        description: foodItem.description,
                                        instatantService: foodItem.instatantService,
                                        parcelAvailable: foodItem.parcelAvailable,
                                        availableHours: foodItem.availableHours,
                                        governmentChargeApplicable: foodItem.governmentChargeApplicable,
                                        createdOn: convert.convertTime(foodItem.createdOn,offset),
                                        availability: foodItem.isUnavailable ? false : true,
                                        rating: foodItem.avgRating,
                                        numberOfRatings: foodItem.numberOfRatings,
                                        comments: foodItem.comments
                                    })
                                }
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/get-all-food-items',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        foodItems: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            foodItemsModel.find({restaurantID: restaurant.id,isDeleted: false},(err,foodItems) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json(responseObject);
                                }

                                if(!foodItems.length) {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                }

                                let allFoodItemArray = [];
                                for(i in foodItems) {
                                    let foodItemObject = {
                                        id: foodItems[i].id,
                                        category: foodItems[i].category,
                                        subcategory: foodItems[i].subcategory,
                                        name: foodItems[i].name,
                                        price: foodItems[i].price,
                                        description: foodItems[i].description,
                                        options: foodItems[i].options,
                                        availability: foodItems[i].isUnavailable ? 'Unavailable' : 'Available'
                                    }
                                    allFoodItemArray.push(foodItemObject);
                                }

                                responseObject.status = 'success';
                                responseObject.foodItems = allFoodItemArray;

                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/get-categories',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        categories: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            foodItemsModel.find({restaurantID: restaurant.id,isDeleted: false},(err,foodItems) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json(responseObject);
                                }

                                let categoryArray = [];
                                let subcategoryArray = [];

                                if(foodItems.length) {
                                    for(i in foodItems) {
                                        categoryArray.push(foodItems[i].category);

                                        if(foodItems[i].subcategory !== 'Others') {
                                            subcategoryArray.push({
                                                category: foodItems[i].category,
                                                subcategory: foodItems[i].subcategory
                                            });
                                        }
                                    }

                                    let uniqueCategoryArray = [...new Set(categoryArray)];

                                    for(i in uniqueCategoryArray) {
                                        let secondSubCategoryArray = [];

                                        for(j in subcategoryArray) {
                                            if(subcategoryArray[j].category === uniqueCategoryArray[i]) {
                                                secondSubCategoryArray.push(subcategoryArray[j].subcategory);
                                            }
                                        }

                                        let uniqueSubcategoryArray = [...new Set(secondSubCategoryArray)];

                                        responseObject.categories.push({
                                            category: uniqueCategoryArray[i],
                                            subcategories: uniqueSubcategoryArray
                                        });
                                    }
                                }

                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/create-food-item',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            category: '',
            subcategory: '',
            name: '',
            price: '',
            options: '',
            description: '',
            availableHours: '',
            photo: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const tempPhotoModel = require('../models/tempPhotoModel');
        const foodItemsModel = require('../models/foodItemsModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            const fs = require("fs");
                            const checkEmpty = require('../validation/checkEmpty');
                            const validatefoodItem = require('../validation/foodItemValidation');

                            let requestBodyObject = {
                                category: req.body.category,
                                subcategory: req.body.subcategory,
                                name: req.body.name,
                                price: req.body.price,
                                options: req.body.options,
                                description: req.body.description,
                                availableHours: req.body.availableHours,
                                openingHours: restaurant.openingHours
                            }
                            let {isValid} = validatefoodItem(requestBodyObject,responseObject.message);
                            if(!isValid) {
                                return res.json(responseObject);
                            }

                            let category = req.body.category;
                            let subcategory = req.body.subcategory;
                            let name = req.body.name;
                            let price = req.body.price;
                            let options = [];
                            if(req.body.options) {
                                for(i in req.body.options) {
                                    let optionName = req.body.options[i].optionName;
                                    let optionsSecond = [];
                                    for(j in req.body.options[i].options) {
                                        let option = req.body.options[i].options[j].option;
                                        let extraPrice = req.body.options[i].options[j].extraPrice;
                                        optionsSecond.push({
                                            option: option,
                                            extraPrice: extraPrice
                                        })
                                    }
                                    options.push({
                                        optionName: optionName,
                                        options: optionsSecond
                                    })
                                }
                            }
                            let description = req.body.description;
                            let instatantService = req.body.instatantService ? true : false;
                            let parcelAvailable = req.body.parcelAvailable ? true : false;
                            let availableHours = {
                                everyday: req.body.availableHours.everyday ? req.body.availableHours.everyday : null,
                                sunday: req.body.availableHours.everyday ? null : (req.body.availableHours.sunday ? req.body.availableHours.sunday : null),
                                monday: req.body.availableHours.everyday ? null : (req.body.availableHours.monday ? req.body.availableHours.monday : null),
                                tuesday: req.body.availableHours.everyday ? null : (req.body.availableHours.tuesday ? req.body.availableHours.tuesday : null),
                                wednesday: req.body.availableHours.everyday ? null : (req.body.availableHours.wednesday ? req.body.availableHours.wednesday : null),
                                thursday: req.body.availableHours.everyday ? null : (req.body.availableHours.thursday ? req.body.availableHours.thursday : null),
                                friday: req.body.availableHours.everyday ? null : (req.body.availableHours.friday ? req.body.availableHours.friday : null),
                                saturday: req.body.availableHours.everyday ? null : (req.body.availableHours.saturday ? req.body.availableHours.saturday : null)
                            }
                            let governmentChargeApplicable = req.body.governmentChargeApplicable ? true : false;
                            let photo = checkEmpty(req.body.photo);

                            if(!photo || !Array.isArray(photo) || photo.length === 0) {
                                photo = [];
                            }

                            if(photo.length > 10) {
                                responseObject.message.photo = 'A food item can have maximum 10 photos';
                                return res.json(responseObject);
                            }

                            tempPhotoModel.find({"$and":[{ _id: {$in : photo}},{userID: id},{userType: 'manager'},{type: 'food'}]},(err,photos) => {
                                if(photo.length && (err || (photos.length !== photo.length))) {
                                    responseObject.message.photo = 'All photos were not found!!';
                                    return res.json(responseObject);
                                }

                                let databasePhotoArray = [];

                                if(photos.length) {
                                    const storePhoto = require('../validation/storePhoto');

                                    for(i in photos) {
                                        let photoDestinationDirectory = 'photos/food/';
                                        let photoPath = 'photos/temp/' + photos[i].name;
                                        let photoObject = photos[i];
                                        databasePhotoArray.push(photoObject.name);

                                        if(fs.existsSync(photoPath)) {
                                            storePhoto(photoObject,photoDestinationDirectory);
                                        }
                                    }
                                }

                                const newfoodItem = new foodItemsModel({
                                    restaurantID: restaurant.id,
                                    category: category,
                                    subcategory: subcategory,
                                    name: name,
                                    price: price,
                                    options: options,
                                    description: description,
                                    instatantService: instatantService,
                                    parcelAvailable: parcelAvailable,
                                    availableHours: availableHours,
                                    governmentChargeApplicable: governmentChargeApplicable,
                                    photo: databasePhotoArray
                                });
    
                                newfoodItem
                                .save()
                                .then(foodItem => {
                                    for(i in photos) {
                                        photos[i].remove();
                                    }
    
                                    responseObject.status = 'success';
                                    return res.json(responseObject)
                                })
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/update-food-item',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            category: '',
            subcategory: '',
            price: '',
            options: '',
            description: '',
            availableHours: '',
            photo: '',
            oldPhotoArray: []
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const tempPhotoModel = require('../models/tempPhotoModel');
        const foodItemsModel = require('../models/foodItemsModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            const fs = require("fs");
                            const checkEmpty = require('../validation/checkEmpty');
                            const validatefoodItemUpdate = require('../validation/foodItemUpdateValidation');

                            let foodItemID = checkEmpty(req.body.foodItemID);

                            if(!foodItemID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            foodItemsModel.findOne({_id: foodItemID,restaurantID: restaurant.id},(err,foodItem) => {
                                if(err || (foodItem === null)) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json(responseObject);
                                }

                                if(foodItem.isDeleted) {
                                    responseObject.message.fatalError = 'Food item has been deleted';
                                    return res.json(responseObject);
                                }
                                else {
                                    let requestBodyObject = {
                                        category: req.body.category,
                                        subcategory: req.body.subcategory,
                                        price: req.body.price,
                                        options: req.body.options,
                                        description: req.body.description,
                                        availableHours: req.body.availableHours,
                                        openingHours: restaurant.openingHours
                                    }
                                    let {isValid} = validatefoodItemUpdate(requestBodyObject,responseObject.message);
                                    if(!isValid) {
                                        return res.json(responseObject);
                                    }
        
                                    let category = req.body.category;
                                    let subcategory = req.body.subcategory;
                                    let price = req.body.price;
                                    let options = [];
                                    if(req.body.options) {
                                        for(i in req.body.options) {
                                            let optionName = req.body.options[i].optionName;
                                            let optionsSecond = [];
                                            for(j in req.body.options[i].options) {
                                                let option = req.body.options[i].options[j].option;
                                                let extraPrice = req.body.options[i].options[j].extraPrice;
                                                optionsSecond.push({
                                                    option: option,
                                                    extraPrice: extraPrice
                                                })
                                            }
                                            options.push({
                                                optionName: optionName,
                                                options: optionsSecond
                                            })
                                        }
                                    }
                                    let description = req.body.description;
                                    let instatantService = req.body.instatantService ? true : false;
                                    let parcelAvailable = req.body.parcelAvailable ? true : false;
                                    let availableHours = {
                                        everyday: req.body.availableHours.everyday ? req.body.availableHours.everyday : null,
                                        sunday: req.body.availableHours.everyday ? null : (req.body.availableHours.sunday ? req.body.availableHours.sunday : null),
                                        monday: req.body.availableHours.everyday ? null : (req.body.availableHours.monday ? req.body.availableHours.monday : null),
                                        tuesday: req.body.availableHours.everyday ? null : (req.body.availableHours.tuesday ? req.body.availableHours.tuesday : null),
                                        wednesday: req.body.availableHours.everyday ? null : (req.body.availableHours.wednesday ? req.body.availableHours.wednesday : null),
                                        thursday: req.body.availableHours.everyday ? null : (req.body.availableHours.thursday ? req.body.availableHours.thursday : null),
                                        friday: req.body.availableHours.everyday ? null : (req.body.availableHours.friday ? req.body.availableHours.friday : null),
                                        saturday: req.body.availableHours.everyday ? null : (req.body.availableHours.saturday ? req.body.availableHours.saturday : null)
                                    }
                                    let governmentChargeApplicable = req.body.governmentChargeApplicable ? true : false;

                                    const fs = require("fs");
                                    const checkEmpty = require('../validation/checkEmpty');
                                    let oldPhoto = checkEmpty(req.body.oldPhoto);
                                    let photo = checkEmpty(req.body.photo);

                                    let numberOfOldPhoto = 0;
                                    let numberOfPhoto = 0;
                                    let deletablePhotoArray = restaurant.photo;

                                    if(oldPhoto) {
                                        if(!Array.isArray(oldPhoto)) {
                                            responseObject.message.photo = 'Invalid photo array';
                                            return res.json(responseObject);
                                        }
                                        else if(oldPhoto.length) {
                                            numberOfOldPhoto = oldPhoto.length;
                                            let errorHappened = 0;
                                            for(i=0; i<oldPhoto.length; i++) {
                                                let index = deletablePhotoArray.findIndex(j => j === oldPhoto[i]);
                                                if(index < 0) {
                                                    errorHappened = 1;
                                                    responseObject.message.oldPhotoArray.push({
                                                        serial: i,
                                                        oldPhoto: oldPhoto[i],
                                                        message: 'Photo was not found!!'
                                                    })
                                                }
                                                else {
                                                    deletablePhotoArray.splice(index,1);
                                                }
                                            }
                                            
                                            if(errorHappened === 1) {
                                                responseObject.message.photo = 'All photos were not found!!';
                                                return res.json(responseObject);
                                            }
                                        }
                                    }
                                    else {
                                        oldPhoto = [];
                                    }

                                    if(photo) {
                                        if(!Array.isArray(photo)) {
                                            responseObject.message.photo = 'Invalid photo array';
                                            return res.json(responseObject);
                                        }
                                        else if(photo.length) {
                                            numberOfPhoto = photo.length;
                                        }
                                    }
                                    else {
                                        photo = [];
                                    }

                                    if((numberOfOldPhoto + numberOfPhoto) > 10) {
                                        responseObject.message.photo = 'A food item can have maximum 10 photos';
                                        return res.json(responseObject);
                                    }

                                    tempPhotoModel.find({"$and":[{ _id: {$in : photo}},{userID: id},{userType: 'manager'},{type: 'food'}]},(err,photos) => {
                                        if(photo.length) {
                                            if(err || !photos.length || (photo.length !== photos.length)) {
                                                responseObject.message.photo = 'All photos were not found!!';
                                                return res.json(responseObject);
                                            }
                                        }

                                        let databasePhotoArray = oldPhoto;

                                        if(photos) {
                                            const storePhoto = require('../validation/storePhoto');

                                            for(i in photos) {
                                                let photoDestinationDirectory = 'photos/food/';
                                                let photoPath = 'photos/temp/' + photos[i].name;
                                                let photoObject = photos[i];
                                                databasePhotoArray.push(photoObject.name);

                                                if(fs.existsSync(photoPath)) {
                                                    storePhoto(photoObject,photoDestinationDirectory);
                                                }
                                            }
                                        }

                                        if(deletablePhotoArray.length) {
                                            for(i in deletablePhotoArray) {
                                                deletablePhoto = deletablePhotoArray[i];
                                                fs.unlink('photos/food/photo-640/' + deletablePhoto, (err) => {});
                                            }
                                        }

                                        foodItem.updateOne({
                                            category: category,
                                            subcategory: subcategory,
                                            price: price,
                                            options: options,
                                            description: description,
                                            instatantService: instatantService,
                                            parcelAvailable: parcelAvailable,
                                            availableHours: availableHours,
                                            governmentChargeApplicable: governmentChargeApplicable,
                                            photo: databasePhotoArray
                                        }).then(foodItemT => {
                                            for(i in photos) {
                                                photos[i].remove();
                                            }

                                            responseObject.status = 'success';
                                            return res.json(responseObject);
                                        });
                                    })
                                }
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/toggle-food-item-available-status',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const checkEmpty = require('../validation/checkEmpty');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let foodItemID = checkEmpty(req.body.foodItemID);

                            if(!foodItemID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            foodItemsModel.findOne({_id: foodItemID,restaurantID: restaurant.id,isDeleted: false},(err,foodItem) => {
                                if(err || (foodItem === null)) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json(responseObject);
                                }
                                else {
                                    foodItem.updateOne({
                                        isUnavailable: !foodItem.isUnavailable
                                    })
                                    .then((foodItemT) => {
                                        responseObject.status = 'success';
                                        return res.json(responseObject);
                                    })
                                }
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/delete-food-item',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const checkEmpty = require('../validation/checkEmpty');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let foodItemID = checkEmpty(req.body.foodItemID);

                            if(!foodItemID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            foodItemsModel.findOne({_id: foodItemID,restaurantID: restaurant.id},(err,foodItem) => {
                                if(err || (foodItem === null)) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json(responseObject);
                                }

                                if(foodItem.isDeleted) {
                                    responseObject.message.fatalError = 'Food item has already been deleted';
                                    return res.json(responseObject);
                                }
                                else {
                                    foodItem.updateOne({
                                        isDeleted: true
                                    }).then(foodItemT => {
                                        responseObject.status = 'success';
                                        return res.json(responseObject);
                                    })
                                }
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/create-order',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            order: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validateCreateOrder = require('../validation/createOrderValidation');
        const validationHelper = require('../validation/validationHelper');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let order = checkEmpty(req.body.order);

                            if(order) {
                                let tableID = checkEmpty(req.body.order.tableID);
                                let orderDetails = checkEmpty(req.body.order.orderDetails);
                                let parcel = checkEmpty(req.body.order.parcel);
                                let associate = checkEmpty(req.body.order.associate);
                                let numberOfGuests = checkEmpty(req.body.order.numberOfGuests);
                                let specialDiscount = checkEmpty(req.body.order.specialDiscount);
                                
                                let associateIndex = restaurant.associates.findIndex(j => j === associate);

                                if(associateIndex < 0) {
                                    associate = '';
                                }
                                
                                if(!((Number.isInteger(numberOfGuests)) && (numberOfGuests >= 0))) {
                                    numberOfGuests = 0;
                                }
                                else if(numberOfGuests > 100000) {
                                    numberOfGuests = 100000;
                                }

                                let requestBodyObject = [];

                                if(!(orderDetails && tableID)) {
                                    responseObject.message.fatalError = 'Invalid order';
                                    return res.json(responseObject);
                                }
                                else if(!tableID.match("^[a-zA-Z0-9]*$")) {
                                    responseObject.message.fatalError = 'Invalid order';
                                    return res.json(responseObject);
                                }
                                else if(!Array.isArray(orderDetails)) {
                                    responseObject.message.order = 'Invalid order array';
                                    return res.json(responseObject);
                                }
                                else if(orderDetails.length < 1) {
                                    responseObject.message.order = 'Invalid order array';
                                    return res.json(responseObject);
                                }
                                else if(orderDetails.length > 100) {
                                    responseObject.message.order = 'Maximum 100 food items are allowed at a time';
                                    return res.json(responseObject);
                                }
                                else {
                                    if(specialDiscount) {
                                        if(!validationHelper.isPositiveNumber(specialDiscount)) {
                                            responseObject.message.order = 'Enter a valid special discount';
                                            return res.json(responseObject);
                                        }
                                        else {
                                            specialDiscount = Math.round(specialDiscount*100)/100;
                                        }
                                    }
                                    else {
                                        specialDiscount = 0;
                                    }

                                    let breakHappened = 0;
                                    for(i in orderDetails) {
                                        if(!(orderDetails[i].foodItemID && orderDetails[i].quantity)) {
                                            breakHappened = 1;
                                            break;
                                        }
                                        else if(!(Number.isInteger(orderDetails[i].quantity))) {
                                            breakHappened = 1;
                                            break;
                                        }
                                        else if((orderDetails[i].quantity < 1) || (orderDetails[i].quantity > 100)) {
                                            breakHappened = 1;
                                            break;
                                        }

                                        let optionsArray = [];
                                        
                                        if(orderDetails[i].options) {
                                            if(!Array.isArray(orderDetails[i].options)) {
                                                breakHappened = 1;
                                                break;
                                            }
                                            else if(orderDetails[i].options.length > 20) {
                                                breakHappened = 1;
                                                break;
                                            }

                                            for(j in orderDetails[i].options) {
                                                if(orderDetails[i].options[j].optionName && orderDetails[i].options[j].option) {
                                                    optionsArray.push({
                                                        optionName: orderDetails[i].options[j].optionName,
                                                        option: orderDetails[i].options[j].option
                                                    })
                                                }
                                                else {
                                                    breakHappened = 1;
                                                    break;
                                                }
                                            }
                                        }

                                        if(breakHappened === 1) {
                                            break;
                                        }

                                        requestBodyObject.push({
                                            foodItemID: orderDetails[i].foodItemID,
                                            quantity: orderDetails[i].quantity,
                                            options: optionsArray
                                        })
                                    }

                                    if(breakHappened) {
                                        responseObject.message.order = 'Invalid order array';
                                        return res.json(responseObject);
                                    }

                                    let {message,isValid} = validateCreateOrder(requestBodyObject,responseObject.message);
                                    if(!isValid) {
                                        responseObject.message = message;
                                        return res.json(responseObject);
                                    }

                                    order = {
                                        restaurantID: restaurantID,
                                        orderDetails: requestBodyObject,
                                        parcel: parcel
                                    }

                                    let databaseOrder = order;
                                    databaseOrder.parcel = parcel ? true : false;

                                    let index = restaurant.tableID.findIndex(j => j === tableID);
                                    if(index < 0) {
                                        responseObject.message.order = 'Invalid table ID';
                                        return res.json(responseObject);
                                    }

                                    databaseOrder.restaurantName = restaurant.restaurantName;
                                    databaseOrder.tableID = tableID;

                                    let foodItemIDArray = [];

                                    for(i in order.orderDetails) {
                                        foodItemIDArray.push(order.orderDetails[i].foodItemID);
                                    }

                                    let uniqueFoodItemIDArray = [...new Set(foodItemIDArray)];

                                    foodItemsModel.find({"$and":[{ _id: {$in : uniqueFoodItemIDArray}},{restaurantID: restaurantID},{isDeleted: false}]},(err,foodItems) => {
                                        if(err || (foodItems === null) || (foodItems.length !== uniqueFoodItemIDArray.length)) {
                                            responseObject.message.order = 'All food items are not available';
                                            return res.json(responseObject);
                                        }

                                        let parcelItemCount = 0;
                                        let instantServiceItemCount = 0;
                                        for(i in foodItems) {
                                            if(foodItems[i].parcelAvailable) {
                                                parcelItemCount = parcelItemCount + 1;
                                            }

                                            if(foodItems[i].instantService) {
                                                instantServiceItemCount = instantServiceItemCount + 1;
                                            }
                                        }

                                        if(databaseOrder.parcel) {
                                            if(parcelItemCount !== foodItems.length) {
                                                responseObject.message.order = 'All food items are not available for parcel';
                                                return res.json(responseObject);
                                            }
                                        }

                                        if(instantServiceItemCount === foodItems.length) {
                                            databaseOrder.instantService = true;
                                        }

                                        databaseOrder.governmentChargePercentage = restaurant.governmentCharge;
                                        databaseOrder.governmentChargeDescription = restaurant.governmentChargeDescription;
                                        databaseOrder.governmentChargeRegNo = restaurant.governmentChargeRegNo;
                                        databaseOrder.serviceChargePercentage = restaurant.serviceCharge;
                                        databaseOrder.serviceChargeDescription = restaurant.serviceChargeDescription;
                                        databaseOrder.grossTotal = 0;
                                        databaseOrder.totalGovernmentCharge = 0;

                                        breakHappened = 0;
                                        let databasefoodItemsArray = [];
                                        for(i in foodItems) {
                                            databasefoodItemsArray.push(foodItems[i]);
                                        }

                                        for(i in order.orderDetails) {
                                            let index = databasefoodItemsArray.findIndex(j => j.id === order.orderDetails[i].foodItemID);
                                            databaseOrder.orderDetails[i].foodItemName = foodItems[index].name;
                                            databaseOrder.orderDetails[i].basePrice = foodItems[index].price;
                                            databaseOrder.orderDetails[i].unitPrice = foodItems[index].price;
                                            let options = [];
                                            if(databaseOrder.orderDetails[i].options.length) {
                                                for(j in databaseOrder.orderDetails[i].options) {
                                                    let optionName = databaseOrder.orderDetails[i].options[j].optionName;
                                                    let option = databaseOrder.orderDetails[i].options[j].option;
                                                    let insideOption = {};

                                                    for(k=0; k<foodItems[index].options.length; k++) {
                                                        if(foodItems[index].options[k].optionName === optionName) {
                                                            for(l=0; l<foodItems[index].options[k].options.length; l++) {
                                                                if(foodItems[index].options[k].options[l].option === option) {
                                                                    databaseOrder.orderDetails[i].unitPrice = databaseOrder.orderDetails[i].unitPrice + foodItems[index].options[k].options[l].extraPrice;
                                                                    insideOption = ({
                                                                        optionName: optionName,
                                                                        option: option,
                                                                        extraPrice: foodItems[index].options[k].options[l].extraPrice
                                                                    })
                                                                    break;
                                                                }
                                                                else if(l === (foodItems[index].options[k].options.length - 1)) {
                                                                    breakHappened = 1;
                                                                }
                                                            }
                                                            break;
                                                        }
                                                        else if(k === (foodItems[index].options.length - 1)) {
                                                            breakHappened = 1;
                                                        }

                                                        if(breakHappened === 1) {
                                                            break;
                                                        }
                                                    }
                                                    options.push(insideOption);
                                                    
                                                    if(breakHappened === 1) {
                                                        break;
                                                    }
                                                }

                                                if(breakHappened === 1) {
                                                    break;
                                                }
                                            }
                                            if(options.length) {
                                                databaseOrder.orderDetails[i].options = options;
                                            }
                                            databaseOrder.orderDetails[i].totalPrice = databaseOrder.orderDetails[i].unitPrice * databaseOrder.orderDetails[i].quantity;
                                            databaseOrder.grossTotal = databaseOrder.grossTotal + databaseOrder.orderDetails[i].totalPrice;
                                            databaseOrder.orderDetails[i].governmentCharge = 0;
                                            if(foodItems[index].governmentChargeApplicable) {
                                                databaseOrder.orderDetails[i].governmentCharge = Math.round(databaseOrder.orderDetails[i].totalPrice * databaseOrder.governmentChargePercentage) / 100;
                                                databaseOrder.totalGovernmentCharge = databaseOrder.totalGovernmentCharge + databaseOrder.orderDetails[i].governmentCharge;
                                            }
                                            databaseOrder.orderDetails[i].netPrice = databaseOrder.orderDetails[i].totalPrice + databaseOrder.orderDetails[i].governmentCharge;
                                            databaseOrder.orderDetails[i].photo = foodItems[index].photo;
                                        }

                                        if(breakHappened === 1) {
                                            responseObject.message.order = 'All options are not valid';
                                            return res.json(responseObject);
                                        }

                                        databaseOrder.serviceCharge = Math.round(databaseOrder.grossTotal * databaseOrder.serviceChargePercentage) / 100;
                                        databaseOrder.netPayable = databaseOrder.grossTotal + databaseOrder.totalGovernmentCharge + databaseOrder.serviceCharge;
                                        let discountRecordNetPayable = databaseOrder.netPayable;

                                        if(specialDiscount > databaseOrder.netPayable) {
                                            specialDiscount = databaseOrder.netPayable;
                                        }

                                        specialDiscount = specialDiscount * (-1);

                                        databaseOrder.specialDiscount = specialDiscount;
                                        databaseOrder.netPayable = (Math.round(databaseOrder.netPayable + specialDiscount) * 100) / 100;
                                        databaseOrder.decimalRounding = 0;

                                        if(restaurant.decimalRounding) {
                                            let decimalRounding = databaseOrder.netPayable - Math.floor(databaseOrder.netPayable);
                                            if(decimalRounding < 0.5) {
                                                databaseOrder.netPayable = Math.floor(databaseOrder.netPayable);
                                                databaseOrder.decimalRounding = Math.round((0 - decimalRounding) * 100) / 100;
                                            }
                                            else {
                                                databaseOrder.netPayable = Math.floor(databaseOrder.netPayable) + 1;
                                                databaseOrder.decimalRounding = Math.round((1 - decimalRounding) * 100) / 100;
                                            }
                                        }

                                        if(restaurant.isPayFirst) {
                                            databaseOrder.currentState = 'Waiting for payment';
                                        }
                                        else {
                                            databaseOrder.currentState = 'Restaurant is preparing your order';
                                        }

                                        databaseOrder.associate = associate;
                                        databaseOrder.numberOfGuests = numberOfGuests;

                                        if(specialDiscount) {
                                            let discountDecimalRounding = 0;
                                            if(restaurant.decimalRounding) {
                                                let tempDecimalRounding = discountRecordNetPayable - Math.floor(discountRecordNetPayable);
                                                if(tempDecimalRounding < 0.5) {
                                                    discountRecordNetPayable = Math.floor(discountRecordNetPayable);
                                                    discountDecimalRounding = Math.round((0 - tempDecimalRounding) * 100) / 100;
                                                }
                                                else {
                                                    discountRecordNetPayable = Math.floor(discountRecordNetPayable) + 1;
                                                    discountDecimalRounding = Math.round((1 - tempDecimalRounding) * 100) / 100;
                                                }
                                            }

                                            databaseOrder.discountRecord = [{
                                                id: 0,
                                                name: '',
                                                currentRecord: {
                                                    specialDiscount: 0,
                                                    decimalRounding: discountDecimalRounding,
                                                    netPayable: discountRecordNetPayable
                                                },
                                                type: 'Amount',
                                                discountPercentage: '',
                                                applyTo: 'Grand Total',
                                                minOrder: 0,
                                                maxAmount: '',
                                                discountAmount: specialDiscount * (-1),
                                                time: new Date()
                                            }];
            
                                            databaseOrder.nextDiscountID = 1;
                                        }

                                        const newOrder = new orderModel({
                                            ...databaseOrder,
                                            stateRecord: [
                                                {
                                                    state: 'Order placed',
                                                    time: new Date()
                                                },
                                                {
                                                    state: 'Order accepted',
                                                    time: new Date()
                                                }
                                            ]
                                        });
                
                                        newOrder
                                        .save()
                                        .then(order => {
                                            responseObject.status = 'success';
                                            return res.json(responseObject);
                                        })
                                    })
                                }
                            }
                            else {
                                responseObject.message.order = 'Invalid order';
                                return res.json(responseObject);
                            }
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/get-all-orders',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        numberOfNewWaitingOrders: 0,
        numberOfNewWaitingInstantOrders: 0,
        tableIDs: [],
        numberOfOrders: {
            waitingGeneralOrders: 0,
            waitingInstantOrders: 0,
            ongoingGeneralOrders: 0,
            ongoingInstantOrders: 0,
            pastOrders: 0
        },
        orders: {
            waitingGeneralOrders: [],
            waitingInstantOrders: [],
            ongoingGeneralOrders: [],
            ongoingInstantOrders: [],
            pastOrders: []
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            orderModel.find({restaurantID: restaurant.id,isDeleted: false},(err,orders) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json(responseObject);
                                }
                                else if(!orders.length) {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                }
    
                                let tableIDs = [];
    
                                for(i in orders) {
                                    let currentState;
                                    if(orders[i].currentState === 'Checking restaurant status') {
                                        currentState = 'Waiting for confirmation';

                                        if(orders[i].instantService) {
                                            responseObject.numberOfNewWaitingInstantOrders = responseObject.numberOfNewWaitingInstantOrders + 1;
                                        }
                                        else {
                                            responseObject.numberOfNewWaitingOrders = responseObject.numberOfNewWaitingOrders + 1;
                                        }

                                        orders[i].updateOne({
                                            currentState: 'Confirming order with restaurant'
                                        }).then((orderT) => {
                                            // No action needed
                                        })
                                    }
                                    else if(orders[i].currentState === 'Confirming order with restaurant') {
                                        currentState = 'Waiting for confirmation';
                                    }
                                    else if(orders[i].currentState === 'Restaurant is preparing your order') {
                                        currentState = 'Order is being prepared';
                                    }
                                    else {
                                        currentState = orders[i].currentState;
                                    }

                                    let ongoing = true;

                                    if((currentState === 'Failed') || (currentState === 'Canceled') || (currentState === 'Rejected') || (currentState === 'Completed')) {
                                        ongoing = false;
                                    }

                                    if(ongoing) {
                                        tableIDs.push(orders[i].tableID);
                                    }

                                    let discountRecord = [];

                                    for(j in orders[i].discountRecord) {
                                        discountRecord.push({
                                            id: orders[i].discountRecord[j].id,
                                            name: orders[i].discountRecord[j].name,
                                            type: orders[i].discountRecord[j].type,
                                            discountPercentage: orders[i].discountRecord[j].discountPercentage,
                                            applyTo: orders[i].discountRecord[j].applyTo,
                                            minOrder: orders[i].discountRecord[j].minOrder,
                                            maxAmount: orders[i].discountRecord[j].maxAmount,
                                            discountAmount: orders[i].discountRecord[j].discountAmount
                                        });
                                    }
                                    
                                    let order = {
                                        orderID: orders[i].id,
                                        tableID: orders[i].tableID,
                                        userName: orders[i].userName,
                                        numberOfGuests: orders[i].numberOfGuests,
                                        associate: orders[i].associate ? orders[i].associate : '',
                                        orderDetails: orders[i].orderDetails,
                                        grossTotal: orders[i].grossTotal,
                                        totalGovernmentCharge: orders[i].totalGovernmentCharge,
                                        governmentChargeRegNo: orders[i].governmentChargeRegNo,
                                        serviceCharge: orders[i].serviceCharge,
                                        currentState: currentState,
                                        specialDiscount: orders[i].specialDiscount,
                                        discountRecord: discountRecord,
                                        decimalRounding: orders[i].decimalRounding,
                                        netPayable: orders[i].netPayable,
                                        paymentStatus: orders[i].paymentStatus,
                                        instantService: orders[i].instantService,
                                        parcel: orders[i].parcel,
                                        createdOn: orders[i].createdOn,
                                        stateRecord: orders[i].stateRecord,
                                        reason: orders[i].reason,
                                        paymentMethod: orders[i].paymentMethod ? orders[i].paymentMethod : {},
                                        paidAmount: orders[i].paidAmount ? orders[i].paidAmount : '',
                                        changeAmount: orders[i].paidAmount ? orders[i].changeAmount : ''
                                    };

                                    if(ongoing) {
                                        if(currentState === 'Waiting for confirmation') {
                                            if(orders[i].instantService) {
                                                responseObject.numberOfOrders.waitingInstantOrders = responseObject.numberOfOrders.waitingInstantOrders + 1;
                                                responseObject.orders.waitingInstantOrders.push(order);
                                            }
                                            else {
                                                responseObject.numberOfOrders.waitingGeneralOrders = responseObject.numberOfOrders.waitingGeneralOrders + 1;
                                                responseObject.orders.waitingGeneralOrders.push(order);
                                            }
                                        }
                                        else {
                                            if(orders[i].instantService) {
                                                responseObject.numberOfOrders.ongoingInstantOrders = responseObject.numberOfOrders.ongoingInstantOrders + 1;
                                                responseObject.orders.ongoingInstantOrders.push(order);
                                            }
                                            else {
                                                responseObject.numberOfOrders.ongoingGeneralOrders = responseObject.numberOfOrders.ongoingGeneralOrders + 1;
                                                responseObject.orders.ongoingGeneralOrders.push(order);
                                            }
                                        }
                                    }
                                    else {
                                        responseObject.numberOfOrders.pastOrders = responseObject.numberOfOrders.pastOrders + 1;
                                        responseObject.orders.pastOrders.push(order);
                                    }
                                }

                                responseObject.tableIDs = [...new Set(tableIDs)];

                                restaurant.updateOne({
                                    lastPingTime: new Date()
                                }).then((restaurantT) => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                });
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/accept-order',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            specialDiscount: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validationHelper = require('../validation/validationHelper');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let orderID = checkEmpty(req.body.orderID);
                            let specialDiscount = checkEmpty(req.body.specialDiscount);
                            let associate = checkEmpty(req.body.associate);

                            if(!orderID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            let index = restaurant.associates.findIndex(j => j === associate);

                            if(index < 0) {
                                associate = '';
                            }

                            orderModel.findOne({_id: orderID,restaurantID: restaurantID,currentState: 'Confirming order with restaurant',isDeleted: false},(err,order) => {
                                if(err || (order === null)) {
                                    responseObject.message.fatalError = 'Order was not found!!';
                                    return res.json(responseObject);
                                }

                                if(specialDiscount) {
                                    if(!validationHelper.isPositiveNumber(specialDiscount)) {
                                        responseObject.message.specialDiscount = 'Enter a valid special discount';
                                        return res.json(responseObject);
                                    }
                                    else if(specialDiscount > order.netPayable) {
                                        specialDiscount = order.netPayable;
                                    }
                                    else {
                                        specialDiscount = Math.round(specialDiscount*100)/100;
                                    }

                                    specialDiscount = specialDiscount * (-1);
                                }
                                else {
                                    specialDiscount = 0;
                                }

                                let stateRecord = order.stateRecord;
                                stateRecord.push({
                                    state: 'Order accepted',
                                    time: new Date()
                                });

                                let netPayable = Math.round((order.grossTotal + order.totalGovernmentCharge + order.serviceCharge + specialDiscount)*100)/100;
                                let databaseDecimalRounding = 0;

                                if(restaurant.decimalRounding) {
                                    let decimalRounding = netPayable - Math.floor(netPayable);

                                    if(decimalRounding < 0.5) {
                                        netPayable = Math.floor(netPayable);
                                        databaseDecimalRounding = Math.round((0 - decimalRounding) * 100) / 100;
                                    }
                                    else {
                                        netPayable = Math.floor(netPayable) + 1;
                                        databaseDecimalRounding = Math.round((1 - decimalRounding) * 100) / 100;
                                    }
                                }

                                let currentState = 'Restaurant is preparing your order';

                                if(restaurant.isPayFirst) {
                                    currentState = 'Waiting for payment';
                                }

                                let discountRecord = [];
                                let nextDiscountID = 0;

                                if(specialDiscount) {
                                    discountRecord = [{
                                        id: 0,
                                        name: '',
                                        currentRecord: {
                                            specialDiscount: 0,
                                            decimalRounding: order.decimalRounding,
                                            netPayable: order.netPayable
                                        },
                                        type: 'Amount',
                                        discountPercentage: '',
                                        applyTo: 'Grand Total',
                                        minOrder: 0,
                                        maxAmount: '',
                                        discountAmount: specialDiscount * (-1),
                                        time: new Date()
                                    }];
    
                                    nextDiscountID = 1;
                                }

                                order.updateOne({
                                    specialDiscount: specialDiscount,
                                    decimalRounding: databaseDecimalRounding,
                                    netPayable: netPayable,
                                    associate: associate,
                                    currentState: currentState,
                                    stateRecord: stateRecord,
                                    discountRecord: discountRecord,
                                    nextDiscountID: nextDiscountID
                                }).then((orderT) => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                });
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/reject-order',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            reason: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let orderID = checkEmpty(req.body.orderID);
                            let reason = checkEmpty(req.body.reason);

                            if(!orderID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            if(reason) {
                                if(reason === 'Restaurant was offline') {
                                    responseObject.message.reason = 'This reason cannot be used';
                                    return res.json(responseObject);
                                }
                                else if(reason.length > 100) {
                                    responseObject.message.reason = 'Reason can be maximum 100 characters long';
                                    return res.json(responseObject);
                                }
                            }

                            orderModel.findOne({_id: orderID,restaurantID: restaurantID,isDeleted: false},(err,order) => {
                                if(err || (order === null)) {
                                    responseObject.message.fatalError = 'Order was not found!!';
                                    return res.json(responseObject);
                                }

                                if((order.currentState === 'Failed') || (order.currentState === 'Canceled') || (order.currentState === 'Rejected') || (order.currentState === 'Completed')) {
                                    responseObject.message.fatalError = 'Order rejection failed';
                                    return res.json(responseObject);
                                }

                                let stateRecord = order.stateRecord;
                                stateRecord.push({
                                    state: 'Order rejected',
                                    time: new Date()
                                });
                                
                                order.updateOne({
                                    currentState: 'Rejected',
                                    stateRecord: stateRecord,
                                    reason: reason,
                                    paymentStatus: (order.paymentStatus === 'Paid') ? 'Returned' : 'Unpaid'
                                }).then((orderT) => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                });
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/accept-payment',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            paymentMethod: '',
            paidAmount: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');
        const validationHelper = require('../validation/validationHelper');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let orderID = checkEmpty(req.body.orderID);
                            let paymentMethod = checkEmpty(req.body.paymentMethod);
                            let paidAmount = checkEmpty(req.body.paidAmount);
                            let changeAmount = 0;

                            if(!orderID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            if(!paymentMethod) {
                                responseObject.message.paymentMethod = 'Invalid payment method';
                                return res.json(responseObject);
                            }

                            let databasePaymentMethod = {};

                            for(i=0; i<restaurant.paymentMethod.length; i++) {
                                if(paymentMethod === restaurant.paymentMethod[i].id) {
                                    databasePaymentMethod = {
                                        id: paymentMethod,
                                        paymentMethod: restaurant.paymentMethod[i].paymentMethod,
                                        type: restaurant.paymentMethod[i].type,
                                        photo: restaurant.paymentMethod[i].photo
                                    }
                                    break;
                                }
                                else if(i === (restaurant.paymentMethod.length-1)) {
                                    responseObject.message.paymentMethod = 'Invalid payment method';
                                    return res.json(responseObject);
                                }
                            }

                            orderModel.findOne({_id: orderID,restaurantID: restaurantID,currentState: 'Waiting for payment',isDeleted: false},(err,order) => {
                                if(err || (order === null)) {
                                    responseObject.message.fatalError = 'Order was not found!!';
                                    return res.json(responseObject);
                                }

                                if(databasePaymentMethod.type === 'Cash') {
                                    if(!((paidAmount === 0) || (validationHelper.isPositiveNumber(paidAmount)))) {
                                        responseObject.message.paidAmount = 'Enter a valid paid amount';
                                        return res.json(responseObject);
                                    }
                                    else if(paidAmount > 1000000000) {
                                        responseObject.message.paidAmount = 'Paid amount is too big';
                                        return res.json(responseObject);
                                    }
                                    else if(paidAmount < order.netPayable) {
                                        responseObject.message.paidAmount = 'Paid amount cannot be less than net payable';
                                        return res.json(responseObject);
                                    }

                                    paidAmount = Math.round(paidAmount*100)/100;
                                    changeAmount = Math.round((order.netPayable - paidAmount)*100)/100;
                                }
                                else {
                                    paidAmount = '';
                                }

                                let currentState = 'Restaurant is preparing your order';
                                let stateRecord = order.stateRecord;

                                stateRecord.push({
                                    state: 'Payment completed',
                                    time: new Date()
                                });

                                if(restaurant.isPayFirst) {
                                    stateRecord.push({
                                        state: 'Restaurant started preparation',
                                        time: new Date()
                                    });
                                }
                                else {
                                    currentState = 'Completed';
                                    stateRecord.push({
                                        state: 'Completed',
                                        time: new Date()
                                    });
                                }

                                order.updateOne({
                                    currentState: currentState,
                                    stateRecord: stateRecord,
                                    paymentMethod: databasePaymentMethod,
                                    paidAmount: paidAmount,
                                    changeAmount: changeAmount,
                                    paymentStatus: 'Paid'
                                }).then((orderT) => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                });
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/serve-order',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let orderID = checkEmpty(req.body.orderID);

                            if(!orderID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            orderModel.findOne({_id: orderID,restaurantID: restaurantID,currentState: 'Restaurant is preparing your order',isDeleted: false},(err,order) => {
                                if(err || (order === null)) {
                                    responseObject.message.fatalError = 'Order was not found!!';
                                    return res.json(responseObject);
                                }

                                let stateRecord = order.stateRecord;
                                stateRecord.push({
                                    state: 'Order ready',
                                    time: new Date()
                                });

                                order.updateOne({
                                    currentState: 'Order is ready to be served',
                                    stateRecord: stateRecord
                                }).then((orderT) => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                });
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/complete-order',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let orderID = checkEmpty(req.body.orderID);

                            if(!orderID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            orderModel.findOne({_id: orderID,restaurantID: restaurantID,currentState: 'Order is ready to be served',isDeleted: false},(err,order) => {
                                if(err || (order === null)) {
                                    responseObject.message.fatalError = 'Order was not found!!';
                                    return res.json(responseObject);
                                }

                                let stateRecord = order.stateRecord;
                                stateRecord.push({
                                    state: 'Served',
                                    time: new Date()
                                });

                                if(restaurant.isPayFirst) {
                                    stateRecord.push({
                                        state: 'Completed',
                                        time: new Date()
                                    });
                                    order.updateOne({
                                        currentState: 'Completed',
                                        stateRecord: stateRecord
                                    }).then((orderT) => {
                                        responseObject.status = 'success';
                                        return res.json(responseObject);
                                    });
                                }
                                else {
                                    order.updateOne({
                                        currentState: 'Waiting for payment',
                                        stateRecord: stateRecord
                                    }).then((orderT) => {
                                        responseObject.status = 'success';
                                        return res.json(responseObject);
                                    });
                                }
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/sync-orders',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            oldOrdersArray: [],
            newOrdersArray: []
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validationHelper = require('../validation/validationHelper');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let oldOrders = checkEmpty(req.body.oldOrders);
                            let newOrders = checkEmpty(req.body.newOrders);

                            let oldOrderID = [];

                            if(oldOrders) {
                                if(!Array.isArray(oldOrders)) {
                                    responseObject.message.fatalError = 'Invalid order array';
                                    return res.json(responseObject);
                                }

                                for(i in oldOrders) {
                                    if(oldOrders[i].orderID) {
                                        oldOrderID.push(oldOrders[i].orderID);
                                    }
                                }
                            }

                            let uniqueOldOrderID = [...new Set(oldOrderID)];;

                            if(newOrders) {
                                if(!Array.isArray(newOrders)) {
                                    responseObject.message.fatalError = 'Invalid order array';
                                    return res.json(responseObject);
                                }
                            }

                            let currentStateValues = ['Confirming order with restaurant','Failed','Canceled','Rejected','Restaurant is preparing your order','Order is ready to be served','Waiting for payment','Completed'];

                            foodItemsModel.find({restaurantID: restaurantID,isDeleted: false},(err,foodItems) => {
                                orderModel.find({"$and":[{ _id: {$in : uniqueOldOrderID}},{restaurantID: restaurantID},{isDeleted: false}]},(err,orders) => {
                                    if(uniqueOldOrderID.length && (err || !orders || !orders.length)) {
                                        responseObject.message.oldOrdersArray = uniqueOldOrderID;
                                    }
                                    else if(uniqueOldOrderID.length !== orders.length) {
                                        for(i in uniqueOldOrderID) {
                                            let index = orders.findIndex(j => j.orderID === uniqueOldOrderID[i]);
    
                                            if(index < 0) {
                                                responseObject.message.oldOrdersArray.push(uniqueOldOrderID[i]);
                                            }
                                        }
                                    }
    
                                    for(i in orders) {
                                        let index = oldOrders.findIndex(j => j.orderID === orders[i].orderID);

                                        if((orders[i].currentState === 'Failed') || (orders[i].currentState === 'Canceled') || (orders[i].currentState === 'Rejected') || (orders[i].currentState === 'Completed')) {
                                            responseObject.message.oldOrdersArray.push(oldOrders[index].orderID);
                                            continue;
                                        }
    
                                        let currentState = oldOrders[index].currentState;
                                        let reason = oldOrders[index].reason;
                                        let stateRecord = oldOrders[index].stateRecord;
                                        let discountRecord = oldOrders[index].discountRecord;
                                        let specialDiscount = oldOrders[index].specialDiscount;
                                        let associate = oldOrders[index].associate;
                                        let decimalRounding = oldOrders[index].decimalRounding;
                                        let netPayable = oldOrders[index].netPayable;
                                        let paidAmount = oldOrders[index].paidAmount;
                                        let changeAmount = oldOrders[index].changeAmount;
                                        let paymentStatus = oldOrders[index].paymentStatus;
                                        let paymentMethod = oldOrders[index].paymentMethod ? oldOrders[index].paymentMethod : '';
                                        let nextDiscountID = oldOrders[index].nextDiscountID;

                                        if(paymentMethod) {
                                            let paymentMethodIndex = restaurant.paymentMethod.findIndex(j => j.id === paymentMethod);
                                            let cashPaymentIndex = restaurant.paymentMethod.findIndex(j => j.type === 'Cash');

                                            if(paymentMethodIndex >= 0) {
                                                paymentMethod = restaurant.paymentMethod[paymentMethodIndex];
                                            }
                                            else {
                                                paymentMethod = restaurant.paymentMethod[cashPaymentIndex];
                                            }
                                        }

                                        orders[i].updateOne({
                                            currentState: currentState,
                                            reason: reason,
                                            stateRecord: stateRecord,
                                            discountRecord: discountRecord,
                                            specialDiscount: specialDiscount,
                                            associate: associate,
                                            decimalRounding: decimalRounding,
                                            netPayable: netPayable,
                                            paidAmount: paidAmount,
                                            changeAmount: changeAmount,
                                            paymentStatus: paymentStatus,
                                            paymentMethod: paymentMethod,
                                            nextDiscountID: nextDiscountID,
                                            offlineUpdate: true
                                        }).then(orderT => {
                                            // No action needed
                                        });
                                    }

                                    for(i in newOrders) {
                                        let tableID = newOrders[i].tableID;
                                        let numberOfGuests = newOrders[i].numberOfGuests;
                                        let associate = newOrders[i].associate;
                                        let orderDetails = newOrders[i].orderDetails;
                                        let grossTotal = newOrders[i].grossTotal;
                                        let totalGovernmentCharge = newOrders[i].totalGovernmentCharge;
                                        let serviceCharge = newOrders[i].serviceCharge;
                                        let nextDiscountID = newOrders[i].nextDiscountID;
                                        let discountRecord = newOrders[i].discountRecord;
                                        let specialDiscount = newOrders[i].specialDiscount;
                                        let decimalRounding = newOrders[i].decimalRounding;
                                        let netPayable = newOrders[i].netPayable;
                                        let paidAmount = newOrders[i].paidAmount;
                                        let changeAmount = newOrders[i].changeAmount;
                                        let instantService = newOrders[i].instantService;
                                        let parcel = newOrders[i].parcel;
                                        let currentState = newOrders[i].currentState;
                                        let stateRecord = newOrders[i].stateRecord;
                                        let paymentMethod = newOrders[i].paymentMethod ? newOrders[i].paymentMethod : '';
                                        let paymentStatus = newOrders[i].paymentStatus;
                                        let createdOn = newOrders[i].createdOn;
                                        let reason = newOrders[i].reason;

                                        if(paymentMethod) {
                                            let paymentMethodIndex = restaurant.paymentMethod.findIndex(j => j.id === paymentMethod);
                                            let cashPaymentIndex = restaurant.paymentMethod.findIndex(j => j.type === 'Cash');

                                            if(paymentMethodIndex >= 0) {
                                                paymentMethod = restaurant.paymentMethod[paymentMethodIndex];
                                            }
                                            else {
                                                paymentMethod = restaurant.paymentMethod[cashPaymentIndex];
                                            }
                                        }

                                        const newOrder = new orderModel({
                                            tableID: tableID,
                                            numberOfGuests: numberOfGuests,
                                            associate: associate,
                                            orderDetails: orderDetails,
                                            grossTotal: grossTotal,
                                            totalGovernmentCharge: totalGovernmentCharge,
                                            serviceCharge: serviceCharge,
                                            nextDiscountID: nextDiscountID,
                                            discountRecord: discountRecord,
                                            specialDiscount: specialDiscount,
                                            decimalRounding: decimalRounding,
                                            netPayable: netPayable,
                                            paidAmount: paidAmount,
                                            changeAmount: changeAmount,
                                            instantService: instantService,
                                            parcel: parcel,
                                            currentState: currentState,
                                            stateRecord: stateRecord,
                                            paymentMethod: paymentMethod,
                                            paymentStatus: paymentStatus,
                                            createdOn: createdOn,
                                            reason: reason,
                                            offlineUpdate: true
                                        });
                
                                        newOrder
                                        .save()
                                        .then(order => {
                                            // No action needed
                                        })
                                    }
                                });
                            });
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/summary',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        totalUsers: 0,
        totalOrders: 0,
        totalItems: 0,
        totalSales: 0
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        const orderModel = require('../models/orderModel');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            foodItemsModel.find({restaurantID: restaurant.id,isDeleted: false},(err,foodItems) => {
                                if(foodItems.length) {
                                    responseObject.totalItems = foodItems.length;
                                }

                                orderModel.find({restaurantID: restaurant.id, isDeleted: false},(err,orders) => {
                                    if(err || (!orders.length)) {
                                        responseObject.status = 'success';
                                        return res.json(responseObject);
                                    }

                                    responseObject.totalOrders = orders.length;

                                    let users = [];
                                    let earnings = 0;

                                    for(i in orders) {
                                        if(orders[i].userID !== 'N/A') {
                                            users.push(orders[i].userID);
                                        }

                                        if(orders[i].currentState === 'Completed') {
                                            earnings = earnings + orders[i].netPayable;
                                        }
                                    }

                                    let uniqueUsers = [...new Set(users)];

                                    responseObject.totalUsers = uniqueUsers.length;
                                    responseObject.totalSales = earnings;
    
                                    responseObject.status = 'success';
                                    
                                    return res.json(responseObject);
                                })
                            });
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/earnings-summary',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        cash: 0,
        card: 0,
        mobileBanking: 0,
        details: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const checkEmpty = require('../validation/checkEmpty');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');

        let offset = Number(req.body.offset);

        if(offset) {
            if((offset > 12) || (offset < -12)) {
                offset = 6;
            }
            else {
                offset = Math.round(offset * 100) / 100;
            }
        }
        else {
            offset = 6;
        }

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            orderModel.find({restaurantID: restaurant.id,currentState: 'Completed',isDeleted: false},(err,orders) => {
                                if(err || (!orders.length)) {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                }

                                let day = checkEmpty(req.body.day);

                                if(!day){
                                    day = 0;
                                }
                                else if(!Number.isInteger(day)) {
                                    day = 0;
                                }
                                else if(day > 100000) {
                                    day = 0;
                                }

                                let date = new Date();
                                let timestamp = date.getTime();
                                let hours = date.getUTCHours();
                                let minutes = date.getUTCMinutes();
                                let seconds = date.getUTCSeconds();
                                let milliseconds = date.getUTCMilliseconds();

                                let userMinute = 0;
                                if(offset < 0) {
                                    offset = Math.abs(offset);
                                    let decimal = offset - Math.floor(offset);
                                    userMinute = minutes - decimal * 60;

                                    if(userMinute < 0) {
                                        userMinute = userMinute + 60;
                                        hours = hours - 1;
                                    }
                                }
                                else if(offset > 0) {
                                    let decimal = offset - Math.floor(offset);
                                    userMinute = minutes + decimal * 60;

                                    if(userMinute > 59) {
                                        userMinute = userMinute - 60;
                                        hours = hours + 1;
                                    }
                                }
                                
                                let userHour = hours + Math.floor(offset);
                                if(userHour > 23) {
                                    userHour = userHour - 24;
                                }
                                else if(userHour < 0) {
                                    userHour = userHour + 24;
                                }
                                
                                let userTimeMidnight = timestamp - (userHour * 60 * 60 * 1000 + userMinute * 60 * 1000 + seconds * 1000 + milliseconds) - day * 24 * 60 * 60 * 1000;
                                let userTimeEnd = userTimeMidnight + 24 * 60 * 60 * 1000;

                                let cash = 0;
                                let card = 0;
                                let mobileBanking = 0;
                                let details = [];

                                for(i in orders) {
                                    let orderCreationTime = orders[i].createdOn.getTime();

                                    if((orderCreationTime >= userTimeMidnight) && (orderCreationTime < userTimeEnd)) {
                                        if(orders[i].paymentMethod.type === 'Cash') {
                                            cash = cash + orders[i].netPayable;
                                        }
                                        else if(orders[i].paymentMethod.type === 'Card') {
                                            card = card + orders[i].netPayable;
                                        }
                                        else if(orders[i].paymentMethod.type === 'Mobile Banking') {
                                            mobileBanking = mobileBanking + orders[i].netPayable;
                                        }

                                        for(j=0; j<details.length; j++) {
                                            if(details[j].paymentMethod === orders[i].paymentMethod.paymentMethod) {
                                                details[j].amount = details[j].amount + orders[i].netPayable;
                                            }
                                            else if(j === (details.length-1)) {
                                                details.push({
                                                    paymentMethod: orders[i].paymentMethod.paymentMethod,
                                                    amount: orders[i].netPayable
                                                })
                                            }
                                        }
                                    }
                                }

                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    total: cash + card + mobileBanking,
                                    cash: cash,
                                    card: card,
                                    mobileBanking: mobileBanking,
                                    details: details
                                });
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/apply-discount',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            name: '',
            discount: '',
            minOrder: '',
            maxAmount: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validationHelper = require('../validation/validationHelper');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let orderID = checkEmpty(req.body.orderID);
                            let name = checkEmpty(req.body.name) ? req.body.name : '';
                            let type = (req.body.type === 'Percentage') ? 'Percentage' : 'Amount';
                            let discount = checkEmpty(req.body.discount);
                            let applyTo = (req.body.applyTo === 'Subtotal') ? 'Subtotal' : 'Grand Total';
                            let minOrder = checkEmpty(req.body.minOrder);
                            let maxAmount = checkEmpty(req.body.maxAmount);

                            if(!orderID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            if(name) {
                                name = name.replace(/ +(?= )/g,'');
                                name = name.trim();

                                if(name.length > 25) {
                                    responseObject.message.name = 'Discount coupon\'s name can have maximum 25 characters';
                                    return res.json(responseObject);
                                }
                            }

                            if(!validationHelper.isPositiveNumber(discount)) {
                                responseObject.message.discount = 'Discount must be a positive number';
                                return res.json(responseObject);
                            }
                            else if(discount > 999999999999999999999999999999) {
                                responseObject.message.discount = 'Discount amount is too big';
                                return res.json(responseObject);
                            }
                            else {
                                discount = Math.round(discount*100)/100;
                            }

                            if((minOrder !== 0) && minOrder) {
                                if(!validationHelper.isPositiveNumber(minOrder)) {
                                    responseObject.message.minOrder = 'Minimum order amount must be 0 or a positive number';
                                    return res.json(responseObject);
                                }
                                else if(minOrder > 999999999999999999999999999999) {
                                    responseObject.message.minOrder = 'Minimum order amount is too big';
                                    return res.json(responseObject);
                                }
                                else {
                                    minOrder = Math.round(discount*100)/100;
                                }
                            }
                            else {
                                minOrder = 0;
                            }

                            if(type === 'Percentage') {
                                if(discount > 100) {
                                    responseObject.message.discount = 'Discount cannot be bigger than 100%';
                                    return res.json(responseObject);
                                }

                                if(maxAmount) {
                                    if(!validationHelper.isPositiveNumber(maxAmount)) {
                                        responseObject.message.maxAmount = 'Maximum discount amount must be a positive number';
                                        return res.json(responseObject);
                                    }
                                    else if(maxAmount > 999999999999999999999999999999) {
                                        responseObject.message.maxAmount = 'Maximum discount amount is too big';
                                        return res.json(responseObject);
                                    }
                                    else {
                                        maxAmount = Math.round(maxAmount*100)/100;
                                    }
                                }
                                else {
                                    maxAmount = '';
                                }
                            }
                            else {
                                maxAmount = '';
                            }

                            orderModel.findOne({_id: orderID,restaurantID: restaurantID,isDeleted: false},(err,order) => {
                                if(err || (order === null)) {
                                    responseObject.message.fatalError = 'Order was not found!!';
                                    return res.json(responseObject);
                                }

                                if(order.currentState === 'Confirming order with restaurant') {
                                    responseObject.message.fatalError = 'Order must be accepted before applying a discount';
                                    return res.json(responseObject);
                                }
                                else if((order.currentState === 'Failed') || (order.currentState === 'Canceled') || (order.currentState === 'Rejected') || (order.currentState === 'Completed')) {
                                    responseObject.message.fatalError = 'Dicount cannot be applied to a ' + order.currentState + ' order';
                                    return res.json(responseObject);
                                }

                                let specialDiscount = order.specialDiscount * (-1);
                                let decimalRounding = order.decimalRounding;
                                let netPayable = order.netPayable;

                                let discountPercentage = discount;

                                if(type === 'Percentage') {
                                    if(applyTo === 'Subtotal') {
                                        if(minOrder < order.grossTotal) {
                                            discount = 0;
                                        }
                                        else {
                                            discount = Math.round((order.grossTotal * (discount / 100)) * 100) / 100;
                                        }
                                    }
                                    else {
                                        if(minOrder < order.netPayable) {
                                            discount = 0;
                                        }
                                        else {
                                            discount = Math.round(((order.grossTotal + order.totalGovernmentCharge + order.serviceCharge) * (discount / 100)) * 100) / 100;
                                        }
                                    }

                                    if(maxAmount) {
                                        if(discount > maxAmount) {
                                            discount = maxAmount;
                                        }
                                    }

                                    specialDiscount = specialDiscount + discount;
                                    netPayable = Math.round((order.grossTotal + order.totalGovernmentCharge + order.serviceCharge - specialDiscount) * 100) / 100;

                                    if(restaurant.decimalRounding) {
                                        let decimalRoundingCalculate = netPayable - Math.floor(netPayable);

                                        if(decimalRoundingCalculate < 0.5) {
                                            netPayable = Math.floor(netPayable);
                                            decimalRounding = Math.round((0 - decimalRoundingCalculate) * 100) / 100;
                                        }
                                        else {
                                            netPayable = Math.floor(netPayable) + 1;
                                            decimalRounding = Math.round((1 - decimalRoundingCalculate) * 100) / 100;
                                        }
                                    }
                                }
                                else {
                                    discountPercentage = '';

                                    if(applyTo === 'Subtotal') {
                                        if(minOrder < order.grossTotal) {
                                            discount = 0;
                                        }
                                    }
                                    else {
                                        if(minOrder < order.netPayable) {
                                            discount = 0;
                                        }
                                    }

                                    if(discount >= netPayable) {
                                        specialDiscount = specialDiscount + netPayable;
                                        netPayable = 0;
                                    }
                                    else {
                                        specialDiscount = specialDiscount + discount;
                                        netPayable = Math.round((order.grossTotal + order.totalGovernmentCharge + order.serviceCharge - specialDiscount) * 100) / 100;

                                        if(restaurant.decimalRounding) {
                                            let decimalRoundingCalculate = netPayable - Math.floor(netPayable);

                                            if(decimalRoundingCalculate < 0.5) {
                                                netPayable = Math.floor(netPayable);
                                                decimalRounding = Math.round((0 - decimalRoundingCalculate) * 100) / 100;
                                            }
                                            else {
                                                netPayable = Math.floor(netPayable) + 1;
                                                decimalRounding = Math.round((1 - decimalRoundingCalculate) * 100) / 100;
                                            }
                                        }
                                    }
                                }

                                specialDiscount = specialDiscount * (-1);

                                let discountRecord = order.discountRecord.push({
                                    id: order.nextDiscountID,
                                    name: name,
                                    currentRecord: {
                                        specialDiscount: order.specialDiscount,
                                        decimalRounding: order.decimalRounding,
                                        netPayable: order.netPayable
                                    },
                                    type: type,
                                    discountPercentage: discountPercentage,
                                    applyTo: applyTo,
                                    minOrder: minOrder,
                                    maxAmount: maxAmount,
                                    discountAmount: discount,
                                    time: new Date()
                                });

                                let nextDiscountID = order.nextDiscountID + 1;

                                let changeAmount = 0;

                                if(order.paidAmount) {
                                    changeAmount = Math.round((netPayable - order.paidAmount) * 100) / 100;
                                }

                                order.updateOne({
                                    nextDiscountID: nextDiscountID,
                                    specialDiscount: specialDiscount,
                                    decimalRounding: decimalRounding,
                                    netPayable: netPayable,
                                    discountRecord: discountRecord,
                                    changeAmount: changeAmount
                                }).then((orderT) => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                });
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/remove-discount',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validationHelper = require('../validation/validationHelper');
        const managerModel = require('../models/managerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'manager') {
            managerModel.findOne({_id: id,isDeleted: false},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    let restaurantID = manager.restaurantID;

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        if(restaurant !== null) {
                            let orderID = checkEmpty(req.body.orderID);
                            let discountID = checkEmpty(req.body.discountID);

                            if(!orderID) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }
                            else if((discountID !== 0) && !validationHelper.isPositiveNumber(discountID)) {
                                responseObject.message.fatalError = 'Invalid request';
                                return res.json(responseObject);
                            }

                            orderModel.findOne({_id: orderID,restaurantID: restaurantID,isDeleted: false},(err,order) => {
                                if(err || (order === null)) {
                                    responseObject.message.fatalError = 'Order was not found!!';
                                    return res.json(responseObject);
                                }

                                if(order.currentState === 'Confirming order with restaurant') {
                                    responseObject.message.fatalError = 'Order must be accepted before removing a discount';
                                    return res.json(responseObject);
                                }
                                else if((order.currentState === 'Failed') || (order.currentState === 'Canceled') || (order.currentState === 'Rejected') || (order.currentState === 'Completed')) {
                                    responseObject.message.fatalError = 'Dicount cannot be removed from a ' + order.currentState + ' order';
                                    return res.json(responseObject);
                                }

                                let index = order.discountRecord.findIndex(j => j.id === discountID);

                                if(index >= 0) {
                                    let specialDiscount = order.discountRecord[index].currentRecord.specialDiscount;
                                    let decimalRounding = order.discountRecord[index].currentRecord.decimalRounding;
                                    let netPayable = order.discountRecord[index].currentRecord.netPayable;
                                    let discountRecord = order.discountRecord.splice(index, 1);
                                    let paidAmount = order.paidAmount;
                                    let nextDiscountID = order.nextDiscountID;
                                    let changeAmount = 0;
                                    let lastDiscountCouponID = 0;

                                    for(i in order.discountRecord) {
                                        if(Number.isInteger(order.discountRecord[i].id)) {
                                            if(order.discountRecord[i].id > index) {
                                                lastDiscountCouponID = order.discountRecord[i].id;
                                                let currentRecord = {
                                                    specialDiscount: specialDiscount,
                                                    decimalRounding: decimalRounding,
                                                    netPayable: netPayable
                                                };
                                                let type = order.discountRecord[i].type;
                                                let discountPercentage = order.discountRecord[i].discountPercentage;
                                                let applyTo = order.discountRecord[i].applyTo;
                                                let minOrder = order.discountRecord[i].minOrder;
                                                let maxAmount = order.discountRecord[i].maxAmount;
                                                let discountAmount = order.discountRecord[i].discountAmount;
    
                                                if(type === 'Percentage') {
                                                    specialDiscount = specialDiscount * (-1);
    
                                                    if(applyTo === 'Subtotal') {
                                                        if(minOrder < order.grossTotal) {
                                                            discountAmount = 0;
                                                        }
                                                        else {
                                                            discountAmount = Math.round((order.grossTotal * (discountPercentage / 100)) * 100) / 100;
                                                        }
                                                    }
                                                    else {
                                                        if(minOrder < order.netPayable) {
                                                            discountAmount = 0;
                                                        }
                                                        else {
                                                            discountAmount = Math.round(((order.grossTotal + order.totalGovernmentCharge + order.serviceCharge) * (discountPercentage / 100)) * 100) / 100;
                                                        }
                                                    }
                
                                                    if(maxAmount) {
                                                        if(discountAmount > maxAmount) {
                                                            discountAmount = maxAmount;
                                                        }
                                                    }
                
                                                    specialDiscount = specialDiscount + discountAmount;
                                                    netPayable = Math.round((order.grossTotal + order.totalGovernmentCharge + order.serviceCharge - specialDiscount) * 100) / 100;
                
                                                    if(restaurant.decimalRounding) {
                                                        let decimalRoundingCalculate = netPayable - Math.floor(netPayable);
                
                                                        if(decimalRoundingCalculate < 0.5) {
                                                            netPayable = Math.floor(netPayable);
                                                            decimalRounding = Math.round((0 - decimalRoundingCalculate) * 100) / 100;
                                                        }
                                                        else {
                                                            netPayable = Math.floor(netPayable) + 1;
                                                            decimalRounding = Math.round((1 - decimalRoundingCalculate) * 100) / 100;
                                                        }
                                                    }
    
                                                    specialDiscount = specialDiscount * (-1);
                                                }
                                                else {
                                                    specialDiscount = specialDiscount * (-1);
    
                                                    if(discountAmount >= netPayable) {
                                                        specialDiscount = specialDiscount + netPayable;
                                                        netPayable = 0;
                                                    }
                                                    else {
                                                        specialDiscount = specialDiscount + discountAmount;
                                                        netPayable = Math.round((order.grossTotal + order.totalGovernmentCharge + order.serviceCharge - specialDiscount) * 100) / 100;
                
                                                        if(restaurant.decimalRounding) {
                                                            let decimalRoundingCalculate = netPayable - Math.floor(netPayable);
                
                                                            if(decimalRoundingCalculate < 0.5) {
                                                                netPayable = Math.floor(netPayable);
                                                                decimalRounding = Math.round((0 - decimalRoundingCalculate) * 100) / 100;
                                                            }
                                                            else {
                                                                netPayable = Math.floor(netPayable) + 1;
                                                                decimalRounding = Math.round((1 - decimalRoundingCalculate) * 100) / 100;
                                                            }
                                                        }
                                                    }
    
                                                    specialDiscount = specialDiscount * (-1);
                                                }
    
                                                discountRecord[i] = {
                                                    ...discountRecord[i],
                                                    currentRecord: currentRecord,
                                                    discountAmount: discountAmount
                                                }
                                            }
                                        }
                                    }

                                    if(nextDiscountID <= lastDiscountCouponID) {
                                        nextDiscountID = lastDiscountCouponID + 1;
                                    }

                                    if(paidAmount) {
                                        if(paidAmount < netPayable) {
                                            paidAmount = netPayable;
                                            changeAmount = 0;
                                        }
                                        else {
                                            changeAmount = Math.round((paidAmount - netPayable) * 100) / 100;
                                        }
                                    }

                                    order.updateOne({
                                        specialDiscount: specialDiscount,
                                        decimalRounding: decimalRounding,
                                        netPayable: netPayable,
                                        discountRecord: discountRecord,
                                        nextDiscountID: nextDiscountID,
                                        changeAmount: changeAmount
                                    }).then((orderT) => {
                                        responseObject.status = 'success';
                                        return res.json(responseObject);
                                    });
                                }
                                else {
                                    responseObject.message.fatalError = 'Invalid request';
                                    return res.json(responseObject);
                                }
                            })
                        }
                        else {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = "Invalid access token";
                    return res.json(responseObject);
                }
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

module.exports = router;