const jwt = require('jsonwebtoken');
const checkEmpty = require('./checkEmpty');

module.exports = function validateLoginAuthenticity(accessToken,message) {
    let error = false;
    let userType = '';
    let id = '';

    accessToken = checkEmpty(accessToken);
    
    if(!accessToken) {
        error = true;
        message.fatalError = 'Authentication failed';
    }
    else {
        jwt.verify(accessToken, 'ThisIsVerySecretStringMadeForJWT', (err, authData) => {
            if(err || (authData === null)) {
                error = true;
                message.fatalError = 'Authentication failed';
            }
            else {
                if(authData.jwtObject.userID) {
                    userType = 'user';
                    id = authData.jwtObject.userID;
                }
                else if(authData.jwtObject.ownerID) {
                    userType = 'owner';
                    id = authData.jwtObject.ownerID;
                }
                else if(authData.jwtObject.managerID) {
                    userType = 'manager';
                    id = authData.jwtObject.managerID;
                }
            }
        })
    }
    
    return {
        message: message,
        isValid: !error,
        userType: userType,
        id: id
    };
}