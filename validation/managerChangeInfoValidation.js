var validator = require('validator');
const checkEmpty = require('./checkEmpty');

module.exports = function validateChangeInfoInput(data,message) {
    let error = false;

    data.username = checkEmpty(data.username);
    data.name = checkEmpty(data.name);
    data.phoneNumber = checkEmpty(data.phoneNumber);
    data.email = checkEmpty(data.email);

    if(!data.username) {
        error = true;
        message.username = 'Username is required';
    }
    else if(data.username.length < 2) {
        error = true;
        message.username = 'Username must be at least 2 characters';
    }
    else if(data.username.length > 200) {
        error = true;
        message.username = 'Username must be within 2 to 200 characters';
    }
    
    if(!data.name) {
        error = true;
        message.name = 'Name is required';
    }
    else if(data.name.length < 2) {
        error = true;
        message.name = 'Name must be at least 2 characters';
    }
    else if(data.name.length > 200) {
        error = true;
        message.name = 'Name must be within 2 to 200 characters';
    }

    if(data.phoneNumber) {
        if(data.phoneNumber.length > 50) {
            error = true;
            message.phoneNumber = 'Enter a valid phone number';
        }
    }

    if(data.email && !validator.isEmail(data.email)) {
        error = true;
        message.email = 'Enter a valid email address';
    }

    return {
        message: message,
        isValid: !error
    };
}