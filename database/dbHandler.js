const { Pool } = require('pg');

const pool = new Pool();

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = (query, callback) => {
  pool.connect((err, client, done) => {
    if (err) throw err;
    client.query(query, (err1, res) => {
      done();
      if (err1) {
        callback(err1.stack);
      } else {
        callback(null, res);
      }
    });
  });
};
