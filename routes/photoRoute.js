const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
		cb(null, './photos/temp');
	},
	filename: function (req, file, cb) {
        const uuidv4 = require('uuid/v4');
        const path = require('path');
        const sequenceModel = require('../models/sequenceModel');
        sequenceModel.findOne({},(err,seq) => {
            let seqNo = 0;

            if(seq === null) {
                new sequenceModel({}).save();
            }
            else if(!err) {
                seqNo = seq.seqNo + 1;
                seq.seqNo = seqNo;
                seq.save();
            }

            var imgPath = uuidv4() + '#' + seqNo.toString(16) + path.extname(file.originalname);
            cb(null,imgPath);
        });
	}
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 50000000},
    fileFilter: (req,file,cb) => {
        const checkPhoto = require('../validation/checkPhoto');
        if(checkPhoto(file,cb)) {
            cb(null,true);
        }
        else {
            cb('Error: Upload a valid photo');
        }
    }
}).single('myPhoto');

const fetchPhoto = (path,photoNameArray,cb) => {
    const sharp = require('sharp');
    sharp.cache(false);

    let photoArray = [];

    if(photoNameArray.length === 0) {
        photoArray = [{
            name: '',
            photo: ''
        }];

        cb(photoArray);
    }
    else if(photoNameArray.length === 1) {
        let photoPath = path + photoNameArray[0];

        sharp(photoPath)
        .toBuffer((err,output) => {
            if(err) {
                photoArray.push({
                    name: photoNameArray[0] ? photoNameArray[0] : '',
                    photo: ''
                });
            }
            else {
                photoArray.push({
                    name: photoNameArray[0],
                    photo: output
                });
            }

            cb(photoArray);
        })
    }
    else {
        for(i in photoNameArray) {
            let photoName = photoNameArray[i];
            let photoPath = path + photoName;

            sharp(photoPath)
            .toBuffer((err,output) => {
                if(err) {
                    photoArray.push({
                        name: photoName ? photoName : '',
                        photo: ''
                    });
                }
                else {
                    photoArray.push({
                        name: photoName,
                        photo: output
                    });
                }
            })
        }

        function waitFunc() {
            if(photoArray.length !== photoNameArray.length) {
                setTimeout(waitFunc, 100);
            }
            else {
                cb(photoArray);
            }
        }

        setTimeout(waitFunc, 100);
    }
}

router.post('/upload-photo',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            clientPhotoID: ''
        },
        tempPhotoID: '',
        clientPhotoID: '',
        photo: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        upload(req, res, function (err) {
            if (err) {
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            const validateLoginAuthenticity = require('../validation/isLoggedIn');
            let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
            if(!isValid) {
                return res.json(responseObject);
            }
            else {
                const checkEmpty = require('../validation/checkEmpty');
                let clientPhotoID = checkEmpty(req.body.clientPhotoID);

                if(!clientPhotoID) {
                    responseObject.message.clientPhotoID = 'Client photo ID is required';
                    return res.json(responseObject);
                }
                else if(!clientPhotoID.match("^[a-zA-Z0-9]*$")) {
                    responseObject.message.clientPhotoID = 'Client photo ID should contain only numbers and letters';
                    return res.json(responseObject);
                }
                
                if(!((req.body.type === 'logo') || (req.body.type === 'banner') || (req.body.type === 'profile') || (req.body.type === 'food') || (req.body.type === 'restaurant'))) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json(responseObject);
                }
                const tempPhotoModel = require('../models/tempPhotoModel');

                if(!(req.file && req.file.filename)) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json(responseObject);
                }

                new tempPhotoModel({
                    userID: id,
                    userType: userType,
                    name: req.file.filename,
                    type: req.body.type
                }).save()
                .then(tempPhoto => {
                    const sharp = require('sharp');
                    sharp.cache(false);

                    if(req.body.type === 'banner') {
                        sharp(req.file.path)
                        .resize(1500,300)
                        .toBuffer((err,output) => {
                            if(err) {
                                responseObject.message.fatalError = "Something went wrong!!";
                                return res.json(responseObject);
                            }
                            else {
                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    tempPhotoID: tempPhoto.id,
                                    clientPhotoID: req.body.clientPhotoID,
                                    photo: output
                                });
                            }
                        });
                    }
                    else {
                        sharp(req.file.path)
                        .resize(320,300)
                        .toBuffer((err,output) => {
                            if(err) {
                                responseObject.message.fatalError = "Something went wrong!!";
                                return res.json(responseObject);
                            }
                            else {
                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    tempPhotoID: tempPhoto.id,
                                    clientPhotoID: req.body.clientPhotoID,
                                    photo: output
                                });
                            }
                        });
                    }
                })
            }
        });
    })
});

router.post('/manager-profile-photo',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
        },
        profilePhoto: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const managerModel = require('../models/managerModel');

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
                    let photoPath = 'photos/manager_profile/photo-640/';
                    let photoNameArray = [manager.photo];

                    fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                        responseObject.status = 'success';
                        responseObject.profilePhoto = photoArray[0];
                        return res.json(responseObject);
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

router.post('/restaurant-photo',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        logo: '',
        banner: '',
        photo: [],
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
                            let cashPhotoNames = [];
                            let cardPhotoNames = [];
                            let mobileBankingPhotoNames = [];

                            for(i in restaurant.paymentMethod) {
                                if(restaurant.paymentMethod[i].type === 'Cash') {
                                    cashPhotoNames.push(restaurant.paymentMethod[i].photo);
                                }
                                else if(restaurant.paymentMethod[i].type === 'Card') {
                                    cardPhotoNames.push(restaurant.paymentMethod[i].photo);
                                }
                                else if(restaurant.paymentMethod[i].type === 'Mobile Banking') {
                                    mobileBankingPhotoNames.push(restaurant.paymentMethod[i].photo);
                                }
                            }

                            let photoPath = 'photos/logo/photo-640/';
                            let photoNameArray = [restaurant.logo];

                            fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                responseObject.logo = photoArray[0];
                                
                                photoPath = 'photos/banner/photo-3000/';
                                photoNameArray = [restaurant.banner];

                                fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                    responseObject.banner = photoArray[0];
                                    
                                    photoPath = 'photos/restaurant/photo-640/';
                                    photoNameArray = restaurant.photo;

                                    fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                        responseObject.photo = photoArray;
                                        
                                        photoPath = 'photos/payment_method/150-100/';
                                        photoNameArray = cashPhotoNames;

                                        fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                            responseObject.paymentMethod.cash = photoArray;
                                            
                                            photoNameArray = cardPhotoNames;

                                            fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                                responseObject.paymentMethod.card = photoArray;
                                                
                                                photoNameArray = mobileBankingPhotoNames;

                                                fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                                    responseObject.status = 'success';
                                                    responseObject.paymentMethod.mobileBanking = photoArray;
                                                    return res.json(responseObject);
                                                });
                                            });
                                        });
                                    });
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

router.post('/payment-methods',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
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
        const restaurantModel = require('../models/restaurantModel');
        const paymentMethodModel = require('../models/paymentMethodModel');

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
                            paymentMethodModel.find({},(err,paymentMethods) => {
                                if(err || (paymentMethods.length === 0)) {
                                    responseObject.message.fatalError = "Something went wrong!!";
                                    return res.json(responseObject);
                                }

                                let cashPhotoNames = [];
                                let cardPhotoNames = [];
                                let mobileBankingPhotoNames = [];

                                for(i in paymentMethods) {
                                    if(paymentMethods[i].type === 'Cash') {
                                        cashPhotoNames.push(paymentMethods[i].photo);
                                    }
                                    else if(paymentMethods.type === 'Card') {
                                        cardPhotoNames.push(paymentMethods[i].photo);
                                    }
                                    else if(paymentMethods[i].type === 'Mobile Banking') {
                                        mobileBankingPhotoNames.push(paymentMethods[i].photo);
                                    }
                                }

                                let photoPath = 'photos/payment_method/150-100/';
                                let photoNameArray = cashPhotoNames;

                                fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                    responseObject.paymentMethod.cash = photoArray;
                                    
                                    photoNameArray = cardPhotoNames;

                                    fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                        responseObject.paymentMethod.card = photoArray;
                                        
                                        photoNameArray = mobileBankingPhotoNames;

                                        fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                            responseObject.status = 'success';
                                            responseObject.paymentMethod.mobileBanking = photoArray;
                                            return res.json(responseObject);
                                        });
                                    });
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

router.post('/food-item-photo',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        photos: []
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
                                
                                let photoPath = 'photos/food/photo-640/';
                                let photoNameArray = foodItem.photo;

                                fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                    responseObject.status = 'success';
                                    responseObject.photos = photoArray;
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

router.post('/all-food-item-photos',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        photos: []
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

                            if(!Array.isArray(foodItemID)) {
                                responseObject.message.fatalError = 'Invalid food item ID array';
                                return res.json(responseObject);
                            }
                            else if(!foodItemID.length) {
                                responseObject.message.fatalError = 'No food item ID was found!!';
                                return res.json(responseObject);
                            }

                            foodItemsModel.find({"$and":[{ _id: {$in : foodItemID}},{restaurantID: restaurant.id},{isDeleted: false}]},(err,foodItems) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json(responseObject);
                                }
                                else if(foodItems.length !== foodItemID.length) {
                                    responseObject.message.fatalError = 'All food items were not found!!';
                                    return res.json(responseObject);
                                }

                                let photoPath = 'photos/food/photo-320/';

                                for(i in foodItems) {
                                    let foodItemID = foodItems[i].id;
                                    let photoNameArray = [foodItems[i].photo[0]];
                                    fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                        let name = photoArray[0].name;
                                        let photo = photoArray[0].photo;
                                        responseObject.photos.push({
                                            id: foodItemID,
                                            name: name,
                                            photo: photo
                                        })
                                    });
                                }

                                function waitFunc() {
                                    if(responseObject.photos.length !== foodItems.length) {
                                        setTimeout(waitFunc, 100);
                                    }
                                    else {
                                        responseObject.status = 'success';
                                        return res.json(responseObject);
                                    }
                                }
                        
                                setTimeout(waitFunc, 100);
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

router.post('/order-payment-method',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        photo: ''
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

                            orderModel.findOne({_id: orderID,restaurantID: restaurantID,isDeleted: false},(err,order) => {
                                if(err || (order === null)) {
                                    responseObject.message.fatalError = 'Order was not found!!';
                                    return res.json(responseObject);
                                }

                                let photoPath = 'photos/payment_method/150-100/';
                                let photoNameArray = [];
                                if(order.paymentMethod) {
                                    photoNameArray = [order.paymentMethod.photo];
                                }

                                fetchPhoto(photoPath,photoNameArray,(photoArray) => {
                                    responseObject.status = 'success';
                                    responseObject.photo = photoArray[0];
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

module.exports = router;