const userValidator = require('./userValidationHelper');
const checkEmpty = require('./checkEmpty');


module.exports = function validateRegisterInput(data,message) {
    let error = false;

    data.countryCode = checkEmpty(data.countryCode);
    data.phoneNumber = checkEmpty(data.phoneNumber);
    data.name = checkEmpty(data.name);

    if(!userValidator.isValidCountryCode(data.countryCode) || !userValidator.isValidPhoneNumber(data.phoneNumber)) {
        error = true;
    }
    
    if(error) {
        message.fatalError = 'Invalid request';
        return {
            message: message,
            isValid: false
        };
    }

    let msg = userValidator.isValidPassword(data.password);
    if(msg !== "true") {
        error = true;
        message.password = msg;
    }

    if(!data.reEnterPassword || (data.reEnterPassword.length > 200) || (data.password !== data.reEnterPassword)) {
        error = true;
        message.reEnterPassword = 'Passwords must match';
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
        message.name = 'Name must be between 2 to 200 characters';
    }

    return {
        message: message,
        isValid: !error
    };
}