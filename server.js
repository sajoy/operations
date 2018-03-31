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

const Activity = new GraphQLObjectType({
    name: 'Activity',
    sqlTable: 'operations.activity',
    uniqueKey: 'id',
    fields: () => ({
        category: {
            type: GraphQLString
        },
        description: {
           type: GraphQLString 
        },
        day: {
            type: GraphQLInt,
            sqlColumn: 'day_id'
        }
    })
});

const Day = new GraphQLObjectType({
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
        },
        activities: {
            type: GraphQLList(Activity),
            sqlJoin: (dayTable, activityTable, args) => {
                return `${dayTable}.id = ${activityTable}.day_id`;
            }
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
                month: {
                    type: GraphQLInt, // should this actually be the month instelf? a GraphQL Type
                    defaultValue: 0,
                    description: 'The unique month id (I think)'
                },
                week: {
                    type: GraphQLInt,
                    defaultValue: 0,
                    description: 'The unique week id'
                }
            },
            where: (daysTable, args, context) => {
                const {week, month} = args;
                if (week) return `${daysTable}.week_id = ${week}`;
                if (month) return `${daysTable}.month_id = ${month}`;

                // would you ever want to query a week and a month that aren't related?
                // for example: days(week:4, month:8)
                // would that even work??? there would never be that combo
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
    x - add arguments for days:
        x - month
    - add more day properties:
        x - activities
           x - Activity type
        - expenses
            - Expense type
    - figure out how to filter day's activities (only specified category)
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