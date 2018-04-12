const pg = require('pg');

const connString = process.env.TESTSTRING;
const client = new pg.Client({
    connectionString: connString
});


module.exports = client;