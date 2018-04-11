const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLFloat } = require('graphql') ;

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

module.exports = {
    Month, Week, Day, Activity, Expense
};