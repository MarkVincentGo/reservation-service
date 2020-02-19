
module.exports.controller = {
  reservations: {
    addReservation: (req, res) => {
      // adds a reservation
    },

    getAllReservations: (req, res) => {
      // get all reservations (possibly for businessowners)
    },

    getOneReservation: (req, res) => {
      // get only one reservation with id as parameter
    },

    updateReservation: (req, res) => {
      // update reservation data with id as parameter
    },

    deleteReservation: (req,res) => {
      // delete reservation data with id parameter
    },
  },

  restaurants: {
    addRestaurant: (req, res) => {
      // adds a restautant
    },

    getOneRestaurant: (req, res) => {
      // get only one restautant with id as parameter
    },

    updateRestaurant: (req, res) => {
      // update restautant data with id as parameter
    },

    deleteRestaurant: (req, res) => {
      // delete restautant data with id parameter
    },
  },
};
