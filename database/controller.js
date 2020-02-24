/* eslint-disable max-len */
const Promise = require('bluebird');
const dbHandler = require('./dbHandler.js');
const reservePostMethods = require('./getManyResTest.js');


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
const convertNumToSeatCount = (number) => `${numToEnglish[number - 1]}_seat_count`;
const changeTimeInterval = (time, i) => possibleTimeslots[possibleTimeslots.indexOf(time) + 2 * i];

module.exports.controller = {
  reservations: {
    findReservations: (req, res) => {
      const { restaurantId } = req.params;
      const { numberOfPeople, date } = req.body;
      const startTime = req.body.time;
      reservePostMethods.seeRestaurantData(restaurantId, req.body)
        .then((restaurantData) => {
          const endTime = changeTimeInterval(startTime, restaurantData.reservation_duration / 15);
          const promises = [];
          console.log(changeTimeInterval(startTime, 9))
          for (let i = -4; i <= 4; i += 1) {
            const timeo = changeTimeInterval(startTime, i);
            promises.push(reservePostMethods.seeReservationAvailability(restaurantId, restaurantData, req.body, timeo, date));
          }
          return [Promise.all(promises), restaurantData, endTime];
        })
        .spread((data, restaurantData, endTime) => {
          const foundData = data.map((rows) => (
            [rows[0].length < restaurantData[convertNumToSeatCount(numberOfPeople)]
              ? 'available' : 'unavailable', rows[1]]));
          console.log(foundData);

          // let available = true;
          // if (data2.rows.length >= restaurantData[`${numToEnglish[numberOfPeople - 1]}_seat_count`]) {
          //   // if array length is greater than seat count for restaurant, save available? for "no" and search for other times
          //   available = false;
          // }
        });
    },

    addReservation: (req, res) => {
      const { restaurantId } = req.params;
      const {
        firstName, lastName, email, phoneNumber, numberOfPeople, date, time, notes,
      } = req.body;
      // adds a reservation
      // dbHandler.query(`INSERT INTO reservations
      // (first_name, last_name, email, phone_number, number_people, date, start_time)`);
      const year = parseInt(date.substring(0, 4), 10);
      const month = parseInt(date.substring(5, 7), 10) + 1;
      const day = parseInt(date.substring(8, 10), 10);
      const d = new Date(year, month, day).getDay();

      dbHandlerProm(`SELECT reservation_duration FROM restaurants WHERE id = ${restaurantId}`)
        .then((data) => {
          const resLimit = data.rows[0].reservation_duration;
          const insertReservationQuery = `INSERT INTO reservations 
          (restaurant_id,first_name, last_name, email, phone_number, number_people, date, start_time, end_time, notes) VALUES
          (${restaurantId},'${firstName}','${lastName}','${email}','${phoneNumber}',${numberOfPeople},'${date}','${time}', '${changeTimeInterval(time, resLimit / 15)}','${notes}')`;
          return dbHandlerProm(insertReservationQuery);
        })
        .then(() => res.end());
    },

    getAllReservations: (req, res) => {
      const { restaurantId } = req.params;
      // get all reservations (possibly for businessowners)const client = new Client()
      dbHandler(`SELECT * FROM reservations WHERE restaurant_id = ${restaurantId} LIMIT 5`, (err, data) => (
        err ? res.send(err) : res.send(data.rows)
      ));
    },

    getOneReservation: (req, res) => {
      // get only one reservation with id as parameter
      const { restaurantId, reservationId } = req.params;
      // get all reservations (possibly for businessowners)const client = new Client()
      dbHandler(`SELECT * FROM reservations WHERE restaurant_id = ${restaurantId} AND id = ${reservationId} LIMIT 5`, (err, data) => (
        err ? res.send(err) : res.send(data.rows)
      ));
    },

    updateReservation: (req, res) => {
      // update reservation data with id as parameter
      const { restaurantId, reservationId } = req.params;
      const keys = Object.keys(req.body);
      let values = Object.values(req.body);
      values = values.map((value) => value.toString().replace(/'/gi, "''"));
      values = values.map((value) => `'${value}'`);

      // this makes a string of all requested changes
      const changedItems = keys.slice(1).reduce((accumulator, currentValue, index) => {
        // eslint-disable-next-line no-param-reassign
        accumulator += `, ${currentValue} = ${values[index + 1]}`;
        return accumulator;
      }, `${keys[0]} = ${values[0]}`);

      // this makes as many dollar signs necessary to fulfill all changes
      // const orderedArray = body.map((i, j) => `$${j + 1}`)
      // console.log(orderedArray);
      // const questionMark = orderedArray.join(',')
      const query = `UPDATE reservations SET ${changedItems} WHERE id = ${restaurantId} AND restaurant_id = ${reservationId}`;
      dbHandler(query, (err, data) => (
        err ? res.status(400).send(err) : res.status(200).send(data)
      ));
    },

    deleteReservation: (req, res) => {
      const { restaurantId, reservationId } = req.params;
      // delete reservation data with id parameter
      dbHandler(`DELETE FROM reservations WHERE restaurant_id = ${restaurantId} AND id = ${reservationId}`, (err) => (
        err ? res.status(400).end() : res.status(200).end()
      ));
    },
  },

  restaurants: {
    addRestaurant: (req, res) => {
      // adds a restautant
      const newRestaurantData = Object.values(req.body);
      const query = {
        text: `INSERT INTO restaurants (
          name, monday_start, monday_end, tuesday_start, tuesday_end, 
          wednesday_start, wednesday_end, thursday_start, thursday_end,
          friday_start, friday_end, saturday_start, saturday_end,
          sunday_start, sunday_end, reservation_allowed, max_number,
          min_number, reservation_duration, allowed_months_ahead,
          one_seat_count, two_seat_count, three_seat_count, four_seat_count,
          five_seat_count, six_seat_count, seven_seat_count, eight_seat_count,
          nine_seat_count, ten_seat_count, eleven_seat_count, twelve_seat_count,
          thirteen_seat_count, fourteen_seat_count, fifteen_seat_count) 
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
            $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35)`,
        values: newRestaurantData,
      };
      dbHandler(query, (err, data) => (
        err ? res.status(400).send(err) : res.status(200).send(data)
      ));
    },

    getOneRestaurant: (req, res) => {
      const { restaurantId } = req.params;
      // get only one restautant with id as parameter
      dbHandler(`SELECT * FROM restaurants WHERE id = ${restaurantId}`, (err, data) => (
        err ? res.status(400).send(err) : res.status(200).send(data.rows)
      ));
    },

    updateRestaurant: (req, res) => {
      const { restaurantId } = req.params;
      // update restautant data with id as parameter
      const keys = Object.keys(req.body);
      let values = Object.values(req.body);
      values = values.map((value) => value.toString().replace(/'/gi, "''"));
      values = values.map((value) => `'${value}'`);

      // this makes a string of all requested changes
      const changedItems = keys.slice(1).reduce((accumulator, currentValue, index) => {
        // eslint-disable-next-line no-param-reassign
        accumulator += `, ${currentValue} = ${values[index + 1]}`;
        return accumulator;
      }, `${keys[0]} = ${values[0]}`);

      // this makes as many dollar signs necessary to fulfill all changes
      // const orderedArray = body.map((i, j) => `$${j + 1}`)
      // console.log(orderedArray);
      // const questionMark = orderedArray.join(',')
      const query = `UPDATE restaurants SET ${changedItems} WHERE id = ${restaurantId}`;
      dbHandler(query, (err, data) => (
        err ? res.status(400).send(err) : res.status(200).send(data)
      ));
    },

    deleteRestaurant: (req, res) => {
      const { restaurantId } = req.params;
      // delete restautant data with id parameter
      dbHandler(`DELETE FROM reservations WHERE restaurant_id = ${restaurantId}`, (err1) => {
        if (err) {
          res.status(400).send(err1);
        } else {
          dbHandler(`DELETE FROM restaurants WHERE id = ${restaurantId}`, (err2) => (
            err2 ? res.status(400).send(err2) : res.status(200).end()
          ));
        }
      });
    },
  },
};
