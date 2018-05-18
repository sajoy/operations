const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt } = require('graphql') ;
const { Month, Week, Day, Activity, Expense } = require('./graphTypes.js');
const mutation = require('./graphMutation');
const joinMonster = require('join-monster').default;
const escape = require('pg-escape');
const client = require('./database.js')

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
            orderBy: {
                id: 'asc'
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

module.exports = new GraphQLSchema({
    description: 'Operations data schema',
    query: QueryRoot,
    mutation: mutation
});