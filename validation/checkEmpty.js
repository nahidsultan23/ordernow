const checkEmpty = (value) => {
    if(typeof value === 'string') {
        value = value.trim();
        if(value === '') {
            value = undefined;
        }
    }
    else if ( value === null || (typeof value === 'object' && Object.keys(value).length === 0)) {
        value = undefined;
    }
    return value;
}

module.exports = checkEmpty;