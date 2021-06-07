const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NodeRSA = require('node-rsa');
const request = require('request');

const publicKey = new NodeRSA('-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCNu21ZFx/EkcQ3EzAMQTXRtFjwJFJDeqN4Drxx8fcwTt2sBs/LBHr4CN6y2C9nve686cnW1FhRRaDGONDqnMS2nKg465t4Jz3TNBnLLe0g1PUKqPr2mWE1XVvTNQVZUM++QVbvwYv94ohVfCrUbIyfCx+DJ9C6o8dsH8eLwVnsSQIDAQAB\n-----END PUBLIC KEY-----');
const privateKey = new NodeRSA('-----BEGIN PRIVATE KEY-----\nMIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAI27bVkXH8SRxDcTMAxBNdG0WPAkUkN6o3gOvHHx9zBO3awGz8sEevgI3rLYL2e97rzpydbUWFFFoMY40OqcxLacqDjrm3gnPdM0Gcst7SDU9Qqo+vaZYTVdW9M1BVlQz75BVu/Bi/3iiFV8KtRsjJ8LH4Mn0Lqjx2wfx4vBWexJAgMBAAECgYBMhksnFCYx4yZXOkPyCe9+F2sB1gqYponGk+ZJe4Skj6B+dnsROY0PiPJ9C96km9dgJra1CJfa4cZJ4Hlkg1puEtOSh319b8YkLWjj0YKjotD3Lqfb42haqU1pWY4bJw/g9lmnj2qG+9PTIZOIXmn2xCA2yL0L7Clz4Je+ESLBgQJBANwiBYd9Y9BVqSnVpWPjkTXylx/0pcU9tWZqgPJEmZnou9Gj8Hi8K0XTkqG7mC18KirFEtKbVxSGTwgwuqhNSXkCQQCk0znfeBRnFjTLS3thTfFACuE3UqcDhjPSZHT5HWQxuckDSF9u4VPqWa8Kr2hVw645qJpq3te0OmvXcRcb5NVRAkEAl8TdCwzoRDrK5ozl+nhrJUab6uxBXjutVW8Yd+/T9sj+tQrSQGt7aij0b41m3fU9HT/COnHfF8eBtaPjDSY8AQJAfr46Q1/X+Ik34ZfScTl5KPD0zBDPgsNAuCktVZ5HPIGLU+3kDKRSXePG2SWWylRldcrzqvhe0CUYZht9VKK7cQJAfxlaOMMBuftllItwZ0T8buaUFQyQhCpW2okFZlf8sAqw4wRCkcz1j8BmABJnQJ6c9lTwt0MQgbO/3ESJxtK7CA==\n-----END PRIVATE KEY-----');
const signCheckKey = new NodeRSA('-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKDdTU3hecEOVfBWnKTbzy/Wo8uNAaAvx9ipdOjGXW2E9YPXj1oCELnQcrddX+ii++rMnBwrxSG8mAAn+ZRwLZIuXxHereugnPcwXv1Bqpi3TsMCdNti9+RZ9n+3J6SyvHq1ckS6hGONnzc5eXTcxKeVGdmHGHYgh67u5Gjq3k+wIDAQAB\n-----END PUBLIC KEY-----');
const signatureKey = new NodeRSA('-----BEGIN PRIVATE KEY-----\nMIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAIoN1NTeF5wQ5V8FacpNvPL9ajy40BoC/H2Kl06MZdbYT1g9ePWgIQudByt11f6KL76sycHCvFIbyYACf5lHAtki5fEd6t66Cc9zBe/UGqmLdOwwJ022L35Fn2f7cnpLK8erVyRLqEY42fNzl5dNzEp5UZ2YcYdiCHru7kaOreT7AgMBAAECgYBxiVKCBm0QUuzwqrkIQcqlZDhc2/l5iv8wGCy70sdmW9tVTKkQCLNko63j1jM59VeyztPW4FqUhHnBJ0zdOANkahZVf7neB2d2KoYOd598d7y16BJn/1BmMYgQY8eQsW+KtlBVZyhFGYM935TDFlWXs8FXt1938aUPirzj3sYiIQJBAODj11TQ6uKH4mhYjhgv1xQIyzhoo7ygofzB4biGEgVY0M8xBkwuODaz5c7lOyfdxGAqgmjvwfhiYJke8MHuOekCQQCdJtFmT3RVokEowFte9zMPchFPGZoEYrDEodIpngGeAZFZi7vfDon8hfs9Mo0wQR8DeseWVSL3nOu49A6aa7VDAkAo4uOERRNfKgtMo0T6OsBkoRCpacTTB3VL6cfq710ZYcNc1/HoKcMIlv5h9iUiI1yPi0r4Xxap3ODpFcn5yCD5AkA1Mfaf0zVl5053JOXI95RpHguN4vSnl2COrtgdDkct3Qn+bbZiguFigVfSF1KDiwecfeshkCAOASgpqzNmQh9RAkBISk/0cjRMS/PtsE9heh3WBH8h6PS150nn5uB+0RIJCYdq8d3ZAgMUGayoG3sMTUjD2xE/JVZ1BzXaqkIrSNlN\n-----END PRIVATE KEY-----');
const saltRounds = 15;
const otpUrl = 'http://66.45.237.70/api.php';

router.post('/pre-init',function(req,res) {
    var responseObject = {
        status: 'failure',
        rsaPublicKey: '',
        rsaSignatureKey: '',
        countryCodes: [],
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        return res.json({
            status: 'success',
            rsaPublicKey: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCNu21ZFx/EkcQ3EzAMQTXRtFjwJFJDeqN4Drxx8fcwTt2sBs/LBHr4CN6y2C9nve686cnW1FhRRaDGONDqnMS2nKg465t4Jz3TNBnLLe0g1PUKqPr2mWE1XVvTNQVZUM++QVbvwYv94ohVfCrUbIyfCx+DJ9C6o8dsH8eLwVnsSQIDAQAB\n-----END PUBLIC KEY-----',
            rsaSignatureKey: '-----BEGIN PRIVATE KEY-----\nMIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAIoN1NTeF5wQ5V8FacpNvPL9ajy40BoC/H2Kl06MZdbYT1g9ePWgIQudByt11f6KL76sycHCvFIbyYACf5lHAtki5fEd6t66Cc9zBe/UGqmLdOwwJ022L35Fn2f7cnpLK8erVyRLqEY42fNzl5dNzEp5UZ2YcYdiCHru7kaOreT7AgMBAAECgYBxiVKCBm0QUuzwqrkIQcqlZDhc2/l5iv8wGCy70sdmW9tVTKkQCLNko63j1jM59VeyztPW4FqUhHnBJ0zdOANkahZVf7neB2d2KoYOd598d7y16BJn/1BmMYgQY8eQsW+KtlBVZyhFGYM935TDFlWXs8FXt1938aUPirzj3sYiIQJBAODj11TQ6uKH4mhYjhgv1xQIyzhoo7ygofzB4biGEgVY0M8xBkwuODaz5c7lOyfdxGAqgmjvwfhiYJke8MHuOekCQQCdJtFmT3RVokEowFte9zMPchFPGZoEYrDEodIpngGeAZFZi7vfDon8hfs9Mo0wQR8DeseWVSL3nOu49A6aa7VDAkAo4uOERRNfKgtMo0T6OsBkoRCpacTTB3VL6cfq710ZYcNc1/HoKcMIlv5h9iUiI1yPi0r4Xxap3ODpFcn5yCD5AkA1Mfaf0zVl5053JOXI95RpHguN4vSnl2COrtgdDkct3Qn+bbZiguFigVfSF1KDiwecfeshkCAOASgpqzNmQh9RAkBISk/0cjRMS/PtsE9heh3WBH8h6PS150nn5uB+0RIJCYdq8d3ZAgMUGayoG3sMTUjD2xE/JVZ1BzXaqkIrSNlN\n-----END PRIVATE KEY-----',
            countryCodes: ['Bangladesh (+880)'],
            message: {
                fatalError: ''
            }
        })
    })
});

router.post('/send-otp',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            countryCode: '',
            phoneNumber: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const userModel = require('../models/userModel');
        const userTempModel = require('../models/userTempModel');

        const validateTempRegisterInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateTempRegisterInput(req.body,responseObject.message);
        
        if(!isValid) {
            return res.json(responseObject);
        }

        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        userTempModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,userTemp) => {
            if(err) {
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }
            
            if(userTemp !== null) {
                let timeIntervalLastOtp = Math.abs(new Date() - userTemp.lastOTPSendTime);
                let otpTrials = userTemp.otpTrials;

                if(otpTrials >= 5) {
                    if(timeIntervalLastOtp >= 600000) {
                        let otp = Math.floor(100000 + Math.random() * 900000);
                        let data = {
                            username: '01714565610',
                            password: 'projectTest1234',
                            number: userTemp.phoneNumber,
                            message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                        };

                        request.post({url: otpUrl,formData: data}, function(err,httpResponse,body) {
                            if(err) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json(responseObject);
                            }
                
                            let responseCode = body.split('|');
                
                            if(responseCode[0] === '1101') {
                                userTemp.updateOne({
                                    otp: otp,
                                    otpVerified: false,
                                    otpTrials: 0,
                                    lastOTPSendTime: new Date()
                                }).then(userT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            }
                            else {
                                responseObject.message.otp = 'Verification code was not sent';
                                return res.json(responseObject);
                            }
                        });
                    }
                    else {
                        let interval = 600000 - timeIntervalLastOtp;
                        if(interval >= 60000) {
                            minuteInterval = Math.floor(interval / 60000);
                            responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + minuteInterval + ' more minute(s) and try again';
                        }
                        else {
                            secondInterval = Math.floor(interval / 1000) + 1;
                            responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + secondInterval + ' more second(s) and try again';
                        }
                        return res.json(responseObject);
                    }
                }
                else {
                    if(timeIntervalLastOtp >= 30000) {
                        let otp = userTemp.otp;
                        let data = {
                            username: '01714565610',
                            password: 'projectTest1234',
                            number: userTemp.phoneNumber,
                            message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                        };

                        request.post({url: otpUrl,formData: data}, function(err,httpResponse,body) {
                            if(err) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json(responseObject);
                            }
                
                            let responseCode = body.split('|');
                
                            if(responseCode[0] === '1101') {
                                userTemp.updateOne({
                                    otpVerified: false,
                                    lastOTPSendTime: new Date()
                                }).then(userT => {
                                    responseObject.status = 'success';
                                    res.json(responseObject);
                                })
                            }
                            else {
                                responseObject.message.otp = 'Verification code was not sent';
                                return res.json(responseObject);
                            }
                        });
                    }
                    else {
                        let interval = Math.floor((30000 - timeIntervalLastOtp) / 1000);
                        responseObject.message.fatalError = 'A verification code was sent to your phone number a few seconds ago. Please wait for that one to arrive or, try again after ' + interval + ' second(s)';
                        return res.json(responseObject);
                    }
                }
            }
            else {
                userModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
                    if(err) {
                        responseObject.message.fatalError = 'Something went wrong!!';
                        return res.json(responseObject);
                    }
                    if(user !== null) {
                        responseObject.message.phoneNumber = 'This phone number is attached to an existing account';
                        return res.json(responseObject);
                    }
                    
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: req.body.phoneNumber,
                        message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url: otpUrl,formData: data}, function(err,httpResponse,body) {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            const newTempUser = new userTempModel({
                                countryCodeFull: req.body.countryCode,
                                countryCode: countryCode,
                                phoneNumber: req.body.phoneNumber,
                                otp: otp
                            });
                            newTempUser
                            .save()
                            .then(userT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = 'Verification code was not sent';
                            return res.json(responseObject);
                        }
                    });
                });
            }
        });
    })
});

router.post('/send-otp-again',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const userTempModel = require('../models/userTempModel');
        const validateRegisterOTPSendAgainInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateRegisterOTPSendAgainInput(req.body,responseObject.message);
        
        if(!isValid) {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
        
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        userTempModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,userTemp) => {
            if(err || (userTemp === null)) {     
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            let timeIntervalLastOtp = Math.abs(new Date() - userTemp.lastOTPSendTime);
            let otpTrials = userTemp.otpTrials;

            if(otpTrials >= 5) {
                if(timeIntervalLastOtp >= 600000) {
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: userTemp.phoneNumber,
                        message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url: otpUrl,formData: data}, function(err,httpResponse,body) {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            userTemp.updateOne({
                                otp: otp,
                                otpVerified: false,
                                otpTrials: 0,
                                lastOTPSendTime: new Date()
                            }).then(userT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = 'Verification code was not sent';
                            return res.json(responseObject);
                        }
                    });
                }
                else {
                    let interval = 600000 - timeIntervalLastOtp;
                    if(interval >= 60000) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + minuteInterval + ' more minute(s) and try again';
                    }
                    else {
                        secondInterval = Math.floor(interval / 1000) + 1;
                        responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + secondInterval + ' more second(s) and try again';
                    }
                    return res.json(responseObject);
                }
            }
            else {
                if(timeIntervalLastOtp >= 30000) {
                    let otp = userTemp.otp;
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: userTemp.phoneNumber,
                        message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url: otpUrl,formData: data}, function(err,httpResponse,body) {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            userTemp.updateOne({
                                otpVerified: false,
                                lastOTPSendTime: new Date()
                            }).then(userT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = 'Verification code was not sent';
                            return res.json(responseObject);
                        }
                    });
                }
                else {
                    let interval = Math.floor((30000 - timeIntervalLastOtp) / 1000);
                    responseObject.message.fatalError = 'A verification code was sent to your number a few seconds ago. Please wait for that one to arrive or, try again after ' + interval + ' second(s)';
                    return res.json(responseObject);
                } 
            }
        });
    })
});

router.post('/verify-otp',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const userTempModel = require('../models/userTempModel');
        const validateOtpInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateOtpInput(req.body,responseObject.message);
        
        if(!isValid) {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
        
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        userTempModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,userTemp) => {
            if(err || (userTemp === null)) {          
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            let timeIntervalLastOtp = Math.abs(new Date() - userTemp.lastOTPSendTime);
            let otpTrials = userTemp.otpTrials;

            if(otpTrials >= 5) {
                if(timeIntervalLastOtp >= 600000) {
                    responseObject.message.fatalError = "You have entered wrong verification code too many times. Please try again by clicking on 'Didn\'t receive code? Resend verification code' link below";
                    return res.json(responseObject);
                }
                else {
                    let interval = 600000 - timeIntervalLastOtp;
                    if(interval < 0) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please try again by clicking on 'Didn\'t receive code? Resend verification code' link below";
                    }
                    else if(interval >= 60000) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please wait for " + minuteInterval + " more minute(s) and try again by clicking on 'Resend verification code' button below";
                    }
                    else {
                        secondInterval = Math.floor(interval / 1000) + 1;
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please wait for " + secondInterval + " more second(s) and try again by clicking on 'Resend verification code' button below";
                    }
                    return res.json(responseObject);
                }
            }

            if(userTemp.otp !== req.body.otp) {
                userTemp.otpTrials += 1;
                userTemp.save();
                responseObject.message.otp = "Verification code did not match";
                return res.json(responseObject);
            }

            userTemp.updateOne({
                otpVerified: true
            }).then(userT => {
                responseObject.status = 'success';
                return res.json(responseObject);
            })
        });
    })
});

router.post('/create-user-account',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            password: '',
            reEnterPassword: '',
            name: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const userModel = require('../models/userModel');
        const userTempModel = require('../models/userTempModel');
        const validateRegisterInput = require('../validation/userRegisterValidation');
        const checkEmpty = require('../validation/checkEmpty');

        let password = checkEmpty(req.body.password);
        let passwordSign = checkEmpty(req.body.passwordSign);
        let reEnterPassword = checkEmpty(req.body.reEnterPassword);
        let reEnterPasswordSign = checkEmpty(req.body.reEnterPasswordSign);

        /*

        if(password && passwordSign) {
            let signCheck = signCheckKey.verify(password, passwordSign, 'utf8', 'base64');
            if(signCheck) {
                password = privateKey.decrypt(password, 'utf8', 'base64');
            }
            else {
                password = '';
            }
        }
        else {
            password = '';
        }
        
        if(reEnterPassword && reEnterPasswordSign) {
            let signCheck = signCheckKey.verify(reEnterPassword, reEnterPasswordSign, 'utf8', 'base64');
            if(signCheck) {
                reEnterPassword = privateKey.decrypt(reEnterPassword, 'utf8', 'base64');
            }
            else {
                reEnterPassword = '';
            }
        }
        else {
            reEnterPassword = '';
        }

        */

        let requestBodyObject = {
            countryCode: req.body.countryCode,
            phoneNumber: req.body.phoneNumber,
            name: req.body.name,
            password: password,
            reEnterPassword: reEnterPassword
        }

        let {isValid} = validateRegisterInput(requestBodyObject,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        userTempModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,userTemp) => {
            if(err) {          
                responseObject.message.fatalError = "Something went wrong!!";
                return res.json(responseObject);
            }

            if(userTemp !== null) {
                if(!userTemp.otpVerified) {
                    responseObject.message.fatalError = "Your phone number was not verified";
                    return res.json(responseObject);
                }
                else {
                    bcrypt.hash(password,saltRounds).then(function(hashedPassword) {
                        const newUser = new userModel({
                            countryCodeFull: req.body.countryCode,
                            countryCode: countryCode,
                            phoneNumber: req.body.phoneNumber,
                            password: hashedPassword,
                            name: req.body.name
                        });

                        newUser
                        .save()
                        .then(user => {
                            userTemp.remove();
                            let jwtObject = {
                                userID: user.id
                            }

                            jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Token was not created';
                                    return res.json(responseObject);
                                }
                                else {
                                    const accessTokenModel = require('../models/accessTokenModel');

                                    const newAccessToken = new accessTokenModel({
                                        accessToken: token,
                                        userID: user.id
                                    });

                                    newAccessToken
                                    .save()
                                    .then(accessToken => {
                                        let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                        let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                        let refreshToken = encryptedID + ' ' + signedID;
                                        return res.json({
                                            ...responseObject,
                                            status: 'success',
                                            accessToken: token,
                                            refreshToken: refreshToken
                                        });
                                    })
                                }
                            });
                        })
                    });
                }
            }
            else {
                responseObject.message.fatalError = "Something went wrong!!";
                return res.json(responseObject);
            }
        });
    })
});

router.post('/user-login',function(req,res) {
    responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            countryCode: '',
            phoneNumber: '',
            password: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const userModel = require('../models/userModel');
        const validateLoginInput = require('../validation/userLoginValidation');
        const checkEmpty = require('../validation/checkEmpty');

        let password = checkEmpty(req.body.password);
        let passwordSign = checkEmpty(req.body.passwordSign);

        /*

        if(password && passwordSign) {
            let signCheck = signCheckKey.verify(password, passwordSign, 'utf8', 'base64');
            if(signCheck) {
                password = privateKey.decrypt(password, 'utf8', 'base64');
            }
            else {
                password = '';
            }
        }
        else {
            password = '';
        }

        */

        let requestBodyObject = {
            countryCode: req.body.countryCode,
            phoneNumber: req.body.phoneNumber,
            password: password
        }

        let {isValid} = validateLoginInput(requestBodyObject,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );
        
        userModel.findOne({countryCode: countryCode,phoneNumber: requestBodyObject.phoneNumber},{'password': 1,'phoneNumber': 1},(err,user) => {
            if(err) {            
                responseObject.message.fatalError = "Something went wrong!!";
                return res.json(responseObject);
            }
            else if(user) {
                const validator = require('../validation/userValidationHelper');
                var msg = validator.isValidPassword(password);
                if(msg !== "true") {
                    responseObject.message.password = "Wrong password!! Try again";
                    return res.json(responseObject);
                }

                bcrypt.compare(password,user.password).then(function(result) {
                    if(result) {
                        let jwtObject = {
                            userID: user.id
                        }

                        jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                            if(err) {
                                responseObject.message.fatalError = 'Token was not created';
                                return res.json(responseObject);
                            }
                            else {
                                const accessTokenModel = require('../models/accessTokenModel');

                                const newAccessToken = new accessTokenModel({
                                    accessToken: token,
                                    userID: user.id
                                });

                                newAccessToken
                                .save()
                                .then(accessToken => {
                                    let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                    let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                    let refreshToken = encryptedID + ' ' + signedID;
                                    return res.json({
                                        ...responseObject,
                                        status: 'success',
                                        accessToken: token,
                                        refreshToken: refreshToken
                                    });
                                })
                            }
                        });
                    }
                    else {
                        responseObject.message.password = "Wrong password!! Try again";
                        return res.json(responseObject);
                    }
                });
            }
            else {
                responseObject.message.phoneNumber = "No user exists with this phone number";
                return res.json(responseObject);
            }
        });
    })
});

router.post('/recover-password',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            countryCode: '',
            phoneNumber: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const userModel = require('../models/userModel');
        const recoverPasswordModel = require('../models/recoverPasswordModel');
        const validateTempRecoverPasswordInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateTempRecoverPasswordInput(req.body,responseObject.message);
        
        if(!isValid) {
            return res.json(responseObject);
        }

        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        recoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err) {
                responseObject.message.fatalError = "Something went wrong!!";
                return res.json(responseObject);
            }
            
            if(user !== null) {
                let timeIntervalLastOtp = Math.abs(new Date() - user.lastOTPSendTime);
                let otpTrials = user.otpTrials;

                if(otpTrials >= 5) {
                    if(timeIntervalLastOtp >= 600000) {
                        let otp = Math.floor(100000 + Math.random() * 900000);
                        let data = {
                            username: '01714565610',
                            password: 'projectTest1234',
                            number: user.phoneNumber,
                            message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                        };

                        request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                            if(err) {
                                responseObject.message.fatalError = "Something went wrong!!";
                                return res.json(responseObject);
                            }
                
                            let responseCode = body.split('|');
                
                            if(responseCode[0] === '1101') {
                                user.updateOne({
                                    otp: otp,
                                    otpVerified: false,
                                    otpTrials: 0,
                                    lastOTPSendTime: new Date()
                                }).then(userT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            }
                            else {
                                responseObject.message.otp = "Password recovery verification code was not sent";
                                return res.json(responseObject);
                            }
                        });
                    }
                    else {
                        let interval = 600000 - timeIntervalLastOtp;
                        if(interval >= 60000) {
                            minuteInterval = Math.floor(interval / 60000);
                            responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + minuteInterval + ' more minute(s) and try again';
                        }
                        else {
                            secondInterval = Math.floor(interval / 1000) + 1;
                            responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + secondInterval + ' more second(s) and try again';
                        }
                        return res.json(responseObject);
                    }
                }
                else {
                    if(timeIntervalLastOtp >= 30000) {
                        let otp = user.otp;
                        let data = {
                            username: '01714565610',
                            password: 'projectTest1234',
                            number: user.phoneNumber,
                            message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                        };

                        request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                            if(err) {
                                responseObject.message.fatalError = "Something went wrong!!";
                                return res.json(responseObject);
                            }
                
                            let responseCode = body.split('|');
                
                            if(responseCode[0] === '1101') {
                                user.updateOne({
                                    otpVerified: false,
                                    lastOTPSendTime: new Date()
                                }).then(userT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            }
                            else {
                                responseObject.message.otp = "Password recovery verification code was not sent";
                                return res.json(responseObject);
                            }
                        });
                    }
                    else {
                        let interval = Math.floor((30000 - timeIntervalLastOtp) / 1000);
                        responseObject.message.fatalError = 'A verification code was sent to your phone number a few seconds ago. Please wait for that one to arrive or, try again after ' + interval + ' second(s)';
                        return res.json(responseObject);
                    }
                }
            }
            else {
                userModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
                    if(err) {
                        responseObject.message.fatalError = "Something went wrong!!";
                        return res.json(responseObject);
                    }
                    if(user === null) {
                        responseObject.message.phoneNumber = "No user exists with this phone number";
                        return res.json(responseObject);
                    }
                    
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: req.body.phoneNumber,
                        message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            const newrRecoverPasswordUser = new recoverPasswordModel({
                                countryCodeFull: req.body.countryCode,
                                countryCode: countryCode,
                                phoneNumber: req.body.phoneNumber,
                                otp: otp
                            });
                            newrRecoverPasswordUser
                            .save()
                            .then(userT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = "Password recovery verification code was not sent";
                            return res.json(responseObject);
                        }
                    });
                });
            }
        });
    })
});

router.post('/recover-password-send-otp-again',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const recoverPasswordModel = require('../models/recoverPasswordModel');
        const validateRecoverPasswordOTPSendAgainInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateRecoverPasswordOTPSendAgainInput(req.body,responseObject.message);
        
        if(!isValid) {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
        
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        recoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err || (user === null)) {     
                responseObject.message.fatalError = "Something went wrong!!";
                return res.json(responseObject);
            }

            let timeIntervalLastOtp = Math.abs(new Date() - user.lastOTPSendTime);
            let otpTrials = user.otpTrials;

            if(otpTrials >= 5) {
                if(timeIntervalLastOtp >= 600000) {
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: user.phoneNumber,
                        message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            user.updateOne({
                                otp: otp,
                                otpVerified: false,
                                otpTrials: 0,
                                lastOTPSendTime: new Date()
                            }).then(userT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = "Password recovery verification code was not sent";
                            return res.json(responseObject);
                        }
                    });
                }
                else {
                    let interval = 600000 - timeIntervalLastOtp;
                    if(interval >= 60000) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + minuteInterval + ' more minute(s) and try again';
                    }
                    else {
                        secondInterval = Math.floor(interval / 1000) + 1;
                        responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + secondInterval + ' more second(s) and try again';
                    }
                    return res.json(responseObject);
                }
            }
            else {
                if(timeIntervalLastOtp >= 30000) {
                    let otp = user.otp;
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: user.phoneNumber,
                        message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                        if(err) {
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            user.updateOne({
                                otpVerified: false,
                                lastOTPSendTime: new Date()
                            }).then(userT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = "Password recovery verification code was not sent";
                            return res.json(responseObject);
                        }
                    });
                }
                else {
                    let interval = Math.floor((30000 - timeIntervalLastOtp) / 1000);
                    responseObject.message.fatalError = 'A verification code was sent to your number a few seconds ago. Please wait for that one to arrive or, try again after ' + interval + ' second(s)';
                    return res.json(responseObject);
                } 
            }
        });
    })
});

router.post('/recover-password-verify-otp',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const recoverPasswordModel = require('../models/recoverPasswordModel');
        const validateOtpInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateOtpInput(req.body,responseObject.message);
        
        if(!isValid) {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
        
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        recoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err || (user === null)) {          
                responseObject.message.fatalError = "Something went wrong!!";
                return res.json(responseObject);
            }

            let timeIntervalLastOtp = Math.abs(new Date() - user.lastOTPSendTime);
            let otpTrials = user.otpTrials;

            if(otpTrials >= 5) {
                if(timeIntervalLastOtp >= 600000) {
                    responseObject.message.fatalError = "You have entered wrong verification code too many times. Please try again by clicking on 'Resend verification code' button below";
                    return res.json(responseObject);
                }
                else {
                    let interval = 600000 - timeIntervalLastOtp;
                    if(interval < 0) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please try again by clicking on 'Resend verification code' button below";
                    }
                    else if(interval >= 60000) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please wait for " + minuteInterval + " more minute(s) and try again by clicking on 'Resend verification code' button below";
                    }
                    else {
                        secondInterval = Math.floor(interval / 1000) + 1;
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please wait for " + secondInterval + " more second(s) and try again by clicking on 'Resend verification code' button below";
                    }
                    return res.json(responseObject);
                }
            }

            if(user.otp !== req.body.otp) {
                user.otpTrials += 1;
                user.save();
                responseObject.message.otp = "Verification code did not match";
                return res.json(responseObject);
            }

            user.updateOne({
                otpVerified: true
            }).then(userT => {
                responseObject.status = 'success';
                return res.json(responseObject);
            })
        });
    })
});

router.post('/recover-password-change',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            password: '',
            reEnterPassword: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const userModel = require('../models/userModel');
        const recoverPasswordModel = require('../models/recoverPasswordModel');
        const validateRecoverPasswordInput = require('../validation/userRecoverPasswordValidation');
        const checkEmpty = require('../validation/checkEmpty');

        let password = checkEmpty(req.body.password);
        let passwordSign = checkEmpty(req.body.passwordSign);
        let reEnterPassword = checkEmpty(req.body.reEnterPassword);
        let reEnterPasswordSign = checkEmpty(req.body.reEnterPasswordSign);

        /*

        if(password && passwordSign) {
            let signCheck = signCheckKey.verify(password, passwordSign, 'utf8', 'base64');
            if(signCheck) {
                password = privateKey.decrypt(password, 'utf8', 'base64');
            }
            else {
                password = '';
            }
        }
        else {
            password = '';
        }
        
        if(reEnterPassword && reEnterPasswordSign) {
            let signCheck = signCheckKey.verify(reEnterPassword, reEnterPasswordSign, 'utf8', 'base64');
            if(signCheck) {
                reEnterPassword = privateKey.decrypt(reEnterPassword, 'utf8', 'base64');
            }
            else {
                reEnterPassword = '';
            }
        }
        else {
            reEnterPassword = '';
        }

        */

        let requestBodyObject = {
            countryCode: req.body.countryCode,
            phoneNumber: req.body.phoneNumber,
            name: req.body.name,
            password: password,
            reEnterPassword: reEnterPassword
        }

        let {isValid} = validateRecoverPasswordInput(requestBodyObject,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        recoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,recoverPasswordUser) => {
            if(err) {          
                responseObject.message.fatalError = "Something went wrong!!";
                return res.json(responseObject);
            }

            if(recoverPasswordUser !== null) {
                if(!recoverPasswordUser.otpVerified) {
                    responseObject.message.fatalError = "Your phone number was not verified";
                    return res.json(responseObject);
                }
                else {
                    userModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
                        if(err || (user === null)) {          
                            responseObject.message.fatalError = "Something went wrong!!";
                            return res.json(responseObject);
                        }

                        bcrypt.hash(password,saltRounds).then(function(hashedPassword) {
                            user.updateOne({
                                password: hashedPassword
                            }).then(userT => {
                                recoverPasswordUser.remove();
                                let jwtObject = {
                                    userID: user.id
                                }
    
                                jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                                    if(err) {
                                        responseObject.message.fatalError = 'Token was not created';
                                        return res.json(responseObject);
                                    }
                                    else {
                                        const accessTokenModel = require('../models/accessTokenModel');
    
                                        const newAccessToken = new accessTokenModel({
                                            accessToken: token,
                                            userID: user.id
                                        });
    
                                        newAccessToken
                                        .save()
                                        .then(accessToken => {
                                            let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                            let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                            let refreshToken = encryptedID + ' ' + signedID;
                                            return res.json({
                                                ...responseObject,
                                                status: 'success',
                                                accessToken: token,
                                                refreshToken: refreshToken
                                            });
                                        })
                                    }
                                });
                            })
                        });
                    })
                }
            }
            else {
                responseObject.message.fatalError = "Something went wrong!!";
                return res.json(responseObject);
            }
        });
    })
});

router.post('/get-access-token',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const accessTokenModel = require('../models/accessTokenModel');
    const userModel = require('../models/userModel');
    const checkSpam = require('../validation/spamFilter');
    const checkEmpty = require('../validation/checkEmpty');
    checkSpam(req,res,responseObject,(req,res) => {
        let accessToken = checkEmpty(req.body.accessToken);
        let refreshToken = checkEmpty(req.body.refreshToken);

        if(accessToken && refreshToken) {
            let refreshTokenPart = refreshToken.split(' ');

            if(!refreshTokenPart[1]) {
                responseObject.message.fatalError = 'Invalid refresh token';
                return res.json({
                    ...responseObject,
                    status: 'failure'
                });
            }

            let signCheck = signCheckKey.verify(refreshTokenPart[0], refreshTokenPart[1], 'utf8', 'base64');

            let accessTokenID;

            if(signCheck) {
                accessTokenID = privateKey.decrypt(refreshTokenPart[0], 'utf8', 'base64');
            }
            else {
                responseObject.message.fatalError = 'Invalid refresh token';
                return res.json(responseObject);
            }
            
            accessTokenModel.findOne({_id: accessTokenID},(err,accessTokenT) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }
                
                if((accessTokenT === null) || (accessTokenT.accessToken !== accessToken)) {
                    responseObject.message.fatalError = 'Invalid refresh token';
                    
                    return res.json(responseObject);
                }

                userModel.findOne({_id: accessTokenT.userID},(err,user) => {
                    if(err || (user === null)) {
                        responseObject.message.fatalError = 'Invalid refresh token';
                        return res.json(responseObject);
                    }

                    let jwtObject = {
                        userID: accessTokenT.userID
                    }
    
                    jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                        if(err) {
                            responseObject.message.fatalError = 'Token was not created';
                            return res.json(responseObject);
                        }
                        else {
                            const accessTokenModel = require('../models/accessTokenModel');
    
                            const newAccessToken = new accessTokenModel({
                                accessToken: token,
                                userID: accessTokenT.userID
                            });
    
                            newAccessToken
                            .save()
                            .then(accessToken => {
                                accessTokenT.remove();
                                let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                let refreshToken = encryptedID + ' ' + signedID;
                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    accessToken: token,
                                    refreshToken: refreshToken
                                });
                            })
                        }
                    });
                })
            });
        }
        else {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
    })
});

router.post('/change-password',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            currentPassword: '',
            newPassword: '',
            reEnterNewPassword: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const userModel = require('../models/userModel');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
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
                    const validateChangePasswordInput = require('../validation/userChangePasswordValidation');
                    const validator = require('../validation/userValidationHelper');

                    let currentPassword = checkEmpty(req.body.currentPassword);
                    let currentPasswordSign = checkEmpty(req.body.currentPasswordSign);
                    let newPassword = checkEmpty(req.body.newPassword);
                    let newPasswordSign = checkEmpty(req.body.newPasswordSign);
                    let reEnterNewPassword = checkEmpty(req.body.reEnterNewPassword);
                    let reEnterNewPasswordSign = checkEmpty(req.body.reEnterNewPasswordSign);

                    /*

                    if(currentPassword && currentPasswordSign) {
                        let signCheck = signCheckKey.verify(currentPassword, currentPasswordSign, 'utf8', 'base64');
                        if(signCheck) {
                            currentPassword = privateKey.decrypt(currentPassword, 'utf8', 'base64');
                        }
                        else {
                            currentPassword = '';
                        }
                    }
                    else {
                        currentPassword = '';
                    }

                    if(newPassword && newPasswordSign) {
                        let signCheck = signCheckKey.verify(newPassword, newPasswordSign, 'utf8', 'base64');
                        if(signCheck) {
                            newPassword = privateKey.decrypt(newPassword, 'utf8', 'base64');
                        }
                        else {
                            newPassword = '';
                        }
                    }
                    else {
                        newPassword = '';
                    }
                    
                    if(reEnterNewPassword && reEnterNewPasswordSign) {
                        let signCheck = signCheckKey.verify(reEnterNewPassword, reEnterNewPasswordSign, 'utf8', 'base64');
                        if(signCheck) {
                            reEnterNewPassword = privateKey.decrypt(reEnterNewPassword, 'utf8', 'base64');
                        }
                        else {
                            reEnterNewPassword = '';
                        }
                    }
                    else {
                        reEnterNewPassword = '';
                    }

                    */

                    let requestBodyObject = {
                        newPassword: newPassword,
                        reEnterNewPassword: reEnterNewPassword
                    }

                    let {isValid} = validateChangePasswordInput(requestBodyObject,responseObject.message);

                    var msg = validator.isValidPassword(currentPassword);
                    if(msg !== "true") {
                        isValid = false;
                        responseObject.message.currentPassword = "Wrong current password";
                    }
                    if(!isValid) {
                        return res.json(responseObject);
                    }

                    bcrypt.compare(currentPassword,user.password).then(function(result) {
                        if(result) {
                            bcrypt.hash(newPassword,saltRounds).then(function(hashedPassword) {
                                user.updateOne({
                                    password: hashedPassword
                                }).then(userT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            })
                        }
                        else {
                            responseObject.message.currentPassword = "Wrong current password";
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

router.post('/send-otp-owner',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            countryCode: '',
            phoneNumber: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerModel = require('../models/ownerModel');
        const ownerTempModel = require('../models/ownerTempModel');

        const validateTempRegisterInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateTempRegisterInput(req.body,responseObject.message);
        
        if(!isValid) {
            return res.json(responseObject);
        }

        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        ownerTempModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,ownerTemp) => {
            if(err) {
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }
            
            if(ownerTemp !== null) {
                let timeIntervalLastOtp = Math.abs(new Date() - ownerTemp.lastOTPSendTime);
                let otpTrials = ownerTemp.otpTrials;

                if(otpTrials >= 5) {
                    if(timeIntervalLastOtp >= 600000) {
                        let otp = Math.floor(100000 + Math.random() * 900000);
                        let data = {
                            username: '01714565610',
                            password: 'projectTest1234',
                            number: ownerTemp.phoneNumber,
                            message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                        };

                        request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                            if(err) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json(responseObject);
                            }
                
                            let responseCode = body.split('|');
                
                            if(responseCode[0] === '1101') {
                                ownerTemp.updateOne({
                                    otp: otp,
                                    otpVerified: false,
                                    otpTrials: 0,
                                    lastOTPSendTime: new Date()
                                }).then(ownerT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            }
                            else {
                                responseObject.message.otp = 'Verification code was not sent';
                                return res.json(responseObject);
                            }
                        });
                    }
                    else {
                        let interval = 600000 - timeIntervalLastOtp;
                        if(interval >= 60000) {
                            minuteInterval = Math.floor(interval / 60000);
                            responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + minuteInterval + ' more minute(s) and try again';
                        }
                        else {
                            secondInterval = Math.floor(interval / 1000) + 1;
                            responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + secondInterval + ' more second(s) and try again';
                        }
                        return res.json(responseObject);
                    }
                }
                else {
                    if(timeIntervalLastOtp >= 30000) {
                        let otp = ownerTemp.otp;
                        let data = {
                            username: '01714565610',
                            password: 'projectTest1234',
                            number: ownerTemp.phoneNumber,
                            message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                        };

                        request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                            if(err) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json(responseObject);
                            }
                
                            let responseCode = body.split('|');
                
                            if(responseCode[0] === '1101') {
                                ownerTemp.updateOne({
                                    otpVerified: false,
                                    lastOTPSendTime: new Date()
                                }).then(ownerT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            }
                            else {
                                responseObject.message.otp = 'Verification code was not sent';
                                return res.json(responseObject);
                            }
                        });
                    }
                    else {
                        let interval = Math.floor((30000 - timeIntervalLastOtp) / 1000);
                        responseObject.message.fatalError = 'A verification code was sent to your phone number a few seconds ago. Please wait for that one to arrive or, try again after ' + interval + ' second(s)';
                        return res.json(responseObject);
                    }
                }
            }
            else {
                ownerModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,owner) => {
                    if(err) {
                        responseObject.message.fatalError = 'Something went wrong!!';
                        return res.json(responseObject);
                    }
                    if(owner !== null) {
                        responseObject.message.phoneNumber = 'This phone number is attached to an existing account';
                        return res.json(responseObject);
                    }
                    
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: req.body.phoneNumber,
                        message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            const newTempOwner = new ownerTempModel({
                                countryCodeFull: req.body.countryCode,
                                countryCode: countryCode,
                                phoneNumber: req.body.phoneNumber,
                                otp: otp
                            });
                            newTempOwner
                            .save()
                            .then(ownerT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = 'Verification code was not sent';
                            return res.json(responseObject);
                        }
                    });
                });
            }
        });
    })
});

router.post('/send-otp-again-owner',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerTempModel = require('../models/ownerTempModel');
        const validateRegisterOTPSendAgainInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateRegisterOTPSendAgainInput(req.body,responseObject.message);
        
        if(!isValid) {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
        
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        ownerTempModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,ownerTemp) => {
            if(err || (ownerTemp === null)) {     
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            let timeIntervalLastOtp = Math.abs(new Date() - ownerTemp.lastOTPSendTime);
            let otpTrials = ownerTemp.otpTrials;

            if(otpTrials >= 5) {
                if(timeIntervalLastOtp >= 600000) {
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: ownerTemp.phoneNumber,
                        message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            ownerTemp.updateOne({
                                otp: otp,
                                otpVerified: false,
                                otpTrials: 0,
                                lastOTPSendTime: new Date()
                            }).then(ownerT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = 'Verification code was not sent';
                            return res.json(responseObject);
                        }
                    });
                }
                else {
                    let interval = 600000 - timeIntervalLastOtp;
                    if(interval >= 60000) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + minuteInterval + ' more minute(s) and try again';
                    }
                    else {
                        secondInterval = Math.floor(interval / 1000) + 1;
                        responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + secondInterval + ' more second(s) and try again';
                    }
                    return res.json(responseObject);
                }
            }
            else {
                if(timeIntervalLastOtp >= 30000) {
                    let otp = ownerTemp.otp;
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: ownerTemp.phoneNumber,
                        message: 'Your www.ordernow.restaurant verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            ownerTemp.updateOne({
                                otpVerified: false,
                                lastOTPSendTime: new Date()
                            }).then(ownerT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = 'Verification code was not sent';
                            return res.json(responseObject);
                        }
                    });
                }
                else {
                    let interval = Math.floor((30000 - timeIntervalLastOtp) / 1000);
                    responseObject.message.fatalError = 'A verification code was sent to your number a few seconds ago. Please wait for that one to arrive or, try again after ' + interval + ' second(s)';
                    return res.json(responseObject);
                } 
            }
        });
    })
});

router.post('/verify-otp-owner',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerTempModel = require('../models/ownerTempModel');
        const validateOtpInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateOtpInput(req.body,responseObject.message);
        
        if(!isValid) {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
        
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        ownerTempModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,ownerTemp) => {
            if(err || (ownerTemp === null)) {          
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            let timeIntervalLastOtp = Math.abs(new Date() - ownerTemp.lastOTPSendTime);
            let otpTrials = ownerTemp.otpTrials;

            if(otpTrials >= 5) {
                if(timeIntervalLastOtp >= 600000) {
                    responseObject.message.fatalError = "You have entered wrong verification code too many times. Please try again by clicking on 'Resend verification code' button below";
                    return res.json(responseObject);
                }
                else {
                    let interval = 600000 - timeIntervalLastOtp;
                    if(interval < 0) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please try again by clicking on 'Resend verification code' button below";
                    }
                    else if(interval >= 60000) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please wait for " + minuteInterval + " more minute(s) and try again by clicking on 'Resend verification code' button below";
                    }
                    else {
                        secondInterval = Math.floor(interval / 1000) + 1;
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please wait for " + secondInterval + " more second(s) and try again by clicking on 'Resend verification code' button below";
                    }
                    return res.json(responseObject);
                }
            }

            if(ownerTemp.otp !== req.body.otp) {
                ownerTemp.otpTrials += 1;
                ownerTemp.save();
                responseObject.message.otp = 'Verification code did not match';
                return res.json(responseObject);
            }

            ownerTemp.updateOne({
                otpVerified: true
            }).then(ownerT => {
                responseObject.status = 'success';
                return res.json(responseObject);
            })
        });
    })
});

router.post('/create-owner-account',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            password: '',
            reEnterPassword: '',
            name: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerModel = require('../models/ownerModel');
        const ownerTempModel = require('../models/ownerTempModel');
        const validateRegisterInput = require('../validation/userRegisterValidation');
        const checkEmpty = require('../validation/checkEmpty');

        let password = checkEmpty(req.body.password);
        let passwordSign = checkEmpty(req.body.passwordSign);
        let reEnterPassword = checkEmpty(req.body.reEnterPassword);
        let reEnterPasswordSign = checkEmpty(req.body.reEnterPasswordSign);

        /*

        if(password && passwordSign) {
            let signCheck = signCheckKey.verify(password, passwordSign, 'utf8', 'base64');
            if(signCheck) {
                password = privateKey.decrypt(password, 'utf8', 'base64');
            }
            else {
                password = '';
            }
        }
        else {
            password = '';
        }
        
        if(reEnterPassword && reEnterPasswordSign) {
            let signCheck = signCheckKey.verify(reEnterPassword, reEnterPasswordSign, 'utf8', 'base64');
            if(signCheck) {
                reEnterPassword = privateKey.decrypt(reEnterPassword, 'utf8', 'base64');
            }
            else {
                reEnterPassword = '';
            }
        }
        else {
            reEnterPassword = '';
        }

        */

        let requestBodyObject = {
            countryCode: req.body.countryCode,
            phoneNumber: req.body.phoneNumber,
            name: req.body.name,
            password: password,
            reEnterPassword: reEnterPassword
        }

        let {isValid} = validateRegisterInput(requestBodyObject,responseObject.message);

        if(!isValid) {
            return res.json(responseObject);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        ownerTempModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,ownerTemp) => {
            if(err) {          
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            if(ownerTemp !== null) {
                if(!ownerTemp.otpVerified) {
                    responseObject.message.fatalError = 'Your phone number was not verified';
                    return res.json(responseObject);
                }
                else {
                    bcrypt.hash(password,saltRounds).then(function(hashedPassword) {
                        const newOwner = new ownerModel({
                            countryCodeFull: req.body.countryCode,
                            countryCode: countryCode,
                            phoneNumber: req.body.phoneNumber,
                            password: hashedPassword,
                            name: req.body.name
                        });

                        newOwner
                        .save()
                        .then(owner => {
                            ownerTemp.remove();
                            let jwtObject = {
                                ownerID: owner.id
                            }

                            jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Token was not created';
                                    return res.json(responseObject);
                                }
                                else {
                                    const accessTokenModel = require('../models/accessTokenModel');

                                    const newAccessToken = new accessTokenModel({
                                        accessToken: token,
                                        userID: owner.id
                                    });

                                    newAccessToken
                                    .save()
                                    .then(accessToken => {
                                        let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                        let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                        let refreshToken = encryptedID + ' ' + signedID;
                                        return res.json({
                                            ...responseObject,
                                            status: 'success',
                                            accessToken: token,
                                            refreshToken: refreshToken
                                        });
                                    })
                                }
                            });
                        })
                    });
                }
            }
            else {
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }
        });
    })
});

router.post('/owner-login',function(req,res) {
    responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            countryCode: '',
            phoneNumber: '',
            password: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerModel = require('../models/ownerModel');
        const validateLoginInput = require('../validation/userLoginValidation');
        const checkEmpty = require('../validation/checkEmpty');

        let password = checkEmpty(req.body.password);
        let passwordSign = checkEmpty(req.body.passwordSign);

        /*

        if(password && passwordSign) {
            let signCheck = signCheckKey.verify(password, passwordSign, 'utf8', 'base64');
            if(signCheck) {
                password = privateKey.decrypt(password, 'utf8', 'base64');
            }
            else {
                password = '';
            }
        }
        else {
            password = '';
        }

        */

        let requestBodyObject = {
            countryCode: req.body.countryCode,
            phoneNumber: req.body.phoneNumber,
            password: password
        }

        let {isValid} = validateLoginInput(requestBodyObject,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );
        
        ownerModel.findOne({countryCode: countryCode,phoneNumber: requestBodyObject.phoneNumber},{'password': 1,'phoneNumber': 1},(err,owner) => {
            if(err) {            
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }
            else if(owner) {
                const validator = require('../validation/userValidationHelper');
                var msg = validator.isValidPassword(password);
                if(msg !== "true") {
                    responseObject.message.password = 'Wrong password!! Try again';
                    return res.json(responseObject);
                }

                bcrypt.compare(password,owner.password).then(function(result) {
                    if(result) {
                        let jwtObject = {
                            ownerID: owner.id
                        }

                        jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                            if(err) {
                                responseObject.message.fatalError = 'Token was not created';
                                return res.json(responseObject);
                            }
                            else {
                                const accessTokenModel = require('../models/accessTokenModel');

                                const newAccessToken = new accessTokenModel({
                                    accessToken: token,
                                    userID: owner.id
                                });

                                newAccessToken
                                .save()
                                .then(accessToken => {
                                    let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                    let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                    let refreshToken = encryptedID + ' ' + signedID;
                                    return res.json({
                                        ...responseObject,
                                        status: 'success',
                                        accessToken: token,
                                        refreshToken: refreshToken
                                    });
                                })
                            }
                        });
                    }
                    else {
                        responseObject.message.password = 'Wrong password!! Try again';
                        return res.json(responseObject);
                    }
                });
            }
            else {
                responseObject.message.phoneNumber = 'No owner exists with this phone number';
                return res.json(responseObject);
            }
        });
    })
});

router.post('/recover-password-owner',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            countryCode: '',
            phoneNumber: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerModel = require('../models/ownerModel');
        const ownerRecoverPasswordModel = require('../models/ownerRecoverPasswordModel');
        const validateTempRecoverPasswordInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateTempRecoverPasswordInput(req.body,responseObject.message);
        
        if(!isValid) {
            responseObject.message = message;
            return res.json(responseObject);
        }

        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        ownerRecoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,owner) => {
            if(err) {
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }
            
            if(owner !== null) {
                let timeIntervalLastOtp = Math.abs(new Date() - owner.lastOTPSendTime);
                let otpTrials = owner.otpTrials;

                if(otpTrials >= 5) {
                    if(timeIntervalLastOtp >= 600000) {
                        let otp = Math.floor(100000 + Math.random() * 900000);
                        let data = {
                            username: '01714565610',
                            password: 'projectTest1234',
                            number: owner.phoneNumber,
                            message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                        };

                        request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                            if(err) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json(responseObject);
                            }
                
                            let responseCode = body.split('|');
                
                            if(responseCode[0] === '1101') {
                                owner.updateOne({
                                    otp: otp,
                                    otpVerified: false,
                                    otpTrials: 0,
                                    lastOTPSendTime: new Date()
                                }).then(ownerT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            }
                            else {
                                responseObject.message.otp = 'Password recovery verification code was not sent';
                                return res.json(responseObject);
                            }
                        });
                    }
                    else {
                        let interval = 600000 - timeIntervalLastOtp;
                        if(interval >= 60000) {
                            minuteInterval = Math.floor(interval / 60000);
                            responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + minuteInterval + ' more minute(s) and try again';
                        }
                        else {
                            secondInterval = Math.floor(interval / 1000) + 1;
                            responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + secondInterval + ' more second(s) and try again';
                        }
                        return res.json(responseObject);
                    }
                }
                else {
                    if(timeIntervalLastOtp >= 30000) {
                        let otp = owner.otp;
                        let data = {
                            username: '01714565610',
                            password: 'projectTest1234',
                            number: owner.phoneNumber,
                            message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                        };

                        request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                            if(err) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json(responseObject);
                            }
                
                            let responseCode = body.split('|');
                
                            if(responseCode[0] === '1101') {
                                owner.updateOne({
                                    otpVerified: false,
                                    lastOTPSendTime: new Date()
                                }).then(ownerT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            }
                            else {
                                responseObject.message.otp = 'Password recovery verification code was not sent';
                                return res.json(responseObject);
                            }
                        });
                    }
                    else {
                        let interval = Math.floor((30000 - timeIntervalLastOtp) / 1000);
                        responseObject.message.fatalError = 'A verification code was sent to your phone number a few seconds ago. Please wait for that one to arrive or, try again after ' + interval + ' second(s)';
                        return res.json(responseObject);
                    }
                }
            }
            else {
                ownerModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,owner) => {
                    if(err) {
                        responseObject.message.fatalError = 'Something went wrong!!';
                        return res.json(responseObject);
                    }
                    if(owner === null) {
                        responseObject.message.phoneNumber = 'No user exists with this phone number';
                        return res.json(responseObject);
                    }
                    
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: req.body.phoneNumber,
                        message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            const newrRecoverPasswordOwner = new ownerRecoverPasswordModel({
                                countryCodeFull: req.body.countryCode,
                                countryCode: countryCode,
                                phoneNumber: req.body.phoneNumber,
                                otp: otp
                            });
                            newrRecoverPasswordOwner
                            .save()
                            .then(ownerT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = 'Password recovery verification code was not sent';
                            return res.json(responseObject);
                        }
                    });
                });
            }
        });
    })
});

router.post('/recover-password-owner-send-otp-again',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerRecoverPasswordModel = require('../models/ownerRecoverPasswordModel');
        const validateRecoverPasswordOTPSendAgainInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateRecoverPasswordOTPSendAgainInput(req.body,responseObject.message);
        
        if(!isValid) {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
        
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        ownerRecoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,owner) => {
            if(err || (owner === null)) {     
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            let timeIntervalLastOtp = Math.abs(new Date() - owner.lastOTPSendTime);
            let otpTrials = owner.otpTrials;

            if(otpTrials >= 5) {
                if(timeIntervalLastOtp >= 600000) {
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: owner.phoneNumber,
                        message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            owner.updateOne({
                                otp: otp,
                                otpVerified: false,
                                otpTrials: 0,
                                lastOTPSendTime: new Date()
                            }).then(ownerT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = 'Password recovery verification code was not sent';
                            return res.json(responseObject);
                        }
                    });
                }
                else {
                    let interval = 600000 - timeIntervalLastOtp;
                    if(interval >= 60000) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + minuteInterval + ' more minute(s) and try again';
                    }
                    else {
                        secondInterval = Math.floor(interval / 1000) + 1;
                        responseObject.message.fatalError = 'You entered wrong verification code too many times. Please wait for ' + secondInterval + ' more second(s) and try again';
                    }
                    return res.json(responseObject);
                }
            }
            else {
                if(timeIntervalLastOtp >= 30000) {
                    let otp = owner.otp;
                    let data = {
                        username: '01714565610',
                        password: 'projectTest1234',
                        number: owner.phoneNumber,
                        message: 'Your Order Now password recovery verification code is ' + otp + '. Do not share this verification code with anyone.'
                    };

                    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
                        if(err) {
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }
            
                        let responseCode = body.split('|');
            
                        if(responseCode[0] === '1101') {
                            owner.updateOne({
                                otpVerified: false,
                                lastOTPSendTime: new Date()
                            }).then(ownerT => {
                                responseObject.status = 'success';
                                return res.json(responseObject);
                            })
                        }
                        else {
                            responseObject.message.otp = 'Password recovery verification code was not sent';
                            return res.json(responseObject);
                        }
                    });
                }
                else {
                    let interval = Math.floor((30000 - timeIntervalLastOtp) / 1000);
                    responseObject.message.fatalError = 'A verification code was sent to your number a few seconds ago. Please wait for that one to arrive or, try again after ' + interval + ' second(s)';
                    return res.json(responseObject);
                } 
            }
        });
    })
});

router.post('/recover-password-owner-verify-otp',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            otp: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerRecoverPasswordModel = require('../models/ownerRecoverPasswordModel');
        const validateOtpInput = require('../validation/userTempRegisterValidation');

        let {isValid} = validateOtpInput(req.body,responseObject.message);

        if(!isValid) {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
        
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        ownerRecoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,owner) => {
            if(err || (owner === null)) {          
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            let timeIntervalLastOtp = Math.abs(new Date() - owner.lastOTPSendTime);
            let otpTrials = owner.otpTrials;

            if(otpTrials >= 5) {
                if(timeIntervalLastOtp >= 600000) {
                    responseObject.message.fatalError = "You have entered wrong verification code too many times. Please try again by clicking on 'Resend verification code' button below";
                    return res.json(responseObject);
                }
                else {
                    let interval = 600000 - timeIntervalLastOtp;
                    if(interval < 0) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please try again by clicking on 'Resend verification code' button below";
                    }
                    else if(interval >= 60000) {
                        minuteInterval = Math.floor(interval / 60000);
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please wait for " + minuteInterval + " more minute(s) and try again by clicking on 'Resend verification code' button below";
                    }
                    else {
                        secondInterval = Math.floor(interval / 1000) + 1;
                        responseObject.message.fatalError = "You have entered wrong verification code too many times. Please wait for " + secondInterval + " more second(s) and try again by clicking on 'Resend verification code' button below";
                    }
                    return res.json(responseObject);
                }
            }

            if(owner.otp !== req.body.otp) {
                owner.otpTrials += 1;
                owner.save();
                responseObject.message.otp = 'Verification code did not match';
                return res.json(responseObject);
            }

            owner.updateOne({
                otpVerified: true
            }).then(ownerT => {
                responseObject.status = 'success';
                return res.json(responseObject);
            })
        });
    })
});

router.post('/recover-password-owner-change',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            password: '',
            reEnterPassword: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerModel = require('../models/ownerModel');
        const ownerRecoverPasswordModel = require('../models/ownerRecoverPasswordModel');
        const validateRecoverPasswordInput = require('../validation/userRecoverPasswordValidation');
        const checkEmpty = require('../validation/checkEmpty');

        let password = checkEmpty(req.body.password);
        let passwordSign = checkEmpty(req.body.passwordSign);
        let reEnterPassword = checkEmpty(req.body.reEnterPassword);
        let reEnterPasswordSign = checkEmpty(req.body.reEnterPasswordSign);

        /*

        if(password && passwordSign) {
            let signCheck = signCheckKey.verify(password, passwordSign, 'utf8', 'base64');
            if(signCheck) {
                password = privateKey.decrypt(password, 'utf8', 'base64');
            }
            else {
                password = '';
            }
        }
        else {
            password = '';
        }
        
        if(reEnterPassword && reEnterPasswordSign) {
            let signCheck = signCheckKey.verify(reEnterPassword, reEnterPasswordSign, 'utf8', 'base64');
            if(signCheck) {
                reEnterPassword = privateKey.decrypt(reEnterPassword, 'utf8', 'base64');
            }
            else {
                reEnterPassword = '';
            }
        }
        else {
            reEnterPassword = '';
        }

        */

        let requestBodyObject = {
            countryCode: req.body.countryCode,
            phoneNumber: req.body.phoneNumber,
            name: req.body.name,
            password: password,
            reEnterPassword: reEnterPassword
        }

        let {isValid} = validateRecoverPasswordInput(requestBodyObject,responseObject.message);

        if(!isValid) {
            return res.json(responseObject);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        ownerRecoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,recoverPasswordOwner) => {
            if(err) {          
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }

            if(recoverPasswordOwner !== null) {
                if(!recoverPasswordOwner.otpVerified) {
                    responseObject.message.fatalError = 'Your phone number was not verified';
                    return res.json(responseObject);
                }
                else {
                    ownerModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,owner) => {
                        if(err || (owner === null)) {          
                            responseObject.message.fatalError = 'Something went wrong!!';
                            return res.json(responseObject);
                        }

                        bcrypt.hash(password,saltRounds).then(function(hashedPassword) {
                            owner.updateOne({
                                password: hashedPassword
                            }).then(ownerT => {
                                recoverPasswordOwner.remove();
                                let jwtObject = {
                                    ownerID: owner.id
                                }
    
                                jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                                    if(err) {
                                        responseObject.message.fatalError = 'Token was not created';
                                        return res.json(responseObject);
                                    }
                                    else {
                                        const accessTokenModel = require('../models/accessTokenModel');
    
                                        const newAccessToken = new accessTokenModel({
                                            accessToken: token,
                                            userID: owner.id
                                        });
    
                                        newAccessToken
                                        .save()
                                        .then(accessToken => {
                                            let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                            let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                            let refreshToken = encryptedID + ' ' + signedID;
                                            return res.json({
                                                ...responseObject,
                                                status: 'success',
                                                accessToken: token,
                                                refreshToken: refreshToken
                                            });
                                        })
                                    }
                                });
                            })
                        });
                    })
                }
            }
            else {
                responseObject.message.fatalError = 'Something went wrong!!';
                return res.json(responseObject);
            }
        });
    })
});

router.post('/get-access-token-owner',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const accessTokenModel = require('../models/accessTokenModel');
    const ownerModel = require('../models/ownerModel');
    const checkSpam = require('../validation/spamFilter');
    const checkEmpty = require('../validation/checkEmpty');
    checkSpam(req,res,responseObject,(req,res) => {
        let accessToken = checkEmpty(req.body.accessToken);
        let refreshToken = checkEmpty(req.body.refreshToken);

        if(accessToken && refreshToken) {
            let refreshTokenPart = refreshToken.split(' ');

            if(!refreshTokenPart[1]) {
                responseObject.message.fatalError = 'Invalid refresh token';
                return res.json(responseObject);
            }

            let signCheck = signCheckKey.verify(refreshTokenPart[0], refreshTokenPart[1], 'utf8', 'base64');

            let accessTokenID;

            if(signCheck) {
                accessTokenID = privateKey.decrypt(refreshTokenPart[0], 'utf8', 'base64');
            }
            else {
                responseObject.message.fatalError = 'Invalid refresh token';
                return res.json(responseObject);
            }
            
            accessTokenModel.findOne({_id: accessTokenID},(err,accessTokenT) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json(responseObject);
                }
                
                if((accessTokenT === null) || (accessTokenT.accessToken !== accessToken)) {
                    responseObject.message.fatalError = 'Invalid refresh token';
                    return res.json(responseObject);
                }

                ownerModel.findOne({_id: accessTokenT.userID},(err,owner) => {
                    if(err || (owner === null)) {
                        responseObject.message.fatalError = 'Invalid refresh token';
                        return res.json(responseObject);
                    }

                    let jwtObject = {
                        ownerID: accessTokenT.userID
                    }
    
                    jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                        if(err) {
                            responseObject.message.fatalError = 'Token was not created';
                            return res.json(responseObject);
                        }
                        else {
                            const accessTokenModel = require('../models/accessTokenModel');
    
                            const newAccessToken = new accessTokenModel({
                                accessToken: token,
                                userID: accessTokenT.userID
                            });
    
                            newAccessToken
                            .save()
                            .then(accessToken => {
                                accessTokenT.remove();
                                let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                let refreshToken = encryptedID + ' ' + signedID;
                                return res.json({
                                    ...responseObject,
                                    status: 'success',
                                    accessToken: token,
                                    refreshToken: refreshToken
                                });
                            })
                        }
                    });
                })
            });
        }
        else {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
    })
});

router.post('/change-password-owner',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            currentPassword: '',
            newPassword: '',
            reEnterNewPassword: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerModel = require('../models/ownerModel');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json(responseObject);
                }

                if(owner !== null) {
                    const checkEmpty = require('../validation/checkEmpty');
                    const validateChangePasswordInput = require('../validation/userChangePasswordValidation');
                    const validator = require('../validation/userValidationHelper');

                    let currentPassword = checkEmpty(req.body.currentPassword);
                    let currentPasswordSign = checkEmpty(req.body.currentPasswordSign);
                    let newPassword = checkEmpty(req.body.newPassword);
                    let newPasswordSign = checkEmpty(req.body.newPasswordSign);
                    let reEnterNewPassword = checkEmpty(req.body.reEnterNewPassword);
                    let reEnterNewPasswordSign = checkEmpty(req.body.reEnterNewPasswordSign);

                    /*

                    if(currentPassword && currentPasswordSign) {
                        let signCheck = signCheckKey.verify(currentPassword, currentPasswordSign, 'utf8', 'base64');
                        if(signCheck) {
                            currentPassword = privateKey.decrypt(currentPassword, 'utf8', 'base64');
                        }
                        else {
                            currentPassword = '';
                        }
                    }
                    else {
                        currentPassword = '';
                    }

                    if(newPassword && newPasswordSign) {
                        let signCheck = signCheckKey.verify(newPassword, newPasswordSign, 'utf8', 'base64');
                        if(signCheck) {
                            newPassword = privateKey.decrypt(newPassword, 'utf8', 'base64');
                        }
                        else {
                            newPassword = '';
                        }
                    }
                    else {
                        newPassword = '';
                    }
                    
                    if(reEnterNewPassword && reEnterNewPasswordSign) {
                        let signCheck = signCheckKey.verify(reEnterNewPassword, reEnterNewPasswordSign, 'utf8', 'base64');
                        if(signCheck) {
                            reEnterNewPassword = privateKey.decrypt(reEnterNewPassword, 'utf8', 'base64');
                        }
                        else {
                            reEnterNewPassword = '';
                        }
                    }
                    else {
                        reEnterNewPassword = '';
                    }

                    */

                    let requestBodyObject = {
                        newPassword: newPassword,
                        reEnterNewPassword: reEnterNewPassword
                    }

                    let {isValid} = validateChangePasswordInput(requestBodyObject,responseObject.message);

                    var msg = validator.isValidPassword(currentPassword);
                    if(msg !== "true") {
                        isValid = false;
                        responseObject.message.currentPassword = 'Wrong current password';
                    }
                    if(!isValid) {
                        return res.json(responseObject);
                    }

                    bcrypt.compare(currentPassword,owner.password).then(function(result) {
                        if(result) {
                            bcrypt.hash(newPassword,saltRounds).then(function(hashedPassword) {
                                owner.updateOne({
                                    password: hashedPassword
                                }).then(ownerT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            })
                        }
                        else {
                            responseObject.message.currentPassword = 'Wrong current password';
                            return res.json(responseObject);
                        }
                    })
                }
                else {
                    responseObject.message.fatalError = 'Invalid access token';
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

router.post('/manager-password-change-owner',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            newPassword: '',
            reEnterNewPassword: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const ownerModel = require('../models/ownerModel');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'owner') {
            ownerModel.findOne({_id: id},(err,owner) => {
                if(err) {
                    responseObject.message.fatalError = 'Something went wrong!!';
                    return res.json(responseObject);
                }

                if(owner !== null) {
                    const checkEmpty = require('../validation/checkEmpty');
                    const validateChangePasswordInput = require('../validation/userChangePasswordValidation');
                    const managerModel = require('../models/managerModel');
                    const restaurantModel = require('../models/restaurantModel');

                    let managerID = checkEmpty(req.body.managerID);
                    let newPassword = checkEmpty(req.body.newPassword);
                    let newPasswordSign = checkEmpty(req.body.newPasswordSign);
                    let reEnterNewPassword = checkEmpty(req.body.reEnterNewPassword);
                    let reEnterNewPasswordSign = checkEmpty(req.body.reEnterNewPasswordSign);

                    if(!managerID) {
                        responseObject.message.fatalError = 'Manager was not found!!';
                        return res.json(responseObject);
                    }
                    else {
                        managerModel.findOne({_id: managerID,isDeleted: false},(err,manager) => {
                            if(err || (manager === null)) {
                                responseObject.message.fatalError = 'Something went wrong!!';
                                return res.json(responseObject);
                            }
    
                            let restaurantID = manager.restaurantID;
    
                            restaurantModel.findOne({_id: restaurantID,isDeleted: false},(err,restaurant) => {
                                if(err || (restaurant === null)) {
                                    responseObject.message.fatalError = 'Restaurant was not found!!';
                                    return res.json(responseObject);
                                }
                                else {
                                    let ownerID = restaurant.ownerID;
    
                                    if(ownerID === id) {
                                        /*

                                        if(newPassword && newPasswordSign) {
                                            let signCheck = signCheckKey.verify(newPassword, newPasswordSign, 'utf8', 'base64');
                                            if(signCheck) {
                                                newPassword = privateKey.decrypt(newPassword, 'utf8', 'base64');
                                            }
                                            else {
                                                newPassword = '';
                                            }
                                        }
                                        else {
                                            newPassword = '';
                                        }
                                        
                                        if(reEnterNewPassword && reEnterNewPasswordSign) {
                                            let signCheck = signCheckKey.verify(reEnterNewPassword, reEnterNewPasswordSign, 'utf8', 'base64');
                                            if(signCheck) {
                                                reEnterNewPassword = privateKey.decrypt(reEnterNewPassword, 'utf8', 'base64');
                                            }
                                            else {
                                                reEnterNewPassword = '';
                                            }
                                        }
                                        else {
                                            reEnterNewPassword = '';
                                        }

                                        */
                    
                                        let requestBodyObject = {
                                            newPassword: newPassword,
                                            reEnterNewPassword: reEnterNewPassword
                                        }
                    
                                        let {isValid} = validateChangePasswordInput(requestBodyObject,responseObject.message);
                                        if(!isValid) {
                                            return res.json(responseObject);
                                        }
        
                                        bcrypt.hash(newPassword,saltRounds).then(function(hashedPassword) {
                                            manager.updateOne({
                                                password: hashedPassword
                                            }).then(managerT => {
                                                responseObject.status = 'success';
                                                return res.json(responseObject);
                                            })
                                        })
                                    }
                                    else {
                                        responseObject.message.fatalError = 'You do not have permission to change info of this manager';
                                        return res.json(responseObject);
                                    }
                                }
                            })
                        })
                    }
                }
                else {
                    responseObject.message.fatalError = 'Invalid access token';
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

router.post('/create-restaurant',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            name: '',
            password: '',
            reEnterPassword: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const validateLoginAuthenticity = require('../validation/isLoggedIn');
        const validateRestaurantRegisterInput = require('../validation/restaurantRegisterValidation');
        const restaurantTempModel = require('../models/restaurantTempModel');
        const managerModel = require('../models/managerModel');
        const checkEmpty = require('../validation/checkEmpty');

        let {isValid,userType,id} = validateLoginAuthenticity(req.body.accessToken,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(userType === 'owner') {
            const ownerModel = require('../models/ownerModel');

            let password = checkEmpty(req.body.password);
            let passwordSign = checkEmpty(req.body.passwordSign);
            let reEnterPassword = checkEmpty(req.body.reEnterPassword);
            let reEnterPasswordSign = checkEmpty(req.body.reEnterPasswordSign);

            ownerModel.findOne({_id: id},(err,owner) => {
                if(err || (owner === null)) {
                    responseObject.message.fatalError = 'Something went wrong!!'
                    return res.json(responseObject);
                }

                /*

                if(password && passwordSign) {
                    let signCheck = signCheckKey.verify(password, passwordSign, 'utf8', 'base64');
                    if(signCheck) {
                        password = privateKey.decrypt(password, 'utf8', 'base64');
                    }
                    else {
                        password = '';
                    }
                }
                else {
                    password = '';
                }
                
                if(reEnterPassword && reEnterPasswordSign) {
                    let signCheck = signCheckKey.verify(reEnterPassword, reEnterPasswordSign, 'utf8', 'base64');
                    if(signCheck) {
                        reEnterPassword = privateKey.decrypt(reEnterPassword, 'utf8', 'base64');
                    }
                    else {
                        reEnterPassword = '';
                    }
                }
                else {
                    reEnterPassword = '';
                }

                */
    
                let requestBodyObject = {
                    name: req.body.name,
                    password: password,
                    reEnterPassword: reEnterPassword
                }
                let {isValid} = validateRestaurantRegisterInput(requestBodyObject,responseObject.message);
                if(!isValid) {
                    return res.json(responseObject);
                }
    
                bcrypt.hash(password,saltRounds).then(function(hashedPassword) {
                    const newRestaurant = new restaurantTempModel({
                        ownerID: id,
                        restaurantName: req.body.name
                    })
                    newRestaurant
                    .save()
                    .then(restaurant => {
                        const newManager = new managerModel({
                            restaurantID: restaurant.id,
                            password: hashedPassword
                        })
                        newManager
                        .save()
                        .then(manager => {
                            manager.updateOne({
                                username: manager.id
                            }).then(managerT => {
                                owner.totalRestaurantCount += 1;
                                owner.currentRestaurantCount += 1;
                                owner.save();
                                return res.json({
                                    ...responseObject,
                                    status: 'success'
                                });
                            })
                        })
                    })
                })
            })
        }
        else {
            responseObject.message.fatalError = 'You do not have permission to see this page';
            return res.json(responseObject);
        }
    })
});

router.post('/manager-login',function(req,res) {
    responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            username: '',
            password: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const mongoose = require('mongoose');
        const managerModel = require('../models/managerModel');
        const validateLoginInput = require('../validation/managerLoginValidation');
        const checkEmpty = require('../validation/checkEmpty');
        const validator = require('../validation/userValidationHelper');

        let password = checkEmpty(req.body.password);

        let passwordSign = checkEmpty(req.body.passwordSign);

        if(password && passwordSign) {
            let signCheck = signCheckKey.verify(password, passwordSign, 'utf8', 'base64');
            if(signCheck) {
                password = privateKey.decrypt(password, 'utf8', 'base64');
            }
            else {
                password = '';
            }
        }
        else {
            password = '';
        }

        let requestBodyObject = {
            username: req.body.username,
            password: password
        }

        let {isValid} = validateLoginInput(requestBodyObject,responseObject.message);
        if(!isValid) {
            return res.json(responseObject);
        }

        if(mongoose.Types.ObjectId.isValid(req.body.username)) {
            managerModel.findOne({_id: req.body.username,isDeleted: false},{'password': 1},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }
                else if(manager === null) {
                    responseObject.message.username = "No manager exists with this username or id";
                    return res.json(responseObject);
                }
                else {
                    var msg = validator.isValidPassword(password);
                    if(msg !== "true") {
                        responseObject.message.password = "Wrong password!! Try again";
                        return res.json(responseObject);
                    }
    
                    bcrypt.compare(password,manager.password).then(function(result) {
                        if(result) {
                            let jwtObject = {
                                managerID: manager.id
                            }
    
                            jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1d', algorithm: 'HS256'}, (err, token) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Token was not created';
                                    return res.json(responseObject);
                                }
                                else {
                                    const accessTokenModel = require('../models/accessTokenModel');
    
                                    const newAccessToken = new accessTokenModel({
                                        accessToken: token,
                                        userID: manager.id
                                    });
    
                                    newAccessToken
                                    .save()
                                    .then(accessToken => {
                                        let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                        let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                        let refreshToken = encryptedID + ' ' + signedID;

                                        responseObject.status = 'success';
                                        responseObject.accessToken = token;
                                        responseObject.refreshToken = refreshToken;
                                        return res.json(responseObject);
                                    })
                                }
                            });
                        }
                        else {
                            responseObject.message.password = "Wrong password!! Try again";
                            return res.json(responseObject);
                        }
                    });
                }
            });
        }
        else {
            managerModel.findOne({username: req.body.username,isDeleted: false},{'password': 1},(err,manager) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }

                if(manager !== null) {
                    var msg = validator.isValidPassword(password);
                    if(msg !== "true") {
                        responseObject.message.password = "Wrong password!! Try again";
                        return res.json(responseObject);
                    }

                    bcrypt.compare(password,manager.password).then(function(result) {
                        if(result) {
                            let jwtObject = {
                                managerID: manager.id
                            }

                            jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                                if(err) {
                                    responseObject.message.fatalError = 'Token was not created';
                                    return res.json(responseObject);
                                }
                                else {
                                    const accessTokenModel = require('../models/accessTokenModel');

                                    const newAccessToken = new accessTokenModel({
                                        accessToken: token,
                                        userID: manager.id
                                    });

                                    newAccessToken
                                    .save()
                                    .then(accessToken => {
                                        let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                        let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                        let refreshToken = encryptedID + ' ' + signedID;

                                        responseObject.status = 'success';
                                        responseObject.accessToken = token;
                                        responseObject.refreshToken = refreshToken;
                                        return res.json(responseObject);
                                    })
                                }
                            });
                        }
                        else {
                            responseObject.message.password = "Wrong password!! Try again";
                            return res.json(responseObject);
                        }
                    });
                }
                else {
                    responseObject.message.fatalError = "No manager exists with this username or id";
                    return res.json(responseObject);
                }
            })
        }
    })
});

router.post('/get-access-token-manager',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        },
        accessToken: '',
        refreshToken: ''
    }
    const accessTokenModel = require('../models/accessTokenModel');
    const managerModel = require('../models/managerModel');
    const checkSpam = require('../validation/spamFilter');
    const checkEmpty = require('../validation/checkEmpty');
    checkSpam(req,res,responseObject,(req,res) => {
        let accessToken = checkEmpty(req.body.accessToken);
        let refreshToken = checkEmpty(req.body.refreshToken);

        if(accessToken && refreshToken) {
            let refreshTokenPart = refreshToken.split(' ');

            if(!refreshTokenPart[1]) {
                responseObject.message.fatalError = 'Invalid refresh token';
                return res.json(responseObject);
            }

            let signCheck = signCheckKey.verify(refreshTokenPart[0], refreshTokenPart[1], 'utf8', 'base64');

            let accessTokenID;

            if(signCheck) {
                accessTokenID = privateKey.decrypt(refreshTokenPart[0], 'utf8', 'base64');
            }
            else {
                responseObject.message.fatalError = 'Invalid refresh token';
                return res.json(responseObject);
            }
            
            accessTokenModel.findOne({_id: accessTokenID},(err,accessTokenT) => {
                if(err) {
                    responseObject.message.fatalError = "Something went wrong!!";
                    return res.json(responseObject);
                }
                
                if((accessTokenT === null) || (accessTokenT.accessToken !== accessToken)) {
                    responseObject.message.fatalError = 'Invalid refresh token';
                    return res.json(responseObject);
                }

                managerModel.findOne({_id: accessTokenT.userID,isDeleted: false},(err,manager) => {
                    if(err || (manager === null)) {
                        responseObject.message.fatalError = 'Invalid refresh token';
                        return res.json(responseObject);
                    }

                    let jwtObject = {
                        managerID: accessTokenT.userID
                    }
    
                    jwt.sign({jwtObject}, 'ThisIsVerySecretStringMadeForJWT', {expiresIn: '1y', algorithm: 'HS256'}, (err, token) => {
                        if(err) {
                            responseObject.message.fatalError = 'Token was not created';
                            return res.json(responseObject);
                        }
                        else {
                            const accessTokenModel = require('../models/accessTokenModel');
    
                            const newAccessToken = new accessTokenModel({
                                accessToken: token,
                                userID: accessTokenT.userID
                            });
    
                            newAccessToken
                            .save()
                            .then(accessToken => {
                                accessTokenT.remove();
                                let encryptedID = publicKey.encrypt(accessToken.id, 'base64', 'utf8');
                                let signedID = signatureKey.sign(encryptedID, 'base64', 'utf8');
                                let refreshToken = encryptedID + ' ' + signedID;

                                responseObject.status = 'success';
                                responseObject.accessToken = token;
                                responseObject.refreshToken = refreshToken;
                                return res.json(responseObject);
                            })
                        }
                    });
                })
            });
        }
        else {
            responseObject.message.fatalError = 'Invalid request';
            return res.json(responseObject);
        }
    })
});

router.post('/change-password-manager',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: '',
            currentPassword: '',
            newPassword: '',
            reEnterNewPassword: ''
        }
    }
    const checkSpam = require('../validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        const managerModel = require('../models/managerModel');
        const validateLoginAuthenticity = require('../validation/isLoggedIn');

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
                    const validateChangePasswordInput = require('../validation/userChangePasswordValidation');
                    const validator = require('../validation/userValidationHelper');

                    let currentPassword = checkEmpty(req.body.currentPassword);
                    let currentPasswordSign = checkEmpty(req.body.currentPasswordSign);
                    let newPassword = checkEmpty(req.body.newPassword);
                    let newPasswordSign = checkEmpty(req.body.newPasswordSign);
                    let reEnterNewPassword = checkEmpty(req.body.reEnterNewPassword);
                    let reEnterNewPasswordSign = checkEmpty(req.body.reEnterNewPasswordSign);

                    if(currentPassword && currentPasswordSign) {
                        let signCheck = signCheckKey.verify(currentPassword, currentPasswordSign, 'utf8', 'base64');
                        if(signCheck) {
                            currentPassword = privateKey.decrypt(currentPassword, 'utf8', 'base64');
                        }
                        else {
                            currentPassword = '';
                        }
                    }
                    else {
                        currentPassword = '';
                    }

                    if(newPassword && newPasswordSign) {
                        let signCheck = signCheckKey.verify(newPassword, newPasswordSign, 'utf8', 'base64');
                        if(signCheck) {
                            newPassword = privateKey.decrypt(newPassword, 'utf8', 'base64');
                        }
                        else {
                            newPassword = '';
                        }
                    }
                    else {
                        newPassword = '';
                    }
                    
                    if(reEnterNewPassword && reEnterNewPasswordSign) {
                        let signCheck = signCheckKey.verify(reEnterNewPassword, reEnterNewPasswordSign, 'utf8', 'base64');
                        if(signCheck) {
                            reEnterNewPassword = privateKey.decrypt(reEnterNewPassword, 'utf8', 'base64');
                        }
                        else {
                            reEnterNewPassword = '';
                        }
                    }
                    else {
                        reEnterNewPassword = '';
                    }

                    let requestBodyObject = {
                        newPassword: newPassword,
                        reEnterNewPassword: reEnterNewPassword
                    }

                    let {isValid} = validateChangePasswordInput(requestBodyObject,responseObject.message);

                    var msg = validator.isValidPassword(currentPassword);
                    if(msg !== "true") {
                        isValid = false;
                        responseObject.message.currentPassword = "Wrong current password";
                    }
                    if(!isValid) {
                        return res.json(responseObject);
                    }

                    bcrypt.compare(currentPassword,manager.password).then(function(result) {
                        if(result) {
                            bcrypt.hash(newPassword,saltRounds).then(function(hashedPassword) {
                                manager.updateOne({
                                    password: hashedPassword
                                }).then(managerT => {
                                    responseObject.status = 'success';
                                    return res.json(responseObject);
                                })
                            })
                        }
                        else {
                            responseObject.message.currentPassword = "Wrong current password";
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