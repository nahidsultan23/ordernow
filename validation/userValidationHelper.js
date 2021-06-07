const isValidCountryCode = countryCode => {
    if(!countryCode || countryCode !== 'Bangladesh (+880)')
        return false;

    return true;
}

const isValidPhoneNumber = phoneNumber => {
    const pattern = /^0?[^0]\d{9}$/;
    if(!phoneNumber || !pattern.test(phoneNumber))
        return false;

    return true;
}

const isValidPassword = password => {
    if(!password)
        return 'Enter a valid password';
    if(password.length < 6)
         return 'Password must be at least 6 characters';
    if(password.length > 200)
        return  'Password must be between 6 to 200 characters';

    return 'true';
}

module.exports = {
    isValidCountryCode: isValidCountryCode,
    isValidPhoneNumber: isValidPhoneNumber,
    isValidPassword: isValidPassword
};