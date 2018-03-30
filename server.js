require('dotenv').config();
const express = require('express');
const expressGraphql = require('express-graphql');
const { buildSchema, GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt } = require('graphql') ;
const PORT = process.env.PORT || 3000;
const joinMonster = require('join-monster').default;

const pg = require('pg');

const connString = process.env.CONNSTRING;
const client = new pg.Client({
    connectionString: connString
});

client.connect();

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
                return joinMonster(resolveInfo, {}, sql => {
                    return client.query(sql);
                }, {dialect: 'pg'});
            }
        }
    })
});

const schema = new GraphQLSchema({
    description: 'idk man pls just work',
    query: QueryRoot
});

// TODO hook me up to dat posgres ish!
/*
    x - grab data from postgres db instead of arr
    - add arguments for days:
        - month
    - add types:
        - task
        - category?


*/



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