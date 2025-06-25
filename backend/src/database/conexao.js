const { Pool} = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '198117',
    database: 'modefuck',
});

const query = (text, param)=> {
    return pool.query(text, param);
}

module.exports = {
    query
}