const express = require('express');
const expressGraphql = require('express-graphql');
const { buildSchema } = require('graphql') ;
const PORT = process.env.PORT || 3000;


// make a graphql schema
    // the names listed within the Query type are what we can ask for
    // other Types describe how our models look
const schema = buildSchema(`
    type Query {
        day(id: Int!): Day,
        days(week: Int, month: Int): [Day]
    },
    type Day {
        id: Int,
        date: String,
        week: Int,
        month: Int
    }
`);

// faux data
const days = [
    {
        id: 1,
        date: '03/29/12',
        week: 1,
        month: 1
    },
    {
        id: 2,
        date: '03/30/12',
        week: 1,
        month: 1
    },
    {
        id: 3,
        date: '03/31/12',
        week: 1,
        month: 1
    },
    {
        id: 4,
        date: '03/31/12',
        week: 2,
        month: 1
    }
];

// the resolver that resolves queries
// root is an object that
    // 1. has keys that match the Querys in the schema
    // 2. the values are functions that do the work to get/give the data
    // 3. will be passed to our GraphQL middleware

const root = {
    day: getDay,
    days: getDays
};

function getDay (args) {
    return days.filter(day => day.id === args.id)[0];
}

function getDays (args) {
    if (args.week) {
        return days.filter(day => day.week === args.week);
    } else if (args.month) {
        return days.filter(day => day.month === args.month);
    } else {
        return days;
    }
}




const app = express();

app.use(express.static('./public'));

app.use('/graphql', expressGraphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.use('*', (req, res) => {
    res.sendFile('index.html', {root: './public/'});
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));