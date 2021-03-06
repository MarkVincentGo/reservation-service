/* eslint-disable max-len */
const fs = require('graceful-fs');
const faker = require('faker');


// data possibly not in faker
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
const emailDomains = ['@yahoo.com', '@gmail.com', '@hotmail.com', '@msn.com', '@icloud.com', '@aol.com'];

// methods
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
// Box-Mueller Transform --> converts uniform distribution to Gaussian distribution
const GaussianRandom = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const gaussRandNum = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // shift distribution peak to six, ensure integer value and extend variance
  return Math.floor(Math.abs(gaussRandNum * 3 + 6)) + 1;
};

// to prevent reservationId from restarting, declare it in outer scope.
let id = 0;
const write = fs.createWriteStream('./reservationsTest.csv');
// write.write('id,restaurant_id,date,start_time, end_time,time1,time2,time3,time4,time5,time6,time7,time8,number_people,first_name,last_name,email,phone_number,notes\n', 'utf8');

// default parameters to ensure no undefined arguments pass into the function
function writeOneHundredReservations(writer, encoding, callback, restaurantId = 1, openTime = '13:00', closeTime = '17:00', maxNumber = 4, minNumber = 8, resLimit = 90, monthsAhead = 3, seatCounts = {
  one_seat_count: 15,
  two_seat_count: 10,
  three_seat_count: 10,
  four_seat_count: 10,
  five_seat_count: 5,
  six_seat_count: 5,
  seven_seat_count: 0,
  eight_seat_count: 2,
  nine_seat_count: 0,
  ten_seat_count: 2,
  eleven_seat_count: 2,
  twelve_seat_count: 1,
  thirteen_seat_count: 0,
  fourteen_seat_count: 0,
  fifteen_seat_count: 2,
}) {
  // Blindly assuming 8-20 reservations each restaurant
  let i = Math.random() * 12 + 8;

  // restrict possible hours to be specific to restaurant
  const openIndex = possibleTimeslots.indexOf(openTime);
  const closeIndex = possibleTimeslots.indexOf(closeTime);
  const restaurantReservationHours = possibleTimeslots.slice(openIndex, closeIndex + 8);
  // eslint-disable-next-line no-shadow
  function write() {
    let ok = true;
    do {
      id += 1;
      i -= 1;


      // this block is tricky. Reserve next 4/6/8 timeslots depending on reservation limit. This block sets the times of one reservation.
      let randomTimeIndex = Math.floor(Math.random() * restaurantReservationHours.length - 8);
      if (randomTimeIndex < 0) { randomTimeIndex = Math.floor(Math.random() * 8); }
      const randomTimeIndex60 = randomTimeIndex + 4;
      const randomTimeIndex90 = randomTimeIndex + 6;
      const randomTimeIndex120 = randomTimeIndex + 8;
      // reserve
      const time = restaurantReservationHours[randomTimeIndex];
      const time60 = restaurantReservationHours[randomTimeIndex60];
      const time90 = restaurantReservationHours[randomTimeIndex90];
      const time120 = restaurantReservationHours[randomTimeIndex120];
      const timeArr = [time, time60, time90, time120];

      // Gaussian distribution makes reservations of 5 to 7 people more likely
      const randomNumPeople = GaussianRandom();

      // date is in YYYY-MM-DD format
      const dayOfMonth = Math.floor(Math.random() * 29 + 1);
      let date;
      if (dayOfMonth < 10) {
        date = `2020-0${Math.floor(Math.random() * monthsAhead + new Date().getMonth() + 1)}-0${dayOfMonth}`;
      } else {
        date = `2020-0${Math.floor(Math.random() * monthsAhead + new Date().getMonth() + 1)}-${dayOfMonth}`;
      }
      // in the case the GaussianRandom number is below the restaurant min number for reservation or greater than max, just reassign it to max number.
      let numberPeople = randomNumPeople > maxNumber || randomNumPeople < minNumber ? maxNumber : randomNumPeople;
      if (numberPeople > seatCounts[`${numberPeople}_seat_count`]) {
        numberPeople = ([1, 2, 4])[Math.floor(Math.random() * 3)];
      }
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const startTime = timeArr[0];
      const endTime = timeArr[resLimit / 30 - 1];
      const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${getRandomElement(emailDomains)}`;
      const phoneNumber = faker.phone.phoneNumberFormat(1);
      const notes = faker.lorem.sentence();

      // logging timeslots the reservations covers
      let data;
      if (resLimit === 60) {
        data = `${restaurantId},${date},${startTime},${endTime},${numberPeople},${firstName},${lastName},${email},${phoneNumber},${notes}\n`;
      } else if (resLimit === 90) {
        data = `${restaurantId},${date},${startTime},${endTime},${numberPeople},${firstName},${lastName},${email},${phoneNumber},${notes}\n`;
      } else {
        data = `${restaurantId},${date},${startTime},${endTime},${numberPeople},${firstName},${lastName},${email},${phoneNumber},${notes}\n`;
      }


      if (i === 0) {
        writer.write(data, encoding, callback);
      } else {
        // see if we should continue, or wait
        // don't pass the callback, because we're not done yet.
        ok = writer.write(data, encoding);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      // had to stop early!
      // write some more once it drains
      writer.once('drain', write);
    }
  }
  write();
}

module.exports = writeOneHundredReservations;
