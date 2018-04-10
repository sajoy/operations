require('dotenv').config();
const express = require('express');
const expressGraphql = require('express-graphql');
const { buildSchema, GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLFloat } = require('graphql') ;
const PORT = process.env.PORT || 3000;
const joinMonster = require('join-monster').default;
const escape = require('pg-escape');

const pg = require('pg');

const connString = process.env.CONNSTRING;
const client = new pg.Client({
    connectionString: connString
});

client.connect();

const Expense = new GraphQLObjectType({
    name: 'Expense',
    sqlTable: 'operations.expense',
    uniqueKey: 'id',
    fields: () => ({
        id: {
            type: GraphQLInt
        },
        category: {
            type: GraphQLString
        },
        description: {
           type: GraphQLString 
        },
        amount: {
            type: GraphQLString
        },
        day: {
            type: GraphQLInt,
            sqlColumn: 'day_id'
        }
    })
});

const Activity = new GraphQLObjectType({
    name: 'Activity',
    sqlTable: 'operations.activity',
    uniqueKey: 'id',
    fields: () => ({
        id: {
            type: GraphQLInt
        },
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
        },
        expenses: {
            type: GraphQLList(Expense),
            sqlJoin: (dayTable, expenseTable, args) => {
                return `${dayTable}.id = ${expenseTable}.day_id`;
            }
        }
    })
});

const Week = new GraphQLObjectType({
    name: 'Week',
    sqlTable: 'operations.week',
    uniqueKey: 'id',
    fields: () => ({
        id: {
            type: GraphQLInt
        },
        days: {
            type: GraphQLList(Day),
            sqlJoin: (weekTable, dayTable, args) => {
                return `${weekTable}.id = ${dayTable}.week_id`;
            }
        }
    })
});

const Month = new GraphQLObjectType({
    name: 'Month',
    sqlTable: 'operations.month',
    uniqueKey: 'id',
    fields: () => ({
        id: {
            type: GraphQLInt
        },
        days: {
            type: GraphQLList(Day),
            sqlJoin: (monthTable, dayTable, args) => {
                return `${monthTable}.id = ${dayTable}.month_id`;
            }
        }
    })
});

const QueryRoot = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        month: {
            type: Month,
            args: {
                id: {
                    type: GraphQLInt,
                    description: 'The unique id of the month'
                }
            },
            where: (monthTable, args, context) => {
                return `${monthTable}.id = ${args.id}`;
            },
            resolve: (parent, args, context, resolveInfo) => {
                return joinMonster(resolveInfo, {}, sql => {
                    return client.query(sql);
                }, {dialect: 'pg'});
            }
        },
        week: {
            type: Week,
            args: {
                id: {
                    type: GraphQLInt,
                    description: 'The unique id of the week'
                }
            },
            where: (weekTable, args, context) => {
                return `${weekTable}.id = ${args.id}`;
            },
            resolve: (parent, args, context, resolveInfo) => {
                return joinMonster(resolveInfo, {}, sql => {
                    return client.query(sql);
                }, {dialect: 'pg'});
            }
        },
        day: {
            type: Day,
            args: {
                id: {
                    type: GraphQLInt,
                    description: 'The unique id of a day' 
                }
            },
            where: (dayTable, args, context) => {
                return `${dayTable}.id = ${args.id}`;
            },
            resolve: (parent, args, context, resolveInfo) => {
                return joinMonster(resolveInfo, {}, sql => {
                    return client.query(sql);
                }, {dialect: 'pg'})
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
        },
        expenses: {
            type: GraphQLList(Expense),
            args: {
                category: {
                    type: GraphQLString,
                    description: 'The category of the expense'
                }
            },
            where: (expenseTable, args, context) => {
                if (!args.category) return null;
                return escape(`${expenseTable}.category = %L`, args.category);
            },
            resolve: (parent, args, context, resolveInfo) => {
                return joinMonster(resolveInfo, {}, sql => {
                    return client.query(sql);
                }, {dialect: 'pg'});
            }
        },
        activities: {
            type: GraphQLList(Activity),
            args: {
                category: {
                    type: GraphQLString,
                    description: 'The category of the activity'
                }
            },
            where: (activityTable, args, context) => {
                if (!args.category) return null;
                return escape(`${activityTable}.category = %L`, args.category);
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
    description: 'Operations data schema',
    query: QueryRoot
});





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