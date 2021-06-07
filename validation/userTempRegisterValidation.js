const validator = require('./userValidationHelper');
const checkEmpty = require('./checkEmpty');

module.exports = function validateTempRegisterInput(data,message) {
    let error = false;

    data.countryCode = checkEmpty(data.countryCode);
    data.phoneNumber = checkEmpty(data.phoneNumber);

    if(!(data.countryCode && data.phoneNumber)) {
        message.fatalError = 'Invalid request';
        return {
            message: message,
            isValid: false
        };
    }
    
    if(!validator.isValidCountryCode(data.countryCode)) {
        error = true;
        message.countryCode = 'Enter a valid country code';
    }
    if(!validator.isValidPhoneNumber(data.phoneNumber)) {
        error = true;
        message.phoneNumber = 'Enter a valid phone number';
    }
    else {
        data.phoneNumber = data.phoneNumber.replace(/^0/,'');
    }

    return {
        message: message,
        isValid: !error
    };
}