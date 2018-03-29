const express = require('express');
const expressGraphql = require('express-graphql');
const { buildSchema, GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt } = require('graphql') ;
const PORT = process.env.PORT || 3000;
const joinMonster = require('join-monster');


const Day = new GraphQLObjectType ({
    name: 'Day',
    sqlTable: 'operations.day',
    uniqueKey: 'id',
    fields:  () => ({
        id: {
            type: GraphQLInt
        },
        date: {
            sqlColumn: 'day_date',
            type: GraphQLString
        },
        week: {
            sqlColumn: 'week_id',
            type: GraphQLInt
        },
        month: {
            sqlColumn: 'month_id',
            type: GraphQLInt
        }
    })
});

const QueryRoot = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        day: {
            type: Day,
            resolve: (parent, args, context, resolveInfo) => {
                console.log(args);
                return 5;
            }
        },
        days: {
            type: new GraphQLList(Day),
            args: {
                week: {
                    type: GraphQLInt,
                    defaultValue: 1,
                    description: 'what the week'
                }
            },
            resolve: (parent, args, context, resolveInfo) => {
                console.log(args);
                if (args.week) {
                    return days;
                } else {
                    return null;
                }
            }
        }
    })
});

const schema = new GraphQLSchema({
    description: 'idk man pls just work',
    query: QueryRoot
});

// TODO hook me up to dat posgres ish!

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

// const root = {
//     day: getDay,
//     days: getDays
// };

// function getDay (args) {
//     return days.filter(day => day.id === args.id)[0];
// }

// function getDays (args) {
//     if (args.week) {
//         return days.filter(day => day.week === args.week);
//     } else if (args.month) {
//         return days.filter(day => day.month === args.month);
//     } else {
//         return days;
//     }
// }

 


const app = express();

app.use(express.static('./public'));

app.use('/graphql', expressGraphql({
    schema: schema,
    graphiql: true
}));

app.use('*', (req, res) => {
    res.sendFile('index.html', {root: './public/'});
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));