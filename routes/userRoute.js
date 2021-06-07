const express = require('express');
const router = express.Router();

router.post('/get-user-info',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        phoneNumber: '',
        name: '',
        email: '',
        profilePicture: '',
        accountCreationDate: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
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

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    const fs = require("fs");
                    const sharp = require('sharp');
                    sharp.cache(false);

                    let photoPath = 'photos/user_profile/photo-320/' + user.photo;

                    if(fs.existsSync(photoPath)) {
                        const sharp = require('sharp');
                        sharp.cache(false);

                        sharp(photoPath)
                        .toBuffer((err,output) => {
                            if(err) {
                                responseObject.message.fatalError = "Something went wrong!!";
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }

                            return res.json({
                                ...responseObject,
                                status: 'success',
                                phoneNumber: user.countryCode + user.phoneNumber,
                                name: user.name,
                                email: user.email ? user.email : '',
                                profilePicture: output,
                                accountCreationDate: convert.convertTime(user.createdOn,offset)
                            });
                        })
                    }
                    else {
                        return res.json({
                            ...responseObject,
                            status: 'success',
                            phoneNumber: user.countryCode + user.phoneNumber,
                            name: user.name,
                            email: user.email ? user.email : '',
                            profilePicture: '',
                            accountCreationDate: convert.convertTime(user.createdOn,offset)
                        });
                    }
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

router.post('/update-user-account',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            name: '',
            email: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    const checkEmpty = require('../validation/checkEmpty');
                    const validateChangeInfoInput = require('../validation/userChangeInfoValidation');
                    let name = checkEmpty(req.body.name);
                    let email = checkEmpty(req.body.email);

                    let requestBodyObject = {
                        name: name,
                        email: email
                    }

                    let {message,isValid} = validateChangeInfoInput(requestBodyObject,responseObject.message);
                    if(!isValid) {
                        responseObject.message = message;
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    user.updateOne({
                        name: name,
                        email: email
                    }).then(userT => {
                        return res.json({
                            ...responseObject,
                            status: 'success'
                        });
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

router.post('/update-profile-photo',function(req,res) {
    responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    const checkEmpty = require('../validation/checkEmpty');
                    const tempPhotoModel = require('../models/tempPhotoModel');
                    let tempPhotoID = checkEmpty(req.body.tempPhotoID);

                    if(!tempPhotoID) {
                        responseObject.message.fatalError = "Invalid request";
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    tempPhotoModel.findOne({_id: tempPhotoID, userID: id, userType: 'user', type: 'profile'},(err,photo) => {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(photo === null) {
                            responseObject.message.fatalError = "Invalid request";
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else {
                            const fs = require("fs");

                            if(user.photo) {
                                fs.unlink('photos/user_profile/photo-50/' + user.photo, (err) => {
                                    fs.unlink('photos/user_profile/photo-320/' + user.photo, (err) => {
                                        fs.unlink('photos/user_profile/photo-640/' + user.photo, (err) => {
                                            const storePhoto = require('../validation/storePhoto');

                                            let photoDestinationDirectory = 'photos/user_profile/';

                                            let photoPath = 'photos/temp/' + photo.name;

                                            if(fs.existsSync(photoPath)) {
                                                storePhoto(photo,photoDestinationDirectory);

                                                user.updateOne({
                                                    photo: photo.name
                                                }).then(userT => {
                                                    photo.remove();
                                                    return res.json({
                                                        ...responseObject,
                                                        status: 'success'
                                                    });
                                                })
                                            }
                                            else {
                                                responseObject.message.fatalError = "Invalid request";
                                                return res.json({
                                                    ...responseObject,
                                                    status: 'failure'
                                                });
                                            }
                                        })
                                    })
                                });
                            }
                            else {
                                const storePhoto = require('../validation/storePhoto');

                                let photoDestinationDirectory = 'photos/user_profile/';

                                let photoPath = 'photos/temp/' + photo.name;

                                if(fs.existsSync(photoPath)) {
                                    storePhoto(photo,photoDestinationDirectory);

                                    user.updateOne({
                                        photo: photo.name
                                    }).then(userT => {
                                        photo.remove();
                                        return res.json({
                                            ...responseObject,
                                            status: 'success'
                                        });
                                    })
                                }
                                else {
                                    responseObject.message.fatalError = "Invalid request";
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }
                            }
                        }
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
            message.fatalError = 'You do not have permission to see this page';
            responseObject = {
                status: 'failure',
                message: message
            }
            return res.json({
                ...responseObject
            });
        }
    })
});

router.post('/get-all-restaurants',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        restaurants: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validateGetAllRestaurants = require('../validation/getAllRestaurantsValidation');
        const validateRestaurantOpen = require('../validation/restaurantOpenValidation');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let requestBodyObject = {
                        lat: req.body.lat,
                        long: req.body.long
                    }
                    let {message,isValid} = validateGetAllRestaurants(requestBodyObject,responseObject.message);
                    if(!isValid) {
                        responseObject.message = message;
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }
                    var maxDistance = 50000000;
                    long = req.body.long ? req.body.long : 90.3492859;
                    lat = req.body.lat ? req.body.lat : 23.7806207;
                    var location = { type: "Point", coordinates:[parseFloat(long), parseFloat(lat)] };
                    let offset = Number('+6');
                    restaurantModel.aggregate()
                    .near({
                        near: location,
                        maxDistance: maxDistance,
                        distanceField: 'distance', // required
                        spherical: true
                    }).match({
                        isDeleted: false
                    }).group({
                        _id : '$_id',
                        distance: {$first: '$distance'},
                        userDistance: {$first: (req.body.lat && req.body.long) ? '$distance' : ''},
                        restaurantID: {$first: '$_id'},
                        restaurantName: {$first: '$restaurantName'},
                        description: {$first: '$description'},
                        address: {$first: '$address'},
                        activeStatus: {$first: '$activeStatus'},
                        openingHours: {$first: '$openingHours'},
                        isMidBreakApplicable: {$first: '$isMidBreakApplicable'},
                        midBreaks: {$first: '$midBreaks'},
                        banner: {$first: '$banner'}
                    }).sort(
                        {distance: 1}
                    ).exec((err,restaurants) => {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        const sharp = require('sharp');
                        sharp.cache(false);

                        let bannerArray = [];

                        for(i in restaurants) {
                            if(restaurants[i].banner) {
                                let restaurantIDNow = restaurants[i]._id;
                                sharp('photos/banner/photo-1500/'+restaurants[i].banner)
                                .toBuffer((err,output) => {
                                    bannerArray.push({
                                        restaurantID: restaurantIDNow,
                                        output: output
                                    });
                                });
                            }
                            else {
                                bannerArray.push({
                                    restaurantID: restaurants[i]._id,
                                    output: null
                                });
                            }
                        }

                        function waitFunc() {
                            if(bannerArray.length !== restaurants.length) {
                                setTimeout(waitFunc, 100);
                            }
                            else {
                                let outputRestaurants = [];
                                for(i=0; i<restaurants.length; i++) {
                                    let index = bannerArray.findIndex(j => j.restaurantID === restaurants[i]._id);
                                    let outputRestaurant = {
                                        restaurantID: restaurants[i]._id,
                                        restaurantName: restaurants[i].restaurantName,
                                        description: restaurants[i].description,
                                        address: restaurants[i].address,
                                        userDistance: restaurants[i].userDistance,
                                        restaurantStatus: validateRestaurantOpen(offset,restaurants[i].openingHours,restaurants[i].isMidBreakApplicable,restaurants[i].midBreaks) ? (restaurants[i].activeStatus ? 'Open' : 'Inactive') : 'Closed',
                                        banner: bannerArray[index].output
                                    }
                                    outputRestaurants.push(outputRestaurant);
                                }
                                
                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    restaurants: outputRestaurants
                                });
                            }
                        }

                        setTimeout(waitFunc, 100);
                    });
                }
                else {
                    responseObject.message.fatalError = 'Invalid access token';
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

router.post('/get-restaurant-details',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        restaurantID: '',
        restaurantName: '',
        managerID: '',
        managerName: '',
        managerPhoneNumber: '',
        description: '',
        isPayFirst: '',
        governmentCharge: '',
        governmentChargeDescription: '',
        serviceCharge: '',
        serviceChargeDescription: '',
        phoneNumber: '',
        email: '',
        coordinate: {},
        location: '',
        address: '',
        instruction: '',
        openingHours: '',
        isMidBreakApplicable: '',
        midBreaks: '',
        paymentMethod: [],
        restaurantStatus: '',
        logo: '',
        banner: '',
        photo: [],
        smallPhoto: [],
        createdOn: '',
        rating: '',
        numberOfRatings: '',
        comment: {},
        foodItems: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validateRestaurantOpen = require('../validation/restaurantOpenValidation');
        const checkEmpty = require('../validation/checkEmpty');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const managerModel = require('../models/managerModel');
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

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);

                    if(restaurantID) {
                        restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                            if(err || (restaurant === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }
    
                            const sharp = require('sharp');
                            sharp.cache(false);

                            let paymentMethod = {
                                cash: [],
                                card: [],
                                mobileBanking: []
                            };
                            for(i in restaurant.paymentMethod) {
                                if(restaurant.paymentMethod[i].type === 'Cash') {
                                    sharp('photos/payment_method/45-30/'+restaurant.paymentMethod[i].photo)
                                    .toBuffer((err,output) => {
                                        paymentMethod.cash.push({
                                            id: restaurant.paymentMethod[i].id,
                                            type: 'Cash',
                                            photo: output
                                        });
                                    })
                                }
                                else if(restaurant.paymentMethod[i].type === 'Card') {
                                    sharp('photos/payment_method/45-30/'+restaurant.paymentMethod[i].photo)
                                    .toBuffer((err,output) => {
                                        paymentMethod.card.push({
                                            id: restaurant.paymentMethod[i].id,
                                            type: 'Card',
                                            photo: output
                                        });
                                    })
                                }
                                else if(restaurant.paymentMethod[i].type === 'Mobile Banking') {
                                    sharp('photos/payment_method/45-30/'+restaurant.paymentMethod[i].photo)
                                    .toBuffer((err,output) => {
                                        paymentMethod.mobileBanking.push({
                                            id: restaurant.paymentMethod[i].id,
                                            type: 'Mobile Banking',
                                            photo: output
                                        });
                                    })
                                }
                            }
    
                            let logo = [];
                            if(restaurant.logo) {
                                sharp('photos/logo/photo-320/'+restaurant.logo)
                                .toBuffer((err,output) => {
                                    logo.push(output);
                                })
                            }

                            let banner = [];
                            if(restaurant.banner) {
                                sharp('photos/banner/photo-1500/'+restaurant.banner)
                                .toBuffer((err,output) => {
                                    banner.push(output);
                                })
                            }                                

                            let photo = [];
                            let smallPhoto = [];
                            if(restaurant.photo) {
                                if(restaurant.photo.length > 0) {
                                    for(i in restaurant.photo) {
                                        sharp('photos/restaurant/photo-320/'+restaurant.photo[i])
                                        .toBuffer((err,output) => {
                                            photo.push(output);
                                        })

                                        sharp('photos/restaurant/photo-50/'+restaurant.photo[i])
                                        .toBuffer((err,output) => {
                                            smallPhoto.push(output);
                                        })
                                    }
                                }
                            }

                            function waitFunc() {
                                if(((paymentMethod.cash.length+paymentMethod.card.length+paymentMethod.mobileBanking.length) !== restaurant.paymentMethod.length) || (restaurant.logo && (logo.length === 0)) || (restaurant.banner && (banner.length === 0)) || (restaurant.photo && (restaurant.photo.length > 0) && (restaurant.photo.length !== photo.length) && (restaurant.photo.length !== smallPhoto.length))) {
                                    setTimeout(waitFunc, 100);
                                }
                                else {
                                    managerModel.findOne({restaurantID: restaurantID,isDeleted: false},(err,manager) => {
                                        if(err || (manager === null)) {
                                            responseObject.message.fatalError = 'Something went wrong!!';
                                            return res.json({
                                                ...responseObject,
                                                status: 'failure'
                                            });
                                        }

                                        foodItemsModel.find({restaurantID: restaurantID,isDeleted: false},(err,foodItems) => {
                                            if(err) {
                                                responseObject.message.fatalError = 'Something went wrong!!';
                                                return res.json({
                                                    ...responseObject,
                                                    status: 'failure'
                                                });
                                            }

                                            let restaurantStatus = validateRestaurantOpen(offset,restaurant.openingHours,restaurant.isMidBreakApplicable,restaurant.midBreaks) ? (restaurant.activeStatus ? 'Open' : 'Inactive') : 'Closed';

                                            let allFoodItemArray = [];
                                            if(foodItems.length) {
                                                for(i in foodItems) {
                                                    let foodItemObject = {
                                                        id: foodItems[i].id,
                                                        category: foodItems[i].category,
                                                        name: foodItems[i].name,
                                                        price: foodItems[i].price,
                                                        governmentChargeApplicable: foodItems[i].governmentChargeApplicable,
                                                        createdOn: convert.convertTime(foodItems[i].createdOn,offset),
                                                        availability: ((restaurantStatus === 'Open') && validateRestaurantOpen(offset,foodItems[i].availableHours,restaurant.isMidBreakApplicable,restaurant.midBreaks) && !foodItems[i].isUnavailable) ? 'Available' : 'Unavailable'
                                                    }
                                                    allFoodItemArray.push(foodItemObject);
                                                }
                                            }

                                            return res.json({
                                                ...responseObject,
                                                status: 'success',
                                                restaurantID: restaurantID,
                                                restaurantName: restaurant.restaurantName,
                                                managerID: manager.id,
                                                managerName: manager.name,
                                                managerPhoneNumber: manager.phoneNumber,
                                                description: restaurant.description,
                                                isPayFirst: restaurant.isPayFirst,
                                                governmentCharge: restaurant.governmentCharge,
                                                governmentChargeDescription: restaurant.governmentChargeDescription,
                                                serviceCharge: restaurant.serviceCharge,
                                                serviceChargeDescription: restaurant.serviceChargeDescription,
                                                phoneNumber: restaurant.phoneNumber,
                                                email: restaurant.email,
                                                coordinate: {
                                                    lat: restaurant.lat,
                                                    long: restaurant.long
                                                },
                                                location: restaurant.location,
                                                address: restaurant.address,
                                                instruction: restaurant.instruction,
                                                openingHours: restaurant.openingHours,
                                                isMidBreakApplicable: restaurant.isMidBreakApplicable,
                                                midBreaks: restaurant.midBreaks,
                                                paymentMethod: paymentMethod,
                                                restaurantStatus: restaurantStatus,
                                                logo: logo[0],
                                                banner: banner[0],
                                                photo: photo,
                                                smallPhoto: smallPhoto,
                                                createdOn: convert.convertTime(restaurant.createdOn,offset),
                                                rating: restaurant.rating,
                                                numberOfRatings: restaurant.numberOfRatings,
                                                comment: restaurant.comment,
                                                foodItems: allFoodItemArray
                                            })
                                        });
                                    })
                                }
                            }
    
                            setTimeout(waitFunc, 100);
                        })
                    }
                    else {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }
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

router.post('/get-all-food-items',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        restaurantID: '',
        restaurantName: '',
        foodItems: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validateFoodItemAvailable = require('../validation/restaurantOpenValidation');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let offset = Number('+6');
                    let restaurantID = checkEmpty(req.body.restaurantID);

                    if(!restaurantID) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(restaurant !== null) {
                            foodItemsModel.find({restaurantID: restaurant.id,isDeleted: false},(err,foodItems) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                if(!foodItems.length) {
                                    return res.json({
                                        ...responseObject,
                                        status: 'success'
                                    });
                                }

                                let allFoodItemArray = [];
                                for(i in foodItems) {
                                    let foodItemObject = {
                                        id: foodItems[i].id,
                                        category: foodItems[i].category,
                                        name: foodItems[i].name,
                                        price: foodItems[i].price,
                                        governmentChargeApplicable: foodItems[i].governmentChargeApplicable,
                                        description: foodItems[i].description,
                                        availability: (validateFoodItemAvailable(offset,restaurant.openingHours,restaurant.isMidBreakApplicable,restaurant.midBreaks) && restaurant.activeStatus && !foodItems[i].isUnavailable && validateFoodItemAvailable(offset,foodItems[i].availableHours,restaurant.isMidBreakApplicable,restaurant.midBreaks)) ? 'Available' : 'Unavailable'
                                    }
                                    allFoodItemArray.push(foodItemObject);
                                }

                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    restaurantID: restaurant.id,
                                    restaurantName: restaurant.restaurantName,
                                    foodItems: allFoodItemArray
                                })
                            })
                        }
                        else {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = 'Invalid access token';
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

router.post('/get-food-item-details',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        restaurantID: '',
        restaurantName: '',
        category: '',
        name: '',
        price: '',
        options: [],
        description: '',
        instatantService: '',
        parcelAvailable: '',
        availableHours: '',
        governmentChargeApplicable: '',
        photo: [],
        smallPhoto: [],
        createdOn: '',
        availability: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validateFoodItemAvailable = require('../validation/restaurantOpenValidation');
        const checkEmpty = require('../validation/checkEmpty');
        const userModel = require('../models/userModel');
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

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let foodItemID = checkEmpty(req.body.foodItemID);

                    if(!foodItemID) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    foodItemsModel.findOne({_id: foodItemID},(err,foodItem) => {
                        if(err || (foodItem === null)) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(foodItem.isDeleted) {
                            responseObject.message.fatalError = 'Food item has already been deleted';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else {
                            let restaurantID = foodItem.restaurantID;

                            restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                                if(err || (restaurant === null)) {
                                    responseObject.message.fatalError = "Something went wrong!!";
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                const sharp = require('sharp');
                                sharp.cache(false);
                                let photo = [];
                                let smallPhoto = [];
                                if(foodItem.photo) {
                                    if(foodItem.photo.length > 0) {
                                        for(i in foodItem.photo) {
                                            sharp('photos/food/photo-320/'+foodItem.photo[i])
                                            .toBuffer((err,output) => {
                                                photo.push(output);
                                            })

                                            sharp('photos/food/photo-50/'+foodItem.photo[i])
                                            .toBuffer((err,output) => {
                                                smallPhoto.push(output);
                                            })
                                        }
                                    }
                                }

                                function waitFunc() {
                                    if(foodItem.photo && (foodItem.photo.length !== photo.length) && (foodItem.photo.length !== smallPhoto.length)) {
                                        setTimeout(waitFunc, 100);
                                    }
                                    else {
                                        return res.json({
                                            ...responseObject,
                                            status: 'success',
                                            restaurantID: restaurant.id,
                                            restaurantName: restaurant.restaurantName,
                                            category: foodItem.category,
                                            name: foodItem.name,
                                            price: foodItem.price,
                                            options: foodItem.options,
                                            description: foodItem.description,
                                            instatantService: foodItem.instatantService,
                                            parcelAvailable: foodItem.parcelAvailable,
                                            availableHours: foodItem.availableHours,
                                            governmentChargeApplicable: foodItem.governmentChargeApplicable,
                                            photo: photo,
                                            smallPhoto: smallPhoto,
                                            createdOn: convert.convertTime(foodItem.createdOn,offset),
                                            availability: (validateFoodItemAvailable(offset,restaurant.openingHours,restaurant.isMidBreakApplicable,restaurant.midBreaks) && restaurant.activeStatus && !foodItem.isUnavailable && validateFoodItemAvailable(offset,foodItem.availableHours,restaurant.isMidBreakApplicable,restaurant.midBreaks)) ? 'Available' : 'Unavailable'
                                        })
                                    }
                                }

                                setTimeout(waitFunc, 100);
                            })
                        }
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
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }
        
        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let order = checkEmpty(req.body.order);
                    if(order) {
                        let restaurantID = checkEmpty(req.body.order.restaurantID);
                        let tableID = checkEmpty(req.body.order.tableID);
                        let orderDetails = checkEmpty(req.body.order.orderDetails);
                        let parcel = checkEmpty(req.body.order.parcel);

                        let requestBodyObject = [];

                        if(!(restaurantID && orderDetails && tableID)) {
                            responseObject.message.fatalError = 'Invalid order';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(!tableID.match("^[a-zA-Z0-9]*$")) {
                            responseObject.message.fatalError = 'Invalid order';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(!Array.isArray(orderDetails)) {
                            responseObject.message.order = 'Invalid order array';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(orderDetails.length < 1) {
                            responseObject.message.order = 'Invalid order array';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(orderDetails.length > 100) {
                            responseObject.message.order = 'Please order maximum 100 food items at a time';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else {
                            let breakHappened = 0;
                            for(i in orderDetails) {
                                if(!(orderDetails[i].foodItemID && orderDetails[i].quantity)) {
                                    breakHappened = 1;
                                    break;
                                }
                                else if(!Number.isInteger(orderDetails[i].quantity)) {
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
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }

                            let {message,isValid} = validateCreateOrder(requestBodyObject,responseObject.message);
                            if(!isValid) {
                                responseObject.message = message;
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }

                            order = {
                                restaurantID: restaurantID,
                                orderDetails: requestBodyObject,
                                parcel: parcel
                            }

                            let databaseOrder = order;
                            databaseOrder.parcel = parcel ? true : false;

                            restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                                if(err || (restaurant === null)) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                let index = restaurant.tableID.findIndex(j => j === tableID);
                                if(index < 0) {
                                    responseObject.message.order = 'Invalid table id';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                databaseOrder.userID = id;
                                databaseOrder.userName = user.name;
                                databaseOrder.restaurantName = restaurant.restaurantName;
                                databaseOrder.tableID = tableID;

                                let foodItemIDArray = [];

                                for(i in order.orderDetails) {
                                    foodItemIDArray.push(order.orderDetails[i].foodItemID);
                                }

                                let uniqueFoodItemIDArray = [...new Set(foodItemIDArray)];

                                foodItemsModel.find({"$and":[{ _id: {$in : uniqueFoodItemIDArray}},{restaurantID: restaurantID},{isUnavailable: false},{isDeleted: false}]},(err,foodItems) => {
                                    if(err || (foodItems === null) || (foodItems.length !== uniqueFoodItemIDArray.length)) {
                                        responseObject.message.order = 'All food items are not available';
                                        return res.json({
                                            ...responseObject,
                                            status: 'failure'
                                        });
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
                                            return res.json({
                                                ...responseObject,
                                                status: 'failure'
                                            });
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
                                        responseObject.message.order = 'All food items options are not valid';
                                        return res.json({
                                            ...responseObject,
                                            status: 'failure'
                                        });
                                    }

                                    databaseOrder.serviceCharge = Math.round(databaseOrder.grossTotal * databaseOrder.serviceChargePercentage) / 100;
                                    databaseOrder.netPayable = databaseOrder.grossTotal + databaseOrder.totalGovernmentCharge + databaseOrder.serviceCharge;

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

                                    const newOrder = new orderModel({
                                        ...databaseOrder,
                                        stateRecord: [
                                            {
                                                state: 'Order placed',
                                                time: new Date()
                                            }
                                        ]
                                    });
            
                                    newOrder
                                    .save()
                                    .then(order => {
                                        if(!restaurant.activeStatus) {
                                            order.updateOne({
                                                currentState: 'Failed',
                                                reason: 'Restaurant was offline',
                                                paymentStatus: 'Unpaid'
                                            }).then(orderT => {
                                                responseObject.message.fatalError = 'Restaurant is offline';
                                                return res.json({
                                                    ...responseObject,
                                                    status: 'failure'
                                                });
                                            });
                                        }
                                        else {
                                            let lastPingTime = restaurant.lastPingTime.getTime();
                                            let currentTime = Date.now();
                                            let difference = (currentTime - lastPingTime)/1000;
            
                                            if(difference > 15) {
                                                order.updateOne({
                                                    currentState: 'Failed',
                                                    reason: 'Restaurant was offline',
                                                    paymentStatus: 'Unpaid'
                                                }).then(orderT => {
                                                    responseObject.message.fatalError = 'Restaurant is offline';
                                                    return res.json({
                                                        ...responseObject,
                                                        status: 'failure'
                                                    });
                                                });
                                            }
                                            else {
                                                let waitCount = 0;

                                                function waitFunc() {
                                                    orderModel.findOne({_id: order.id},(err,orderT) => {
                                                        if(err || (orderT === null) || (orderT.currentState !== 'Checking restaurant status')) {
                                                            return res.json({
                                                                ...responseObject,
                                                                status: 'success'
                                                            });
                                                        }
                                                        else {
                                                            if(waitCount < 4) {
                                                                waitCount = waitCount + 1;
                                                                setTimeout(waitFunc, 3000);
                                                            }
                                                            else {
                                                                orderT.updateOne({
                                                                    currentState: 'Failed',
                                                                    reason: 'Restaurant was offline',
                                                                    paymentStatus: 'Unpaid'
                                                                }).then(order => {
                                                                    responseObject.message.fatalError = 'Restaurant is offline';
                                                                    return res.json({
                                                                        ...responseObject,
                                                                        status: 'failure'
                                                                    });
                                                                });
                                                            }
                                                        }
                                                    })
                                                }
            
                                                setTimeout(waitFunc, 3000);
                                            }
                                        }
                                    })
                                })
                            })
                        }
                    }
                    else {
                        responseObject.message.order = 'Invalid order';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }
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

router.post('/cancel-order',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let orderID = checkEmpty(req.body.orderID);

                    if(!orderID) {
                        responseObject.message.fatalError = 'Order cancellation failed';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    orderModel.findOne({_id: orderID, userID: id},(err,order) => {
                        if(err || (order === null)) {
                            responseObject.message.fatalError = 'Order cancellation failed';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(order !== null) {
                            if((order.currentState === 'Checking restaurant status') || (order.currentState === 'Confirming order with restaurant')) {
                                let stateRecord = order.stateRecord;
                                stateRecord.push({
                                    state: 'Order canceled',
                                    time: new Date()
                                });
                                order.updateOne({
                                    currentState: 'Canceled',
                                    stateRecord: stateRecord,
                                    reason: 'Customer\'s mind changed',
                                    paymentStatus: 'Unpaid'
                                }).then(orderT => {
                                    return res.json({
                                        ...responseObject,
                                        status: 'success'
                                    });
                                });
                            }
                            else {
                                responseObject.message.fatalError = 'Order cancellation failed';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }
                        }
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

router.post('/get-all-orders',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        orders: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const orderModel = require('../models/orderModel');
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

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    orderModel.find({userID: id},(err,orders) => {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(!orders.length) {
                            return res.json({
                                ...responseObject,
                                status: 'success'
                            });
                        }

                        let orderArray = [];

                        for(i in orders) {
                            let order = {
                                orderID: orders[i].id,
                                currentState: orders[i].currentState,
                                restaurantID: orders[i].restaurantID,
                                restaurantName: orders[i].restaurantName,
                                price: orders[i].netPayable.toString(),
                                createdOn: convert.convertTime(orders[i].createdOn,offset)
                            };
                            orderArray.push(order);
                        }

                        return res.json({
                            ...responseObject,
                            status: 'success',
                            orders: orderArray
                        });
                    });
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

router.post('/order-details',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
        },
        restaurantID: '',
        restaurantName: '',
        tableID: '',
        orderDetails: [],
        grossTotal: '',
        totalGovernmentCharge: '',
        governmentChargeDescription: '',
        serviceCharge: '',
        serviceChargeDescription: '',
        specialDiscount: '',
        rounding: '',
        netPayable: '',
        parcel: '',
        createdOn: '',
        currentState: '',
        paymentMessage: '',
        serviceMessage: '',
        stateRecord: [],
        reason: '',
        paymentMethod: {}
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const orderModel = require('../models/orderModel');
        const restaurantModel = require('../models/restaurantModel');
        const checkEmpty = require('../validation/checkEmpty');
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

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let orderID = checkEmpty(req.body.orderID);

                    if(!orderID) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    orderModel.findOne({_id: orderID, userID: id},(err,order) => {
                        if(err || (order === null)) {
                            responseObject.message.fatalError = 'Order was not found!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(order !== null) {
                            restaurantModel.findOne({_id: order.restaurantID},(err,restaurant) => {
                                if(err || (restaurant === null)) {
                                    responseObject.message.fatalError = 'Order was not found!!';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                for(i in order.stateRecord) {
                                    order.stateRecord[i].time = convert.convertTime(order.stateRecord[i].time,offset);
                                }

                                responseObject = {
                                    ...responseObject,
                                    restaurantID: order.restaurantID,
                                    restaurantName: order.restaurantName,
                                    tableID: order.tableID,
                                    orderDetails: order.orderDetails,
                                    grossTotal: order.grossTotal,
                                    totalGovernmentCharge: order.totalGovernmentCharge,
                                    governmentChargeDescription: order.governmentChargeDescription,
                                    serviceCharge: order.serviceCharge,
                                    serviceChargeDescription: order.serviceChargeDescription,
                                    specialDiscount: order.specialDiscount,
                                    rounding: order.decimalRounding,
                                    netPayable: order.netPayable.toString(),
                                    parcel: order.parcel,
                                    createdOn: convert.convertTime(order.createdOn,offset),
                                    currentState: order.currentState,
                                    stateRecord: order.stateRecord,
                                    paymentMessage: (order.currentState === 'Waiting for payment') ? restaurant.paymentMessage : '',
                                    serviceMessage: (order.currentState === 'Order is ready to be served') ? restaurant.serviceMessage : '',
                                    reason: order.reason,
                                    paymentMethod: order.paymentMethod ? order.paymentMethod : {}
                                }

                                /*

                                let photoCount = 0;
                                let bufferCount = 0;
                                const fs = require("fs");
                                const sharp = require('sharp');
                                sharp.cache(false);
                                for(i in order.orderDetails) {
                                    if(order.orderDetails[i].photo.length) {
                                        let photo = [];
                                        let smallPhoto = [];
                                        for(j in order.orderDetails[i].photo) {
                                            let photoPath = 'photos/food/photo-320/' + order.orderDetails[i].photo[j];
                                            let smallPhotoPath = 'photos/food/photo-50/' + order.orderDetails[i].photo[j];
                                            let name = order.orderDetails[i].photo[j];
                                            photoCount = photoCount + 2;
    
                                            if(fs.existsSync(photoPath)) {
                                                sharp(photoPath)
                                                .toBuffer((err,output) => {
                                                    photo.push([output,name]);
                                                });
                                                bufferCount = bufferCount + 1;
                                            }
                                            else {
                                                bufferCount = bufferCount + 1;
                                            }
    
                                            if(fs.existsSync(smallPhotoPath)) {
                                                sharp(smallPhotoPath)
                                                .toBuffer((err,output) => {
                                                    smallPhoto.push([output,name]);
                                                });
                                                bufferCount = bufferCount + 1;
                                            }
                                            else {
                                                bufferCount = bufferCount + 1;
                                            }
                                        }
                                        responseObject.orderDetails[i].photo = photo;
                                        responseObject.orderDetails[i].smallPhoto = smallPhoto;
                                    }
                                }
    
                                function waitFunc() {
                                    if(photoCount !== bufferCount) {
                                        setTimeout(waitFunc, 100);
                                    }
                                    else {
                                        return res.json({
                                            ...responseObject,
                                            status: 'success'
                                        });
                                    }
                                }
    
                                setTimeout(waitFunc, 100);

                                

                                if(order.paymentMethod) {
                                    sharp('photos/payment_method/150-100/'+order.paymentMethod.photo)
                                    .toBuffer((err,output) => {
                                        responseObject.paymentMethod.photo = output;
                                    })
                                }
    
                                function waitFunc() {
                                    if(order.paymentMethod && !responseObject.paymentMethod.photo.type) {
                                        setTimeout(waitFunc, 100);
                                    }
                                    else {
                                        return res.json({
                                            ...responseObject,
                                            status: 'success'
                                        });
                                    }
                                }

                                setTimeout(waitFunc, 100);

                                */

                                return res.json({
                                    ...responseObject,
                                    status: 'success'
                                });
                            })
                        }
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

router.post('/rate-restaurant',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            rating: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);
                    let rating = checkEmpty(req.body.rating);

                    if(!(restaurantID && rating)) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    if(!Number.isInteger(rating)) {
                        responseObject.message.rating = 'Invalid rating';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }
                    else if((rating < 1) || rating > 5) {
                        responseObject.message.rating = 'Invalid rating';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err || (restaurant === null)) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(restaurant !== null) {
                            let ratings = restaurant.ratings;
                            let index = ratings.findIndex(j => j.userID === id);

                            if(index < 0) {
                                let avgRating = 0;
                                let numberOfRatings = restaurant.numberOfRatings + 1;
                                ratings.push({
                                    userID: id,
                                    rating: rating,
                                    orderID: '',
                                    time: new Date()
                                });

                                if(numberOfRatings > 10) {
                                    let sum = 0;
                                    for(i in ratings) {
                                        sum = sum + ratings[i].rating;
                                    }

                                    avgRating = sum / numberOfRatings;
                                }

                                restaurant.updateOne({
                                    avgRating: avgRating,
                                    ratings: ratings,
                                    numberOfRatings: numberOfRatings
                                }).then((restaurantT) => {
                                    return res.json({
                                        ...responseObject,
                                        status: 'success'
                                    });
                                });
                            }
                            else {
                                let avgRating = 0;
                                let numberOfRatings = restaurant.numberOfRatings;
                                ratings[index].rating = rating;

                                if(numberOfRatings > 10) {
                                    let sum = 0;
                                    for(i in ratings) {
                                        sum = sum + ratings[i].rating;
                                    }

                                    avgRating = sum / numberOfRatings;
                                }

                                restaurant.updateOne({
                                    avgRating: avgRating,
                                    ratings: ratings,
                                    numberOfRatings: numberOfRatings
                                }).then((restaurantT) => {
                                    return res.json({
                                        ...responseObject,
                                        status: 'success'
                                    });
                                });
                            }
                        }
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

router.post('/comment-restaurant',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            comment: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);
                    let comment = checkEmpty(req.body.comment);

                    if(!(restaurantID && comment)) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    if(comment.length > 2000) {
                        responseObject.message.comment = 'Comment length should not be more than 2000 characters';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err || (restaurant === null)) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(restaurant !== null) {
                            let comments = restaurant.comments;
                            let numberOfComments = comments.length;
                            comments.push({
                                commentID: numberOfComments,
                                userID: id,
                                userName: user.name,
                                rating: 0,
                                comment: comment,
                                orderID: '',
                                time: new Date(),
                                replies: []
                            });

                            restaurant.updateOne({
                                comments: comments
                            }).then((restaurantT) => {
                                return res.json({
                                    ...responseObject,
                                    status: 'success'
                                });
                            });
                        }
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

router.post('/comment-reply-restaurant',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            reply: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);
                    let commentID = checkEmpty(req.body.commentID);
                    let reply = checkEmpty(req.body.reply);

                    if(!(restaurantID && reply)) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    if(!Number.isInteger(commentID)) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }
                    else if(commentID < 0) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    if(reply.length > 2000) {
                        responseObject.message.reply = 'Comment length should not be more than 2000 characters';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                        if(err || (restaurant === null)) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(restaurant !== null) {
                            let comments = restaurant.comments;

                            if(commentID < comments.length) {
                                comments[commentID].replies.push({
                                    userID: id,
                                    userName: user.name,
                                    reply: reply,
                                    time: new Date()
                                });

                                restaurant.updateOne({
                                    comments: comments
                                }).then((restaurantT) => {
                                    return res.json({
                                        ...responseObject,
                                        status: 'success'
                                    });
                                });
                            }
                            else {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }
                        }
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

router.post('/rate-food-item',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            rating: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let foodItemID = checkEmpty(req.body.foodItemID);
                    let rating = checkEmpty(req.body.rating);

                    if(!(foodItemID && rating)) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    if(!Number.isInteger(rating)) {
                        responseObject.message.rating = 'Invalid rating';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }
                    else if((rating < 1) || rating > 5) {
                        responseObject.message.rating = 'Invalid rating';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    foodItemsModel.findOne({_id: foodItemID,isDeleted: false},(err,foodItem) => {
                        if(err || (foodItem === null)) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(foodItem !== null) {
                            let restaurantID = foodItem.restaurantID;

                            restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                                if(err || (restaurant === null)) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                if(restaurant !== null) {
                                    let ratings = foodItem.ratings;
                                    let index = ratings.findIndex(j => j.userID === id);
        
                                    if(index < 0) {
                                        let avgRating = 0;
                                        let numberOfRatings = restaurant.numberOfRatings + 1;
                                        ratings.push({
                                            userID: id,
                                            rating: rating,
                                            orderID: '',
                                            time: new Date()
                                        });
        
                                        if(numberOfRatings > 10) {
                                            let sum = 0;
                                            for(i in ratings) {
                                                sum = sum + ratings[i].rating;
                                            }
        
                                            avgRating = sum / numberOfRatings;
                                        }
        
                                        foodItem.updateOne({
                                            avgRating: avgRating,
                                            ratings: ratings,
                                            numberOfRatings: numberOfRatings
                                        }).then((foodItemT) => {
                                            return res.json({
                                                ...responseObject,
                                                status: 'success'
                                            });
                                        });
                                    }
                                    else {
                                        let avgRating = 0;
                                        let numberOfRatings = restaurant.numberOfRatings;
                                        ratings[index].rating = rating;
        
                                        if(numberOfRatings > 10) {
                                            let sum = 0;
                                            for(i in ratings) {
                                                sum = sum + ratings[i].rating;
                                            }
        
                                            avgRating = sum / numberOfRatings;
                                        }
        
                                        foodItem.updateOne({
                                            avgRating: avgRating,
                                            ratings: ratings,
                                            numberOfRatings: numberOfRatings
                                        }).then((foodItemT) => {
                                            return res.json({
                                                ...responseObject,
                                                status: 'success'
                                            });
                                        });
                                    }
                                }
                            })
                        }
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

router.post('/comment-food-item',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            comment: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let foodItemID = checkEmpty(req.body.foodItemID);
                    let comment = checkEmpty(req.body.comment);

                    if(!(foodItemID && comment)) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    if(comment.length > 2000) {
                        responseObject.message.comment = 'Comment length should not be more than 2000 characters';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    foodItemsModel.findOne({_id: foodItemID,isDeleted: false},(err,foodItem) => {
                        if(err || (foodItem === null)) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(foodItem !== null) {
                            let restaurantID = foodItem.restaurantID;

                            restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                                if(err || (restaurant === null)) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                if(restaurant !== null) {
                                    let comments = foodItem.comments;
                                    let numberOfComments = comments.length;
                                    comments.push({
                                        commentID: numberOfComments,
                                        userID: id,
                                        userName: user.name,
                                        rating: 0,
                                        comment: comment,
                                        orderID: '',
                                        time: new Date(),
                                        replies: []
                                    });

                                    foodItem.updateOne({
                                        comments: comments
                                    }).then((restaurantT) => {
                                        return res.json({
                                            ...responseObject,
                                            status: 'success'
                                        });
                                    });
                                }
                            })
                        }
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

router.post('/comment-reply-food-item',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            reply: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let foodItemID = checkEmpty(req.body.foodItemID);
                    let commentID = checkEmpty(req.body.commentID);
                    let reply = checkEmpty(req.body.reply);

                    if(!(foodItemID && reply)) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    if(!Number.isInteger(commentID)) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }
                    else if(commentID < 0) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    if(reply.length > 2000) {
                        responseObject.message.reply = 'Comment length should not be more than 2000 characters';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    foodItemsModel.findOne({_id: foodItemID,isDeleted: false},(err,foodItem) => {
                        if(err || (foodItem === null)) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(foodItem !== null) {
                            let restaurantID = foodItem.restaurantID;

                            restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                                if(err || (restaurant === null)) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                if(restaurant !== null) {
                                    let comments = foodItem.comments;

                                    if(commentID < comments.length) {
                                        comments[commentID].replies.push({
                                            userID: id,
                                            userName: user.name,
                                            reply: reply,
                                            time: new Date()
                                        });
        
                                        foodItem.updateOne({
                                            comments: comments
                                        }).then((foodItemT) => {
                                            return res.json({
                                                ...responseObject,
                                                status: 'success'
                                            });
                                        });
                                    }
                                    else {
                                        responseObject.message.fatalError = 'Something went wrong!!';
                                        return res.json({
                                            ...responseObject,
                                            status: 'failure'
                                        });
                                    }
                                }
                            })
                        }
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

router.post('/rate-order',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            rating: '',
            comment: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const userModel = require('../models/userModel');
        const restaurantModel = require('../models/restaurantModel');
        const foodItemsModel = require('../models/foodItemsModel');
        const orderModel = require('../models/orderModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'user') {
            userModel.findOne({_id: id},(err,user) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(user !== null) {
                    let orderID = checkEmpty(req.body.orderID);
                    let rating = checkEmpty(req.body.rating);
                    let comment = checkEmpty(req.body.comment);
                    let foodItemIDRatingComment = checkEmpty(req.body.foodItemIDRatingComment);

                    if(!orderID) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    orderModel.findOne({_id: orderID,userID: id,rating: false,comment: false},(err,order) => {
                        if(err || (order === null)) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(!((order.currentState === 'Failed') || (order.currentState === 'Canceled') || (order.currentState === 'Rejected') || (order.currentState === 'Completed'))) {
                            responseObject.message.fatalError = 'An ongoing order can not be rated';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        let restaurantID = order.restaurantID;

                        restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                            if(err || (restaurant === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }

                            let restaurantAvgRating = restaurant.avgRating;
                            let restaurantRatings = restaurant.ratings;
                            let restaurantNumberOfRatings = restaurant.numberOfRatings;
                            let restaurantComments = restaurant.comments;

                            if(rating) {
                                if(!Number.isInteger(rating)) {
                                    responseObject.message.rating = 'Invalid rating';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }
                                else if((rating < 1) || rating > 5) {
                                    responseObject.message.rating = 'Invalid rating';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                restaurantNumberOfRatings = restaurantNumberOfRatings + 1;
                                restaurantRatings.push({
                                    userID: id,
                                    rating: rating,
                                    orderID: orderID,
                                    time: new Date()
                                });

                                if(restaurantNumberOfRatings > 10) {
                                    let sum = 0;
                                    for(i in restaurantRatings) {
                                        sum = sum + restaurantRatings[i].rating;
                                    }

                                    restaurantAvgRating = sum / restaurantNumberOfRatings;
                                }

                                if(comment) {
                                    if(comment.length > 2000) {
                                        comment = comment.substring(0, 2000);
                                    }

                                    let numberOfRestaurantComments = restaurantComments.length;

                                    restaurantComments.push({
                                        commentID: numberOfRestaurantComments,
                                        userID: id,
                                        userName: user.name,
                                        rating: rating,
                                        comment: comment,
                                        orderID: orderID,
                                        time: new Date(),
                                        replies: []
                                    });
                                }
                            }

                            let foodItemIDArray = [];

                            if(foodItemIDRatingComment) {
                                if((foodItemIDRatingComment.length > 0) && (foodItemIDRatingComment.length <= 100)) {
                                    if(!Array.isArray(foodItemIDRatingComment)) {
                                        responseObject.message.fatalError = 'Invalid request';
                                        return res.json({
                                            ...responseObject,
                                            status: 'failure'
                                        });
                                    }
                                    
                                    let breakHappened = 0;
                                    let ratingError = 0;
        
                                    for(i=0; i<foodItemIDRatingComment.length; i++) {
                                        if(!foodItemIDRatingComment[i].foodItemID) {
                                            breakHappened = 1;
                                            break;
                                        }
                                        else if(!(foodItemIDRatingComment[i].rating || foodItemIDRatingComment[i].comment)) {
                                            breakHappened = 1;
                                            break;
                                        }
                                        else if(!Number.isInteger(foodItemIDRatingComment[i].rating)) {
                                            ratingError = 1;
                                            break;
                                        }
                                        else if((foodItemIDRatingComment[i].rating < 1) || (foodItemIDRatingComment[i].rating > 5)) {
                                            ratingError = 1;
                                            break;
                                        }
                                        
                                        if(foodItemIDRatingComment[i].comment.length > 2000) {
                                            foodItemIDRatingComment[i].comment = foodItemIDRatingComment[i].comment.substring(0, 2000);
                                        }
        
                                        foodItemIDArray.push(foodItemIDRatingComment[i].foodItemID);
                                    }
        
                                    if(ratingError === 1) {
                                        responseObject.message.rating = 'Invalid rating';
                                        return res.json({
                                            ...responseObject,
                                            status: 'failure'
                                        });
                                    }
                                    else if(breakHappened === 1) {
                                        responseObject.message.fatalError = 'Invalid request';
                                        return res.json({
                                            ...responseObject,
                                            status: 'failure'
                                        });
                                    }
        
                                    foodItemIDArray = [...new Set(foodItemIDArray)];
                                    let noMatch = 0;
        
                                    for(i in foodItemIDArray) {
                                        for(j=0; j<order.orderDetails.length; j++) {
                                            if(foodItemIDArray[i] === order.orderDetails[j].foodItemID) {
                                                break;
                                            }
                                            else if(j === (order.orderDetails.length - 1)) {
                                                noMatch = 1;
                                            }
                                        }
        
                                        if(noMatch === 1) {
                                            break;
                                        }
                                    }
        
                                    if(noMatch === 1) {
                                        responseObject.message.fatalError = 'Invalid request';
                                        return res.json({
                                            ...responseObject,
                                            status: 'failure'
                                        });
                                    }
                                }
                            }

                            order.updateOne({
                                rating: true,
                                comment: true
                            }).then((orderT) => {
                                // No action required
                            });

                            restaurant.updateOne({
                                avgRating: restaurantAvgRating,
                                ratings: restaurantRatings,
                                numberOfRatings: restaurantNumberOfRatings,
                                comments: restaurantComments
                            }).then((restaurantT) => {
                                // No action required
                            });

                            foodItemsModel.find({"$and":[{ _id: {$in : foodItemIDArray}},{isDeleted: false}]},(err,foodItems) => {
                                if(foodItems.length > 0) {
                                    for(i in foodItems) {
                                        let index = foodItemIDRatingComment.findIndex(j => j.foodItemID === foodItems[i].id);
                                        let foodItemAvgRating = foodItems[i].avgRating;
                                        let foodItemRatings = foodItems[i].ratings;
                                        let foodItemNumberOfRatings = foodItems[i].numberOfRatings;
                                        let foodItemComments = foodItems[i].comments;
    
                                        if(foodItemIDRatingComment[index].rating) {
                                            foodItemNumberOfRatings = foodItemNumberOfRatings + 1;
                                            foodItemRatings.push({
                                                userID: id,
                                                rating: foodItemIDRatingComment[index].rating,
                                                orderID: orderID,
                                                time: new Date()
                                            });
    
                                            if(foodItemNumberOfRatings > 10) {
                                                let sum = 0;
                                                for(j in foodItemRatings) {
                                                    sum = sum + foodItemRatings[j].rating;
                                                }
    
                                                foodItemAvgRating = sum / foodItemNumberOfRatings;
                                            }

                                            if(foodItemIDRatingComment[index].comment) {
                                                let numberOfFoodItemComments = foodItemComments.length;
        
                                                foodItemComments.push({
                                                    commentID: numberOfFoodItemComments,
                                                    userID: id,
                                                    userName: user.name,
                                                    rating: foodItemIDRatingComment[index].rating,
                                                    comment: foodItemIDRatingComment[index].comment,
                                                    orderID: orderID,
                                                    time: new Date(),
                                                    replies: []
                                                });
                                            }
                                        }
    
                                        foodItems[i].updateOne({
                                            avgRating: foodItemAvgRating,
                                            ratings: foodItemRatings,
                                            numberOfRatings: foodItemNumberOfRatings,
                                            comments: foodItemComments
                                        }).then((foodItemT) => {
                                            // No action required
                                        });
                                    }
                                }

                                return res.json({
                                    ...responseObject,
                                    status: 'success'
                                });
                            })
                        })
                    });
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

module.exports = router;