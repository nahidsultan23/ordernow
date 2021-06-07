const convertTime = (date,offset) => {
    let timestamp = date.getTime();
    let newTimestamp = timestamp + Number(offset) * 3600 * 1000;
    return new Date(newTimestamp);
}

module.exports = {
    convertTime: convertTime
};