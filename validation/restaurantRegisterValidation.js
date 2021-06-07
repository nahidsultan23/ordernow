const userValidator = require('./userValidationHelper');
const checkEmpty = require('./checkEmpty');

module.exports = function validateRestaurantRegisterInput(data,message) {
    let error = false;

    data.name = checkEmpty(data.name);

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
        message.name = 'Restaurant name is required';
    }
    else if(data.name.length < 2) {
        error = true;
        message.name = 'Restaurant name must be at least 2 characters';
    }
    else if(data.name.length > 200) {
        error = true;
        message.name = 'Restaurant name must be within 2 to 200 characters';
    }

    return {
        message: message,
        isValid: !error
    };
}