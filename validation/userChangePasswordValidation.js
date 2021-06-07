const userValidator = require('./userValidationHelper');

module.exports = function validateChangePasswordInput(data,message) {
    let error = false;

    let msg = userValidator.isValidPassword(data.newPassword);
    if(msg !== "true") {
        error = true;
        message.newPassword = msg;
    }

    if(!data.reEnterNewPassword || (data.reEnterNewPassword.length > 200) || (data.newPassword !== data.reEnterNewPassword)) {
        error = true;
        message.reEnterNewPassword = 'Passwords must match';
    }

    return {
        message: message,
        isValid: !error
    };
}