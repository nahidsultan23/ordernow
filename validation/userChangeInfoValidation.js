var validator = require('validator');
const checkEmpty = require('./checkEmpty');

module.exports = function validateChangeInfoInput(data,message) {
    let error = false;

    data.name = checkEmpty(data.name);
    data.email = checkEmpty(data.email);

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

    if(data.email && !validator.isEmail(data.email)) {
        error = true;
        message.email = 'Enter a valid email address';
    }

    return {
        message: message,
        isValid: !error
    };
}