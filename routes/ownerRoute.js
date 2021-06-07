const express = require('express');
const router = express.Router();

router.post('/get-owner-info',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
        },
        phoneNumber: '',
        name: '',
        email: '',
        totalRestaurantCount: '',
        currentRestaurantCount: '',
        deletedRestaurantCount: '',
        profilePicture: '',
        accountCreationDate: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
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

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    const fs = require("fs");
                    const sharp = require('sharp');
                    sharp.cache(false);

                    let photoPath = 'photos/owner_profile/photo-320/' + owner.photo;

                    if(fs.existsSync(photoPath)) {
                        sharp(photoPath)
                        .toBuffer((err,output) => {
                            if(err) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }

                            return res.json({
                                ...responseObject,
                                status: 'success',
                                phoneNumber: owner.countryCode + owner.phoneNumber,
                                name: owner.name,
                                email: owner.email,
                                totalRestaurantCount: owner.totalRestaurantCount,
                                currentRestaurantCount: owner.currentRestaurantCount,
                                deletedRestaurantCount: owner.deletedRestaurantCount,
                                profilePicture: output,
                                accountCreationDate: convert.convertTime(owner.createdOn,offset)
                            });
                        })
                    }
                    else {
                        return res.json({
                            ...responseObject,
                            status: 'success',
                            phoneNumber: owner.countryCode + owner.phoneNumber,
                            name: owner.name,
                            email: owner.email,
                            totalRestaurantCount: owner.totalRestaurantCount,
                            currentRestaurantCount: owner.currentRestaurantCount,
                            deletedRestaurantCount: owner.deletedRestaurantCount,
                            accountCreationDate: convert.convertTime(owner.createdOn,offset)
                        });
                    }
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

router.post('/update-owner-account',function(req,res) {
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
        const ownerModel = require('../models/ownerModel');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.name);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    const checkEmpty = require('../validation/checkEmpty');
                    const validateChangeInfoInput = require('../validation/userChangeInfoValidation');
                    let name = checkEmpty(req.body.name);
                    let email = checkEmpty(req.body.email);

                    let requestBodyObject = {
                        name: name,
                        email: email
                    }

                    let {message,isValid} = validateChangeInfoInput(requestBodyObject);
                    if(!isValid) {
                        responseObject.message = message;
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    owner.updateOne({
                        name: name,
                        email: email
                    }).then(ownerT => {
                        return res.json({
                            ...responseObject,
                            status: 'success'
                        });
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

router.post('/update-owner-profile-photo',function(req,res) {
    responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    const checkEmpty = require('../validation/checkEmpty');
                    const tempPhotoModel = require('../models/tempPhotoModel');
                    let tempPhotoID = checkEmpty(req.body.tempPhotoID);

                    if(!tempPhotoID) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    tempPhotoModel.findOne({_id: tempPhotoID, userID: id, userType: 'owner', type: 'profile'},(err,photo) => {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        if(photo === null) {
                            responseObject.message.fatalError = 'Invalid request';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else {
                            const fs = require("fs");

                            if(owner.photo) {
                                fs.unlink('photos/owner_profile/photo-50/' + owner.photo, (err) => {
                                    fs.unlink('photos/owner_profile/photo-320/' + owner.photo, (err) => {
                                        fs.unlink('photos/owner_profile/photo-640/' + owner.photo, (err) => {
                                            const storePhoto = require('../validation/storePhoto');

                                            let photoDestinationDirectory = 'photos/owner_profile/';

                                            let photoPath = 'photos/temp/' + photo.name;

                                            if(fs.existsSync(photoPath)) {
                                                storePhoto(photo,photoDestinationDirectory);

                                                owner.updateOne({
                                                    photo: photo.name
                                                }).then(ownerT => {
                                                    photo.remove();
                                                    return res.json({
                                                        ...responseObject,
                                                        status: 'success'
                                                    });
                                                })
                                            }
                                            else {
                                                responseObject.message.fatalError = 'Invalid request';
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

                                let photoDestinationDirectory = 'photos/owner_profile/';

                                let photoPath = 'photos/temp/' + photo.name;

                                if(fs.existsSync(photoPath)) {
                                    storePhoto(photo,photoDestinationDirectory);

                                    owner.updateOne({
                                        photo: photo.name
                                    }).then(ownerT => {
                                        photo.remove();
                                        return res.json({
                                            ...responseObject,
                                            status: 'success'
                                        });
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

router.post('/get-all-restaurants',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            restaurants: ''
        },
        restaurants: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
        const restaurantModel = require('../models/restaurantModel');
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

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    restaurantModel.find({ownerID: owner.id,isDeleted: false},(err,restaurants) => {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(restaurants === null) {
                            return res.json({
                                ...responseObject,
                                status: 'success'
                            });
                        }

                        const sharp = require('sharp');
                        sharp.cache(false);

                        let bannerArray = [];

                        for(i in restaurants) {
                            if(restaurants[i].banner) {
                                let restaurantIDNow = restaurants[i].id;
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
                                    restaurantID: restaurants[i].id,
                                    output: null
                                });
                            }
                        }

                        function waitFunc() {
                            if(bannerArray.length !== restaurants.length) {
                                setTimeout(waitFunc, 100);
                            }
                            else {
                                let allRestaurantsArray = [];
                                for(i=0; i<restaurants.length; i++) {
                                    let index = bannerArray.findIndex(j => j.restaurantID === restaurants[i].id);
                                    let restaurantObject = {
                                        id: restaurants[i].id,
                                        restaurantName: restaurants[i].restaurantName,
                                        description: restaurants[i].description,
                                        address: restaurants[i].address,
                                        createdOn: convert.convertTime(restaurants[i].createdOn,offset),
                                        updatedOn: convert.convertTime(restaurants[i].updatedOn,offset),
                                        banner: bannerArray[index].output
                                    }
                                    allRestaurantsArray.push(restaurantObject);
                                }
                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    restaurants: allRestaurantsArray
                                })
                            }
                        }

                        setTimeout(waitFunc, 100);
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

router.post('/get-restaurant-details',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        restaurantID: '',
        restaurantName: '',
        managerID: '',
        managerUsername: '',
        managerName: '',
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
        tableID: [],
        paymentMethod: [],
        paymentMessage: '',
        serviceMessage: '',
        activeStatus: '',
        logo: '',
        banner: '',
        photo: [],
        smallPhoto: [],
        createdOn: '',
        updatedOn: '',
        rating: '',
        numberOfRatings: '',
        comment: {},
        foodItems: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const checkEmpty = require('../validation/checkEmpty');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
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

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);

                    if(restaurantID) {
                        restaurantModel.findOne({_id: restaurantID,ownerID: owner.id,isDeleted: false},(err,restaurant) => {
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

                                            let allFoodItemArray = [];
                                            if(foodItems.length) {
                                                for(i in foodItems) {
                                                    let foodItemObject = {
                                                        id: foodItems[i].id,
                                                        category: foodItems[i].category,
                                                        name: foodItems[i].name,
                                                        price: foodItems[i].price,
                                                        createdOn: convert.convertTime(foodItems[i].createdOn,offset),
                                                        availability: foodItems[i].isUnavailable ? 'Unavailable' : 'Available'
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
                                                managerUsername: manager.username,
                                                managerName: manager.name,
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
                                                tableID: restaurant.tableID,
                                                paymentMethod: paymentMethod,
                                                paymentMessage: restaurant.paymentMessage,
                                                serviceMessage: restaurant.serviceMessage,
                                                activeStatus: restaurant.activeStatus,
                                                logo: logo[0],
                                                banner: banner[0],
                                                photo: photo,
                                                smallPhoto: smallPhoto,
                                                createdOn: convert.convertTime(restaurant.createdOn,offset),
                                                updatedOn: convert.convertTime(restaurant.updatedOn,offset),
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
        const checkEmpty = require('../validation/checkEmpty');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
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

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);

                    if(restaurantID) {
                        restaurantModel.findOne({_id: restaurantID,ownerID: owner.id,isDeleted: false},(err,restaurant) => {
                            if(err || (restaurant === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }
    
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

                                const sharp = require('sharp');
                                sharp.cache(false);

                                let photoArray = [];

                                for(i in foodItems) {
                                    if(foodItems[i].photo[0]) {
                                        let foodItemIDNow = foodItems[i].id;
                                        sharp('photos/food/photo-320/'+foodItems[i].photo[0])
                                        .toBuffer((err,output) => {
                                            photoArray.push({
                                                foodItemID: foodItemIDNow,
                                                output: output
                                            });
                                        });
                                    }
                                    else {
                                        photoArray.push({
                                            foodItemID: foodItems[i].id,
                                            output: null
                                        });
                                    }
                                }

                                function waitFunc() {
                                    if(photoArray.length !== foodItems.length) {
                                        setTimeout(waitFunc, 100);
                                    }
                                    else {
                                        let allFoodItemArray = [];
                                        for(i=0; i<foodItems.length; i++) {
                                            let index = photoArray.findIndex(j => j.foodItemID === foodItems[i].id);
                                            let foodItemObject = {
                                                id: foodItems[i].id,
                                                category: foodItems[i].category,
                                                name: foodItems[i].name,
                                                price: foodItems[i].price,
                                                description: foodItems[i].description,
                                                createdOn: convert.convertTime(foodItems[i].createdOn,offset),
                                                availability: foodItems[i].isUnavailable ? 'Unavailable' : 'Available',
                                                photo: photoArray[index].output
                                            }
                                            allFoodItemArray.push(foodItemObject);
                                        }

                                        return res.json({
                                            ...responseObject,
                                            status: 'success',
                                            foodItems: allFoodItemArray
                                        })
                                    }
                                }

                                setTimeout(waitFunc, 100);
                            })
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

router.post('/delete-restaurant',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const checkEmpty = require('../validation/checkEmpty');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
        const restaurantModel = require('../models/restaurantModel');
        const managerModel = require('../models/managerModel');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);

                    if(restaurantID) {
                        restaurantModel.findOne({_id: restaurantID,ownerID: owner.id,isDeleted: false},(err,restaurant) => {
                            if(err || (restaurant === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }
    
                            managerModel.findOne({restaurantID: restaurantID,isDeleted: false},(err,manager) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                let currentRestaurantCount = owner.currentRestaurantCount - 1;
                                let deletedRestaurantCount = owner.deletedRestaurantCount + 1;

                                owner.updateOne({
                                    currentRestaurantCount: currentRestaurantCount,
                                    deletedRestaurantCount: deletedRestaurantCount
                                }).then(ownerT => {
                                    if(manager === null) {
                                        owner.currentRestaurantCount -= 1;
                                        owner.deletedRestaurantCount += 1;
                                        restaurant.updateOne({
                                            isDeleted: true
                                        }).then(restaurantT => {
                                            return res.json({
                                                ...responseObject,
                                                status: 'success'
                                            });
                                        })
                                    }
                                    else {
                                        owner.currentRestaurantCount -= 1;
                                        owner.deletedRestaurantCount += 1;
                                        restaurant.updateOne({
                                            isDeleted: true
                                        }).then(restaurantT => {
                                            manager.updateOne({
                                                isDeleted: true
                                            }).then(managerT => {
                                                return res.json({
                                                    ...responseObject,
                                                    status: 'success'
                                                });
                                            })
                                        })
                                    }
                                });
                            })
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

router.post('/get-all-temp-restaurants',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            restaurants: ''
        },
        restaurants: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
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

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    restaurantTempModel.find({ownerID: owner.id,isDeleted: false},(err,restaurants) => {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(!restaurants.length) {
                            return res.json({
                                ...responseObject,
                                status: 'success'
                            });
                        }

                        let allRestaurantsArray = [];
                        for(i in restaurants) {
                            let restaurantObject = {
                                id: restaurants[i].id,
                                restaurantName: restaurants[i].restaurantName,
                                createdOn: convert.convertTime(restaurants[i].createdOn,offset)
                            }
                            allRestaurantsArray.push(restaurantObject);
                        }
                        return res.json({
                            ...responseObject,
                            status: 'success',
                            restaurants: allRestaurantsArray
                        })
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

router.post('/get-temp-restaurant-details',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        restaurantID: '',
        restaurantName: '',
        managerID: '',
        managerUsername: '',
        managerName: '',
        createdOn: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const checkEmpty = require('../validation/checkEmpty');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
        const restaurantTempModel = require('../models/restaurantTempModel');
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

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);

                    if(restaurantID) {
                        restaurantTempModel.findOne({_id: restaurantID,ownerID: owner.id,isDeleted: false},(err,restaurant) => {
                            if(err || (restaurant === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }
                            
                            managerModel.findOne({restaurantID: restaurantID,isDeleted: false},(err,manager) => {
                                if(err || (manager === null)) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    restaurantID: restaurantID,
                                    restaurantName: restaurant.restaurantName,
                                    managerID: manager.id,
                                    managerUsername: manager.username,
                                    managerName: manager.name,
                                    createdOn: convert.convertTime(restaurant.createdOn,offset)
                                })
                            })
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

router.post('/delete-temp-restaurant',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const checkEmpty = require('../validation/checkEmpty');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
        const restaurantTempModel = require('../models/restaurantTempModel');
        const managerModel = require('../models/managerModel');

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);

                    if(restaurantID) {
                        restaurantTempModel.findOne({_id: restaurantID,ownerID: owner.id,isDeleted: false},(err,restaurant) => {
                            if(err || (restaurant === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }
                            
                            managerModel.findOne({restaurantID: restaurantID,isDeleted: false},(err,manager) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Something went wrong!!';
                                    return res.json({
                                        ...responseObject,
                                        status: 'failure'
                                    });
                                }

                                let currentRestaurantCount = owner.currentRestaurantCount - 1;
                                let deletedRestaurantCount = owner.deletedRestaurantCount + 1;

                                owner.updateOne({
                                    currentRestaurantCount: currentRestaurantCount,
                                    deletedRestaurantCount: deletedRestaurantCount
                                }).then(ownerT => {
                                    if(manager === null) {
                                        owner.currentRestaurantCount -= 1;
                                        owner.deletedRestaurantCount += 1;
                                        restaurant.updateOne({
                                            isDeleted: true
                                        }).then(restaurantT => {
                                            return res.json({
                                                ...responseObject,
                                                status: 'success'
                                            });
                                        })
                                    }
                                    else {
                                        owner.currentRestaurantCount -= 1;
                                        owner.deletedRestaurantCount += 1;
                                        restaurant.updateOne({
                                            isDeleted: true
                                        }).then(restaurantT => {
                                            manager.updateOne({
                                                isDeleted: true
                                            }).then(managerT => {
                                                return res.json({
                                                    ...responseObject,
                                                    status: 'success'
                                                });
                                            })
                                        })
                                    }
                                });
                            })
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

router.post('/get-all-orders',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
        },
        orders: []
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
        const restaurantModel = require('../models/restaurantModel');
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

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    restaurantModel.find({ownerID: id,isDeleted: false},(err,restaurants) => {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(!restaurants.length) {
                            return res.json({
                                ...responseObject,
                                status: 'success'
                            });
                        }

                        let restaurantIDArray = [];
                        for(i in restaurants) {
                            restaurantIDArray.push(restaurants[i].id);
                        }

                        orderModel.find({"$and":[{ restaurantID: {$in : restaurantIDArray}},{isDeleted: false}]},(err,orders) => {
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
                                let currentState;
                                if((orders[i].currentState === 'Checking restaurant status') || (orders[i].currentState === 'Confirming order with restaurant')) {
                                    currentState = 'Waiting for confirmation';
                                }
                                else if(orders[i].currentState === 'Restaurant is preparing your order') {
                                    currentState = 'Order is being prepared';
                                }
                                else {
                                    currentState = orders[i].currentState;
                                }
                                let order = {
                                    orderID: orders[i].id,
                                    currentState: currentState,
                                    restaurantID: orders[i].restaurantID,
                                    restaurantName: orders[i].restaurantName,
                                    earning: orders[i].netPayable.toString(),
                                    createdOn: convert.convertTime(orders[i].createdOn,offset)
                                };
                                orderArray.push(order);
                            }

                            return res.json({
                                ...responseObject,
                                status: 'success',
                                orders: orderArray
                            });
                        })
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

router.post('/order-details',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
        },
        restaurantID: '',
        restaurantName: '',
        tableID: '',
        userName: '',
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
        stateRecord: [],
        reason: '',
        paymentMethod: {}
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
        const restaurantModel = require('../models/restaurantModel');
        const orderModel = require('../models/orderModel');
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

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    let orderID = checkEmpty(req.body.orderID);

                    if(!orderID) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    orderModel.findOne({_id: orderID,isDeleted: false},(err,order) => {
                        if(err || (order === null)) {
                            responseObject.message.fatalError = 'Order was not found!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        let restaurantID = order.restaurantID;

                        restaurantModel.findOne({_id: restaurantID,ownerID: id,isDeleted: false},(err,restaurant) => {
                            if(err || (restaurant === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }

                            let currentState = order.currentState;
                            if((order.currentState === 'Checking restaurant status') || (order.currentState === 'Confirming order with restaurant')) {
                                currentState = 'Waiting for confirmation';
                            }
                            else if(order.currentState === 'Restaurant is preparing your order') {
                                currentState = 'Order is being prepared';
                            }

                            for(i in order.stateRecord) {
                                order.stateRecord[i].time = convert.convertTime(order.stateRecord[i].time,offset);
                            }

                            responseObject = {
                                ...responseObject,
                                restaurantID: restaurantID,
                                restaurantName: order.restaurantName,
                                tableID: order.tableID,
                                userName: order.userName,
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
                                currentState: currentState,
                                stateRecord: order.stateRecord,
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
                        });
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

router.post('/order-summary',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
        },
        summary: {
            today: {
                ongoing: 0,
                completed: 0,
                rejected: 0,
                canceled: 0,
                failed: 0,
                earnings: 0
            },
            last7Days: {
                ongoing: 0,
                completed: 0,
                rejected: 0,
                canceled: 0,
                failed: 0,
                earnings: 0
            },
            last30days: {
                ongoing: 0,
                completed: 0,
                rejected: 0,
                canceled: 0,
                failed: 0,
                earnings: 0
            }
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
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

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    restaurantModel.find({ownerID: id,isDeleted: false},(err,restaurants) => {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(!restaurants.length) {
                            return res.json({
                                ...responseObject,
                                status: 'success'
                            });
                        }

                        let restaurantIDArray = [];
                        for(i in restaurants) {
                            restaurantIDArray.push(restaurants[i].id);
                        }

                        orderModel.find({"$and":[{ restaurantID: {$in : restaurantIDArray}},{isDeleted: false}]},(err,orders) => {
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

                            let ongoingOrdersCount = 0;
                            let todayCompletedOrders = 0;
                            let last7DaysCompletedOrders = 0;
                            let last30DaysCompletedOrders = 0;
                            let todayRejectedOrders = 0;
                            let last7DaysRejectedOrders = 0;
                            let last30DaysRejectedOrders = 0;
                            let todayCanceledOrders = 0;
                            let last7DaysCanceledOrders = 0;
                            let last30DaysCanceledOrders = 0;
                            let todayFailedOrders = 0;
                            let last7DaysFailedOrders = 0;
                            let last30DaysFailedOrders = 0;
                            let todayTotalEarnings = 0;
                            let last7DaysTotalEarnings = 0;
                            let last30daysTotalEarnings = 0;

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
                            
                            let userTimeMidnight = timestamp - (userHour * 60 * 60 * 1000 + userMinute * 60 * 1000 + seconds * 1000 + milliseconds);
                            let userTime7daysBefore = userTimeMidnight - 6 * 24 * 60 * 60 * 1000;
                            let userTime30daysBefore = userTimeMidnight - 29 * 24 * 60 * 60 * 1000;

                            for(i in orders) {
                                let orderCurrentState = orders[i].currentState;
                                let orderCreationTime = orders[i].createdOn.getTime();

                                if(orderCurrentState === 'Failed') {
                                    if(orderCreationTime >= userTimeMidnight) {
                                        todayFailedOrders = todayFailedOrders + 1;
                                    }

                                    if(orderCreationTime >= userTime7daysBefore) {
                                        last7DaysFailedOrders = last7DaysFailedOrders + 1;
                                    }

                                    if(orderCreationTime >= userTime30daysBefore) {
                                        last30DaysFailedOrders = last30DaysFailedOrders + 1;
                                    }
                                }
                                else if(orderCurrentState === 'Canceled') {
                                    if(orderCreationTime >= userTimeMidnight) {
                                        todayCanceledOrders = todayCanceledOrders + 1;
                                    }

                                    if(orderCreationTime >= userTime7daysBefore) {
                                        last7DaysCanceledOrders = last7DaysCanceledOrders + 1;
                                    }

                                    if(orderCreationTime >= userTime30daysBefore) {
                                        last30DaysCanceledOrders = last30DaysCanceledOrders + 1;
                                    }
                                }
                                else if(orderCurrentState === 'Rejected') {
                                    if(orderCreationTime >= userTimeMidnight) {
                                        todayRejectedOrders = todayRejectedOrders + 1;
                                    }

                                    if(orderCreationTime >= userTime7daysBefore) {
                                        last7DaysRejectedOrders = last7DaysRejectedOrders + 1;
                                    }

                                    if(orderCreationTime >= userTime30daysBefore) {
                                        last30DaysRejectedOrders = last30DaysRejectedOrders + 1;
                                    }
                                }
                                else if(orderCurrentState === 'Completed') {
                                    if(orderCreationTime >= userTimeMidnight) {
                                        todayCompletedOrders = todayCompletedOrders + 1;
                                        todayTotalEarnings = todayTotalEarnings + orders[i].netPayable;
                                    }

                                    if(orderCreationTime >= userTime7daysBefore) {
                                        last7DaysCompletedOrders = last7DaysCompletedOrders + 1;
                                        last7DaysTotalEarnings = last7DaysTotalEarnings + orders[i].netPayable;
                                    }

                                    if(orderCreationTime >= userTime30daysBefore) {
                                        last30DaysCompletedOrders = last30DaysCompletedOrders + 1;
                                        last30daysTotalEarnings = last30daysTotalEarnings + orders[i].netPayable;
                                    }
                                }
                                else {
                                    ongoingOrdersCount = ongoingOrdersCount + 1;
                                }
                            }

                            responseObject.summary = {
                                today: {
                                    ongoing: ongoingOrdersCount,
                                    completed: todayCompletedOrders,
                                    rejected: todayRejectedOrders,
                                    canceled: todayCanceledOrders,
                                    failed: todayFailedOrders,
                                    earnings: todayTotalEarnings
                                },
                                last7Days: {
                                    ongoing: ongoingOrdersCount,
                                    completed: last7DaysCompletedOrders,
                                    rejected: last7DaysRejectedOrders,
                                    canceled: last7DaysCanceledOrders,
                                    failed: last7DaysFailedOrders,
                                    earnings: last7DaysTotalEarnings
                                },
                                last30days: {
                                    ongoing: ongoingOrdersCount,
                                    completed: last30DaysCompletedOrders,
                                    rejected: last30DaysRejectedOrders,
                                    canceled: last30DaysCanceledOrders,
                                    failed: last30DaysFailedOrders,
                                    earnings: last30daysTotalEarnings
                                }
                            }

                            return res.json({
                                ...responseObject,
                                status: 'success'
                            });
                        })
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

router.post('/payment-summary',function(req,res) {
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
        const checkEmpty = require('../validation/checkEmpty');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
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

        let {message,isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            responseObject.message = message;
            return res.json({
                ...responseObject,
                status: 'failure'
            });
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    let restaurantID = checkEmpty(req.body.restaurantID);
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

                    if(restaurantID) {
                        restaurantModel.findOne({_id: restaurantID,ownerID: owner.id,isDeleted: false},(err,restaurant) => {
                            if(err || (restaurant === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }
    
                            orderModel.find({restaurantID: restaurantID,currentState: 'Completed',isDeleted: false},(err,orders) => {
                                if(err || (!orders.length)) {
                                    return res.json({
                                        ...responseObject,
                                        status: 'success'
                                    });
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
                                    cash: cash,
                                    card: card,
                                    mobileBanking: mobileBanking,
                                    details: details
                                });
                            })
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

router.post('/delete-order',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const ownerModel = require('../models/ownerModel');
        const restaurantModel = require('../models/restaurantModel');
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

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json({
                        ...responseObject,
                        status: 'failure'
                    });
                }

                if(owner !== null) {
                    let orderID = checkEmpty(req.body.orderID);

                    if(!orderID) {
                        responseObject.message.fatalError = 'Invalid request';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    if(!Array.isArray(orderID)) {
                        responseObject.message.fatalError = 'Invalid order id array';
                        return res.json({
                            ...responseObject,
                            status: 'failure'
                        });
                    }

                    orderModel.find({"$and":[{ _id: {$in : orderID}},{isDeleted: false}]},(err,orders) => {
                        if(err || !orders.length) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(orderID.length !== orders.length) {
                            responseObject.message.fatalError = 'All orders were not found!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        let restaurantID = orders[0].restaurantID;
                        let breakHappened = 0;
                        let currentStateBreakHappened = 0;

                        for(i in orders) {
                            if(orders[i].restaurantID !== restaurantID) {
                                breakHappened = 1;
                                break;
                            }
                            else if(!((orders[i].currentState === 'Failed') || (orders[i].currentState === 'Canceled') || (orders[i].currentState === 'Rejected') || (orders[i].currentState === 'Completed'))) {
                                currentStateBreakHappened = 1;
                                break;
                            }
                        }

                        if(breakHappened === 1) {
                            responseObject.message.fatalError = 'All orders were not found!!';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }
                        else if(currentStateBreakHappened === 1) {
                            responseObject.message.fatalError = 'Ongoing orders can not be deleted';
                            return res.json({
                                ...responseObject,
                                status: 'failure'
                            });
                        }

                        restaurantModel.findOne({_id: restaurantID,ownerID: id,isDeleted: false},(err,restaurant) => {
                            if(err || (restaurant === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json({
                                    ...responseObject,
                                    status: 'failure'
                                });
                            }

                            for(i in orders) {
                                orders[i].updateOne({
                                    isDeleted: true
                                }).then(orderT => {
                                    // No action required
                                });
                            }
                        });

                        return res.json({
                            ...responseObject,
                            status: 'success'
                        });
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

module.exports = router;