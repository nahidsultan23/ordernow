var validator = require('./validationHelper');

module.exports = function validateCreateOrderInput(data,message) {
    let error = false;
    let checkableArray = [];

    if(data.length > 100) {
        error = true;
        message.order = 'Maximum 100 items are allowed in one order';
    }
    else {
        let breakHappened = 0;
        for(i in data) {
            let foodItemID = data[i].foodItemID;
            let options = '';
            let optionsArray = [];
            let optionNameArray = [];
    
            if(data[i].options.length > 0) {
                if(data[i].options.length > 20) {
                    error = true;
                    message.order = 'Invalid order';
                    breakHappened = 1;
                    break;
                }
                for(j in data[i].options) {
                    optionsArray.push(data[i].options[j].optionName+data[i].options[j].option);
                    optionNameArray.push(data[i].options[j].optionName);
                }
            }

            if(validator.findDuplicates(optionNameArray).length) {
                error = true;
                message.order = 'Duplicate option names are not allowed';
                breakHappened = 1;
                break;
            }
    
            if(optionsArray.length > 0) {
                optionsArray.sort();
                for(j in optionsArray) {
                    options = options + optionsArray[j];
                }
            }
    
            checkableArray.push(foodItemID+options);
        }
    
        if((breakHappened === 0) && validator.findDuplicates(checkableArray).length) {
            error = true;
            message.order = 'Duplicate items are not allowed';
        }
    }

    return {
        message: message,
        isValid: !error
    };
}