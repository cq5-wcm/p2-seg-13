/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

// ensure collab calendar package
CQ.Ext.ns("CQ.mcm", "CQ.mcm.cal");

(function() {

    var WEEK_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

    var FREQUENCIES = {
        "yearly":   Date.YEAR,
        "monthly":  Date.MONTH,
        "weekly":   Date.WEEK,
        "daily":    Date.DAY,
        "hourly":   Date.HOUR,
        "minutely": Date.MINUTE,
        "secondly": Date.SECOND
    };

    function increment(rule, date /* Date */) {
        return date.add(FREQUENCIES[rule.frequency], rule.interval || 1);
    }

    // gives a list of possible dates generated from the
    // by* rules, starting with date
    // returns an array of Date objects
    function calculateCandidates(rule, date /* Date */) {
        var dates = []; /* array of Date objects */
        dates.push(date);

        // inner helper function to go through dates array
        function adjustDates(dates, arr, func) {
            if (!arr) {
                return dates;
            }
            var result = [];
            for (var i=0; i < dates.length; i++) {
                var d = dates[i];
                for (var j=0; j < arr.length; j++) {
                    func(d, arr[j], result, j);
                }
            }
            return result;
        }

        // 1. by month
        dates = adjustDates(dates, rule.byMonth, function(date, byMonth, result) {
            // byMonth is 1-12, javascript Date uses 0-11 for month
            date.setMonth(byMonth - 1);
            result.push(date);
        });

        // 2. by month day
        dates = adjustDates(dates, rule.byMonthDay, function(date, byMonthDay, result) {
            if (byMonthDay > 0) {
                date.setDate(byMonthDay);
            } else {
                date.setDate(date.getLastDayOfMonth() + byMonthDay);
            }
            result.push(date);
        });

        // 3. by week day (day + offset)
        dates = adjustDates(dates, rule.byWeekDay, function(date, byWeekDay, result, index) {
            var weekDayNr = WEEK_DAYS.indexOf(byWeekDay);

            if (rule.byMonthDay) {
                // if byMonthDay is given, list must be filtered
                // => keep date only when the weekday matches
                if (date.getDay() == weekDayNr) {
                    result.push(date);
                }
            } else {
                // otherwise generate and add all days with a
                // matching weekday, starting with date
                var days = [];

                if (rule.frequency == 'monthly' || rule.byMonth) {
                    var sameMonth = date.getMonth();
                    // start at first day of the month
                    date.setDate(1);
                    // find the first day with a matching week day
                    while (date.getDay() != weekDayNr) {
                        date = date.add(Date.DAY, 1);
                    }
                    // collect all days in this month with this weekday (every 7 days)
                    while (date.getMonth() == sameMonth) {
                        days.push(date.clone());
                        date = date.add(Date.DAY, 7);
                    }

                } else if (rule.frequency == 'yearly') {
                    var sameYear = date.getYear();
                    // start at first day of the year
                    date = date.add(Date.DAY, - date.getDayOfYear());
                    // find the first day with a matching week day
                    while (date.getDay() != weekDayNr) {
                        date = date.add(Date.DAY, 1);
                    }
                    // collect all days in this year with this weekday (every 7 days)
                    while (date.getYear() == sameYear) {
                        days.push(date.clone());
                        date = date.add(Date.DAY, 7);
                    }
                }

                // now calculate offsets
                var offset = rule.byWeekDayOffset[index];
                if (offset == 0) {
                    // no offset adoption necessary, copy all days into result
                    for (var i=0; i < days.length; i++) {
                        result.push(days[i]);
                    }
                } else {
                    if (offset >= -days.length && offset < 0) {
                        // negative offset
                        result.push(days[days.length + offset]);
                    } else if (offset > 0 && offset <= days.length) {
                        // positive offset
                        result.push(days[offset - 1]);
                    }
                }
            }
        });

        return dates;
    }

    // calculates recurring dates based on the rule
    // in the period given by from and to (inclusive)
    // returns dates as utc millis
    function calculateRecurDates(rule, from /* utc millis */, to /* utc millis */) {
        var dates = []; /* array of utc millis (number) */
        var runDate = new Date(from);
        var i;

        var candidate = null;
        var counter = 0;
        // (open) loop to collect recurrences
        while (counter < 100) {
            counter++;
            // stop collecting when we reach the end of the period specified
            if (candidate && candidate.getTime() > to) {
                break;
            }

            var candidates = calculateCandidates(rule, runDate.clone());
            for (i=0; i < candidates.length; i++) {
                candidate = candidates[i];
                // only use candidates that lie in the given period
                if (candidate.getTime() >= from && candidate.getTime() <= to) {
                    dates.push(candidate.getTime());
                }
            }

            runDate = increment(rule, runDate);
        }
        return dates;
    }

    // calculates the onset in UTC for localdates (start and dates
    // property of an observance, which are given in local time);
    // needs to subtract the offsetFrom which indicates the offset
    // to UTC right before the observance starts
    function getOnsetAsUTC(obs, localdate) {
        //return new Date(localdate.getTime() - obs.offsetFrom);
        return localdate - obs.offsetFrom;
    }

    // finds the latest onset of a given observance for the date
    // returns the onset as utc millis
    function getLatestOnset(obs, date /* utc millis */) {
        if (!obs.initialOnset) {
            if (typeof obs.start === "string") {
                // convert date string to utc millis
                obs.start = new Date(obs.start).getTime();
            }
            // when this observance starts for the first time ever, in UTC
            obs.initialOnset = getOnsetAsUTC(obs, obs.start);
        }
        // if the date is before anything this observance covers, stop
        if (date < obs.initialOnset) {
            return null;
        }

        var onset = obs.initialOnset;
        var i, j;

        if (obs.dates) {
            // look through the explicit list of dates when this
            // observances starts (or started)
            for (i=0; i < obs.dates.length; i++) {
                if (typeof obs.dates[i] === "string") {
                    // convert date string to utc millis
                    obs.dates[i] = new Date(obs.dates[i]).getTime();
                }
                var candidate = getOnsetAsUTC(obs, obs.dates[i]);
                // latest onset before the actual date (incl.) wins
                if (candidate <= date && candidate > onset) {
                    onset = candidate;
                }
            }
        }

        if (obs.rules) {
            // look through the recurrence rules for the start
            // of this observance
            for (i=0; i < obs.rules.length; i++) {
                // calculate onset dates from rule
                var recurDates = calculateRecurDates(obs.rules[i], onset, date);
                for (j=0; j < recurDates.length; j++) {
                    var candidate = recurDates[j];
                    // latest onset before the actual date (incl.) wins
                    if (candidate <= date && candidate > onset) {
                        onset = candidate;
                    }
                }
            }
        }

        return onset;
    }

    /**
     * @class CQ.mcm.cal.TimeZone
     * Represents a timezone including rules for calculating the different
     * daylight or standard time offsets depending on the date.
     *
     * @constructor
     * Takes an timezone description object based on a simple JSON mapping
     * of the icalendar VTIMEZONE object. Example (please note that it's
     * purely fictional in order to show all possible properties):
<pre>
{
    "tzID":  "Europe/Totally-Made-Up",
    "tzURL": "http://tzurl.org/zoneinfo/Europe/Berlin", // optional

    "observances": [ {
        "daylight":   true,    // if not set or false => standard
        "tzName":     "CEST",  // optional
        "offsetFrom": 3600000, // = 1h, unit are milliseconds
        "offsetTo":   7200000, // = 2h, dito
        "start":      "So Mrz 29 1981 02:00:00 GMT+0000",
        "dates": [
            "So Apr 30 1916 23:00:00 GMT+0000",
            "Mo Apr 16 1917 02:00:00 GMT+0000"
        ],
        "rules": [{
            "frequency":       "yearly",
                // yearly, monthly, weekly, daily, hourly, minutely, secondly
            "interval":        1,         // optional, default is 1
            "byWeekDay":       [ "SU" ],  // SU MO TU WE TH FR SA
            "byWeekDayOffset": [ -1   ],  // corresponds to byWeekDay
            "byMonth":         [ 3 ],     // January = 1, December = 12
            "byMonthDay":      [ 1 ]
        }]
    }]
}
</pre>
     * @param {Object} tzInfo a timezone description as detailed above
     *
     */
    CQ.mcm.cal.TimeZone = function(tzInfo) {

        // fallback default timezone info
        if (!tzInfo) {
            tzInfo = {
                tzID: "Etc/UTC",
                observances: [{
                    tzName:     "UTC",
                    offsetFrom: 0,
                    offsetTo:   0,
                    start:      "Thu Jan 01 1970 00:00:00 GMT+0000"
                }]
            };
        }

        function findObservanceFor(date) {
            // use utc millis (number) for date
            if (date && typeof date.getTime === "function") {
                date = date.getTime();
            }
            var latestObservance = null;
            var latestOnset = -1;
            // Note: this expects observances to be sorted by their start date
            for (var i=0; i < tzInfo.observances.length; i++) {
                var obs = tzInfo.observances[i];
                var onset = getLatestOnset(obs, date);
                // latest observance wins
                if (onset != null && (latestObservance == null || onset > latestOnset)) {
                    //jstestdriver.console.log("onset: " + onset + " => offset from: " + obs.offsetFrom + " to: " + obs.offsetTo);
                    latestOnset = onset;
                    latestObservance = obs;
                }
            }
            if (!latestObservance && tzInfo.observances.length > 0) {
                // if no observance was found, use the offsetFrom from
                // the first observance (typically for old dates)
                return {
                    offsetTo: tzInfo.observances[0].offsetFrom
                }
            }
            return latestObservance;
        }

        // public functions ---------------------------------

        // returns the timezone ID, eg. "Europe/Berlin"
        this.getID = function() {
            return tzInfo.tzID;
        };

        // returns a timezone source URL such as "http://tzurl.org/zoneinfo/Europe/Berlin"
        this.getTzURL = function() {
            return tzInfo.tzURL;
        }

        // gets the timezone offset from UTC for a given date in milliseconds
        this.getOffset = function(date) {
            var observance = findObservanceFor(date);
            return observance ? observance.offsetTo : 0;
        };

        // gets the timezone offset from UTC for a given date in minutes
        this.getOffsetInMinutes = function(date) {
            return this.getOffset(date) / 60000;
        };

        // returns the tz short name for the given date (eg. CEST or CET)
        this.getShortName = function(date) {
            var observance = findObservanceFor(date);
            return observance ? observance.tzName : null;
        };

        // returns whether the given date is in daylight time
        this.inDaylightTime = function(date) {
            var observance = findObservanceFor(date);
            return observance && observance.daylight;
        };
    };
}());

// static methods to fetch & cache timezone definitions
(function() {
    var httpBasePath = "/.timezones.json/";

    // TODO: CQ.WCM.getTopWindow() caching must be aware that sub frames might go away
    //       and referenced object in the cache become invalid; see bug 30678
    //var timezones = CQ.WCM.getTopWindow().CQ_Timezone_Cache ? CQ.WCM.getTopWindow().CQ_Timezone_Cache : CQ.WCM.getTopWindow().CQ_Timezone_Cache = {};
    var timezones = {};

    function fetchTimeZone(id) {
        var tzInfo = CQ.HTTP.eval(httpBasePath + id);
        return new CQ.mcm.cal.TimeZone(tzInfo);
    }

    /**
     * The timezone ID of the UTC timezone.
     * @static
     */
    CQ.mcm.cal.TimeZone.UTC_ID = "Etc/UTC";

    /**
     * Set the path from where to load timezone information from
     * the server. Defaults to "/.timezones.json/".
     * @static
     * @param {String} path A server path
     */
    CQ.mcm.cal.TimeZone.setHTTPBasePath = function(path) {
        httpBasePath = path;
    };

    /**
     * Force loading of timezone descriptions, using same json
     * structure as if loaded via HTTP. Can be a single object
     * or an array. Each object must provide its timezone ID
     * via obj.tzID. Overwrites any cached tz object for the
     * same ID.
     * @static
     * @param {Array} tzInfos array of time zone definitions as described in {@link #TimeZone}
     */
    CQ.mcm.cal.TimeZone.load = function(tzInfos) {
        if (!CQ.Ext.isArray(tzInfos)) {
            tzInfos = [tzInfos];
        }
        for (var i=0; i < tzInfos.length; i++) {
            var tzInfo = tzInfos[i];
            timezones[tzInfo.tzID] = new CQ.mcm.cal.TimeZone(tzInfo);
        }
    };

    /**
     * Returns a {@link CQ.mcm.cal.TimeZone} by a timezone ID,
     * eg. "Europe/Berlin". Will be null or undefined if none could
     * be found. Will be loaded on demand from an URL given by
     * the base path set in {@link CQ.mcm.cal.TimeZone#TimeZone.setHTTPBasePath setHTTPBasePath} plus the
     * timezone ID.
     * @static
     * @param {String} id timezone ID
     * @return {CQ.mcm.cal.TimeZone} a TimeZone object
     */
     CQ.mcm.cal.TimeZone.get = function(id) {
        var tz = timezones[id];
        if (!tz) {
            tz = fetchTimeZone(id);
            if (!tz) {
                return null;
            }
            timezones[id] = tz;
        }
        return tz;
     };

})();

// provide convenience methods on the javascript Date object
CQ.Ext.override(Date, {
    /**
     * Returns a new {@link CQ.mcm.cal.Date} object with the current date moved
     * into the given timezone.
     * <br><br>
     * The resulting date object will also have the new methods getTimezoneInfo()
     * (returns the {@link CQ.mcm.cal.TimeZone} instance), getTimezoneID()
     * and inDaylightTime() (returns true for DST). The standard javascript
     * Date method getTimezoneOffset() will be overridden as well as ExtJS
     * Date.getTimezone() to use the new, more accurate timezone info.
     *
     * @param {String/CQ.mcm.cal.TimeZone} tz timezone ID (eg. "Europe/Berlin") or TimeZone object
     * @return {CQ.mcm.cal.Date} a timezone-enabled date representation of this date in the given timezone
     * @clientlib CQ.mcm.calendar
     * @member Date
     */
    shift: function(tz) {
        if (!tz) {
            return this;
        }
        return CQ.mcm.cal.Date(this, tz);
    },

    /**
     * Returns a new {@link CQ.mcm.cal.Date} object with the exact current date but in the
     * given timezone.
     *
     * <br><br>
     * This is different from {@link #shift}() in that it won't move the
     * time to what time it is in the other timezone. It will keep all the
     * fields (hours, minutes, etc.) the same, but being represented as
     * a {@link CQ.mcm.cal.Date} object with timezone info.
     *
     * @param {String/CQ.mcm.cal.TimeZone} tz timezone ID (eg. "Europe/Berlin") or TimeZone object
     * @return {CQ.mcm.cal.Date} a timezone-enabled date with the same date fields in the given timezone
     * @clientlib CQ.mcm.calendar
     * @member Date
     */
    replaceTimezone: function(tz) {
        if (!tz) {
            return this;
        }
        var d = CQ.mcm.cal.Date(this, tz);

        // set all fields
        d.setDate(1); // because of leap years

        d.setFullYear(this.getFullYear());
        d.setMonth(this.getMonth());
        d.setDate(this.getDate());

        d.setHours(this.getHours());
        d.setMinutes(this.getMinutes());
        d.setSeconds(this.getSeconds());
        d.setMilliseconds(this.getMilliseconds());

        return d;
    },

    /**
     * Returns a copy this date as {@link CQ.mcm.cal.Date} in the UTC timezone.
     *
     * @return {CQ.mcm.cal.Date} a timezone-enabled date in the UTC timezone
     * @clientlib CQ.mcm.calendar
     * @member Date
     */
    toUTC: function() {
        return this.shift(CQ.mcm.cal.TimeZone.UTC_ID);
    },

    /**
     * Returns a copy of of this date with the time cleared. Same as clearTime(true).
     *
     * @return {Date} a date-only copy of this date
     * @clientlib CQ.mcm.calendar
     * @member Date
     */
    dateOnly: function() {
        return this.clearTime(true);
    },

    /**
     * Returns the current date (year, month, date) as a UTC date with the
     * time cleared, as {@link CQ.mcm.cal.Date} object. For example,
     * "2009-07-13 14:00:00 +02:00 CEST" would become "2009-07-13 00:00:00 +00:00 UTC".
     *
     * @return {CQ.mcm.cal.Date} a timezone-enabled date in the UTC timezone
     * @clientlib CQ.mcm.calendar
     * @member Date
     */
    utcDateOnly: function() {
        return new CQ.mcm.cal.Date(
            Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()),
            CQ.mcm.cal.TimeZone.UTC_ID);
    },

    /**
     * Adds the given positive or negative offset in minutes to this date.
     * @param {Number} offset offset in minutes
     * @return {Date} this date object
     * @clientlib CQ.mcm.calendar
     * @member Date
     */
    addOffset: function(offset /* in minutes */) {
        if (offset < 0) {
            this.setHours(  this.getHours()   - Math.floor(Math.abs(offset / 60)));
            this.setMinutes(this.getMinutes() - Math.abs(offset % 60));
        } else {
            this.setHours(  this.getHours()   + Math.floor(offset / 60));
            this.setMinutes(this.getMinutes() + offset % 60);
        }
        return this;
    },

    /**
     * Returns whether both dates are on the same day, ie.
     * if their year, month and date are equal.
     * @param {Date} other Date object
     * @return {Boolean} true if both are on the same date
     * @clientlib CQ.mcm.calendar
     * @member Date
     */
    isSameDateAs: function(other) {
        return this.getFullYear() == other.getFullYear() &&
               this.getMonth() == other.getMonth() &&
               this.getDate() == other.getDate();
    }

});

CQ.Ext.apply(Date, {

    /**
     * Parses the given date string in a given timezone into a {@link CQ.mcm.cal.Date} object.
     * Can optionally handle date-only dates (isDate=true) and also handle
     * a separate display timezone.
     * @param {String} dateString date string in ECMA date format (can be parsed
     *                 by Date.parse()), eg. "Wed Aug 27 2008 23:59:59 GMT+0200"
     * @param {String/CQ.mcm.cal.TimeZone} timeZone timezone (ID or object) of the dateString
     * @param {Boolean} isDate whether this is just a date with no time (optional)
     * @param {String/CQ.mcm.cal.TimeZone} timeZone timezone (ID or object) for display;
     *              the returned date will be in this timezone (optional)
     * @return {CQ.mcm.cal.Date} a timezone-aware date object
     * @clientlib CQ.mcm.calendar
     * @member Date
     */
    parseWithTimezone: function(dateString, timeZone, isDate, displayTimeZone) {
        var date = Date.parse(dateString);
        if (date) {
            date = new Date(date);
            if (isDate) {
                return date.toUTC().dateOnly();
            } else {
                date = date.shift(timeZone);
                if (displayTimeZone) {
                    return date.shift(displayTimeZone);
                } else {
                    return date;
                }
            }
        } else {
            return null;
        }
    }

});

/**
 * @class CQ.mcm.cal.Date
 * @extends Date
 * A fully timezone-enabled extension of the javascript Date class.
 * Uses {@link CQ.mcm.cal.TimeZone} as timezone information.
 *
 * @constructor
 * Takes an existing date, shifts it into the given timezone and returns
 * an timezone-enabled Date object.
 * @param {Number/String/Date/CQ.mcm.cal.Date} date
 *              the base date: can be utc millis, a date string that can be parsed
 *              via Date.parse(), a Date or an existing CQ.mcm.cal.Date object
 * @param {String/CQ.mcm.cal.TimeZone} tz timezone ID or timezone object
 */
CQ.mcm.cal.Date = function(date, tz) {

    if (typeof date === "number") {
        // utc millis
        date = new Date(date);
    } else if (typeof date === "string") {
        // date string, eg. "Wed Aug 27 2008 23:59:59 GMT+0200"
        date = new Date(Date.parse(date));
    }

    if (typeof tz === "string") {
        tz = CQ.mcm.cal.TimeZone.get(tz);
    }

    var offset = tz.getOffsetInMinutes(date.getTime());

    var result = new Date(date.getBuiltinTime ? date.getBuiltinTime() : date.getTime());

    // shift date by the difference between current local browser
    // timezone and target timezone
    // (see calculateTime() below for the inverse operation)
    result.addOffset(offset + date.getTimezoneOffset());

    result.timezone = tz;
    result.timezoneOffset = offset; // in minutes

    // cache utc millis between setMonth(), etc. calls
    result.lastUTCMillis = result.getTime();

    // add methods (prototype is filled with methods below using CQ.Ext.override)
    var dp = CQ.mcm.cal.Date.prototype;
    for (var m in dp) {
        result[m] = dp[m];
    }

    // automatic way to create all the setUTC*() and getUTC*() methods
    // that need to be overwritten from the standard Date object
    function getterMethod(field) {
        return function() {
            return new Date(this.getTime())["getUTC" + field]();
        }
    }
    function setterMethod(field) {
        return function() {
            // set utc field via temporary date object and using getTime/setTime
            var date = new Date(this.getTime());
            date["setUTC" + field].apply(date, arguments);
            this.setTime(date.getTime());
        }
    }
    var fields = ["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds"];
    for (var i=0; i < fields.length; i++) {
        var field = fields[i];
        result["getUTC" + field] = getterMethod(field);
        if (field != "Day") { // there is no setUTCDay()...
            result["setUTC" + field] = setterMethod(field);
        }
    }

    return result;
};

CQ.Ext.override(CQ.mcm.cal.Date, {

    /**
     * Returns the Date object's original & internal utc millis
     * (needed because we overwrite getTime()).
     * @private
     * @return {Number} UTC millis as stored by the internal javascript Date object
     */
    getBuiltinTime: function() {
        return Date.prototype.getTime.apply(this);
    },

    /**
     * Returns the numeric value of the specified date as the number of milliseconds
     * since January 1, 1970, 00:00:00 UTC (negative for prior times).
     * Overwrites standard Date.getTime() to provide proper utc millis.
     * @return {Number} utc milliseconds
     */
    getTime: function() {
        // need to call getTimezoneOffset() in order to use the up-to-date offset
        return this.calculateTime( -this.getTimezoneOffset() );
    },

    /**
     * Internal method to calculate the real UTC millis based on the timezone offset.
     * @private
     * @param {Number} tzOffset time zone offset positive to UTC in minutes (eg. "GMT+0200" = +720)
     * @return {Number} real UTC millis
     */
    calculateTime:  function(tzOffset /* positive to UTC */) {
        // shift date back by difference between target timezone and local browser timezone

        var time = this.getBuiltinTime();

        // 1. get the current local offset for this time
        var localOffset = - new Date(time).getTimezoneOffset();

        // 2. shift back with that local offset and get the local offset at the target time
        //    (this is needed when the tzOffset will cross a daylight border for the local offset)
        localOffset = - new Date(time).addOffset(localOffset - tzOffset).getTimezoneOffset();

        // 3. now shift back with the real local offset at the target time
        return new Date(time).addOffset(localOffset - tzOffset).getTime();
    },

    /**
     * Sets the Date object's original & internal utc millis
     * (needed because we overwrite setTime()).
     * @private
     * @param {Number} time (builtin) utc milliseconds
     */
    setBuiltinTime: function(time) {
        Date.prototype.setTime.call(this, time);
    },

    /**
     * Sets the Date object to the time represented by a number of milliseconds since
     * January 1, 1970, 00:00:00 UTC, allowing for negative numbers for times prior.
     * @param {Number} time utc milliseconds
     */
    setTime: function(time) {
        // use a temp proxy to do the calculation for us
        var tzDate = new Date(time).shift(this.timezone);
        this.setBuiltinTime(tzDate.getBuiltinTime());
    },

    /**
     * Returns the offset relative to UTC in minutes. Note that this will be
     * negative for offsets that are ahead of UTC. For example, an offset
     * typically named "GMT+0200" (+2h) will be returned as -720.
     * Overwrites standard Date.getTimezoneOffset().
     * @return {Number} negative offset relative to UTC in minutes
     */
    getTimezoneOffset: function() {
        // checks if the timezone offset has changed through a setMonth(), setDate()
        // etc. method call in the meantime by using the cached this.lastUTCMillis

        var time = this.getBuiltinTime();

        // if the time has changed (eg. through setMonth()), we need to check
        // whether our timezoneoffset is still correct
        if (this.lastUTCMillis && time != this.lastUTCMillis) {
            this.lastUTCMillis = time;

            // first get the time using the "old" offset
            var timeWithOldOffset = this.calculateTime(this.timezoneOffset);
            // calculate the offset for that time and update it
            this.timezoneOffset = this.timezone.getOffsetInMinutes(timeWithOldOffset);
        }

        // Note: standard Date.getTimezoneOffset() returns
        // negative values for UTC +N:M values, positive for UTC -N:M offsets
        return -this.timezoneOffset;
    },

    /**
     * Returns the abbreviated timezone name, for example "CET" or "CEST". This
     * often depends on whether this date is in daylight savings time or not.
     * Overwrites ExtJS Date.getTimezone().
     * @return {String} an abbreviated timezone name
     */
    getTimezone: function() {
        return this.timezone.getShortName(this);
    },

    /**
     * Returns the {@link CQ.mcm.cal.TimeZone}.
     * @return {CQ.mcm.cal.TimeZone} timezone object
     */
    getTimezoneInfo: function() {
        return this.timezone;
    },

    /**
     * Returns the timezone ID, eg. "Europe/Berlin".
     * @return {String} timezone ID
     */
    getTimezoneID: function() {
        return this.timezone.getID();
    },

    /**
     * Returns whether this date is in daylight savings time.
     * @return {Boolean} true for daylight savings time
     */
    inDaylightTime: function() {
        return this.timezone.inDaylightTime(this);
    },

    /**
     * Returns a string representation of this date, including the real
     * timezone. For example: "Mon Nov 30 2009 00:00:00 GMT+0100 (CET)"
     * Overwrites standard Date.toString().
     * @return {String} a string representation of this date
     */
    toString: function() {
        // for example: "Mon Nov 30 2009 00:00:00 GMT+0100 (CET)"
        return this.format("D M d Y H:i:s \\G\\M\\TO (T)");
    },

    /**
     * Converts a date to a string, using the universal time convention.
     * Overwrites standard Date.toString().
     * @return {String} a UTC string representation of this date
     */
    toUTCString: function() {
        /*
        // IS0-8601 format
        function pad(s, count) {
            return String.leftPad(s, count || 2, '0');
        }
        return this.getUTCFullYear() + "-" + pad(this.getUTCMonth()+1) + "-" + pad(this.getUTCDate()) + "T" +
            pad(this.getUTCHours()) + ":" + pad(this.getUTCMinutes()) + ":" + pad(this.getUTCSeconds()) + "." +
            pad(this.getUTCMilliseconds(), 4) + "Z";
        */

        // for example: "Mon Nov 30 2009 14:30:25 GMT"
        return new Date(
                this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate(),
                this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds(),
                this.getUTCMilliseconds()
            ).format("D M d Y H:i:s \\G\\M\\T");
    },

    // deprecated
    toGMTString: function() {
        return this.toUTCString();
    },

    /**
     * Returns the time portion of a Date object in human readable form
     * in American English. For example: "14:30:25 GMT+0100 (CET)".
     * @return {String} a string representation of the time part of this date
     */
    toTimeString: function() {
        // for example: "14:30:25 GMT+0100 (CET)"
        return this.format("H:i:s \\G\\M\\TO (T)");
    },

    /**
     * Returns the primitive value of a Date object. Same as getTime().
     * Overwrites the standard Date.valueOf().
     * @return {Number} utc milliseconds
     */
    valueOf: function() {
        return this.getTime();
    },

    /**
     * Returns a copy of this timezone-enabled date object.
     * Overwrites standard ExtJS Date.clone().
     * @return {CQ.mcm.cal.Date} clone
     */
    clone: function() {
        return new CQ.mcm.cal.Date(this, this.timezone);
    }

});

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

// ensure collab calendar package
CQ.Ext.ns("CQ.mcm", "CQ.mcm.cal");

/**
 * Formats dates as strings and supports up to 9 of them (1-9). A pattern
 * string is like in Date.format() but each* pattern char must be prefixed
 * with the index of the date that should be used, starting at 1.
 * For example: "1M 1j - 2j 1Y" which will result in "Dec 21 - 27 2009".
 * 
 * @param {String} pattern ExtJS Date pattern
 * @param {Array} dates array of Date objects
 * @return {String} formatted date string
 */
CQ.mcm.cal.multiDateFormat = function(pattern, dates) {
    var result = "";
    // if no index is given, default to first date in array
    var index = 0;
    for (var i=0; i < pattern.length; i++) {
        var ch = pattern.charAt(i);
        if (Date.formatCodes[ch]) {
            result = result + dates[index].format(ch);
            index = 0;
        } else if (ch.match(/\d/)) {
            // start at 1: 1 in pattern becomes 0 index
            index = Number(ch) - 1;
            if (index < 0) {
                index = 0;
            }
        } else {
            result = result + ch;
        }
    }
    return result;
};

CQ.mcm.cal.DATE_TIME_LOCALE = "locale";
CQ.mcm.cal.DATE_LITTLE_ENDIAN = "littleEndian";
CQ.mcm.cal.DATE_MIDDLE_ENDIAN = "middleEndian";
CQ.mcm.cal.DATE_BIG_ENDIAN = "bigEndian";
CQ.mcm.cal.TIME_12HCLOCK = "12hclock";
CQ.mcm.cal.TIME_24HCLOCK = "24hclock";

/**
 * The <code>CQ.mcm.cal.Calendar</code> class provides Utility methods 
 * for the calendar component.
 * @class CQ.mcm.cal.Calendar
 */
CQ.mcm.cal.Calendar = function() {
    
    var selectedDate = new Date();
    
    var eventDialog = null;
    var eventPopup = null;
    
    var colorTable = {};
    
    // TODO: maybe change locale, eg. page-dependent or explictly set in calendar component
    // CQ.I18n.setLocale(locale);
    // ... and reset later. But what about the ExtJs Date initialization - re-run ext-lang-cq.js? Has it been executed at this point already?
    
    var datePatterns = {
        // taken from i18n dictionary depending on user's locale
        "locale": {
            "normal":   CQ.I18n.getMessage("m/d/Y",      null, "Date format for ExtJS, eg. '9/25/2009' (http://extjs.com/deploy/ext/docs/output/Date.html)"),
            "short":    CQ.I18n.getMessage("M/j/y",      null, "Date format for ExtJS, short without leading zeros and two-digit year, eg. '9/25/09' (http://extjs.com/deploy/ext/docs/output/Date.html)"),
            "shortDay": CQ.I18n.getMessage("D n/j",      null, "Short day-focused date format for ExtJS, eg. 'Wed 9/10' (http://extjs.com/deploy/ext/docs/output/Date.html)"),
            "day":      CQ.I18n.getMessage("D M j",      null, "Day-focused date format for ExtJS, eg. 'Mon Mar 29' (http://extjs.com/deploy/ext/docs/output/Date.html)"),
            "longDay":  CQ.I18n.getMessage("<b>l</b>, M <b>j</b>, Y",  null, "Long day-focused date format for ExtJS, eg. '<b>Wednesday</b>, Jan <b>4</b>, 2009', with html bold markup (http://extjs.com/deploy/ext/docs/output/Date.html)"),
            "month":    CQ.I18n.getMessage("<b>F</b> Y",               null, "Month-focused date format for ExtJS, eg. '<b>October</b> 2009', with html bold markup (http://extjs.com/deploy/ext/docs/output/Date.html)"),
            "twoDatesInSameMonth":       CQ.I18n.getMessage("1M <b>1j - 2j</b> 2Y",     null, "Two dates with same month for ExtJS, eg. 'Dec <b>21 - 27</b> 2009', with html bold markup (prefix pattern chars with '1' to use the first date and '2' to use the second date - http://extjs.com/deploy/ext/docs/output/Date.html)"),
            "twoDatesInDifferentMonths": CQ.I18n.getMessage("<b>1M 1j - 2M 2j</b>, 2Y", null, "Two dates with different months for ExtJS, eg. '<b>Nov 30 - Dec 6</b>, 2009', with html bold markup (prefix pattern chars with '1' to use the first date and '2' to use the second date - http://extjs.com/deploy/ext/docs/output/Date.html)"),
            "twoDatesInDifferentYears":  CQ.I18n.getMessage("<b>1M 1j, 1Y - 2M 2j, 2Y</b>", null, "Two dates with different years for ExtJS, eg. '<b>Dec 28, 2009 - Jan 3, 2010</b>', with html bold markup (prefix pattern chars with '1' to use the first date and '2' to use the second date - http://extjs.com/deploy/ext/docs/output/Date.html)")
        },
        // starting with the day
        "littleEndian": {
            "normal":   "d.m.Y",       // eg. 25.09.2009
            "short":    "j.M.y",       // recurrencerulefield eg. 25.9.09
            "shortDay": "D j.n",       // week view eg. Mi 25.9.
            "day":      "D j. M.",     // agenda view eg. Mo 29. Mar. 
            "longDay":  "<b>l</b>, <b>j.</b> M., Y", // day lens eg. Dienstag, 4. Jan., 2009
            "month":    "<b>F</b> Y",                // month lens eg. October 2009
            "twoDatesInSameMonth":       "<b>1j. - 2j.</b> 2M. 2Y",       // eg. 21. - 27. Dez. 2009
            "twoDatesInDifferentMonths": "<b>1j. 1M. - 2j. 2M.</b>, 2Y",  // eg. 30. Nov. - 6. Dez., 2009
            "twoDatesInDifferentYears":  "<b>1j. 1M. 1Y - 2j. 2M. 2Y</b>" // eg. 28. Dez. 2009 - 3. Jan. 2010
        },
        // starting with the month
        "middleEndian": {
            "normal":   "m/d/Y",     // eg. 09/25/2009
            "short":    "M/j/y",     // eg. 9/25/09
            "shortDay": "D n/j",     // eg. Wed 9/25
            "day":      "D M j",     // eg. Mon Mar 29
            "longDay":  "<b>l</b>, M <b>j</b>, Y", // eg. Wednesday, Jan 4, 2009
            "month":    "<b>F</b> Y",              // eg. October 2009
            "twoDatesInSameMonth":       "1M <b>1j - 2j</b> 2Y",        // eg. Dec 21 - 27 2009
            "twoDatesInDifferentMonths": "1M <b>1j - 2M 2j</b>, 2Y",    // eg. Nov 30 - Dec 6, 2009
            "twoDatesInDifferentYears":  "<b>1M 1j, 1Y - 2M 2j, 2Y</b>" // eg. Dec 28, 2009 - Jan 3, 2010
        },
        // starting with the year
        "bigEndian": {
            "normal":   "Y-m-d",       // eg. 2009-09-25
            "short":    "y-M-j",       // eg. 09-9-25
            "shortDay": "D n.j",       // eg. Mi 9.25.
            "day":      "D j. M.",     // eg. Mo 29. Mar. 
            "longDay":  "<b>l</b>, <b>j.</b> M., Y", // eg. Dienstag, 4. Jan., 2009
            "month":    "<b>F</b> Y" ,               // eg. October 2009
            "twoDatesInSameMonth":       "<b>1j. - 2j.</b> 2M. 2Y",       // eg. 21. - 27. Dez. 2009
            "twoDatesInDifferentMonths": "<b>1j. 1M. - 2j. 2M.</b>, 2Y",  // eg. 30. Nov. - 6. Dez., 2009
            "twoDatesInDifferentYears":  "<b>1j. 1M. 1Y - 2j. 2M. 2Y</b>" // eg. 28. Dez. 2009 - 3. Jan. 2010
        }
    };
    
    var timePatterns = {
        // taken from i18n dictionary depending on user's locale
        "locale": {
            "normal": CQ.I18n.getMessage("g:i a", null, "Time format for ExtJS, eg. '8:23 pm' or '08:23' (http://extjs.com/deploy/ext/docs/output/Date.html)"),
            "short":  CQ.I18n.getMessage("ga",    null, "Short time format for ExtJS, eg. '12pm' or '12:00' (http://extjs.com/deploy/ext/docs/output/Date.html)")
        },
        // 12-hour clock based
        "12hclock": {
            "normal": "g:i a", // eg. 8:23 pm
            "short":  "ga"     // eg. 12pm
        },
        // 24-hour clock based
        "24hclock": {
            "normal": "H:i", // eg. 08:23
            "short":  "G:i"  // eg. 8:23
        }
    };
    
    var START_OF_WEEK_LOCALE = Number(CQ.I18n.getMessage("0", null, "Start day for week view in calendar (0=Sunday, 1=Monday, etc.)"));
    if (START_OF_WEEK_LOCALE < 0 || START_OF_WEEK_LOCALE > 6) {
        START_OF_WEEK_LOCALE = 0;
    }
    
    var config = {
        // the outermost DOM element of the calendar component
        element: null,
        
        // Current timezone of the user.
        timeZone: "Etc/UTC",
        
        // Base path of the current calendar
        defaultCalendarPath: null,
        
        eventDisplay: "formPopup",
        allowEditing: "permissionSensitive",
        
        // Path of the form page for creating/editing/viewing events
        eventForm: null,
        eventViewForm: null,

        eventEditPattern: null,
        eventViewPattern: null,
        
        // xtypes for dialog / popup widgets
        eventDialogXType: "calendareventdialog",
        eventPopupXType: "calendareventpopup",
        
        // calendar lens height
        height: 0,
        
        // Width and height for event dialog (<= 0 for defaults)
        eventDialogWidth: 0,
        eventDialogHeight: 0,
        eventPopupWidth: 0,
        eventPopupHeight: 0,
        
        // Date format patterns
        dateFormat: CQ.mcm.cal.DATE_TIME_LOCALE,
        timeFormat: CQ.mcm.cal.DATE_TIME_LOCALE,

        startOfWeek: START_OF_WEEK_LOCALE,
        
        // calendar colors
        colors: ["40864B"]    
    };
    
    function getStartOfWeekIndex(day) {
        var weekStartMapping = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'locale'];
        
        var index = -1;
        if (typeof(day) === "string") {
            index = weekStartMapping.indexOf(day);
        } else if (typeof(day) === "number") {
            index = day; 
        }
        if (index < 0 || index > 7) {
           return START_OF_WEEK_LOCALE;
        }
        
        if (index == 7) {
            return START_OF_WEEK_LOCALE;
        } else {
            return index;
        }
    }
    
    function initQueryBuilder(qb, pathQueryGroup) {
        qb.form.method = "POST";
        
        // unlimited results
        qb.setHidden("p.limit", "0");

        // give us raw node json
        qb.addHidden("p.hits", "full");
        // include one level of child nodes (for "recurrence")
        qb.addHidden("p.nodedepth", "1");
        // include ACLs for current user
        qb.addHidden("p.acls", "true");
        
        // we always want calendar events
        qb.addHidden("type", "cq:CalendarEvent");
        
        for (var key in pathQueryGroup) {
            if (pathQueryGroup.hasOwnProperty(key)) {
                qb.addHidden("group." + key, pathQueryGroup[key]);
            }
        }

        // event date range - actual values are set by lenses
        qb.addHidden("event.from", "");
        qb.addHidden("event.to", "");

        qb.addHidden("1_orderby", "event");
        qb.addHidden("2_orderby", "path");
    }
    
    return {
        init: function(cfg) {
            config = CQ.Util.applyDefaults(cfg, config);
            
            // backwards compat
            if (config.eventFormPath) {
                config.eventForm = config.eventFormPath;
            }
            
            config.startOfWeek = getStartOfWeekIndex(config.startOfWeek);
            
            initQueryBuilder(config.queryBuilder, config.pathQueryGroup);
            
            var cal = this;
            
            // when another lens was selected, it must be updated
            CQ.search.Util.getLensContainer().on("switch", function(lensContainer, oldLens, newLens) {
                if (newLens && oldLens != newLens && newLens.setDate) {
                    cal.setDate(selectedDate, true);
                }
            });
            
            var colorIndex = 0;
            var calendars = [config.defaultCalendarPath].concat(config.subscriptions);
            for (var i = 0; i < calendars.length; i++) {
                colorTable[calendars[i]] = config.colors[colorIndex];
                
                colorIndex++;
                if (colorIndex >= config.colors.length) {
                    colorIndex = 0;
                }
            }
        },
        
        //-----------------------------------------< change date boundaries for query >
        
        setLowerDateBound: function(date) {
            // date format in ISO-8601 (but shortened)
            config.queryBuilder.setHidden("event.from", date.format("Y-m-d"));
        },
        
        setUpperDateBound: function(date) {
            // date format in ISO-8601 (but shortened)
            config.queryBuilder.setHidden("event.to", date.format("Y-m-d"));
        },
        
        // -----------------------------------------< actions >
        
        setDateDisplay: function(html) {
            if (config.setDateDisplay) {
                config.setDateDisplay(html);
            }
        },
        
        /**
         * Moves the view to the given date. This depends on the current calendar lens, which
         * will be given the passed date in {@link CQ.mcm.cal.CalendarLens#setDate}, mapping
         * that date to its own display unit (eg. months) and returning the necessary start
         * and end dates for the event query via {@link CQ.mcm.cal.CalendarLens#getStartDate}
         * and {@link CQ.mcm.cal.CalendarLens#getEndDate}.
         *
         * <p>The lens will indicate with the boolean returned by
         * {@link CQ.mcm.cal.CalendarLens#setDate} if the date is already contained in the
         * view and if it is not necessary to rerun the event query. To force an update, pass
         * <code>forceUpdate=true</code>.
         *
         * <p>This will also trigger an update of the date displayed in the calendar component
         * header, using the text provided by the calendar lens in
         * {@link CQ.mcm.cal.CalendarLens#getDateDisplayText}.
         *
         * @param {Date} date  the date to move the view to
         * @param {Boolean} forceUpdate  set to true to force an refresh of the current view (optional)
         */
        setDate: function(date, forceUpdate) {
            selectedDate = date;
            
            var lens = CQ.search.Util.getLensContainer().getCurrentLens();
            if (lens && lens.setDate) {
                
                var update = lens.setDate(selectedDate);
                
                if (lens.getDateDisplayText) {
                    CQ.mcm.cal.Calendar.setDateDisplay( lens.getDateDisplayText() );
                }
                
                if (lens.getStartDate && lens.getEndDate) {
                    CQ.mcm.cal.Calendar.setLowerDateBound( lens.getStartDate() );
                    CQ.mcm.cal.Calendar.setUpperDateBound( lens.getEndDate() );
                }
                
                if (update || forceUpdate) {
                    CQ.mcm.cal.Calendar.update();
                }
            }
        },
        
        /**
         * Moves the view to the previous unit of time, eg. the previous month. This depends
         * on the current calendar lens and uses {@link CQ.mcm.cal.CalendarLens#prev}
         * for that.
         */
        prev: function() {
            var lens = CQ.search.Util.getLensContainer().getCurrentLens();
            if (lens && lens.prev) {
                CQ.mcm.cal.Calendar.setDate( lens.prev() );
            }
        },
        
        /**
         * Moves the view to the next unit of time, eg. the next month. This depends
         * on the current calendar lens and uses {@link CQ.mcm.cal.CalendarLens#next}
         * for that.
         */
        next: function() {
            var lens = CQ.search.Util.getLensContainer().getCurrentLens();
            if (lens && lens.next) {
                CQ.mcm.cal.Calendar.setDate( lens.next() );
            }
        },
        
        /**
         * Focuses the current lens on today. This will set the calendar date
         * to "now" using {@link #setDate}, which might rerun the query for events.
         */
        today: function() {
            CQ.mcm.cal.Calendar.setDate( new Date() );
        },
        
        /**
         * Refreshes the current lens view by re-running the querybuilder query for events.
         */
        update: function() {
            // the currently active lens will automatically be called with the result
            config.queryBuilder.submit();
        },
        
        /**
         * Runs a full text search of events. Pass <code>null</code> to reset the search
         * and show all events for the current view.
         *
         * @param {String} searchTerm  full text search term; use <code>null</code> to clear the query
         */
        search: function(searchTerm) {
            config.queryBuilder.setHidden("fulltext", searchTerm);
            this.update();
        },
        
        /**
         * Returns the height for lenses to use in the calendar component.
         *
         * @return {Number} the lens height in pixels
         */
        getLensHeight: function() {
            return config.height;
        },
        
        /**
         * Returns the color to use for an event. This color will be the same
         * for all events from the same calendar/subscription.
         * 
         * @return {String} a hex color value in the form of "FF0000"
         */
        getColorFor: function(event) {
            var path = event.get("recurrenceOf") || event.get("path");
            
            var match = "";
            // find longest matching path
            for (var p in colorTable) {
                // event path starts with calendar path and match is longer 
                if (path.indexOf(p) == 0 && p.length > match.length) {
                    match = p;
                }
            }
            
            return match ? colorTable[match] : "40864B";
        },
        
        // -----------------------------------------< time zone >
        
        /**
         * Returns the configured calendar time zone. This is used for displaying event start and
         * end times and also as the default time zone when creating new events.
         *
         * @return {String} timezone ID (olson based, see {@link Date#getTimezone})
         */
        getTimeZone: function() {
            return config.timeZone;
        },
        
        // -----------------------------------------< date formatting >
        
        /**
         * Returns a named date pattern to be used in ExtJs' {@link Date#format}. The actual
         * variant depends on the localization setting. Some patterns are:
         * <ul>
         * <li>normal - eg. 25.09.2009</li>
         * <li>short - eg. 25.9.09</li>
         * <li>shortDay - eg. Mi 25.9.</li>
         * <li>day - eg. Mo 29. Mar.</li>
         * <li>longDay - eg. Dienstag, 4. Jan., 2009</li>
         * <li>month - eg. October 2009</li>
         * <li>twoDatesInSameMonth - eg. 21. - 27. Dez. 2009</li>
         * <li>twoDatesInDifferentMonths - eg. 30. Nov. - 6. Dez., 2009</li>
         * <li>twoDatesInDifferentYears - eg. 28. Dez. 2009 - 3. Jan. 2010</li>
         * </ul>
         * @param {String} name  name of the pattern
         * @return {CQ.Ext.data.Record} the event record
         */
        getDatePattern: function(name) {
            return datePatterns[config.dateFormat][name];
        },
        
        /**
         * Returns a named time pattern to be used in ExtJs' {@link Date#format}. The actual
         * variant depends on the localization setting. Some patterns are:
         * <ul>
         * <li>normal - eg. 8:23 pm</li>
         * <li>short - eg. 12pm</li>
         * </ul>
         * @param {String} name  name of the pattern
         * @return {CQ.Ext.data.Record} the event record
         */
        getTimePattern: function(name) {
            return timePatterns[config.timeFormat][name];
        },
        
        /**
         * Returns the configured/locale-dependent start day of the week, eg.
         * 0 for Sunday, 1 for Monday, etc.
         *
         * @return {Number} a number from 0 (Sunday) to 6 (Saturday)
         */
        getStartOfWeek: function() {
            return config.startOfWeek;
        },
        
        // -----------------------------------------< create/edit/delete event (dialogs) >
        
        /**
         * Returns whether calendar editing is disabled through the configuration etc.
         * (i.e. permission independent).
         *
         * @return {Boolean} if calendar editing is generally disabled
         */
        isEditingDisabled: function() {
            if (config.allowEditing === "never") {
                return true;
                
            } else if (config.allowEditing === "onlyOnAuthor") {
                // TODO: CQ.WCM.isPublish() helper, see bug 30061
                // no sidekick present == on publish
                if (!Boolean(CQ.WCM.getSidekick())) {
                    return true;
                }
            }
            
            return false;
        },
        
        /**
         * Returns whether the current user or the configuration and context allows events
         * to be created. Returns false if no create event option should be available.
         *
         * @param {String} calendarPath  path of the calendar to create the event in; defaults to the default calendar
         * @return {Boolean} if an event can be created
         */
        canCreateEvent: function(calendarPath) {
            if (this.isEditingDisabled()) {
                return false;
            }
            return CQ.User.getCurrentUser().hasPermissionOn("create", calendarPath || config.defaultCalendarPath);
        },
        
        /**
         * Returns whether the current user or the configuration and context allows the event
         * to be modified. Returns false if events are to be displayed only.
         *
         * @param {CQ.Ext.data.Record} event  event record with the fields as defined by {@link #getFields}()
         * @return {Boolean} if the event can be modified
         */
        canModifyEvent: function(event) {
            if (this.isEditingDisabled()) {
                return false;
            }
            // look for existing permissions from the query result
            var p = event && event.get("jcr:permissions");
            if (p) {
                return p.modify;
            }
            // fallback: explicit path lookup
            return CQ.User.getCurrentUser().hasPermissionOn("modify", event ? event.get("path") : config.defaultCalendarPath);
        },
        
        /**
         * Returns whether the current user or the configuration and context allows the event
         * to be deleted. Returns false if events are to be displayed only.
         *
         * @param {CQ.Ext.data.Record} event  event record with the fields as defined by {@link #getFields}()
         * @return {Boolean} if the event can be deleted
         */
        canDeleteEvent: function(event) {
            if (this.isEditingDisabled()) {
                return false;
            }
            // look for existing permissions from the query result
            var p = event && event.get("jcr:permissions");
            if (p) {
                return p["delete"];
            }
            // fallback: explicit path lookup
            return CQ.User.getCurrentUser().hasPermissionOn("delete", event ? event.get("path") : config.defaultCalendarPath);
        },
        
        /**
         * Opens the event form to create an event. Must only be called if {@link #canCreateEvent}
         * returns true.
         *
         * @param {Date} date  default start date for new event; optional, defaults to the current
         *                     time, rounded using {@link #roundedTime}
         * @param {Boolean} isDate  if this should be an all-day event; optional, defaults to false
         * @param {Date} endDate  default end date for new event; optional, defaults to the start date
         *                        plus one hour
         * @param {HTMLElement} el  the element to align to (eg. the event in the lens) (optional)
         * @param {String} align  how to align the window to the element; see {@link CQ.Ext.Element#alignTo} (optional)
         */
        createEvent: function(date, isDate, endDate, el, align) {
            if (!date) {
                date = new Date().replaceTimezone(config.timeZone);
                var time = CQ.mcm.cal.Calendar.roundedTime();
                date.clearTime();
                date.setHours(time.hour, time.min);
            }
            
            var event = this.createEventRecord();
            
            // sling-style URL to create new content (needs to end with "/")
            event.set("path", config.defaultCalendarPath + "/" + date.format("Y/m/d") + "/");
            event.set("start", date);
            event.set("end", endDate || date.add(Date.HOUR, 1));
            // marker for editEvent method
            event.isNew = true;
            event.isDate = isDate;
            
            this.openEventEditDialog(event, el, align);
        },
        
        /**
         * Returns a link to be used as href for an event to show (instead of editing).
         * If this method returns null, which is the case when {@link #canModifyEvent} returns
         * false, {@link #openEvent} has to be called instead.
         * A client is free to always call {@link #openEvent} right away, it will open the
         * link in case of event display only.
         *
         * @param {CQ.Ext.data.Record} event event record with the fields as defined by {@link #getFields}()
         * @return {String} an externalized html URL or <code>null</code>
         */
        getEventLink: function(event) {
            if (this.canModifyEvent(event)) {
                return null;
            }
            
            if (config.eventDisplay === "eventUrlLink") {
                if (event.get("url")) {
                    return CQ.HTTP.externalize(event.get("url") + ".html");
                }
                return CQ.HTTP.externalize(CQ.mcm.cal.Calendar.formatEventURL(event, config.eventViewPattern));
                
            } else if (config.eventDisplay === "patternLink") {
                return CQ.HTTP.externalize(CQ.mcm.cal.Calendar.formatEventURL(event, config.eventViewPattern));
            }
             
            // formPopup or patternPopup => no view link, open event for view in popup
            return null;
        },
        
        /**
         * Opens an event. See {@link #openEvent}.
         *
         * @deprecated since 5.4, use {@link #openEvent} instead
         * @param {CQ.Ext.data.Record} event event record with the fields as defined by {@link #getFields}()
         */
        editEvent: function(event) {
            this.openEvent(event);
        },
        
        /**
         * Opens an event. This depends on the configuration and/or the access rights of
         * the user, and might open the event in a custom rendering in a new window, open
         * the page assigned with the event or open a dialog to edit the event.
         *
         * @param {CQ.Ext.data.Record} event event record with the fields as defined by {@link #getFields}()
         * @param {HTMLElement} el  the element to align to (eg. the event in the lens) (optional)
         * @param {String} align  how to align the window to the element; see {@link CQ.Ext.Element#alignTo} (optional)
         */
        openEvent: function(event, el, align) {
            var link = this.getEventLink(event);
            if (link) {
                CQ.shared.Util.open(link);
            } else {
                if (this.canModifyEvent(event)) {
                    // open dialog for editing
                    this.openEventEditDialog(event, el, align);
                } else {
                    // open popup for view
                    this.openEventViewPopup(event, el, align);
                }
            }
        },
        
        /**
         * Opens an event popup with the configured event form or pattern to view it.
         *
         * <p>Uses an widget defined by the config "eventPopupXType" (defaults to
         * {@link CQ.mcm.cal.EventPopup}), which must have a single method
         * <code>open</code> accepting these parameters: an event record ({@link CQ.Ext.data.Record}),
         * the config object from this calendar and optionally the element that displays
         * the event in the current lens.
         *
         * @private
         * @param {CQ.Ext.data.Record} event event record with the fields as defined by {@link #getFields}()
         * @param {HTMLElement} el  the element to align to (eg. the event in the lens) (optional)
         * @param {String} align  how to align the window to the element; see {@link CQ.Ext.Element#alignTo} (optional)
         */
        openEventViewPopup: function(event, el, align) {
            if (!eventPopup) {
                eventPopup = CQ.Ext.ComponentMgr.create({
                    xtype: config.eventPopupXType || "calendareventpopup"
                });
            }
            
            eventPopup.open(event, config, el, align);
        },
        
        /**
         * Opens an event dialog with the configured event form to edit or create it.
         * The create event case is determined by <code>event.isNew == true </code> and
         * the path (<code>event.get("path")</code>) will end with a slash "/". Start
         * and end date will be set (<code>event.get("start"), event.get("end")</code>),
         * as well as <code>event.isDate</code> to indicate if it is an all-day event.
         *
         * <p>Uses an widget defined by the config "eventDialogXType" (defaults to
         * {@link CQ.mcm.cal.EventDialog}), which must have a single method
         * <code>open</code> accepting two parameters: an event record ({@link CQ.Ext.data.Record}),
         * the config object from this calendar and optionally the element that displays
         * the event in the current lens.
         *
         * @private
         * @param {CQ.Ext.data.Record} event event record with the fields as defined by {@link #getFields}()
         * @param {HTMLElement} el  the element to align to (eg. the event in the lens) (optional)
         * @param {String} align  how to align the window to the element; see {@link CQ.Ext.Element#alignTo} (optional)
         */
        openEventEditDialog: function(event, el, align) {
            if (!eventDialog) {
                eventDialog = CQ.Ext.ComponentMgr.create({
                    xtype: config.eventDialogXType || "calendareventdialog"
                });
            }
        
            eventDialog.open(event, config, el, align);
        },
        
        /**
         * Deletes an existing event given by its path.
         * @param {String} path  the path of the event to delete
         * @param {Boolean} onlyThis  for recurrences: true if only the selected event occurrence
         *                            should be deleted, false if the entire series should be removed
         */
        deleteEvent: function(path, onlyThis) {
            var url = path;
            url = CQ.HTTP.addParameter(url,
                    CQ.Sling.STATUS, CQ.Sling.STATUS_BROWSER);
            if (onlyThis) {
                url = CQ.HTTP.addParameter(url, CQ.mcm.cal.Calendar.DELETE_FROM_RECURRENCE_PARAM, "");
            } else {
                url = CQ.HTTP.addParameter(url,
                        CQ.Sling.OPERATION, CQ.Sling.OPERATION_DELETE);
            }
            
            var response = CQ.HTTP.post(url);
            
            if (CQ.HTTP.isOk(response)) {
                // reload lenses
                CQ.mcm.cal.Calendar.update();
            } else {
                // TODO: handle error
            }
        },
        
        // -----------------------------------------< event store >
        
        /**
         * Creates an {@link CQ.Ext.data.Record} for events, using the fields provided by
         * {@link #getFields}.
         * @param {Object} data  the raw json object with the event node data from the server
         * @return {CQ.Ext.data.Record} the event record
         */
        createEventRecord: function(data) {
            if (!this.eventRecordPrototype) {
                this.eventRecordPrototype = CQ.Ext.data.Record.create(this.getFields());
            }
            return new this.eventRecordPrototype(data || {});
        },
        
        /**
         * Returns an array of field definitions for an {@link CQ.Ext.data.Record} used for events.
         * This is used by the {@link #createEventRecord} method.
         * @return {Array} array of ext field definitions
         */
        getFields: function() {
            function timeZoneConvert(value, rec) {
                return Date.parseWithTimezone(value, rec.timeZone, rec.isDate, config.timeZone);
            };
            
            return [
                // we cannot use jcr:title/jcr:path directly as the xtemplate used by
                // the DataViewLens cannot handle field names with ':' inside
                { "name": "path", "mapping": "jcr:path" },
                { "name": "jcr:permissions" },
                
                { "name": "title", "mapping": "jcr:title" },
                
                // provide start/end in the current user's timezone
                { "name": "start", "type": "date", "convert": timeZoneConvert },
                { "name": "end",   "type": "date", "convert": timeZoneConvert },
                
                { "name": "originalStart", "mapping": "start", "type": "date" },
                { "name": "originalEnd",   "mapping": "end",   "type": "date" },
                { "name": "isDate", "type": "boolean" },
                { "name": "timeZone" },
                
                
                { "name": "uid" },
                { "name": "recurrenceOf" },
                { "name": "recurrence" },
                { "name": "url" }
            ];
        },
        
        // -----------------------------------------< static >
        
        TAKE_OUT_OF_RECURRENCE_PARAM: ":takeOutOfRecurrence",
        DELETE_FROM_RECURRENCE_PARAM: ":deleteFromRecurrence",
    
        /**
         * Returns hours and minutes "rounded" towards full and half hours. For example,
         * "14:42" would be rounded to "15:00" and "7:24" woulde become "7:30". At the
         * beginning and the end of the day rounding will stop at "0:00" and "23:30",
         * respectively. If no arguments are given, the current local time will be used.
         *
         * @param {Number} hour  hours to round (optional)
         * @param {Number} min   minutes to round (optional)
         * @return {Object} an object with the fields "hour" and "min"
         */
        roundedTime: function(hour, min) {
            if (arguments.length == 0) {
                var now = new Date();
                hour = now.getHours();
                min = now.getMinutes();
            }

            // sanity check for wrong input
            if (hour > 23) {
                hour = 23;
            } else if (hour < 0) {
                hour = 0;
            }
            
            // next upcoming half or full hour
            // (except it is already round)
            if (min <= 0) {
                // sanity check for wrong input
                min = 0;
            } else if (min > 30) {
                // 14:42 => 15:00
                hour += 1;
                min = 0;
                // avoid skipping to the next day
                // 23:45 => 23:30
                if (hour >= 23) {
                    hour = 23;
                    min = 30;
                }
            } else if (min < 30) {
                // 14:17 => 14:30
                min = 30;
            }

            return { hour: hour, min: min };
        },

        formatEventURL: function(event, pattern) {
            if (!pattern) {
                return "#";
            }
            return new CQ.Ext.Template(pattern).applyTemplate({
               event: event.get("path"),
               url: event.get("url"),
               page: CQ.WCM.getPagePath(),
               home: CQ.User.getCurrentUser().getHome()
            });
        }
        
    };
    
}();

/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * Handles the calendar event edit dialog.
 * @class CQ.mcm.cal.EventDialog
 * @extends CQ.Ext.util.Observable
 */
CQ.mcm.cal.EventDialog = CQ.Ext.extend(CQ.Ext.util.Observable, {
    
    iframeDialog: null,
    
    constructor: function(config) {
        CQ.mcm.cal.EventDialog.superclass.constructor.call(this, config);
    },

    open: function(event, config, el, align) {
        var path = event.get("path");
        var isRecurrence = false;
        
        // is this a recurrence of a recurring event?
        if (event.get("recurrenceOf")) {
            // always point to original event path by default
            path = event.get("recurrenceOf");
            isRecurrence = true;
        } else {
            // check if event is original event of a recurrence (= has recurrence subnode)
            isRecurrence = typeof event.get("recurrence") === "object";
        }
        
        // used in delete handler, assigned later
        var originalEventStart, originalEventEnd;
        
        var iframeDialog = this.iframeDialog;
        
        function normalDeleteHandler() {
            CQ.Ext.Msg.confirm(
                    CQ.I18n.getMessage("Delete event"),
                    CQ.I18n.getMessage("Are you sure you want to delete this event?"),
                    function (button) {
                        if (button == "yes") {
                            iframeDialog.hide();
                            CQ.mcm.cal.Calendar.deleteEvent(path);
                        }
                    }
                ).setIcon(CQ.Ext.Msg.QUESTION);
        };
        
        function recurrenceDeleteHandler() {
            CQ.Ext.Msg.show({
                title: CQ.I18n.getMessage("Delete Recurring Event"),
                msg: CQ.I18n.getMessage("Would you like to delete all events in the series or only this event?"),
                buttons: {
                    ok: CQ.I18n.getMessage("All events in the series"),
                    yes: CQ.I18n.getMessage("Only this instance"),
                    cancel: CQ.I18n.getMessage("Cancel")
                },
                fn: function(buttonId) {
                    if (buttonId === "ok") {
                        // delete all events (path points to original event)
                        iframeDialog.hide();
                        CQ.mcm.cal.Calendar.deleteEvent(path);
                        
                    } else if (buttonId === "yes") {
                        // delete only this (point to recurring event path)
                        iframeDialog.hide();
                        CQ.mcm.cal.Calendar.deleteEvent(event.get("path"), true);
                    } else {
                        // cancel, do nothing
                    }
                }
            });
        };
        
        var dlgConfig = {
            title: (event.isNew ? CQ.I18n.getMessage("Create event") : CQ.I18n.getMessage("Edit event")),
            
            okText: CQ.I18n.getMessage("Save"),
            buttons: [
                {
                    xtype: "button",
                    text: CQ.I18n.getMessage("Delete"),
                    handler: isRecurrence ? recurrenceDeleteHandler : normalDeleteHandler,
                    // only show delete button when we edit an event and if the user is allowed to delete
                    hidden: (typeof event.isNew !== "undefined") || !CQ.mcm.cal.Calendar.canDeleteEvent(event)
                },
                CQ.Dialog.OK,
                CQ.Dialog.CANCEL
            ],
            success: function() {
                // run after successful ok() handler
                CQ.mcm.cal.Calendar.update();
            },
            listeners: {
                loadContent: function(dialog) {
                    var eventbasics = dialog.getContentWin().eventbasics;
                    if (eventbasics) {
                        // timezone must be set before we call eventbasics.getEventStart() below
                        if (eventbasics.setTimeZone) {
                            eventbasics.setTimeZone(config.timeZone);
                        }
                        
                        if (event.isNew || event.get("recurrenceOf")) {
                            // init the form with the date for the new event or
                            // adapt it to the recurring instance
                            if (eventbasics.setEventDate) {
                                // specific functions are provided by the eventbasics form component
                                originalEventStart = eventbasics.getEventStart();
                                originalEventEnd = eventbasics.getEventEnd();
                                eventbasics.setEventDate(event.get("start"), event.get("end"));
                            }
                            if (event.isDate && eventbasics.setIsDate) {
                                eventbasics.setIsDate(true);
                            }
                        }
                        
                        if (eventbasics.setDateFormats) {
                            eventbasics.setDateFormats(
                                CQ.mcm.cal.Calendar.getDatePattern("normal"),
                                CQ.mcm.cal.Calendar.getTimePattern("normal"),
                                CQ.mcm.cal.Calendar.getStartOfWeek()
                            );
                        }
                    }
                    
                    var recurrence = dialog.getContentWin().recurrence;
                    if (recurrence && recurrence.setDateFormat) {
                        recurrence.setDateFormat(CQ.mcm.cal.Calendar.getDatePattern("normal"));
                    }
                }
            }
        };
        
        if (config.eventEditPattern) {
            var url = CQ.HTTP.externalize(CQ.mcm.cal.Calendar.formatEventURL(event, config.eventEditPattern));
            dlgConfig.buildIframeUrl = function() {
                return url;
            };
        } else {
            dlgConfig.formPath = config.eventForm;
        }
        
        if (config.eventDialogWidth > 0) {
            dlgConfig.width = config.eventDialogWidth;
        }
        
        if (config.eventDialogHeight > 0) {
            dlgConfig.height = config.eventDialogHeight;
        }
        
        if (el) {
            dlgConfig.listeners.show = function(win) {
                win.alignTo(el, align || "l-r?");
            };
        }
        
        if (iframeDialog) {
            iframeDialog.destroy();
        }
        
        iframeDialog = new CQ.IframeDialog(dlgConfig);
        this.iframeDialog = iframeDialog;
        
        // for recurrences, change the save button behaviour
        if (isRecurrence) {
            iframeDialog.on("beforesubmit", function() {
                // find out what changed inside the form
                var win = iframeDialog.getContentWin();
                var eventbasics = win.eventbasics;
                var recurrence = win.recurrence;
                if (!eventbasics) {
                    return false;
                }
                
                // means that the date part of the start/end datetime changed, not the time
                var datesChanged = (eventbasics.dates_changed == true);
                var recurrenceRuleChanged = (recurrence && recurrence.rule_changed == true);
                // TODO: find out *any* change in the form (and also skip question / save then)
                var onlyRecurrenceRuleChanged = false;

                if (onlyRecurrenceRuleChanged) {
                    // always change full series when only the recurrence rule changed
                    // ie. just submit the dialog as-is
                    return true;
                } else {
                    // ask user what to do
                    CQ.Ext.Msg.show({
                        title: CQ.I18n.getMessage("Edit Recurring Event"),
                        msg: CQ.I18n.getMessage("Would you like to change all events in the series or only this event?"),
                        //msg: CQ.I18n.getMessage("Would you like to change all events in the series, only this event or this and all future events in the series?"),
                        buttons: {
                            ok: CQ.I18n.getMessage("All events in the series"),
                            yes: CQ.I18n.getMessage("Only this instance"),
                            //no: CQ.I18n.getMessage("All following"),
                            cancel: CQ.I18n.getMessage("Cancel")
                        },
                        fn: function(buttonId) {
                            var iform = iframeDialog.getIframeForm();
                            
                            if (buttonId === "ok") {
                                // all events
                                // request goes to original event

                                if (!datesChanged || recurrenceRuleChanged) {
                                    // reset date part of start/end fields to the value of the original event
                                    // (because if we are on a recurrence, the post goes to the original
                                    // while the dates were changed to display the ones from the recurrence)
                                    if (originalEventStart && eventbasics.setYearMonthDayForEventDates) {
                                        eventbasics.setYearMonthDayForEventDates(originalEventStart, originalEventEnd);
                                    }
                                }
                                
                                iframeDialog.submit(true);

                            } else if (buttonId === "yes") {
                                // only this
                                // request goes to recurring event

                                // disable recurrence rule fields
                                if (recurrence && recurrence.setRecurrenceDisabled) {
                                    recurrence.setRecurrenceDisabled(true);
                                }
                                
                                // insert hidden ":takeOutOfRecurrence" field
                                iform.addHiddenField(CQ.mcm.cal.Calendar.TAKE_OUT_OF_RECURRENCE_PARAM, "");
                                
                                // change form action to actual recurring event path
                                iform.form.action = CQ.HTTP.externalize(event.get("path"));
                                // also change edit resource action hint
                                var fields = iform.formEl.query("input[name=':resource']");
                                if (fields && fields.length > 0) {
                                    fields[0].value = event.get("path");
                                }
                                
                                iframeDialog.submit(true);
                                
                            /*
                            } else if (buttonId === "no") {
                                // all following
                                // request goes to recurring event
                                
                                // disable recurrence rule fields
                                if (recurrence && recurrence.setRecurrenceDisabled) {
                                    recurrence.setRecurrenceDisabled(true);
                                }
                                // insert hidden ":splitRecurrence" field
                                iform.addHiddenField(":splitRecurrence", "");
                                
                                // change form action to actual recurring event path
                                iform.form.action = event.get("path");
                                // also change edit resource action hint
                                var fields = iform.formEl.query("input[name=':resource']");
                                if (fields && fields.length > 0) {
                                    fields[0].value = event.get("path");
                                }
                                
                                iframeDialog.submit(true);
                                
                            */
                            } else /* if (buttonId === "cancel") */ {
                                // cancel
                            }
                        }
                    });
                    return false;
                }
            }, this);
        }
        
        iframeDialog.show();
        iframeDialog.loadContent(path);
    }
});

CQ.Ext.reg("calendareventdialog", CQ.mcm.cal.EventDialog);

/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * Handles the calendar event view popup.
 * @class CQ.mcm.cal.EventPopup
 * @extends CQ.Ext.util.Observable
 */
CQ.mcm.cal.EventPopup = CQ.Ext.extend(CQ.Ext.util.Observable, {
    
    iframeDialog: null,

    constructor: function(config) {
        CQ.mcm.cal.EventPopup.superclass.constructor.call(this, config);
    },

    open: function(event, config, el, align) {
        var url;
        if (config.eventDisplay === "formPopup") {
            url = event.get("path") + ".form.view.html" + config.eventViewForm + "?wcmmode=disabled";
        } else if (config.eventDisplay === "patternPopup") {
            url = CQ.mcm.cal.Calendar.formatEventURL(event, config.eventViewPattern);
        }
        
        if (this.iframeDialog) {
            this.iframeDialog.destroy();
        }
        
        this.iframeDialog = new CQ.IframeDialog({
            cls: "cq-calendar-event-popup",
            baseCls: "cq-calendar-event-popup",
            draggable: false,
            resizable: false,
            closable: true,
            header: false,
            border: false,
            shadow: true,
            modal: true,
            y: 20,
            height: config.eventPopupHeight,
            width: config.eventPopupWidth,
            
            listeners: {
                scope: this,
                
                show: el ? function(win) {
                    win.alignTo(el, align || "l-r?");
                } : CQ.Ext.emptyFn,

                // similar to the loadContent handler in EventDialog.js, but we can do
                // less because we don't need to support the submit
                loadContent: function(dialog) {
                    var eventbasics = dialog.getContentWin().eventbasics;
                    if (eventbasics) {
                        // timezone must be set before we call eventbasics.getEventStart() below
                        if (eventbasics.setTimeZone) {
                            eventbasics.setTimeZone(config.timeZone);
                        }
                        
                        if (event.isNew || event.get("recurrenceOf")) {
                            // init the form with the date for the new event or
                            // adapt it to the recurring instance
                            if (eventbasics.setEventDate) {
                                eventbasics.setEventDate(event.get("start"), event.get("end"));
                            }
                            if (event.isDate && eventbasics.setIsDate) {
                                eventbasics.setIsDate(true);
                            }
                        }
                        
                        if (eventbasics.setDateFormats) {
                            eventbasics.setDateFormats(
                                CQ.mcm.cal.Calendar.getDatePattern("normal"),
                                CQ.mcm.cal.Calendar.getTimePattern("normal"),
                                CQ.mcm.cal.Calendar.getStartOfWeek()
                            );
                        }
                    }
                    
                    var recurrence = dialog.getContentWin().recurrence;
                    if (recurrence && recurrence.setDateFormat) {
                        recurrence.setDateFormat(CQ.mcm.cal.Calendar.getDatePattern("normal"));
                    }
                }
            }
        });
        this.iframeDialog.show();
        this.iframeDialog.loadContent(url);
    }
});

CQ.Ext.reg("calendareventpopup", CQ.mcm.cal.EventPopup);

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * The <code>CQ.mcm.cal.WeekView</code> renders one or multiple
 * days next to each other.
 * NOT USED CQ.mcm.cal.WeekView
 * @extends CQ.Ext.Panel
 */
CQ.mcm.cal.WeekView = CQ.Ext.extend(CQ.Ext.Panel, {

    constructor: function(config) {
        var cal = CQ.mcm.cal.Calendar;
        
        var i;
        var startDate = config.startDate;
        // Note: end date is +1d after the last day displayed
        var days = this.getDaysBetween(startDate.utcDateOnly(), config.endDate.utcDateOnly());
        
        var date = startDate;
        var dateDisplayItems = [];
        var dayDateFormat = cal.getDatePattern("shortDay");
        for (i=0; i < days; i++) {
            dateDisplayItems.push({ "html": date.format(dayDateFormat) });
            date = date.add(Date.DAY, 1);
        }
        
        var topPanel = new CQ.Ext.Panel({
            "cls": "cq-calendar-week-top",
            "layout": "table",
            "layoutConfig": {
                "columns": 1
            },
            "bodyStle": "padding-left: 40px; padding-right: 16px; padding-bottom: 15px; border: 0px; background-color: #ddd",
            "items": [
                {
                    "cls": "cq-calendar-week-daybar",
                    "layout": "table",
                    "layoutConfig": {
                        "columns": days
                    },
                    "border": false,
                    "defaults": {
                        "border": true,
                        "style": "text-align: center"
                    },
                    "items": dateDisplayItems
                },
                {
                    "cls": "cq-calendar-week-alldaybar",
                    "layout": "table",
                    "layoutConfig": {
                        "columns": days
                    },
                    "border": false,
                    "style": "minHeight: 40px",
                    "defaults": {
                        "border": false
                    },
                    "items": this.buildAllDayEventPanels(startDate, days, config.store)
                }
           ]
        });
        
        // height of a single hour in pixels
        this.hourHeight = config.hourHeight || 40;
        
        var dayPanels = [];
        var timePanel = {
            "layout": "table",
            "layoutConfig": {
                "columns": 1
            },
            "cellStyle": "width:40px",
            "border": false,
            "width": 40,
            "items": []
        };
        var veryShortTimeFormat = cal.getTimePattern("short");
        var timeOfDay = startDate.clearTime(true);
        for (i = 0; i < 24; i++) {
            timePanel.items.push({
                "html": timeOfDay.add(Date.HOUR, i).format(veryShortTimeFormat),
                "style": "text-align: right; padding-right: 5px;",
                "height": this.hourHeight,
                "border": false
            });
        }
        dayPanels.push(timePanel);
        
        for (i = 0; i < days; i++) {
            date = startDate.add(Date.DAY, i);
            dayPanels.push(this.buildDayPanel(date, this.hourHeight, config.store));
        }
        
        var bodyPanel = new CQ.Ext.Panel({
            "cls": "cq-calendar-week-body",
            "border": false,
            "layout": "fit",
            "items": [
                {
                    "layout": "fit",
                    "bodyStyle": "overflow-y: scroll",
                    "autoWidth": true,
                    "defaults": {
                        "autoWidth": true
                    },
                    "items": {
                        "layout": "table",
                        "layoutConfig": {
                            "columns": 1 + days
                        },
                        "border": false,
                        "items": dayPanels
                    }
                }
            ]
        });
        
        config = CQ.Util.applyDefaults(config, {
            "cls": "cq-calendar-week",
            "height": CQ.mcm.cal.Calendar.getLensHeight(),
            "layout": "table",
            "layoutConfig": {
                "columns": 1
            },
            "border": false,
            "items": [ topPanel, bodyPanel ]
        });
        
        CQ.mcm.cal.WeekView.superclass.constructor.call(this, config);
    },
    
    buildAllDayEventPanels: function(startDate, days, store) {
        var allDayEventPanels = [];
        
        // events are already ordered
        var events = this.getAllDayEvents(store);
        if (events) {
            //events.each(function(event) {
            //    console.log("> event: " + event.get("title") + " " + event.get("start") + " - " + event.get("end"));    
            //});
            
            // start with first event
            var event = events.removeAt(0);
            var col = 0;
            var startCol, endCol, colsLeft;
            var startsEarlier = false, endsLater = false;
            
            while (event) {       
                // current event: calculate startcol + endcol
                startCol = this.getDaysBetween(startDate.utcDateOnly(), event.get("start"));
                // enforce boundaries for event that starts earlier
                if (startCol < 0) {
                    startCol = 0;
                    startsEarlier = true;
                } else {
                    startsEarlier = false;
                }
                endCol = this.getDaysBetween(startDate.utcDateOnly(), event.get("end"));
                // enforce boundaries for event that end later
                if (endCol >= days) {
                    endCol = days - 1;
                    endsLater = true;
                } else {
                    endsLater = false;
                }
                
                if (startCol > col) {
                    // place dummy between current col and startcol
                    allDayEventPanels.push({
                        "colspan": startCol - col
                    });
                }
                
                // place event
                allDayEventPanels.push({
                    //"title": (startsEarlier ? "< " : "") + event.get("title") + (endsLater ? " >" : ""),
                    "html": (startsEarlier ? "< " : "") + event.get("title") + (endsLater ? " >" : ""),
                    "colspan": endCol - startCol + 1,
                    "frame": true,
                    "border": false,
                    "calendarEvent": event,
                    "listeners": {
                        "render": function() {
                            this.body.unselectable();
                            var ev = this.calendarEvent;
                            this.body.on("dblclick", function() {
                                CQ.mcm.cal.Calendar.openEvent(ev);
                            });
                        }
                    }
                });
                
                // calculate spec left
                col = endCol + 1;
                colsLeft = days - col;
                
                // we can stop immediately if no events are left
                if (events.getCount() == 0) {
                    break;
                }
                
                if (colsLeft >= 1) {
                    // find event that fits in the area left
                    for (var i=0; i < events.getCount(); i++) {
                        event = events.get(i);
                        startCol = this.getDaysBetween(startDate.utcDateOnly(), event.get("start"));
                        if (startCol >= col) {
                            // event found, remove from the list
                            events.removeAt(i);
                            // end this for loop
                            break;
                        }
                        // none found => close this row
                        event = null;
                    }
                    // if event that still fits into this row was found in the for loop,
                    // continue with another round of the while loop
                    if (event) {
                        continue;
                    }
                    
                    // => close row
                    // place dummy to close this row
                    allDayEventPanels.push({
                        "colspan": colsLeft
                    });
                }
                // start at beginning with next event
                col = 0;
                event = events.removeAt(0);
            }
            
            if (colsLeft > 0) {
                // place dummy to close this row
                allDayEventPanels.push({
                    "colspan": colsLeft
                });
            }
        }
        
        // return empty object if no panel created, as an empty array
        // gives an error for the panel's item property in Extjs
        return allDayEventPanels.length > 0 ? allDayEventPanels : {};
    },
    
    buildDayPanel: function(day, hourHeightInPx, store) {
        var timeFormat = CQ.mcm.cal.Calendar.getTimePattern("normal");
        var dayPanel = {
            "cellStyle": "vertical-align: top; border-right: 1px solid #ccc;",
            "layout": "absolute",
            "border": false,
            "items": []
        };
        var tz = CQ.mcm.cal.Calendar.getTimeZone();
        day = day.shift(tz).clearTime(true);
        var events = this.getEventsForDay(day, store);
        if (events) {
            
            var nextDay = day.add(Date.DAY, 1);
            
            var groups = [];
            groups.push([]); // create first group
            
            var groupEndY = 0;

            // 1. collect events into overlapping groups            
            events.each(function(event) {
                var start = event.get("start");
                var end = event.get("end");
                // limit to end of day
                if (end.getTime() > nextDay.getTime()) {
                    end = nextDay;
                }

                var startY = this.calculatePixels(day, start, hourHeightInPx);
                var endY = this.calculatePixels(day, end, hourHeightInPx);
                if (groupEndY == 0 || startY < groupEndY) {
                    // overlap, integrate into group
                    groups[groups.length-1].push(event);
                } else {
                    // new group
                    groups.push([event]);
                }
                // enlarge group if new event lasts longer than the existing group
                groupEndY = endY > groupEndY ? endY : groupEndY;
            }, this);
            
            // 2. render each group...
            for (var i=0; i < groups.length; i++) {
                // ...by distributing the events in each group horizontally
                var group = groups[i];
                if (group.length == 0) {
                    continue;
                }
                var groupStartY = this.calculatePixels(day, group[0].get("start"), hourHeightInPx);
                var groupPanel = {
                    "style": "width: 100%",
                    "y": groupStartY,
                    "border": false,
                    "layout": "table",
                    "layoutConfig": {
                        "columns": group.length
                    },
                    "items": []
                };
                for (var j=0; j < group.length; j++) {
                    var event = group[j];
                    var eventStartY = this.calculatePixels(day, event.get("start"), hourHeightInPx);
                    var eventEndY = this.calculatePixels(day, event.get("end"), hourHeightInPx);
                    var eventHeight = eventEndY - eventStartY;
                    // minimum height
                    if (eventHeight < 15) {
                        eventHeight = 15;
                    }
                    groupPanel.items.push({
                        "title": event.get("start").format(timeFormat) + " " + event.get("title"),
                        //"baseCls":"x-box",
                        "frame": true,
                        "cellStyle": "vertical-align: top; margin-top: " + (eventStartY - groupStartY) + "px;",
                        "style": "overflow: hidden;",
                        "height": eventHeight,
                        "calendarEvent": event,
                        "listeners": {
                            "render": function() {
                                this.body.unselectable();
                                var ev = this.calendarEvent;
                                this.body.on("dblclick", function() {
                                    CQ.mcm.cal.Calendar.openEvent(ev);
                                });
                            }
                        }
                    });
                }
                dayPanel.items.push(groupPanel);
            }
        }
        if (dayPanel.items.length == 0) {
            dayPanel.items = null;
        }
        return dayPanel;
    },
    
    calculatePixels: function(start, end, hourHeightInPx) {
        var MILLIS_PER_HOUR = 60 * 60 * 1000.0;
        return ((end.getTime() - start.getTime()) / MILLIS_PER_HOUR) * hourHeightInPx;
    },

    getAllDayEvents: function(store) {
        if (!store) {
            return null;
        }
        return store.queryBy(function(event, id) {
            return event.get("isDate");
        }, this);
    },
    
    getEventsForDay: function(day, store) {
        if (!store) {
            return null;
        }
        day.clearTime();
        
        return store.queryBy(function(event, id) {
            if (event.get("isDate")) {
                return false;
            }
            return day.isSameDateAs(event.get("start"));
        }, this);
    },
    
    getDaysBetween: function(start, end) {
        var MILLIS_PER_DAY = 24 * 60 * 60 * 1000.0;
        return Math.floor((end.getTime() - start.getTime()) / MILLIS_PER_DAY);
    }
	
});

CQ.Ext.reg("weekview", CQ.mcm.cal.WeekView);

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * The <code>CQ.mcm.cal.CalendarLens</code> introduces the methods
 * required by a lens used in the calendar environment, in addition
 * to the standard {@link CQ.search.Lens} methods.
 * @class CQ.mcm.cal.CalendarLens
 * @extends CQ.search.Lens
 */
CQ.mcm.cal.CalendarLens = CQ.Ext.extend(CQ.search.Lens, {

    /**
     * Option for LensDeck: do not load last data on lens switch, because
     * calendar lenses define a new timeframe for the query and hence
     * need a new query anyway.
     */
    loadLastData: false,

    /**
     * Returns the start date of this lens when going back one unit,
     * eg. the previous month for a month lens.
     * 
     * @return {Date} previous date
     */
	prev: function() {
	},
	
    /**
     * Returns the start date of this lens when going forward one unit,
     * eg. the next month for a month lens.
     * 
     * @return {Date} next date
     */
	next: function() {
	},
	
	/**
	 * Sets this lens to the given date. For example, when the today
	 * button is clicked, this method will be called with "now".
	 * Depending on what the lens actually displays, this might be
	 * interpreted as for example "current month" if the lens is a month lens.
     * 
     * This method must return "true" if the date changed so that the
     * view should be rerendered.
	 * 
	 * Implementations shall not render itself inside, this will
	 * be done implicitly because a query will be submitted after
	 * calling this function and {@link CQ.search.Lens#loadData} will be called, which
	 * must handle the rendering of the newly loaded data.
	 * 
	 * @param {Date} date
	 * @return {Boolean} whether the internal date changed and the lens must be rendered again
	 */
	setDate: function(date) {
	},
	
	/**
	 * Return the date to display on the top of the calendar.
	 * 
	 * @return {String} date display text (or html)
	 */
	getDateDisplayText: function() {
	},
	
	/**
	 * Returns the start date to use as lower bound for the query for events.
	 * 
	 * @return {Date} lower bound date
	 */
	getStartDate: function() {
	},
	
    /**
     * Returns the end date to use as upper bound for the query for events.
     * 
     * @return {Date} upper bound date
     */
    getEndDate: function() {
    }
    
});

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * The <code>CQ.mcm.cal.DayLens</code> renders the day view
 * of the calendar
 * @class CQ.mcm.cal.DayLens
 * @extends CQ.mcm.cal.CalendarLens
 */
CQ.mcm.cal.DayLens = CQ.Ext.extend(CQ.mcm.cal.CalendarLens, {

    /**
     * date of the day
     * @private
     */
    date: null,
	
    /**
     * internal day panel
     * @private
     */
    dayPanel: null,

    constructor: function(config) {
        this.store = new CQ.Ext.data.JsonStore({
			"fields": CQ.mcm.cal.Calendar.getFields()
		});
		
        config = CQ.Util.applyDefaults(config, {
            "autoScroll": true,
            "renderTo": CQ.Util.ROOT_ID,
            "border": false
        });
        
        CQ.mcm.cal.DayLens.superclass.constructor.call(this, config);
    },
	
	// public calendar lens api
	
	prev: function() {
        // Note: rendering is delayed up to renderDay(), called upon querybuilder response
        return this.date.add(Date.DAY, -1);
	},
	
	next: function() {
        // Note: rendering is delayed up to renderDay(), called upon querybuilder response
        return this.date.add(Date.DAY, 1);
	},
	
	setDate: function(date) {
	    // calculate day
	    var newDate = date.clearTime(true);
	    
	    var oldDate = this.date;
	    this.date = newDate;

	    return (!oldDate || (oldDate.getTime() != this.date.getTime()));
	},
	
    getDateDisplayText: function() {
        // eg. "December 2009"
        return this.date.format(CQ.mcm.cal.Calendar.getDatePattern("longDay"));
    },
    
    getStartDate: function() {
        return this.date;
    },
    
    getEndDate: function() {
        return this.date.add(Date.DAY, 1);
    },
    
    // public lens api
    
    loadData: function(data) {
        this.store.loadData(data.hits);
        this.renderDay();
    },

    getSelection: function() {
        // no selection at the moment for calendar events
        return [];
    },
    
	// internal stuff
	
	renderDay: function() {
		if (this.dayPanel) {
			this.remove(this.dayPanel);
		}
		
        this.dayPanel = new CQ.mcm.cal.WeekView({
            "startDate": this.date,
            "endDate": this.date.add(Date.DAY, 1),
            "store": this.store
        });
        this.add(this.dayPanel);
        
        // TODO: hack, need better way to get our container parent
        this.findParentByType("lensdeck").doLayout();
        //this.doLayout();
	}
});

CQ.Ext.reg("daylens", CQ.mcm.cal.DayLens);

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * The <code>CQ.mcm.cal.WeekLens</code> renders the week view
 * of the calendar
 * NOT USED class CQ.mcm.cal.WeekLens
 * @extends CQ.mcm.cal.CalendarLens
 */
CQ.mcm.cal.WeekLens = CQ.Ext.extend(CQ.mcm.cal.CalendarLens, {

    /**
     * start date of the week
     * @private
     */
    startDate: null,
    
    /**
     * end date of the week
     * @private
     */
    endDate: null,
	
    /**
     * internal week panel
     * @private
     */
    weekPanel: null,

    constructor: function(config) {
        this.store = new CQ.Ext.data.JsonStore({
			"fields": CQ.mcm.cal.Calendar.getFields()
		});
		
        config = CQ.Util.applyDefaults(config, {
            "autoScroll": true,
            "renderTo": CQ.Util.ROOT_ID,
            "border": false
        });
        
        CQ.mcm.cal.WeekLens.superclass.constructor.call(this, config);
    },
	
	// public calendar lens api
	
	prev: function() {
        // Note: rendering is delayed up to renderWeek(), called upon querybuilder response
        return this.startDate.add(Date.DAY, -7);
	},
	
	next: function() {
        // Note: rendering is delayed up to renderWeek(), called upon querybuilder response
        return this.startDate.add(Date.DAY, 7);
	},
	
	setDate: function(date) {
        var oldStartDate = this.startDate;
        
	    // day: reset to configured week start
	    this.startDate = date.clearTime(true).add(Date.DAY, CQ.mcm.cal.Calendar.getStartOfWeek() - date.getDay());
	    this.endDate = this.startDate.add(Date.DAY, 7);
	    
	    return (!oldStartDate || (oldStartDate.getTime() != this.startDate.getTime()));
	},
	
    getDateDisplayText: function() {
        var cal = CQ.mcm.cal.Calendar;
        
        // week span displayed as start + end date, which can be in different months or even years
        if (this.startDate.getFullYear() != this.endDate.getFullYear()) {
            return CQ.mcm.cal.multiDateFormat(
                cal.getDatePattern("twoDatesInDifferentYears"),
                [this.startDate, this.endDate]
            );
        } else if (this.startDate.getMonth() != this.endDate.getMonth()) {
            return CQ.mcm.cal.multiDateFormat(
                cal.getDatePattern("twoDatesInDifferentMonths"),
                [this.startDate, this.endDate]
            );
        } else {
            return CQ.mcm.cal.multiDateFormat(
                cal.getDatePattern("twoDatesInSameMonth"),
                [this.startDate, this.endDate]
            );
        }
    },
    
    getStartDate: function() {
        return this.startDate;
    },
    
    getEndDate: function() {
        return this.endDate;
    },
    
    // public lens api
    
    loadData: function(data) {
        this.store.loadData(data.hits);
        this.renderWeek();
    },

    getSelection: function() {
        // no selection at the moment for calendar events
        return [];
    },
    
	// internal stuff

	renderWeek: function() {
		if (this.weekPanel) {
			this.remove(this.weekPanel);
		}
		
        this.weekPanel = new CQ.mcm.cal.WeekView({
            "startDate": this.startDate,
            "endDate": this.endDate,
            "store": this.store
        });
        this.add(this.weekPanel);
        
        // TODO: hack, need better way to get our container parent
        this.findParentByType("lensdeck").doLayout();
        //this.doLayout();
	}
});

CQ.Ext.reg("weeklens", CQ.mcm.cal.WeekLens);

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * The <code>CQ.mcm.cal.MonthLens</code> renders the month view
 * of the calendar
 * @class CQ.mcm.cal.MonthLens
 * @extends CQ.mcm.cal.CalendarLens
 */
CQ.mcm.cal.MonthLens = CQ.Ext.extend(CQ.mcm.cal.CalendarLens, {

    /**
     * first date of displayed month
     * @private
     */
    monthStart: null,
    
    /**
     * start display date
     * @private
     */
    start: null,
    
    /**
     * end display date (+1 day)
     * @private
     */
    end: null,
	
    /**
     * internal month panel
     * @private
     */
    monthPanel: null,
    
    constructor: function(config) {
        this.store = new CQ.Ext.data.JsonStore({
			"fields": CQ.mcm.cal.Calendar.getFields()
		});
		
        config = CQ.Util.applyDefaults(config, {
            "autoScroll": true,
            "renderTo": CQ.Util.ROOT_ID,
            "border": false,
            "height": CQ.mcm.cal.Calendar.getLensHeight(),
            "headerHeight": 20, // height of the day names header
            "headerBorder": 2, // css border vertical sum for day names header
            "dayBorder": 1,    // css border vertical sum for day cell
            "dayHeaderHeight": 13, // height of the day header showing the day number
            "eventHeight": 14 // height of a single event inside a day cell
        });
        
        CQ.mcm.cal.MonthLens.superclass.constructor.call(this, config);
    },
	
	// public calendar lens api
	
	prev: function() {
        // Note: rendering is delayed up to renderMonth(), called upon querybuilder response
        return this.monthStart.add(Date.MONTH, -1);
	},
	
	next: function() {
        // Note: rendering is delayed up to renderMonth(), called upon querybuilder response
        return this.monthStart.add(Date.MONTH, 1);
	},
	
	setDate: function(date) {
        var startOfWeek = CQ.mcm.cal.Calendar.getStartOfWeek();
        
        var newMonthStart = date.getFirstDateOfMonth();
        // find the first week start on or before the month start day => display start
        // calculate the proper start week day depending on the configured start weekday        
        var startWeekDay = newMonthStart.getDay() - startOfWeek;
        if (startWeekDay < 0) {
            startWeekDay += 7;
        }
        this.start = newMonthStart.add(Date.DAY, - startWeekDay);
        
        var newMonthEnd = date.getLastDateOfMonth();
        // find the first week end after or on the month end => display end
        var endWeekDay = newMonthEnd.getDay() - startOfWeek;
        if (endWeekDay < 0) {
            endWeekDay += 7;
        }
        // Note: the end will be the day after the last day displayed, in order
        // to be used for the upper bound of the query and for doing getTime() < end.getTime()
        this.end = newMonthEnd.add(Date.DAY, 6 - endWeekDay + 1);
        
        var oldMonthStart = this.monthStart;
        this.monthStart = newMonthStart;
        
        return (!oldMonthStart || (oldMonthStart.getTime() != this.monthStart.getTime()));
	},
	
	getDateDisplayText: function() {
        // eg. "December 2009"
	    return this.monthStart.format(CQ.mcm.cal.Calendar.getDatePattern("month"));
	},
	
    getStartDate: function() {
        return this.start;
    },
    
    getEndDate: function() {
        return this.end;
    },
    
    // public lens api
    
    loadData: function(data) {
        this.store.loadData(data.hits);
        this.renderMonth();
    },

    getSelection: function() {
        // no selection at the moment for calendar events
        return [];
    },
	
	// internal stuff

	renderMonth: function() {
        var cal = CQ.mcm.cal.Calendar;

        // recreate month panel        
		if (this.monthPanel) {
			this.remove(this.monthPanel);
		}
        this.monthPanel = new CQ.Ext.Panel({
            "cls": "cq-calendar-month",
            "border": false,
            "hideBorders": true,
            "layout": "table",
            "height": this.height,
            "layoutConfig": {
                "columns": 7
            },
            "defaults": {
            	  "cellCls": 'cq-calendar-month-daybar'
            }
        });
		this.add(this.monthPanel);
		
        // header with day names: Monday, Tuesday, etc.
        for (var i = cal.getStartOfWeek(); i < cal.getStartOfWeek() + 7; i++) {
            this.monthPanel.add({
                "html": Date.dayNames[i % 7],
                "cls": "cq-calendar-month-dayname",
                "height": this.headerHeight
            });
        }
		
        // first calculate total number of days displayed, then divide by 7 to get the nr of rows
        var MILLIS_PER_DAY = 24 * 60 * 60 * 1000.0;
        // need to round because this will not divide evenly on months with DST change (a few hours less or more)
        var days = Math.round((this.end.getTime() - this.start.getTime()) / MILLIS_PER_DAY);
        var rows = Math.ceil(days / 7);
        
        this.dayHeight = Math.floor((this.height - this.headerHeight - this.headerBorder) / rows) - this.dayBorder;
        this.eventsPerDay = Math.floor((this.dayHeight - this.dayHeaderHeight) / this.eventHeight);
        
        // ordered list of all-day events to keep the position stable across days
        var alldayEvents = [];
        
        // current month
        for (var d = this.start; d.getTime() < this.end.getTime(); d = d.add(Date.DAY, 1)) {
            var cls = "";
            if (d.getMonth() < this.monthStart.getMonth()) {
                cls = "prev-month-day";
            } else if (d.getMonth() > this.monthStart.getMonth()) {
                cls = "next-month-day";
            }
            
            var dayPanel = this.renderDay(d, alldayEvents, cls);
            dayPanel.height = this.dayHeight;
            this.monthPanel.add(dayPanel);
        }
        
		// TODO: hack, need better way to get our container parent
		this.findParentByType("lensdeck").doLayout();
        //this.doLayout();
	},
	
    renderDay: function(currentDay, alldayEvents, cls) {
        // use ext domhelper notation for creating the child divs for events and co.
        var html = [], moreHtml = [];
        
        // A) add bar showing day of month number
        html.push({
            tag: "div",
            cls: "cq-calendar-month-daybar",
            children: [{
                tag: "div",
                cls: "cq-calendar-month-day-number",
                html: currentDay.getDate()
            }]
        });
        
        // B) all day events (1. - 4.)
        this.renderAllDayEvents(currentDay, html, moreHtml, alldayEvents);
        
        // C) events with time (they are already ordered)
        this.renderTimeEvents(currentDay, html, moreHtml);
        
        // finall check for too many events for the space we have
        // (note the first element is not an event but the daybar)
        
        //var fullHtml = null;
        var hiddenEvents = (html.length - 1) - this.eventsPerDay;
        if (hiddenEvents > 0) {
            var tmp = html, i;
            html = [];
            // copy only eventsPerDay-1, as we need the last space for the "more" link
            for (i=0; i < this.eventsPerDay; i++) {
                html[i] = tmp[i];
            }
            
            // count the actual events for the "+2 more" display, skip dummy placeholders
            hiddenEvents = 0;
            for (i=this.eventsPerDay-1; i < moreHtml.length; i++) {
                if (moreHtml[i].isEvent) {
                    hiddenEvents++;
                }
            }
            
            var popupId = CQ.Ext.id();
            // more link
            html.push({
                tag: "a",
                cls: "cq-calendar-month-day-morelink",
                href: "#",
                html: CQ.I18n.getMessage("+{0} more", [hiddenEvents], "link to see more calendar events that don't fit into the current view"),
                // the explicit setting of the zIndex of the parent is required as a fix for IE
                // (otherwise the popup would pop under the table cell) 
                onclick: "if (event) { CQ.Ext.lib.Event.stopEvent(event); } var el = document.getElementById('" + popupId + "'); el.parentNode.style.zIndex = '1'; el.style.display = 'block';"
            });
            // add more popup (hidden at start)
            html.push({
                id: popupId,
                tag: "div",
                cls: "cq-calendar-month-day-morepopup",
                style: "position: absolute; top: 0; left: 0; width: 200%; z-index: 10; display: none;",
                children: moreHtml
            });
            // close link
            moreHtml.push({
               tag: "a",
                cls: "cq-calendar-month-day-closemorelink",
                href: "#",
                html: CQ.I18n.getMessage("Close"),
                onclick: "if (event) { CQ.Ext.lib.Event.stopEvent(event); } document.getElementById('" + popupId + "').style.display = 'none'"
            });
        }
        
        return this.getDayPanel(currentDay, cls, html);
    },
    
	renderAllDayEvents: function(currentDay, html, moreHtml, alldayEvents) {
        // 1. start with the same order of allday events as on the previous day
        var currentDayUTC = currentDay.utcDateOnly();
        var i;
        for (i=0; i < alldayEvents.length; i++) {
            var ev = alldayEvents[i];
            if (ev && !currentDayUTC.between(ev.get("start"), ev.get("end"))) {
                // clear position
                alldayEvents[i] = null;
            }
        }
        
        // sorts two (all-day) events by their duration
        function sortByDuration(a, b) {
            var durA = a.get("end").getTime() - a.get("start").getTime();
            var durB = b.get("end").getTime() - b.get("start").getTime();
            return durA - durB;
        }
        
        // 2. find new events (starting on this day)
        // Note: we put longer events at the beginning, so they do not end up
        //       at the bottom of the more popup
        var events = this.getEvents(currentDay, true);
        events.sort("DESC", sortByDuration);
        events.each(function(event) {
            if (alldayEvents.indexOf(event) < 0) {
                // not yet present, find hole to fill
                for (var i=0; i < alldayEvents.length; i++) {
                    if (alldayEvents[i] == null) {
                        alldayEvents[i] = event;
                        event = null;
                        break;
                    }
                }
                // if no hole was found, add at the end
                if (event) {
                    alldayEvents.push(event);
                }
            }
        });
        
        // 3. clear empty entries at the end
        for (i = alldayEvents.length-1; i >= 0; i--) {
            if (alldayEvents[i]) {
                break;
            }
            alldayEvents.pop();
        }
        
        // 4. render collected all-day events
        for (i=0; i < alldayEvents.length; i++) {
            var event = alldayEvents[i];
            if (event == null) {
                // render dummy placeholder
                var dummy = {
                    tag: "div",
                    cls: "cq-calendar-month-event"
                };
                html.push(dummy);
                moreHtml.push(dummy);
                
            } else {
                html.push(this.createAllDayEventDiv(event, currentDay, false));
                moreHtml.push(this.createAllDayEventDiv(event, currentDay, true));
            }
        }
	},
	
	createAllDayEventDiv: function(event, currentDay, isMoreHtml) {
        var starts = this.eventStartsOnDay(currentDay, event);
        var ends = this.eventEndsOnDay(currentDay, event);
        
        var startOfWeek = CQ.mcm.cal.Calendar.getStartOfWeek();
        var isWeekStart = (currentDay.getDay() == startOfWeek);
        var isWeekEnd = (currentDay.add(Date.DAY, 1).getDay() == startOfWeek);
        
        var color = CQ.mcm.cal.Calendar.getColorFor(event);
        var h = this.eventHeight - 1;
        
        var elem = {
            tag: "a",
            href: "#",
            cls: "cq-calendar-month-event all-day cq-ellipsis",
            style: "height: " + h + "px; line-height: " + h + "px; background-color: #" + color + ";",
            title: event.get("title")
        };
        
        var link = CQ.mcm.cal.Calendar.getEventLink(event);
        if (link) {
            elem.href = link;
        } else {
            // Note: domhelper does not allow to set real functions for event handler, not even with "useDom=true"
            elem.onclick = "CQ.mcm.cal.MonthLens.editEvent(event, '" + this.id + "', '" + event.id + "')";
        }
        
        if (starts || isWeekStart || isMoreHtml) {
            elem.html = event.get("title");
        }
        
        var leftDiv = { tag: "div", style: "margin-bottom: 1px; ", isEvent: true };
        var rightDiv = { tag: "div" };
        leftDiv.children = [rightDiv];
        rightDiv.children = [elem];
        
        var spritesURL = CQ.HTTP.externalize("/libs/cq/ui/resources/sprites");
        
        var arrowHeight = 8;
        var arrowTop = Math.floor((h - arrowHeight) / 2);
        var arrow = {
            /* top */    t: arrowTop,
            /* middle */ m: Math.floor(h / 2),
            /* bottom */ b: arrowTop + arrowHeight
        };
        
        if (starts) {
            leftDiv.style += "margin-left: 1px; ";
            leftDiv.style += "padding-left: 7px; ";
            
            leftDiv.style += "background: transparent url(" + spritesURL + ".7." + h + ".roundrect.0.0.14." + h + ".8.F." + color + ".png) no-repeat 0 0;";
        } else if (isMoreHtml || isWeekStart) {
            leftDiv.style += "padding-left: 12px; ";
            leftDiv.style += "background: transparent url(" + spritesURL + ".12." + h + ".rect.0.0.12." + h + ".F." + color +
                             ".poly.2." + arrow.m + ".7." + arrow.t + ".7." + arrow.b + ".F.white.png) no-repeat 0 0;";
        }
        
        if (ends) {
            rightDiv.style = "margin-right: 1px; ";
            rightDiv.style += "padding-right: 7px; ";
            rightDiv.style += "background: transparent url(" + spritesURL + ".7." + h + ".roundrect.-7.0.14." + h + ".8.F." + color + ".png) no-repeat right 0;";
        } else if (isMoreHtml || isWeekEnd) {
            rightDiv.style = "padding-right: 12px; ";
            rightDiv.style += "background: transparent url(" + spritesURL + ".12." + h + ".rect.0.0.12." + h + ".F." + color +
                              ".poly.5." + arrow.t + ".5." + arrow.b + ".10." + arrow.m + ".F.white.png) no-repeat right 0;";
        }
        
        return leftDiv;
	},
	
	renderTimeEvents: function(currentDay, html, moreHtml) {
	    var timeFormat = CQ.mcm.cal.Calendar.getTimePattern("normal");
	    var monthLensID = this.id;
	    
        this.getEvents(currentDay, false).each(function(event) {
            var elem = {
                tag: "a",
                cls: "cq-calendar-month-event cq-ellipsis",
                html: event.get("start").format(timeFormat) + " " + event.get("title"),
                isEvent: true
            };
            elem.title = elem.html;
            var link = CQ.mcm.cal.Calendar.getEventLink(event);
            if (link) {
                elem.href = link;
            } else {
                elem.onclick = "CQ.mcm.cal.MonthLens.editEvent(event, '" + monthLensID + "', '" + event.id + "')";
            }
            html.push(elem);
            moreHtml.push(elem);
        });
	},
	
	getDayPanel: function(date, cls, html) {
	    // check for today (in the configured timezone)
	    var now = new Date().shift(CQ.mcm.cal.Calendar.getTimeZone());
	    if (date.isSameDateAs(now)) {
	        cls = (cls ? cls + " current-day" : "current-day");
	    }
	    
	    var cfg = {
            html: html,
            bodyCfg: {
                cls: "x-panel-body cq-calendar-month-day " + cls
            }
        };
        
        if (CQ.mcm.cal.Calendar.canCreateEvent()) {
            cfg.createDate = date.utcDateOnly();
            cfg.listeners = {
                render: function() {
                    this.el.unselectable();
                    var date = this.createDate;
                    this.body.on("click", function() {
                        CQ.mcm.cal.Calendar.createEvent(date, true, null, this.body.dom, "l-r?");
                    }, this);
                }
            };
            cfg.bodyCfg.cls += " cq-calendar-create-event-highlight";
            //cfg.bodyCfg.title = CQ.I18n.getMessage("Click to create a new event");
        }
        
        return cfg;
	},
	
	getEvents: function(date, isAllDay) {
        // check if the event is on the same day
        // TODO: this could be improved (iteration instead of query, because events are ordered)
		return this.store.queryBy(function(event, id) {
			var eventIsAllDay = event.get("isDate");
			if (eventIsAllDay != isAllDay) {
				return false;
			}
			
            if (eventIsAllDay) {
                // compare dates on UTC date basis only
                date = date.utcDateOnly();
                // display all-day events on every day they cover
                return date.between(event.get("start"), event.get("end"));
            } else {
                // check if the date part is equal
                return date.isSameDateAs(event.get("start"));
            }
            
		}, this);
	},
	
	eventStartsOnDay: function(date, event) {
        if (event.get("isDate")) {
            date = date.utcDateOnly();
        }
        return date.isSameDateAs(event.get("start"));
	},
	
    eventEndsOnDay: function(date, event) {
        if (event.get("isDate")) {
            date = date.utcDateOnly();
        }
        return date.isSameDateAs(event.get("end"));
    }
	
});

/**
 * Helper to edit an event from an html inline event handler, based
 * on the component id of the month lens and the id of the event record
 * in its store.
 * 
 * @private
 * @static
 */
CQ.mcm.cal.MonthLens.editEvent = function(ev, id, eventId) {
    var e = CQ.Ext.EventObject.setEvent(ev);
    e.stopEvent();
    
    var monthLens = CQ.Ext.getCmp(id);
    if (monthLens) {
        var event = monthLens.store.getById(eventId);
        if (event) {
            CQ.mcm.cal.Calendar.openEvent(event, e.getTarget(), "l-r?");
        }
    }
};

CQ.Ext.reg("monthlens", CQ.mcm.cal.MonthLens);

/*
 * Copyright 1997-2009 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 * The <code>CQ.mcm.cal.RecurrenceRuleField</code> form widget allows to
 * display and set a calendar event recurence rule.
 * 
 * @class CQ.mcm.cal.RecurrenceRuleField
 * @extends CQ.form.CompositeField
 */
CQ.mcm.cal.RecurrenceRuleField = CQ.Ext.extend(CQ.form.CompositeField, {

    constructor: function(config) {
        CQ.Util.applyDefaults(config, {
            "rule": {},
            "prefix": ".",
            "textStyle": "font-size: 11px; font-family: Tahoma; font-style: normal; font-weight: normal;",
            "inDateFormat": null, // use standard javascript Date constructor/parser
            // Note: ExtJS date format parser can only parse D (eg. Mon) and co
            //       in the current locale! Thus using it for the ECMA date format is not good
            //"inDateFormat": "D M d Y H:i:s \\G\\M\\TO",
            "outDateFormat": "Y-m-d\\TH:i:s.000O", // when posting form
            "displayDateFormat": CQ.Ext.form.DateField.prototype.format, // when displaying human readable form of rule
            "readOnly": false,
            
            // inherited config
            "border": false,
            "maskDisabled": false,
            "layout": "table",
            "layoutConfig": {
                "columns": 1
            }
        });

        // needed in getRuleDefaults() and updatePlainTextDescription()
        this.inDateFormat = config.inDateFormat;
        this.displayDateFormat = config.displayDateFormat;
        
        this.applyRuleDefaults(config.rule);
        
        if (config.readOnly) {
            config.html = this.getPlainTextDescription(config.rule);
            
            CQ.mcm.cal.RecurrenceRuleField.superclass.constructor.call(this, config);
            return;
        }
        
        var ruleWidget = this;
        
        this.rulePath = config.prefix + "/recurrence/rule/";
        this.oldRule = config.rule;
        
        // ------------------------------------------------< frequency selector >
        
        // this is the central combo widget that enables/disables recurrence
        this.frequencyField = new CQ.Ext.form.ComboBox({
            "width": 120,
            "hideLabel": true,
            "bodyStyle": "margin-top:10px;",
            
            // if the value is "" (no repeat), we change the name to end with
            // @Delete so that the property will be removed instead of written
            "hiddenName": this.getFrequencyName(config.rule.frequency),
            "forceSelection": true,
            "editable": false,
            "triggerAction": "all",
            "store": [
                ["", CQ.I18n.getMessage("Does not repeat")],
                ["daily", CQ.I18n.getMessage("Daily")],
                ["weekly", CQ.I18n.getMessage("Weekly")],
                ["monthly", CQ.I18n.getMessage("Monthly")],
                ["yearly", CQ.I18n.getMessage("Yearly")]
            ],
            "value": config.rule.frequency || "",
            "listeners": {
                "beforeselect" : function(combo, record, index) {
                    // if recurrence is enabled for the first time, ensure default end type
                    if (combo.getValue() === "") {
                        ruleWidget.setDefaultEndType();
                    }
                    return true;
                },
                "select" : function(combo, record, index) {
                    ruleWidget.updateRule();
                }
            }
        });
        
        // displays the human readable version of the rule (eg. "Weekly until 1/4/09")
        this.plainTextPanel = new CQ.Ext.Panel({
            "width": 250,
            "border": true,
            "bodyStyle": "margin-top:10px; padding:10px; border: 1px solid #777; background-color: #e1e1e1;",
            "html": this.getPlainTextDescription(config.rule)
        });
        
        // ------------------------------------------------< hidden fields for Sling Post >
        
        this.hiddenRuleDelete = new CQ.Ext.form.Hidden({
            "xtype": "hidden",
            "name": config.prefix + "/recurrence@Delete",
            "value": "",
            "disabled": (config.rule.frequency !== "")
        });
        
        this.hiddenRecurrenceType = new CQ.Ext.form.Hidden({
            "xtype": "hidden",
            "name": config.prefix + "/recurrence/jcr:primaryType",
            "value": "cq:CalendarRecurrence",
            "defaultValue": "cq:CalendarRecurrence"
        });
        
        this.hiddenRecurrenceRuleType = new CQ.Ext.form.Hidden({
            "xtype": "hidden",
            "name": this.rulePath + "jcr:primaryType",
            "value": "cq:CalendarRecurrenceRule",
            "defaultValue": "cq:CalendarRecurrenceRule"
        });
        
        this.hiddenUntilDelete = new CQ.Ext.form.Hidden({
            "xtype": "hidden",
            "name": this.rulePath + "until@Delete",
            "value": ""
        });
        
        this.hiddenCountDelete = new CQ.Ext.form.Hidden({
            "xtype": "hidden",
            "name": this.rulePath + "count@Delete",
            "value": ""
        });
        
        // ------------------------------------------------< interval part >
        
        this.intervalField = new CQ.Ext.form.NumberField({
            "width": 30,
            "name": this.rulePath + "interval",
            "allowBlank": false,
            "allowNegative": false,
            "allowDecimals": false,
            "minValue": 1,
            "value": config.rule.interval || 1,
            "listeners": {
                "change" : function(field, newVal, oldVal) {
                    ruleWidget.updateRule();
                }
            }
        });
        
        this.intervalUnitLabel = new CQ.Ext.Panel({
            "html": this.getIntervalUnit(config.rule.frequency || ""),
            "border": false,                
            "bodyStyle": "padding:5px;"
        });
        
        // TODO: detailed weekly (bug 23558), monthly (23559) and yearly (23560) config
        /*
          {
                // Use the default, automatic layout to distribute the controls evenly
                // across a single row
                xtype: 'checkboxgroup',
                fieldLabel: 'Auto Layout',
                items: [
                    {boxLabel: 'Item 1', name: 'cb-auto-1'},
                    {boxLabel: 'Item 2', name: 'cb-auto-2', checked: true},
                    {boxLabel: 'Item 3', name: 'cb-auto-3'},
                    {boxLabel: 'Item 4', name: 'cb-auto-4'},
                    {boxLabel: 'Item 5', name: 'cb-auto-5'}
                ]
            } 
         */
        
        // ------------------------------------------------< recurrence range (end) >
        
        var endType = this.getEndType(config.rule);
        
        // Text metrics:
        // we have to manually calculate the width of certain labels because
        // the layout requires fixed pixel widths to work properly and the
        // text is localized, ie. it could be longer than the english original

        // text metrics hack (needs an existing element with correct css)       
        var hiddenLabel = new CQ.Ext.form.Label({ 
           text: "placeholder", 
           renderTo: document.body, 
           style: config.textStyle,
           hidden: true
        });
        var tm = CQ.Ext.util.TextMetrics.createInstance(hiddenLabel.el);
        
        // UNTIL
        
        // these texts are in the same column, the longest one wins
        var radioColWidth = 30 /* radio dot + padding */ + Math.max(
            tm.getWidth(CQ.I18n.getMessage("By&nbsp;")),
            tm.getWidth(CQ.I18n.getMessage("After")),
            tm.getWidth(CQ.I18n.getMessage("Never"))
        );
        
        this.untilRadio = new CQ.Ext.form.Radio({
            "boxLabel": CQ.I18n.getMessage("By&nbsp;"),
            "cellStyle": "width: " + radioColWidth + "px; height: 30px;",
            "name": ":ignored_radios_end",
            "inputValue": "until",
            "checked": (endType === "until" ? true : false),
            "listeners": {
                "check": function(){
                    ruleWidget.updateRule();
                }
            }
        });
        
        this.untilField = new CQ.form.DateTime({
            "dateWidth": 100,
            "hideTime": true,
            "name": this.rulePath + "until",
            "disabled": (endType !== "until"),
            "allowBlank": false,
            "hiddenFormat": config.outDateFormat,
            "listeners": {
                "change" : function(field, newVal, oldVal) {
                    ruleWidget.untilFieldSetByUser = true;
                    ruleWidget.updateRule();
                }
            }
        });
        this.untilField.setValue(config.rule.until || this.getDefaultUntil(config.rule.frequency));
        
        // COUNT
        
        this.countRadio = new CQ.Ext.form.Radio({
            "boxLabel": CQ.I18n.getMessage("After"),
            "cellStyle": "width: " + (20 + tm.getWidth(CQ.I18n.getMessage("After"))) + "px; height: 30px;",
            "name": ":ignored_radios_end",
            "inputValue": "count",
            "checked": (endType === "count" ? true : false),
            "listeners": {
                "check": function(){
                    ruleWidget.updateRule();
                }
            }
        });
        
        this.countField = new CQ.Ext.form.NumberField({
            "width": 30,
            "name": this.rulePath + "count",
            "allowBlank": false,
            "allowNegative": false,
            "allowDecimals": false,
            "minValue": 1,
            "value": config.rule.count || 10,
            "disabled": (endType !== "count"),
            "listeners": {
                "change" : function(field, newVal, oldVal) {
                    ruleWidget.updateRule();
                }
            }
        });
        
        this.countLabel = new CQ.Ext.form.Label({
            "text": CQ.I18n.getMessage("occurences"),
            "disabled": (endType !== "count"),
            "style": "padding-left: 5px;"
        });
        
         // NEVER
        
        this.neverRadio = new CQ.Ext.form.Radio({
            "boxLabel": CQ.I18n.getMessage("Never"),
            "colspan": 2,
            "cellStyle": "width: " + (20 + tm.getWidth(CQ.I18n.getMessage("Never"))) + "px; height: 30px;",
            "name": ":ignored_radios_end",
            "inputValue": "never",
            "checked": (endType === "never" ? true : false),
            "listeners": {
                "check": function(){
                    ruleWidget.updateRule();
                }
            }
        });
        
        // ------------------------------------------------< big panel when repeat is on >
        
        this.repeatPanel = new CQ.Ext.Panel({
            "border": false,
            "bodyStyle": "margin-left:20px;",
            "height": 180,
            "hideMode": "visibility",
            
            "layout": "table",
            "layoutConfig": {
                "columns": 1
            },
            "items": [
                {
                    "xtype": "hidden",
                    "name": this.rulePath + "interval@TypeHint",
                    "value": "Long"
                },
                {
                    "xtype": "hidden",
                    "name": this.rulePath + "count@TypeHint",
                    "value": "Long"
                },
                this.hiddenUntilDelete,
                this.hiddenCountDelete,
                this.plainTextPanel,
                {
                    "height": 25,
                    "border": false,
                    "bodyStyle": "margin-top:10px;",
                    
                    "layout": "column",
                    "items": [
                        {
                            "html": CQ.I18n.getMessage("Every:"),
                            "border": false,                
                            "bodyStyle": "padding: 5px 5px 5px 0px;"
                        },
                        {
                            "border": false,
                            "items": [
                                this.intervalField
                            ]
                        },
                        this.intervalUnitLabel
                    ]
                },
                {
                    "border": false,
                    "region": "center",
                    "defaults": {
                        "border": false
                    },
                    
                    "width": 300,
                    "layout": "table",
                    "layoutConfig": {
                        "columns": 3
                    },
                    "items": [
                        // row 1 (and the full first column)
                        {
                            "html": CQ.I18n.getMessage("Ends:"),
                            "rowspan": 3,
                            "bodyStyle": "padding: 8px 5px 5px 0px;",
                            "cellStyle": "width: " + (15 + tm.getWidth(CQ.I18n.getMessage("Ends:"))) + "px; vertical-align: top;"
                        },
                        
                        // row 1, col 2 & 3
                        this.untilRadio,
                        this.untilField,
                        
                        // row 2
                        this.countRadio,
                        {
                            "layout": "column",
                            "items": [
                                {
                                   "border": false,
                                    "items": [
                                        this.countField
                                    ]
                                },
                                {
                                    "border": false,
                                    "bodyStyle": "padding-top: 5px",
                                    "items": [
                                        this.countLabel
                                    ]
                                }
                            ]
                        },
                        
                        // row 3
                        this.neverRadio
                    ]
                },
                this.hiddenRecurrenceType,
                this.hiddenRecurrenceRuleType,
                this.hiddenRuleDelete // at the end, so it is applied last
            ]
        });
        
        config.items = [
            this.frequencyField,
            this.repeatPanel
        ];
        
        this.enableRepeat(config.rule.frequency && config.rule.frequency !== "");
        
        CQ.mcm.cal.RecurrenceRuleField.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        CQ.mcm.cal.RecurrenceRuleField.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event change
             * Fires if the field value has changed.
             * @param {CQ.mcm.cal.RecurrenceRuleField} this
             * @param {Object} newRule The new rule object
             * @param {Object} oldRule The original rule object
             */
            'change'
        );
    },
    
    disable: function() {
        if(this.rendered) {
            this.onDisable();
            this.frequencyField.disable();
            this.hiddenRuleDelete.disable();
            this.hiddenRecurrenceType.disable();
            this.hiddenRecurrenceRuleType.disable();
            this.hiddenUntilDelete.disable();
            this.hiddenCountDelete.disable();
            this.intervalField.disable();
            this.untilRadio.disable();
            this.untilField.disable();
            this.countRadio.disable();
            this.countField.disable();
            this.neverRadio.disable();
        }
        this.disabled = true;
        this.fireEvent("disable", this);
        return this;
    },
    
    enable: function() {
        if(this.rendered){
            this.onEnable();
            this.frequencyField.enable();
            this.hiddenRuleDelete.enable();
            this.hiddenRecurrenceType.enable();
            this.hiddenRecurrenceRuleType.enable();
            this.hiddenUntilDelete.enable();
            this.hiddenCountDelete.enable();
            this.intervalField.enable();
            this.untilRadio.enable();
            this.untilField.enable();
            this.countRadio.enable();
            this.countField.enable();
            this.neverRadio.enable();
        }
        this.disabled = false;
        this.fireEvent("enable", this);
        return this;
    },
    
    setDisplayDateFormat: function(format) {
        this.displayDateFormat = format;
        if (this.untilField) {
            this.untilField.df.format = format;
            // re-set value to force update of rendered component
            this.untilField.setValue(this.untilField.getDateValue());
        }
        this.updatePlainTextDescription();
    },

    /**
     * Returns the current recurrence rule defined by the field's values
     * as (json) object in the same structure as returned from Sling.
     * @public
     */
    getRule: function() {
        if (this.readOnly) {
            return this.rule;
        }
        var o = {
            frequency: this.frequencyField.getValue()
        };
        var interval = this.intervalField.getValue();
        if (interval) {
            o.interval = interval;
        }
        var endType = this.untilRadio.getGroupValue();
        if (endType === "until") {
            o.until = this.untilField.getValue();
        } else if (endType === "count") {
            o.count = this.countField.getValue();
        }
        return o;
    },
    
    /**
     * @private
     */
    applyRuleDefaults: function(rule) {
        CQ.Util.applyDefaults(rule, {
            frequency: "",
            interval: 1
        });
        // make sure config.rule.until is a date object
        if (rule.until && typeof rule.until === "string") {
            if (this.inDateFormat) {
                rule.until = Date.parseDate(rule.until, this.inDateFormat);
            } else {
                rule.until = new Date(rule.until);
            }
        }
        return rule;
    },
    
    /**
     * @private
     */
    getEndType: function(rule) {
        if (rule.until) {
            return "until";
        } else if (rule.count) {
            return "count";
        } else {
            return "never";
        }
    },
    
    /**
     * Updates all widgets and input fields according to the current
     * recurrence rule defined by the field's values.
     * @private
     */
    updateRule: function() {
        var frequency = this.frequencyField.getValue();
        this.frequencyField.hiddenField.name = this.getFrequencyName(frequency);
        this.enableRepeat(frequency !== "");
        
        this.updateIntervalUnitLabel(frequency);
        this.updateEndTypeDisabledStatus(frequency !== "");
        
        // set default only if the until field is disabled, ie. it is not set by the user
        if (!this.untilFieldSetByUser) {
            this.untilField.setValue(this.getDefaultUntil(frequency));
        }
        this.updatePlainTextDescription();
        
        if (frequency === "") {
            this.untilFieldSetByUser = false;
        }

        var newRule = this.getRule();
        this.fireEvent('change', this, newRule, this.oldRule);
        this.oldRule = newRule;
    },

    /**
     * @private
     */
    getFrequencyName: function(frequency) {
        if (frequency) {
            return this.rulePath + "frequency";
        } else {
            return this.rulePath + "frequency@Delete";
        }
    },
    
    /**
     * @private
     */
    enableRepeat: function(repeating) {
        // hide/show entire repeat panel
        if (repeating) {
            this.repeatPanel.show();
            this.repeatPanel.setHeight(180);
        } else {
            this.repeatPanel.hide();
            this.repeatPanel.setHeight(0);
        }
        
        // interval
        this.intervalField.setDisabled(!repeating);

        // hidden fields for type
        this.hiddenRuleDelete.setDisabled(repeating);
        this.hiddenRecurrenceType.setDisabled(!repeating);
        this.hiddenRecurrenceRuleType.setDisabled(!repeating);
    },
    
    /**
     * @private
     */
    updateIntervalUnitLabel: function(frequency) {
        var unit = this.getIntervalUnit(frequency);
        this.intervalUnitLabel.body.update(unit);
    },
    
    /**
     * @private
     */
    getIntervalUnit: function(freq) {
        var unit;
        if (freq === "") {
            unit = "";
        } else if (freq === "daily") {
            unit = CQ.I18n.getMessage("day(s)");
        } else if (freq === "weekly") {
            unit = CQ.I18n.getMessage("week(s)");
        } else if (freq === "monthly") {
            unit = CQ.I18n.getMessage("month(s)");
        } else if (freq === "yearly") {
            unit = CQ.I18n.getMessage("year(s)");
        }
        return unit;
    },
    
    /**
     * @private
     */
    setDefaultEndType: function() {
        this.untilRadio.setValue(true);
        this.countRadio.setValue(false);
        this.neverRadio.setValue(false);
    },
    
    /**
     * @private
     */
    updateEndTypeDisabledStatus: function(repeating) {
        var endType = this.untilRadio.getGroupValue();
        this.untilField.setDisabled(!repeating || endType !== "until");
        this.countField.setDisabled(!repeating || endType !== "count");
        this.countLabel.setDisabled(!repeating || endType !== "count");
    },
    
    /**
     * @private
     */
    getDefaultUntil: function(frequency) {
        // defaults, depending on frequency
        if (frequency === "daily") {
            // 1 month
            return new Date().add(Date.MONTH, 1);
        } else if (frequency === "weekly") {
            // 1 year
            return new Date().add(Date.YEAR, 1);
        } else if (frequency === "monthly") {
            // 1 year
            return new Date().add(Date.YEAR, 1);
        } else if (frequency === "yearly") {
            // 10 years
            return new Date().add(Date.YEAR, 10);
        } else {
            // 1 month fallback
            return new Date().add(Date.MONTH, 1);
        }
    },
    
    /**
     * @private
     */
    updatePlainTextDescription: function() {
        var text = this.getPlainTextDescription(this.getRule());
        if (this.readOnly) {
            this.body.update(text);
        } else {
            this.plainTextPanel.body.update(text);
        }
    },
    
    /**
     * Returns the human readable plain text description of the given rule
     * (which can be retrieved by {@link #getRule}()) as it is displayed
     * in the widget when recurrence is enabled.
     * @public
     */
    getPlainTextDescription: function(rule) {
        this.applyRuleDefaults(rule);
        
        var text;
        if (rule.frequency === "") {
            text = CQ.I18n.getMessage("Event does not repeat");
        } else if (rule.frequency === "daily") {
            if (rule.interval == 1) {
                text = CQ.I18n.getMessage("Daily");
            } else {
                text = CQ.I18n.getMessage("Every {0} days", [rule.interval]);
            }
        } else if (rule.frequency === "weekly") {
            if (rule.interval == 1) {
                text = CQ.I18n.getMessage("Weekly");
            } else {
                text = CQ.I18n.getMessage("Every {0} weeks", [rule.interval]);
            }
        } else if (rule.frequency === "monthly") {
            if (rule.interval == 1) {
                text = CQ.I18n.getMessage("Monthly");
            } else {
                text = CQ.I18n.getMessage("Every {0} months", [rule.interval]);
            }
        } else if (rule.frequency === "yearly") {
            if (rule.interval == 1) {
                text = CQ.I18n.getMessage("Yearly");
            } else {
                text = CQ.I18n.getMessage("Every {0} years", [rule.interval]);
            }
        }
        if (rule.until) {
            var untilStr = rule.until.format(this.displayDateFormat);
            text = text + CQ.I18n.getMessage(" until {0}", [untilStr], "argument is a date, eg. 'until 06/20/09'");
        } else if (rule.count) {
            text = text + CQ.I18n.getMessage(", {0} times", [rule.count], "argument is a number, eg. ', 10 times'");
        }
        return text;
    }

});


CQ.Ext.reg("recurrencerule", CQ.mcm.cal.RecurrenceRuleField);

