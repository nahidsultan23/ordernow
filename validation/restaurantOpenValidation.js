const userValidator = require('./validationHelper');

module.exports = function validateRestaurantOpen(offset,openingHours,isMidBreakApplicable,midBreaks) {
    let error = false;
    let currentDate = new Date();

    let seconds = Number(currentDate.getUTCSeconds());
    let minutes = Number(currentDate.getUTCMinutes());
    let hours = Number(currentDate.getUTCHours()) + offset;
    let dayOfWeek = Number(currentDate.getUTCDay());
    let weekDays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

    if(hours > 23) {
        hours = hours - 24;
        dayOfWeek = dayOfWeek + 1;

        if(dayOfWeek > 6) {
            dayOfWeek = dayOfWeek - 7;
        }
    }

    dayOfWeek = weekDays[dayOfWeek];

    let currentSeconds = hours * 60 * 60 + minutes * 60 + seconds;

    function convertTimes(openingHours) {
        let openingHoursNew = {};
        if(openingHours.sunday) {
            let sunday = {
                from: userValidator.timeToSeconds(openingHours.sunday.from),
                to: userValidator.timeToSeconds(openingHours.sunday.to)
            }
            openingHoursNew.sunday = sunday;
        }
        else {
            openingHoursNew.sunday = null;
        }

        if(openingHours.monday) {
            let monday = {
                from: userValidator.timeToSeconds(openingHours.monday.from),
                to: userValidator.timeToSeconds(openingHours.monday.to)
            }
            openingHoursNew.monday = monday;
        }
        else {
            openingHoursNew.monday = null;
        }

        if(openingHours.tuesday) {
            let tuesday = {
                from: userValidator.timeToSeconds(openingHours.tuesday.from),
                to: userValidator.timeToSeconds(openingHours.tuesday.to)
            }
            openingHoursNew.tuesday = tuesday;
        }
        else {
            openingHoursNew.tuesday = null;
        }

        if(openingHours.wednesday) {
            let wednesday = {
                from: userValidator.timeToSeconds(openingHours.wednesday.from),
                to: userValidator.timeToSeconds(openingHours.wednesday.to)
            }
            openingHoursNew.wednesday = wednesday;
        }
        else {
            openingHoursNew.wednesday = null;
        }

        if(openingHours.thursday) {
            let thursday = {
                from: userValidator.timeToSeconds(openingHours.thursday.from),
                to: userValidator.timeToSeconds(openingHours.thursday.to)
            }
            openingHoursNew.thursday = thursday;
        }
        else {
            openingHoursNew.thursday = null;
        }

        if(openingHours.friday) {
            let friday = {
                from: userValidator.timeToSeconds(openingHours.friday.from),
                to: userValidator.timeToSeconds(openingHours.friday.to)
            }
            openingHoursNew.friday = friday;
        }
        else {
            openingHoursNew.friday = null;
        }

        if(openingHours.saturday) {
            let saturday = {
                from: userValidator.timeToSeconds(openingHours.saturday.from),
                to: userValidator.timeToSeconds(openingHours.saturday.to)
            }
            openingHoursNew.saturday = saturday;
        }
        else {
            openingHoursNew.saturday = null;
        }

        return openingHoursNew;
    }

    function calculateTime(openingHour,midBreak) {
        let openingTime = {
            time1: openingHour,
            time2: openingHour
        };

        if(midBreak) {
            openingTime = {
                time1: {
                    from: openingHour.from,
                    to: midBreak.from
                },
                time2: {
                    from: midBreak.to,
                    to: openingHour.to
                }
            };
        }

        return openingTime;
    }
    
    if(openingHours.everyday) {
        openingHours = {
            sunday: openingHours.everyday,
            monday: openingHours.everyday,
            tuesday: openingHours.everyday,
            wednesday: openingHours.everyday,
            thursday: openingHours.everyday,
            friday: openingHours.everyday,
            saturday: openingHours.everyday
        }
    }

    let openingHoursNew = convertTimes(openingHours);

    if(isMidBreakApplicable) {
        if(midBreaks.everyday) {
            midBreaks = {
                sunday: midBreaks.everyday,
                monday: midBreaks.everyday,
                tuesday: midBreaks.everyday,
                wednesday: midBreaks.everyday,
                thursday: midBreaks.everyday,
                friday: midBreaks.everyday,
                saturday: midBreaks.everyday
            }
        }
    }
    else {
        midBreaks = {
            sunday: null,
            monday: null,
            tuesday: null,
            wednesday: null,
            thursday: null,
            friday: null,
            saturday: null
        }
    }

    let midBreaksNew = convertTimes(midBreaks);

    let timeRangeOpeningHours = {
        sunday: openingHoursNew.sunday ? calculateTime(openingHoursNew.sunday,midBreaksNew.sunday) : null,
        monday: openingHoursNew.monday ? calculateTime(openingHoursNew.monday,midBreaksNew.monday) : null,
        tuesday: openingHoursNew.tuesday ? calculateTime(openingHoursNew.tuesday,midBreaksNew.tuesday) : null,
        wednesday: openingHoursNew.wednesday ? calculateTime(openingHoursNew.wednesday,midBreaksNew.wednesday) : null,
        thursday: openingHoursNew.thursday ? calculateTime(openingHoursNew.thursday,midBreaksNew.thursday) : null,
        friday: openingHoursNew.friday ? calculateTime(openingHoursNew.friday,midBreaksNew.friday) : null,
        saturday: openingHoursNew.saturday ? calculateTime(openingHoursNew.saturday,midBreaksNew.saturday) : null
    }

    let todayTimeRange = null;

    if(dayOfWeek === 'sunday') {
        todayTimeRange = timeRangeOpeningHours.sunday;
    }
    else if(dayOfWeek === 'monday') {
        todayTimeRange = timeRangeOpeningHours.monday;
    }
    else if(dayOfWeek === 'tuesday') {
        todayTimeRange = timeRangeOpeningHours.tuesday;
    }
    else if(dayOfWeek === 'wednesday') {
        todayTimeRange = timeRangeOpeningHours.wednesday;
    }
    else if(dayOfWeek === 'thursday') {
        todayTimeRange = timeRangeOpeningHours.thursday;
    }
    else if(dayOfWeek === 'friday') {
        todayTimeRange = timeRangeOpeningHours.friday;
    }
    else if(dayOfWeek === 'saturday') {
        todayTimeRange = timeRangeOpeningHours.saturday;
    }

    if(!todayTimeRange) {
        error = true;
    }
    else {
        if(todayTimeRange.time1 && todayTimeRange.time2) {
            if(currentSeconds < todayTimeRange.time1.from) {
                error = true;
            }
            else if((currentSeconds > todayTimeRange.time1.to) && (currentSeconds < todayTimeRange.time2.from)) {
                error = true;
            }
            else if(currentSeconds > todayTimeRange.time2.to) {
                error = true;
            }
        }
        else {
            error = true;
        }
    }
    
    return !error;
}