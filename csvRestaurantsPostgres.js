/* eslint-disable max-len */
const fs = require('graceful-fs');
const faker = require('faker');
const makeOneHundredReservations = require('./csvReservationsPostgres.js');


// data possibly not in faker
const openHours = ['8:00', '8:30', '9:00', '11:00', '11:30', '12:00', '12:30', '13:00'];
const closeHours = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'];
const restaurantSuffixes = [' House', ' Express', ' Restaurant', ' Bistro', ' Cuisine', ' Bar', ' Pub', ' Deli', ' Barbeque', ' BBQ', ' Buffet', ' Sandwiches', ' Chicken'];
const resLimit = [60, 90, 120];

// methods
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
// pseudo random names in format either [city name] + restaurantSuffix or [firstName]'s restaurantSuffix. eg: New York Deli, Mark's BBQ.
const generateRestaurantName = () => {
  if (Math.random() < 0.6) {
    return faker.address.city() + getRandomElement(restaurantSuffixes);
  }
  return `${faker.name.firstName()}'s${getRandomElement(restaurantSuffixes)}`;
};


const write = fs.createWriteStream('./restaurantsTestNEW.csv');
// write.write('id,name,monday_start,monday_end,tuesday_start,tuesday_end,wednesday_start,wednesday_end,thursday_start,thursday_end,friday_start,friday_end,saturday_start,saturday_end,sunday_start,sunday_end,reservation_allowed,max_number,min_number,reservation_duration,allowed_months_ahead,1_seat_count,2_seat_count,3_seat_count,4_seat_count,5_seat_count,6_seat_count,7_seat_count,8_seat_count,9_seat_count,10_seat_count,11_seat_count,12_seat_count,13_seat_count,14_seat_count,15_seat_count\n', 'utf8');
write.setMaxListeners(1000);

const reserveWrite = fs.createWriteStream('./reservationsNEW.csv', { flags: 'a', emitClose: true });
reserveWrite.setMaxListeners(5000);

function writeTenMillionRestaurants(writer, encoding, callback) {
  let i = 10000000;
  let id = 0;
  // eslint-disable-next-line no-shadow
  function write() {
    let ok = true;
    do {
      i -= 1;
      id += 1;
      // most places open at similar times on weekdays and weekends
      const weekdayHoursStart = getRandomElement(openHours);
      const weekdayHoursEnd = getRandomElement(closeHours);
      const weekendHoursStart = getRandomElement(openHours);
      const weekendHoursEnd = getRandomElement(closeHours);

      // dealing with possibility that they can be closed on sunday or monday
      const mondayOpen = Math.random() < 0.9;
      const sundayOpen = Math.random() < 0.85;

      const name = generateRestaurantName();
      const mondayStart = mondayOpen ? weekdayHoursStart : null;
      const mondayEnd = mondayOpen ? weekdayHoursEnd : null;
      const tuesdayStart = weekdayHoursStart;
      const tuesdayEnd = weekdayHoursEnd;
      const wednesdayStart = weekdayHoursStart;
      const wednesdayEnd = weekdayHoursEnd;
      const thursdayStart = weekdayHoursStart;
      const thursdayEnd = weekdayHoursEnd;
      const fridayStart = weekdayHoursStart;
      const fridayEnd = weekdayHoursEnd;
      const saturdayStart = weekendHoursStart;
      const saturdayEnd = weekendHoursEnd;
      const sundayStart = sundayOpen ? weekendHoursStart : null;
      const sundayEnd = sundayOpen ? weekendHoursEnd : null;
      // it returns undefined for first few so this is the workaround; reservations deals with this as setting undefined id's to 1, so id 1 must always take reservations
      const reservationAllowed = id === 1 ? true : getRandomElement([true, false]);
      const maxNumber = Math.floor(Math.random() * (15 - 8) + 8);
      const minNumber = Math.floor(Math.random() * (4 - 1) + 1);
      const reservationDuration = getRandomElement(resLimit);
      const allowedMonthsAhead = Math.floor(Math.random() * (4 - 1) + 1);
      const oneSeatCount = Math.floor(Math.random() * 20);
      const twoSeatCount = Math.floor(Math.random() * (15 - 5) + 5);
      const threeSeatCount = Math.floor(Math.random() * 10);
      const fourSeatCount = Math.floor(Math.random() * (15 - 5) + 5);
      const fiveSeatCount = Math.floor(Math.random() * 10);
      const sixSeatCount = Math.floor(Math.random() * 5);
      const sevenSeatCount = Math.floor(Math.random() * 5);
      const eightSeatCount = Math.floor(Math.random() * 5);
      const nineSeatCount = Math.floor(Math.random() * 5);
      const tenSeatCount = Math.floor(Math.random() * 5);
      const elevenSeatCount = Math.floor(Math.random() * 3);
      const twelveSeatCount = Math.floor(Math.random() * 3);
      const thirteenSeatCount = Math.floor(Math.random() * 2);
      const fourteenSeatCount = Math.floor(Math.random() * 2);
      const fifteenSeatCount = Math.floor(Math.random() * 2);
      const data = `${name},${mondayStart},${mondayEnd},${tuesdayStart},${tuesdayEnd},${wednesdayStart},${wednesdayEnd},${thursdayStart},${thursdayEnd},${fridayStart},${fridayEnd},${saturdayStart},${saturdayEnd},${sundayStart},${sundayEnd},${reservationAllowed},${maxNumber},${minNumber},${reservationDuration},${allowedMonthsAhead},${oneSeatCount},${twoSeatCount},${threeSeatCount},${fourSeatCount},${fiveSeatCount},${sixSeatCount},${sevenSeatCount},${eightSeatCount},${nineSeatCount},${tenSeatCount},${elevenSeatCount},${twelveSeatCount},${thirteenSeatCount},${fourteenSeatCount},${fifteenSeatCount}\n`;
      const seatCounts = {
        oneSeatCount,
        twoSeatCount,
        threeSeatCount,
        fourSeatCount,
        fiveSeatCount,
        sixSeatCount,
        sevenSeatCount,
        eightSeatCount,
        nineSeatCount,
        tenSeatCount,
        elevenSeatCount,
        twelveSeatCount,
        thirteenSeatCount,
        fourteenSeatCount,
        fifteenSeatCount,
      }
      if (reservationAllowed) {
        makeOneHundredReservations(reserveWrite, 'utf-8', () => {
          reserveWrite.end();
        },
        // all the arguments passed in to make reservations more accurate.
        id, weekdayHoursStart, weekdayHoursEnd, maxNumber, minNumber, reservationDuration, allowedMonthsAhead, seatCounts);
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

writeTenMillionRestaurants(write, 'utf-8', () => {
  write.end();
});
