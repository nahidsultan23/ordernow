const checkEmpty = require('./checkEmpty');
const validator = require('./validationHelper');

module.exports = function updateRestaurantInput(data,message) {
    let error = false;

    data.description = checkEmpty(data.description);
    data.governmentCharge = checkEmpty(data.governmentCharge);
    data.governmentChargeDescription = checkEmpty(data.governmentChargeDescription);
    data.governmentChargeRegNo = checkEmpty(data.governmentChargeRegNo);
    data.serviceCharge = checkEmpty(data.serviceCharge);
    data.serviceChargeDescription = checkEmpty(data.serviceChargeDescription);
    data.phoneNumber = checkEmpty(data.phoneNumber);
    data.email = checkEmpty(data.email);
    data.lat = checkEmpty(data.lat);
    data.long = checkEmpty(data.long);
    data.address = checkEmpty(data.address);
    data.instruction = checkEmpty(data.instruction);
    data.openingHours = checkEmpty(data.openingHours);
    data.midBreaks = checkEmpty(data.midBreaks);
    data.tableID = checkEmpty(data.tableID);
    data.associates = checkEmpty(data.associates);
    data.discountCoupon = checkEmpty(data.discountCoupon);
    data.paymentMethod = checkEmpty(data.paymentMethod);
    data.paymentMessage = checkEmpty(data.paymentMessage);
    data.serviceMessage = checkEmpty(data.serviceMessage);

    if(data.description) {
        if(data.description.length < 5) {
            error = true;
            message.description = 'Description length must be at least 5 characters';
        }
        else if(data.description.length > 5000) {
            error = true;
            message.description = 'Description length must be within 5 to 5000 characters';
        }
    }
    else {
        error = true;
        message.description = 'Description is required';
    }

    if(data.governmentCharge) {
        if(!validator.isNumber(data.governmentCharge)) {
            error = true;
            message.governmentCharge = 'Enter a valid government charge';
        }
        else if(data.governmentCharge > 9999) {
            error = true;
            message.governmentCharge = 'Government charge is too big';
        }
        else {
            data.governmentCharge = Math.round(data.governmentCharge*100)/100;
        }

        if(!data.governmentChargeDescription) {
            error = true;
            message.governmentChargeDescription = 'Government charge description is required';
        }
        else if(data.governmentChargeDescription.length > 100) {
            data.governmentChargeDescription = data.governmentChargeDescription.substring(0, 100);
        }

        if(!data.governmentChargeRegNo) {
            error = true;
            message.governmentChargeRegNo = 'Government charge registration number is required';
        }
        else if(data.governmentChargeRegNo.length > 100) {
            data.governmentChargeRegNo = data.governmentChargeRegNo.substring(0, 100);
        }
    }

    if(data.serviceCharge) {
        if(!validator.isNumber(data.serviceCharge)) {
            error = true;
            message.serviceCharge = 'Enter a valid service charge';
        }
        else if(data.serviceCharge > 9999) {
            error = true;
            message.serviceCharge = 'Service charge is too big';
        }
        else {
            data.serviceCharge = Math.round(data.serviceCharge*100)/100;
        }

        if(!data.serviceChargeDescription) {
            error = true;
            message.serviceChargeDescription = 'Service charge description is required';
        }
        else if(data.serviceChargeDescription.length > 100) {
            data.serviceChargeDescription = data.serviceChargeDescription.substring(0, 100);
        }
    }

    if(data.phoneNumber) {
        if(!Array.isArray(data.phoneNumber)) {
            error = true;
            message.phoneNumber = 'Invalid phone number array';
        }
        else if(data.phoneNumber.length > 10) {
            error = true;
            message.phoneNumber = 'Maximum 10 phone numbers can be entered';
        }
        else {
            let i = 0;
            let j = 0;
            while(data.phoneNumber[i]) {
                if(data.phoneNumber[i].length > 50) {
                    error = true;
                    message.phoneNumberArray[j] = {
                        serial: i,
                        phoneNumber: data.phoneNumber[i],
                        message: 'Enter a valid phone number'
                    };
                    j++;
                }
                i++;
            }
        }
    }
    else {
        error = true;
        message.phoneNumber = 'Phone number is required';
    }

    if(data.email) {
        var validatorDefault = require('validator');
        if(!Array.isArray(data.email)) {
            error = true;
            message.email = 'Invalid email address array';
        }
        else if(data.email.length > 10) {
            error = true;
            message.email = 'Maximum 10 email addresses can be entered';
        }
        else {
            let i = 0;
            let j = 0;
            while(data.email[i]) {
                if(!validatorDefault.isEmail(data.email[i])) {
                    error = true;
                    message.emailArray[j] = {
                        serial: i,
                        email: data.email[i],
                        message: 'Enter a valid email address'
                    };
                    j++;
                }
                i++;
            }
        }
    }

    if(!(data.lat && validator.isValidLatitude(data.lat))) {
        error = true;
        message.coordinate = 'Enter a valid coordinate';
    }
    else {
        data.lat = Math.round(data.lat*1000000000000000)/1000000000000000;
    }

    if(!(data.long && validator.isValidLongitude(data.long))) {
        error = true;
        message.coordinate = 'Enter a valid coordinate';
    }
    else {
        data.long = Math.round(data.long*1000000000000000)/1000000000000000;
    }

    if(!data.address) {
        error = true;
        message.address = 'Address is required';
    }
    else if(data.address.length < 5) {
        error = true;
        message.address = 'Address must be at least 5 characters';
    }
    else if(data.address.length > 2000) {
        error = true;
        message.address = 'Address must be within 5 to 2000 characters';
    }

    if(data.instruction) {
        if(data.instruction.length > 2000) {
            error = true;
            message.instruction = 'Instruction can be maximum 2000 characters long';
        }
    }

    if(!validator.isValidOpeningHours(data.openingHours)) {
        error = true;
        message.openingHours = 'Enter valid opening hours';
    }

    if(data.isMidBreakApplicable) {
        if(!validator.isValidOpeningHours(data.midBreaks)) {
            error = true;
            message.midBreaks = 'Enter valid mid break hours';
        }
        else if(!message.openingHours) {
            if(!validator.isMidBreaksWithinOpeningHours(data.openingHours,data.midBreaks)) {
                error = true;
                message.midBreaks = "Mid breaks should be within opening hours' time range";
            }
        }
    }

    if(data.tableID) {
        if(!Array.isArray(data.tableID)) {
            error = true;
            message.tableID = 'Invalid table ID array';
        }
        else if(!data.tableID.length) {
            error = true;
            message.tableID = 'Minimum one table ID is required';
        }
        else {
            if(data.tableID.length > 1000) {
                error = true;
                message.tableID = 'Maximum 1000 table IDs are allowed';
            }

            let i = 0;
            let j = 0;
            while(data.tableID[i]) {
                if(data.tableID[i].length > 20) {
                    error = true;
                    message.tableIDArray[j] = {
                        serial: i,
                        tableID: data.tableID[i],
                        message: 'A table ID can have maximum 20 characters'
                    };
                    j++;
                }
                i++;
            }
        }
    }
    else {
        error = true;
        message.tableID = 'Table ID is required';
    }

    if(data.associates) {
        if(!Array.isArray(data.associates)) {
            error = true;
            message.associates = 'Invalid associates array';
        }
        else if(data.associates.length) {
            if(data.associates.length > 10000) {
                error = true;
                message.associates = 'Maximum 10000 associates can be added';
            }

            let i = 0;
            let j = 0;
            while(data.associates[i]) {
                data.associates[i] = data.associates[i].replace(/ +(?= )/g,'');
                data.associates[i] = data.associates[i].trim();

                if(data.associates[i].length > 25) {
                    error = true;
                    message.associatesArray[j] = {
                        serial: i,
                        associates: data.associates[i],
                        message: 'An associate\'s name can have maximum 25 characters'
                    };
                    j++;
                }
                i++;
            }
        }
    }
    else {
        data.associates = [];
    }

    if(data.discountCoupon) {
        if(!Array.isArray(data.discountCoupon)) {
            error = true;
            message.discountCoupon = 'Invalid discount coupon array';
        }
        else if(data.discountCoupon.length) {
            if(data.discountCoupon.length > 100) {
                error = true;
                message.discountCoupon = 'Maximum 100 discount coupons can be added';
            }

            let i = 0;
            let j = 0;
            while(data.discountCoupon[i]) {
                let discountCoupon = {
                    name: data.discountCoupon[i].name,
                    type: (data.discountCoupon[i].type === 'Amount') ? 'Amount' : 'Percentage',
                    discount: data.discountCoupon[i].discount,
                    applyTo: (data.discountCoupon[i].applyTo === 'Subtotal') ? 'Subtotal' : 'Grand Total',
                    minOrder: data.discountCoupon[i].minOrder ? data.discountCoupon[i].minOrder : '',
                    maxAmount: data.discountCoupon[i].maxAmount ? data.discountCoupon[i].maxAmount : ''
                }

                let message = {
                    name: '',
                    discount: '',
                    minOrder: '',
                    maxAmount: ''
                }

                discountCoupon.name = discountCoupon.name.replace(/ +(?= )/g,'');
                discountCoupon.name = discountCoupon.name.trim();

                if(discountCoupon.name.length > 25) {
                    error = true;
                    message.name = 'Discount coupon\'s name can have maximum 25 characters';
                }

                if(!validator.isPositiveNumber(discountCoupon.discount)) {
                    error = true;
                    message.discount = 'Discount must be a positive number';
                }
                else if((discountCoupon.type === 'Percentage') && (discountCoupon.discount > 100)) {
                    error = true;
                    message.discount = 'Discount cannot be bigger than 100';
                }
                else if(discountCoupon.discount > 999999999999999999999999999999) {
                    error = true;
                    message.discount = 'Discount amount is too big';
                }
                else {
                    discountCoupon.discount = Math.round(discountCoupon.discount*100)/100;
                }

                if((discountCoupon.minOrder !== 0) && discountCoupon.minOrder) {
                    if(!validator.isPositiveNumber(discountCoupon.minOrder)) {
                        error = true;
                        message.minOrder = 'Minimum order amount must be 0 or a positive number';
                    }
                    else if(discountCoupon.minOrder > 999999999999999999999999999999) {
                        error = true;
                        message.minOrder = 'Minimum order amount is too big';
                    }
                    else {
                        discountCoupon.minOrder = Math.round(discountCoupon.minOrder*100)/100;
                    }
                }
                else {
                    discountCoupon.minOrder = 0;
                }

                if(discountCoupon.type === 'Percentage') {
                    if(discountCoupon.maxAmount) {
                        if(!validator.isPositiveNumber(discountCoupon.maxAmount)) {
                            error = true;
                            message.maxAmount = 'Maximum discount amount must be a positive number';
                        }
                        else if(discountCoupon.maxAmount > 999999999999999999999999999999) {
                            error = true;
                            message.maxAmount = 'Maximum discount amount is too big';
                        }
                        else {
                            discountCoupon.maxAmount = Math.round(discountCoupon.maxAmount*100)/100;
                        }
                    }
                }
                else {
                    discountCoupon.maxAmount = ''
                }

                if(error) {
                    message.discountCouponArray[j] = {
                        serial: i,
                        discountCoupon: data.discountCoupon[i],
                        message: message
                    };
                    j++;
                }
                else {
                    data.discountCoupon[i] = discountCoupon;
                }

                i++;
            }
        }
    }
    else {
        data.discountCoupon = [];
    }

    if(data.paymentMethod){
        if(!Array.isArray(data.paymentMethod)) {
            error = true;
            message.paymentMethod = 'Invalid payment method array';
        }
        else if(data.paymentMethod.length) {
            if(data.paymentMethod.length > 1000) {
                error = true;
                message.paymentMethod = 'Maximum 1000 payment methods are allowed';
            }
        }
    }
    else {
        error = true;
        message.paymentMethod = 'At least one payment method is required';
    }

    if(!data.paymentMessage) {
        error = true;
        message.paymentMessage = 'Payment message is required';
    }
    else if(!((data.paymentMessage === 'Please pay your bill at the counter') || (data.paymentMessage === 'Please wait until a waiter or waitress comes to you and assists to complete the payment'))) {
        error = true;
        message.paymentMessage = 'Enter a valid payment message';
    }

    if(!data.serviceMessage) {
        error = true;
        message.serviceMessage = 'Service message is required';
    }
    else if(!((data.serviceMessage === 'Please collect your food from the counter') || (data.serviceMessage === 'Please wait for some time and a waiter or waitress will serve the food at your table'))) {
        error = true;
        message.serviceMessage = 'Enter a valid service message';
    }

    return {
        message: message,
        isValid: !error
    };
}