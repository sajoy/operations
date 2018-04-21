const pg = require('pg');

const connString = process.env.CONNSTRING;
const client = new pg.Client({
    connectionString: connString
});


module.exports = client;