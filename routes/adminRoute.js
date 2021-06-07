const express = require('express');
const router = express.Router();

router.post('/add-payment-method',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            paymentMethod: '',
            type: '',
            photo: ''
        }
    }
    const paymentMethodModel = require('../models/paymentMethodModel');
    const checkEmpty = require('../validation/checkEmpty');

    let paymentMethod = checkEmpty(req.body.paymentMethod);
    let type = checkEmpty(req.body.type);
    let photo = checkEmpty(req.body.photo);

    if(paymentMethod && type && photo) {
        if(!((type === 'Cash') || (type === 'Card') || (type === 'Mobile Banking'))) {
            responseObject.message.type = 'Invalid type';
            return res.json(responseObject);
        }

        paymentMethodModel.find({},(err,databasePaymentMethods) => {
            if(err) {
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            if(databasePaymentMethods.length) {
                let databasePaymentMethodArray = [];
                for(i in databasePaymentMethods) {
                    databasePaymentMethodArray.push(databasePaymentMethods[i].paymentMethod);
                }
                let index = databasePaymentMethodArray.indexOf(paymentMethod);

                if(index >= 0) {
                    let paymentMethodType = databasePaymentMethods[i].type;
                    if(type === paymentMethodType) {
                        responseObject.message.paymentMethod = 'Payment method already exists';
                        return res.json(responseObject);
                    }
                }
            }

            const newPaymentMethod = new paymentMethodModel({
                paymentMethod: paymentMethod,
                type: type,
                photo: photo
            });

            newPaymentMethod
            .save()
            .then(paymentMethod => {
                responseObject.status = 'success';
                return res.json(responseObject);
            })
        })
    }
    else {
        responseObject.message.fatalError = 'No payment method or type was found!!';
        return res.json(responseObject);
    }
});

router.post('/everything',function(req,res) {
    let collection = req.body.collection;
    if((collection === 'access_tokens') || (collection === 'food_items') || (collection === 'managers') || (collection === 'orders') || (collection === 'owners') || (collection === 'ownerstemp') || (collection === 'restaurants') || (collection === 'restaurantstemp') || (collection === 'reviewableFoodCategories') || (collection === 'sequence') || (collection === 'temp_photo') || (collection === 'users') || (collection === 'userstemp') || (collection === 'visiting_ip_addresses') || (collection === 'paymentMethods')) {
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/";

        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
            if(err) {
                return res.json({
                    error: 'Nothing found!!'
                });
            }
            
            var dbo = db.db("ordernow");
            dbo.collection(collection).find({}).toArray(function(err, result) {
                if(err) {
                    return res.json({
                        error: 'Nothing found!!'
                    });
                }
                
                db.close();
                return res.json({
                    collection: result
                })
            });
        });
    }
    else {
        return res.json({
            error: 'Nothing found!!'
        });
    }
});

router.post('/qbird-everything',function(req,res) {
    let collection = req.body.collection;
    if((collection === 'active_users') || (collection === 'recover_password') || (collection === 'sequence') || (collection === 'sessions') || (collection === 'shops') || (collection === 'ads') || (collection === 'storedInDatabase') || (collection === 'temp_photo') || (collection === 'users') || (collection === 'userstemp') || (collection === 'sequence') || (collection === 'visiting_ip_addresses') || (collection === 'demoAds')) {
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/";

        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
            if(err) {
                return res.json({
                    error: 'Nothing found!!'
                });
            }
            
            var dbo = db.db("project");
            dbo.collection(collection).find({}).toArray(function(err, result) {
                if(err) {
                    return res.json({
                        error: 'Nothing found!!'
                    });
                }
                
                db.close();
                return res.json({
                    collection: result
                })
            });
        });
    }
    else {
        return res.json({
            error: 'Nothing found!!'
        });
    }
});

module.exports = router;