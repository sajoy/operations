require('dotenv').config();
const daysIn = require('count-days-in-month');
const client = require('../database.js');

client.connect();
client.query(`SELECT * FROM operations.day ORDER BY created_at DESC LIMIT 1`)
    .then(data => {
        const yesterday = data.rows[0];
        const date = new Date(yesterday.day_date);

        Promise.all([
            getWeekId(yesterday.week_id), 
            getMonthId(yesterday.month_id, date)
        ])
        .then(data => {
            const [weekId, monthId] = data;
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + 1);

            client.query(`
                    INSERT INTO operations.day (day_date, week_id, month_id) VALUES ($1, $2, $3)
                    RETURNING id, day_date, week_id, month_id`,
                    [newDate, weekId, monthId]
                )
                .then(data => {
                    console.log('Made a new day!');
                    console.log(data.rows[0]);
                    client.end();
                })
                .catch(handleError);
        })
        .catch(handleError);
    })
    .catch(handleError);


function handleError (err) {
    console.log('...-- UH OH --...');
    console.log(err);

    client.end();
}

function getWeekId (id) {
    return new Promise ((resolve, reject) => {
        client.query(`SELECT COUNT(id) FROM operations.day WHERE week_id = $1`, [id])
            .then(data => {
                const days = parseInt(data.rows[0].count);
                const weekDays = 7;
            
                if (days < weekDays) resolve(id);
                if (days === weekDays) {
                    client.query(`INSERT INTO operations.week DEFAULT VALUES RETURNING id`)
                        .then(data => resolve(data.rows[0].id))
                        .catch(reject);
                }
            })
            .catch(reject);
    });
}

function getMonthId (id, date) {
    return new Promise ((resolve, reject) => {
        client.query(`SELECT COUNT(id) FROM operations.day WHERE month_id = $1`, [id])
            .then(data => {
                const days = parseInt(data.rows[0].count);

                const year = date.getFullYear();
                const month = date.getMonth();
                const monthDays = daysIn(year, month);

                if (days < monthDays) resolve(id);
                if (days === monthDays) {
                    const nextMonth = month + 2; // +2 because I'm storing it base 1, not 0

                    client.query(`
                            INSERT INTO operations.month (cal_number, year) VALUES ($1,$2) RETURNING id;`,
                            [nextMonth, year]
                        )
                        .then(data => resolve(data.rows[0].id))
                        .catch(reject);
                }
            })
            .catch(reject);
    });
}