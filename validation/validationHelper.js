const isValidObjectID = id => {
    if(!id || !/^[0-9a-fA-F]{24}$/.test(id))
        return false;

    return true;
}

const isPositiveNumber = number => {
    if(!number || !/^\+?\d+(\.\d+)?$/.test(number))
        return false;

    return true;
}

const isNumber = number => {
    if(!number || !/^[+-]?\d+(\.\d+)?$/.test(number))
        return false;

    return true;
}

const isBoolean = val => {
    if(!val || !/^true|false$/.test(val))
        return false;

    return true;
}

const isValidLatitude = lat => {
    if(!isNumber(lat) || lat > 90 || lat < -90)
        return false;
    
    return true;
}

const isValidLongitude = long => {
    if(!isNumber(long) || long > 180 || long < -180)
        return false;
    
    return true;
}

const isValidDimension = dim => {
    if(typeof dim !== 'object' || !isPositiveNumber(dim[0]) || !isPositiveNumber(dim[1]) || !isPositiveNumber(dim[2]))
        return false;
    
    return true;
}

const isValidString = (str,min,max) => {
    if(typeof str !== 'string')
        return false;
    if(min && str.length < min)
        return false;
    if(max && str.length > max)
        return false;

    return true;
}

const isValidTime = (timeString) => {
    if(!timeString)
        return false;
    if(timeString.split(':').length !== 3)
        return false;
    if(!(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/.test(timeString)))
        return false;

    return true;
}

const timeToSeconds = (timeString) => {
    let splittedTime = timeString.split(':');
    return Number(splittedTime[0]) * 3600 + Number(splittedTime[1]) * 60 + Number(splittedTime[2]);
}

const isValidOpeningHours = (openingHoursString) => {
    if(!openingHoursString)
        return false;
    else if(openingHoursString.everyday) {
        if(!(openingHoursString.everyday.from && openingHoursString.everyday.to))
            return false;
        if(!(isValidTime(openingHoursString.everyday.from) && isValidTime(openingHoursString.everyday.to)))
            return false;
        if(timeToSeconds(openingHoursString.everyday.from) >= timeToSeconds(openingHoursString.everyday.to))
            return false;
    }
    else if(!(openingHoursString.sunday || openingHoursString.monday || openingHoursString.tuesday || openingHoursString.wednesday || openingHoursString.thursday || openingHoursString.friday || openingHoursString.saturday)) {
        return false;
    }
    else {
        if(openingHoursString.sunday) {
            if(!(openingHoursString.sunday.from && openingHoursString.sunday.to))
                return false;
            else if(!(isValidTime(openingHoursString.sunday.from) && isValidTime(openingHoursString.sunday.to)))
                return false;
            else if(timeToSeconds(openingHoursString.sunday.from) >= timeToSeconds(openingHoursString.sunday.to))
                return false;
        }

        if(openingHoursString.monday) {
            if(!(openingHoursString.monday.from && openingHoursString.monday.to))
                return false;
            else if(!(isValidTime(openingHoursString.monday.from) && isValidTime(openingHoursString.monday.to)))
                return false;
            else if(timeToSeconds(openingHoursString.monday.from) >= timeToSeconds(openingHoursString.monday.to))
                return false;
        }

        if(openingHoursString.tuesday) {
            if(!(openingHoursString.tuesday.from && openingHoursString.tuesday.to))
                return false;
            else if(!(isValidTime(openingHoursString.tuesday.from) && isValidTime(openingHoursString.tuesday.to)))
                return false;
            else if(timeToSeconds(openingHoursString.tuesday.from) >= timeToSeconds(openingHoursString.tuesday.to))
                return false;
        }

        if(openingHoursString.wednesday) {
            if(!(openingHoursString.wednesday.from && openingHoursString.wednesday.to))
                return false;
            else if(!(isValidTime(openingHoursString.wednesday.from) && isValidTime(openingHoursString.wednesday.to)))
                return false;
            else if(timeToSeconds(openingHoursString.wednesday.from) >= timeToSeconds(openingHoursString.wednesday.to))
                return false;
        }

        if(openingHoursString.thursday) {
            if(!(openingHoursString.thursday.from && openingHoursString.thursday.to))
                return false;
            else if(!(isValidTime(openingHoursString.thursday.from) && isValidTime(openingHoursString.thursday.to)))
                return false;
            else if(timeToSeconds(openingHoursString.thursday.from) >= timeToSeconds(openingHoursString.thursday.to))
                return false;
        }

        if(openingHoursString.friday) {
            if(!(openingHoursString.friday.from && openingHoursString.friday.to))
                return false;
            else if(!(isValidTime(openingHoursString.friday.from) && isValidTime(openingHoursString.friday.to)))
                return false;
            else if(timeToSeconds(openingHoursString.friday.from) >= timeToSeconds(openingHoursString.friday.to))
                return false;
        }

        if(openingHoursString.saturday) {
            if(!(openingHoursString.saturday.from && openingHoursString.saturday.to))
                return false;
            else if(!(isValidTime(openingHoursString.saturday.from) && isValidTime(openingHoursString.saturday.to)))
                return false;
            else if(timeToSeconds(openingHoursString.saturday.from) >= timeToSeconds(openingHoursString.saturday.to))
                return false;
        }
    }

    return true;
}

const isMidBreaksWithinOpeningHours = (openingHoursString, midBreaksString) => {
    if(openingHoursString.everyday) {
        openingHoursString.sunday = openingHoursString.everyday;
        openingHoursString.monday = openingHoursString.everyday;
        openingHoursString.tuesday = openingHoursString.everyday;
        openingHoursString.wednesday = openingHoursString.everyday;
        openingHoursString.thursday = openingHoursString.everyday;
        openingHoursString.friday = openingHoursString.everyday;
        openingHoursString.saturday = openingHoursString.everyday;
    }

    if(midBreaksString.everyday) {
        midBreaksString.sunday = midBreaksString.everyday;
        midBreaksString.monday = midBreaksString.everyday;
        midBreaksString.tuesday = midBreaksString.everyday;
        midBreaksString.wednesday = midBreaksString.everyday;
        midBreaksString.thursday = midBreaksString.everyday;
        midBreaksString.friday = midBreaksString.everyday;
        midBreaksString.saturday = midBreaksString.everyday;
    }

    if(!openingHoursString.everyday) {
        midBreaksString.everyday = null;
    }

    if(openingHoursString.everyday && midBreaksString.everyday) {
        if((timeToSeconds(midBreaksString.everyday.from) <= timeToSeconds(openingHoursString.everyday.from)) || (timeToSeconds(midBreaksString.everyday.from) >= timeToSeconds(openingHoursString.everyday.to))) {
            return false;
        }
        else if(timeToSeconds(midBreaksString.everyday.to) >= timeToSeconds(openingHoursString.everyday.to)) {
            return false;
        }
    }
    else {
        if(midBreaksString.sunday) {
            if(openingHoursString.sunday) {
                if((timeToSeconds(midBreaksString.sunday.from) <= timeToSeconds(openingHoursString.sunday.from)) || (timeToSeconds(midBreaksString.sunday.from) >= timeToSeconds(openingHoursString.sunday.to))) {
                    return false;
                }
                else if(timeToSeconds(midBreaksString.sunday.to) >= timeToSeconds(openingHoursString.sunday.to)) {
                    return false;
                }
            }
            else {
                midBreaksString.sunday = null;
            }
        }
    
        if(midBreaksString.monday) {
            if(openingHoursString.monday) {
                if((timeToSeconds(midBreaksString.monday.from) <= timeToSeconds(openingHoursString.monday.from)) || (timeToSeconds(midBreaksString.monday.from) >= timeToSeconds(openingHoursString.monday.to))) {
                    return false;
                }
                else if(timeToSeconds(midBreaksString.monday.to) >= timeToSeconds(openingHoursString.monday.to)) {
                    return false;
                }
            }
            else {
                midBreaksString.monday = null;
            }
        }
    
        if(midBreaksString.tuesday) {
            if(openingHoursString.tuesday) {
                if((timeToSeconds(midBreaksString.tuesday.from) <= timeToSeconds(openingHoursString.tuesday.from)) || (timeToSeconds(midBreaksString.tuesday.from) >= timeToSeconds(openingHoursString.tuesday.to))) {
                    return false;
                }
                else if(timeToSeconds(midBreaksString.tuesday.to) >= timeToSeconds(openingHoursString.tuesday.to)) {
                    return false;
                }
            }
            else {
                midBreaksString.tuesday = null;
            }
        }
    
        if(midBreaksString.wednesday) {
            if(openingHoursString.wednesday) {
                if((timeToSeconds(midBreaksString.wednesday.from) <= timeToSeconds(openingHoursString.wednesday.from)) || (timeToSeconds(midBreaksString.wednesday.from) >= timeToSeconds(openingHoursString.wednesday.to))) {
                    return false;
                }
                else if(timeToSeconds(midBreaksString.wednesday.to) >= timeToSeconds(openingHoursString.wednesday.to)) {
                    return false;
                }
            }
            else {
                midBreaksString.wednesday = null;
            }
        }
    
        if(midBreaksString.thursday) {
            if(openingHoursString.thursday) {
                if((timeToSeconds(midBreaksString.thursday.from) <= timeToSeconds(openingHoursString.thursday.from)) || (timeToSeconds(midBreaksString.thursday.from) >= timeToSeconds(openingHoursString.thursday.to))) {
                    return false;
                }
                else if(timeToSeconds(midBreaksString.thursday.to) >= timeToSeconds(openingHoursString.thursday.to)) {
                    return false;
                }
            }
            else {
                midBreaksString.thursday = null;
            }
        }
    
        if(midBreaksString.friday) {
            if(openingHoursString.friday) {
                if((timeToSeconds(midBreaksString.friday.from) <= timeToSeconds(openingHoursString.friday.from)) || (timeToSeconds(midBreaksString.friday.from) >= timeToSeconds(openingHoursString.friday.to))) {
                    return false;
                }
                else if(timeToSeconds(midBreaksString.friday.to) >= timeToSeconds(openingHoursString.friday.to)) {
                    return false;
                }
            }
            else {
                midBreaksString.friday = null;
            }
        }
    
        if(midBreaksString.saturday) {
            if(openingHoursString.saturday) {
                if((timeToSeconds(midBreaksString.saturday.from) <= timeToSeconds(openingHoursString.saturday.from)) || (timeToSeconds(midBreaksString.saturday.from) >= timeToSeconds(openingHoursString.saturday.to))) {
                    return false;
                }
                else if(timeToSeconds(midBreaksString.saturday.to) >= timeToSeconds(openingHoursString.saturday.to)) {
                    return false;
                }
            }
            else {
                midBreaksString.saturday = null;
            }
        }

        if(!((midBreaksString.sunday) || (midBreaksString.monday) || (midBreaksString.tuesday) || (midBreaksString.wednesday) || (midBreaksString.thursday) || (midBreaksString.friday) || (midBreaksString.saturday))) {
            return false;
        }
    }

    return true;
}

const isAvailableHoursWithinOpeningHours = (openingHoursString, availableHoursString) => {
    if(openingHoursString.everyday) {
        openingHoursString.sunday = openingHoursString.everyday;
        openingHoursString.monday = openingHoursString.everyday;
        openingHoursString.tuesday = openingHoursString.everyday;
        openingHoursString.wednesday = openingHoursString.everyday;
        openingHoursString.thursday = openingHoursString.everyday;
        openingHoursString.friday = openingHoursString.everyday;
        openingHoursString.saturday = openingHoursString.everyday;
    }

    if(availableHoursString.everyday) {
        availableHoursString.sunday = availableHoursString.everyday;
        availableHoursString.monday = availableHoursString.everyday;
        availableHoursString.tuesday = availableHoursString.everyday;
        availableHoursString.wednesday = availableHoursString.everyday;
        availableHoursString.thursday = availableHoursString.everyday;
        availableHoursString.friday = availableHoursString.everyday;
        availableHoursString.saturday = availableHoursString.everyday;
    }

    if(!openingHoursString.everyday) {
        availableHoursString.everyday = null;
    }

    if(openingHoursString.everyday && availableHoursString.everyday) {
        if((timeToSeconds(availableHoursString.everyday.from) < timeToSeconds(openingHoursString.everyday.from)) || (timeToSeconds(availableHoursString.everyday.from) > timeToSeconds(openingHoursString.everyday.to))) {
            return false;
        }
        else if(timeToSeconds(availableHoursString.everyday.to) > timeToSeconds(openingHoursString.everyday.to)) {
            return false;
        }
    }
    else {
        if(availableHoursString.sunday) {
            if(openingHoursString.sunday) {
                if((timeToSeconds(availableHoursString.sunday.from) < timeToSeconds(openingHoursString.sunday.from)) || (timeToSeconds(availableHoursString.sunday.from) > timeToSeconds(openingHoursString.sunday.to))) {
                    return false;
                }
                else if(timeToSeconds(availableHoursString.sunday.to) > timeToSeconds(openingHoursString.sunday.to)) {
                    return false;
                }
            }
            else {
                availableHoursString.sunday = null;
            }
        }
    
        if(availableHoursString.monday) {
            if(openingHoursString.monday) {
                if((timeToSeconds(availableHoursString.monday.from) < timeToSeconds(openingHoursString.monday.from)) || (timeToSeconds(availableHoursString.monday.from) > timeToSeconds(openingHoursString.monday.to))) {
                    return false;
                }
                else if(timeToSeconds(availableHoursString.monday.to) > timeToSeconds(openingHoursString.monday.to)) {
                    return false;
                }
            }
            else {
                availableHoursString.monday = null;
            }
        }
    
        if(availableHoursString.tuesday) {
            if(openingHoursString.tuesday) {
                if((timeToSeconds(availableHoursString.tuesday.from) < timeToSeconds(openingHoursString.tuesday.from)) || (timeToSeconds(availableHoursString.tuesday.from) > timeToSeconds(openingHoursString.tuesday.to))) {
                    return false;
                }
                else if(timeToSeconds(availableHoursString.tuesday.to) > timeToSeconds(openingHoursString.tuesday.to)) {
                    return false;
                }
            }
            else {
                availableHoursString.tuesday = null;
            }
        }
    
        if(availableHoursString.wednesday) {
            if(openingHoursString.wednesday) {
                if((timeToSeconds(availableHoursString.wednesday.from) < timeToSeconds(openingHoursString.wednesday.from)) || (timeToSeconds(availableHoursString.wednesday.from) > timeToSeconds(openingHoursString.wednesday.to))) {
                    return false;
                }
                else if(timeToSeconds(availableHoursString.wednesday.to) > timeToSeconds(openingHoursString.wednesday.to)) {
                    return false;
                }
            }
            else {
                availableHoursString.wednesday = null;
            }
        }
    
        if(availableHoursString.thursday) {
            if(openingHoursString.thursday) {
                if((timeToSeconds(availableHoursString.thursday.from) < timeToSeconds(openingHoursString.thursday.from)) || (timeToSeconds(availableHoursString.thursday.from) > timeToSeconds(openingHoursString.thursday.to))) {
                    return false;
                }
                else if(timeToSeconds(availableHoursString.thursday.to) > timeToSeconds(openingHoursString.thursday.to)) {
                    return false;
                }
            }
            else {
                availableHoursString.thursday = null;
            }
        }
    
        if(availableHoursString.friday) {
            if(openingHoursString.friday) {
                if((timeToSeconds(availableHoursString.friday.from) < timeToSeconds(openingHoursString.friday.from)) || (timeToSeconds(availableHoursString.friday.from) > timeToSeconds(openingHoursString.friday.to))) {
                    return false;
                }
                else if(timeToSeconds(availableHoursString.friday.to) > timeToSeconds(openingHoursString.friday.to)) {
                    return false;
                }
            }
            else {
                availableHoursString.friday = null;
            }
        }
    
        if(availableHoursString.saturday) {
            if(openingHoursString.saturday) {
                if((timeToSeconds(availableHoursString.saturday.from) < timeToSeconds(openingHoursString.saturday.from)) || (timeToSeconds(availableHoursString.saturday.from) > timeToSeconds(openingHoursString.saturday.to))) {
                    return false;
                }
                else if(timeToSeconds(availableHoursString.saturday.to) > timeToSeconds(openingHoursString.saturday.to)) {
                    return false;
                }
            }
            else {
                availableHoursString.saturday = null;
            }
        }

        if(!((availableHoursString.sunday) || (availableHoursString.monday) || (availableHoursString.tuesday) || (availableHoursString.wednesday) || (availableHoursString.thursday) || (availableHoursString.friday) || (availableHoursString.saturday))) {
            return false;
        }
    }

    return true;
}

const findDuplicates = (arr) => arr.filter((item, index) => arr.indexOf(item) != index);

const getDuplicateIndex = (array) => {
    let count = array =>
        array.reduce((a, b) => ({ ...a,
            [b]: (a[b] || 0) + 1
        }), {})
    let duplicates = dict =>
        Object.keys(dict).filter((a) => dict[a] > 1)

    let duplicatesArray = duplicates(count(array));
    let duplicateIndices = [];

    for(i in duplicatesArray) {
        let individualDuplicateIndices = [];
        for(j in array) {
            if(duplicatesArray[i] === array[j]) {
                individualDuplicateIndices.push(j);
            }
        }
        duplicateIndices.push(individualDuplicateIndices);
    }

    return duplicateIndices;
}

module.exports = {
    isPositiveNumber: isPositiveNumber,
    isNumber: isNumber,
    isBoolean: isBoolean,
    isValidLatitude: isValidLatitude,
    isValidLongitude: isValidLongitude,
    isValidDimension: isValidDimension,
    isValidString: isValidString,
    isValidObjectID: isValidObjectID,
    isValidTime: isValidTime,
    timeToSeconds: timeToSeconds,
    isValidOpeningHours: isValidOpeningHours,
    isMidBreaksWithinOpeningHours: isMidBreaksWithinOpeningHours,
    isAvailableHoursWithinOpeningHours: isAvailableHoursWithinOpeningHours,
    findDuplicates: findDuplicates,
    getDuplicateIndex: getDuplicateIndex
};