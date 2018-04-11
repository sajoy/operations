// TODO!!!!! create a dev db, I guess


// run once a day - 11 pm
require('dotenv').config();
const daysIn = require('count-days-in-month');
const client = require('../database.js');

client.connect();

client.query(`SELECT * FROM operations.day ORDER BY created_at DESC LIMIT 1`)
    .then(data => {
        const yesterday = data.rows[0];
        // TODO make and manipulate an object instead of returning new literals each query

        let weekId = yesterday.week_id;
        let monthId = yesterday.month_id;
        let date = new Date(yesterday.day_date);

        return client.query(`SELECT COUNT(id) FROM operations.day WHERE week_id = $1`, [weekId])
            .then(data => {
                const days = data.rows[0];
                const weekDays = 7;
                // TODO fix. it doesn't work.
                if (days.count === weekDays) {
                    return client.query(`INSERT INTO operations.week DEFAULT VALUES RETURNING id`)
                        .then(data => {
                            return { weekId: data.rows[0].id, date };
                        })
                        .catch(err => console.log(err));
                }

                return { weekId, date };
            })
            .then(data => {
                return client.query(`SELECT COUNT(id) FROM operations.day WHERE month_id = $1`, [monthId])
                    .then(data => {
                        const days = data.rows[0];
                        const year = date.getFullYear();
                        const month = date.getMonth();
                        const monthDays = daysIn(year, month);

                        if (days.count === monthDays) {
                            const nextMonth = month + 2; // +2 because I'm storing it base 1, not 0

                            return client.query(`
                                    INSERT INTO operations.month (cal_number, year) VALUES ($1,$2) RETURNING id;`,
                                    [nextMonth, year])
                                .then(data => {
                                    return { weekId: weekId, monthId: data.rows[0].id, date };
                                })
                                .catch(err => console.log(err));
                        }

                        return { weekId, monthId, date };
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    })
    .then(data => {
        const { weekId, monthId, date } = data;
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + 1);

        // insert
          client.query(`INSERT INTO operations.day (day_date, week_id, month_id) VALUES ($1, $2, $3) RETURNING id, day_date, week_id, month_id`, [newDate, weekId, monthId])
          .then(data => {
              console.log('Made a new day!');
              console.log(data.rows[0]);
              client.end();
          })
          .catch(err => console.log(err));
    });


// pseudo code
// get latest day's data:
// date
// week_id
// month_id

// get all week_id's days
// if 7, create new week
// get new week id

// get all month_id's days
// if > month's # of days (checked via map), create new month
// get new month id

// create new day with appropriate month and week id