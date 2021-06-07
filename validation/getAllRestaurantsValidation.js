const checkEmpty = require('./checkEmpty');
const validator = require('./validationHelper');

module.exports = function validateGetAllRestaurantsInput(data,message) {
    let error = false;

    data.lat = checkEmpty(data.lat);
    data.long = checkEmpty(data.long);

    if(data.lat && data.long) {
        if(!validator.isValidLatitude(data.lat)) {
            error = true;
            message.fatalError = 'Invalid coordinate';
        }
        else if(!validator.isValidLongitude(data.long)) {
            error = true;
            message.fatalError = 'Invalid coordinate';
        }
    }
    else if(data.lat) {
        error = true;
        message.fatalError = 'Invalid coordinate';
    }
    else if(data.long) {
        error = true;
        message.fatalError = 'Invalid coordinate';
    }

    return {
        message: message,
        isValid: !error
    };
}