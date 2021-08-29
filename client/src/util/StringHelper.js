// npm modules
import { unix as _unix } from 'moment-timezone';

// Helper Functions
const pad = (num) => (`0${num}`).slice(-2);

/**
 * Turns number of seconds into a string (600 -> 10:00)
 * @param {number} seconds
 */
export const getTimeString = (seconds) => `${Math.floor(seconds / 60)}:${pad(Math.floor(seconds % 60))}`;

/**
 * Converts unix value into a Date (i.e. 01/01/2020)
 * @param {number} unix         time value in ms
 * @param {string} format       Default is 'MM/DD/YYYY'
 * @param {string} timeZone     Default is 'EST'
 */
export const getDateString = (unix, format = 'MM/DD/YYYY', timeZone = 'EST') => _unix(unix).tz(timeZone).format(format);

/**
 * 
 * @param {string} type
 * @return {string} 
 */
export const getTourneyTypeString = (type) => {
  return (type === 'Regular')
    ? 'Regular Season'
    : 'Playoffs';
}