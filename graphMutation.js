const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt } = require('graphql') ;
const client = require('./database');

module.exports = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addActivity: {
            type: GraphQLInt,
            args: {
                description: {type: GraphQLString},
                category: {type: GraphQLString},
                day: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                // TODO put this in an Activity class method
                return client.query(`
                    INSERT INTO operations.activity
                    (day_id, category, description) 
                    VALUES ($1, $2, $3)
                    RETURNING id
                `, [args.day, args.category, args.description])
                .then(res => {
                    return res.rows[0].id;
                })
                .catch(err => console.log(err));
            }
        }
    })
});