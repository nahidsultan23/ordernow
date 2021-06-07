const checkEmpty = require('./checkEmpty');

module.exports = function validateLoginInput(data,message) {
    let error = false;

    data.username = checkEmpty(data.username);

    if(!data.username) {
        error = true;
        message.username = 'Please enter a valid username or id';
    }
    else if(data.username.length < 2) {
        error = true;
        message.username = 'Username must be at least 2 characters';
    }
    else if(data.length > 200) {
        error = true;
        message.username = 'Username must be between 2 to 200 characters';
    }
    else if(/\s/.test(data.username)) {
        error = true;
        message.username = 'Username can not have spaces';
    }

    return { message: message,isValid: !error};
}