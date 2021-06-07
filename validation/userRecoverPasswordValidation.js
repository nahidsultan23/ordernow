const userValidator = require('./userValidationHelper');
const checkEmpty = require('./checkEmpty');


module.exports = function validateRecoverPasswordInput(data,message) {
    let error = false;

    data.countryCode = checkEmpty(data.countryCode);
    data.phoneNumber = checkEmpty(data.phoneNumber);
    data.password = checkEmpty(data.password);
    data.reEnterPassword = checkEmpty(data.reEnterPassword);

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

    return {
        message: message,
        isValid: !error
    };
}