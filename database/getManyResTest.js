/* eslint-disable max-len */
const Promise = require('bluebird');
const dbHandler = require('./dbHandler.js');

const dbHandlerProm = Promise.promisify(dbHandler);

const possibleTimeslots = [
  '8:00', '8:15', '8:30', '8:45',
  '9:00', '9:15', '9:30', '9:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
  '18:00', '18:15', '18:30', '18:45',
  '19:00', '19:15', '19:30', '19:45',
  '20:00', '20:15', '20:30', '20:45',
  '21:00', '21:15', '21:30', '21:45',
  '22:00', '22:15', '22:30', '22:45',
  '23:00', '23:15', '23:30', '23:45',
  '00:00', '00:15', '00:30', '00:45',
  '01:00', '01:15', '01:30', '01:45',
];
const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const numToEnglish = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen']


const seeRestaurantData = (restaurantId, body) => {
  const { numberOfPeople, date } = body;

  const year = parseInt(date.substring(0, 4), 10);
  const month = parseInt(date.substring(5, 7), 10) + 1;
  const day = parseInt(date.substring(8, 10), 10);
  const d = new Date(year, month, day).getDay();

  const query1 = `SELECT reservation_duration, ${dayOfWeek[d]}_start, ${dayOfWeek[d]}_end, 
      ${numToEnglish[numberOfPeople - 1]}_seat_count FROM restaurants WHERE id = ${restaurantId}`;
  // query the data for the restaurant info
  return dbHandlerProm(query1).then((restaurantData) => restaurantData.rows[0]);
};


const seeReservationAvailability = (restaurantId, restaurantData, body, time, date) => {
  const { numberOfPeople } = body;
  const endTime = possibleTimeslots[possibleTimeslots.indexOf(time) + (restaurantData.reservation_duration / 15)];
  // use the reservation duration info to query the reservations table if there are any end times between the start time and end time of the potential reservation
  // use  the reserve duration to query the reserve table for start times in the duration of the potential reservati0n
  return dbHandlerProm(`SELECT * FROM reservations WHERE restaurant_id = ${restaurantId} 
  AND date= '${date}' AND 
  (('${time}' BETWEEN start_time AND end_time) OR ('${endTime}' BETWEEN start_time AND end_time)) AND 
  number_people = ${numberOfPeople} AND date = '${date}'`).then((reservationData) => [reservationData.rows, time]);
};

module.exports.seeRestaurantData = seeRestaurantData;
module.exports.seeReservationAvailability = seeReservationAvailability;
