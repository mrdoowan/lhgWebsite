// npm modules
import { unix as _unix } from 'moment-timezone';

// Helper Functions
const pad = (num) => {
    return ("0"+num).slice(-2);
}

/**
 * Turns number of seconds into a string (600 -> 10:00)
 * @param {number} seconds
 */
export const getTimeString = (seconds) => {
    return Math.floor(seconds / 60) + ':' + pad(Math.floor(seconds % 60));
}

/**
 * Converts unix value into a Date (i.e. 01/01/2020)
 * @param {number} unix 
 * @param {string} timeZone
 */
export const getDateString = (unix, timeZone='EST') => {
    return _unix(unix).tz(timeZone).format('MM/DD/YYYY');
}

/**
 * Converts unix value into a Date and time (i.e. 01/01/2020)
 * @param {number} unix 
 * @param {string} timeZone
 */
export const getDateTimeString = (unix, timeZone='EST') => {
    return _unix(unix).tz(timeZone).format('MM/DD/YYYY - hh:mma');
}