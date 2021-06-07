const checkEmpty = require('./checkEmpty');
const validator = require('./validationHelper');

module.exports = function validatefoodItemInput(data,message) {
    let error = false;

    data.category = checkEmpty(data.category);
    data.subcategory = checkEmpty(data.subcategory);
    data.price = checkEmpty(data.price);
    data.description = checkEmpty(data.description);
    data.availableHours = checkEmpty(data.availableHours);

    if(!data.category) {
        error = true;
        message.category = 'Category is required';
    }
    else if(data.category.length > 50) {
        error = true;
        message.category = 'Category cannot have more than 50 characters';
    }

    if(!data.subcategory) {
        data.subcategory = 'Others';
    }
    else if(data.subcategory.length > 50) {
        error = true;
        message.subcategory = 'Subcategory cannot have more than 50 characters';
    }

    if(data.price !== 0) {
        if(!data.price) {
            error = true;
            message.price = 'Price is required';
        }
        else if(!((data.price === 0) || validator.isPositiveNumber(data.price))) {
            error = true;
            message.price = 'Enter a valid price';
        }
        else if(data.price > 999999999999999) {
            error = true;
            message.price = 'Price is too high';
        }
        else {
            data.price = (Math.round(data.price*100)/100);
        }
    }

    if(data.options) {
        if(!Array.isArray(data.options)) {
            error = true;
            message.options = 'Invalid options array';
        }
        else if(data.options.length < 1) {
            error = true;
            message.options = 'Invalid options array';
        }
        else if(data.options.length > 20) {
            error = true;
            message.options = 'Maximum 20 options are allowed for one food item';
        }
        else {
            let optionNameArray = [];
            let breakIndicator = false;
            for(i in data.options) {
                if(!(data.options[i].optionName && data.options[i].options)) {
                    error = true;
                    message.options = 'Invalid options array';

                    break;
                }
                else if(data.options[i].optionName.length > 50) {
                    error = true;
                    message.options = 'Option name can be maximum 50 characters';

                    break;
                }
                else if(!Array.isArray(data.options[i].options)) {
                    error = true;
                    message.options = 'Invalid options array';

                    break;
                }
                else if(data.options[i].options.length < 1) {
                    error = true;
                    message.options = 'Invalid options array';

                    break;
                }
                else if(data.options[i].options.length > 100) {
                    error = true;
                    message.options = 'Maximum 100 options are allowed under one option name';

                    break;
                }
                else {
                    let optionArray = [];

                    optionNameArray.push(data.options[i].optionName);
                    
                    for(j in data.options[i].options) {
                        if(data.options[i].options[j].option.length > 50) {
                            error = true;
                            message.options = 'Option can be maximum 50 characters';

                            breakIndicator = true;
                            break;
                        }

                        optionArray.push(data.options[i].options[j].option);

                        if(!((data.options[i].options[j].extraPrice === 0) || validator.isPositiveNumber(data.options[i].options[j].extraPrice))) {
                            error = true;
                            message.options = 'Invalid order';

                            breakIndicator = true;
                            break;
                        }
                        else if((data.options[i].options[j].extraPrice > 999999999999999)) {
                            error = true;
                            message.options = 'Extra price is too high';

                            breakIndicator = true;
                            break;
                        }
                        else {
                            data.options[i].options[j].extraPrice = (Math.round(data.options[i].options[j].extraPrice*100)/100);
                        }
                    }

                    if(breakIndicator) {
                        break;
                    }

                    if(validator.findDuplicates(optionArray).length) {
                        error = true;
                        message.options = 'An option cannot be used more than once under the same option name';

                        break;
                    }
                }
            }

            if(validator.findDuplicates(optionNameArray).length) {
                error = true;
                message.options = 'An option name cannot be used more than once';
            }
        }
    }

    if(!data.description) {
        error = true;
        message.description = 'Description is required';
    }
    else if(data.description.length < 2) {
        error = true;
        message.description = 'Description is too short';
    }
    else if(data.description.length > 5000) {
        error = true;
        message.description = 'Description length must be within 2 to 5000 characters';
    }

    if(!validator.isValidOpeningHours(data.availableHours)) {
        error = true;
        message.availableHours = 'Invalid available hours';
    }
    else if(!validator.isAvailableHoursWithinOpeningHours(data.openingHours,data.availableHours)) {
        error = true;
        message.availableHours = "Available hours should be within opening hours' time range";
    }

    return {
        message: message,
        isValid: !error
    };
}