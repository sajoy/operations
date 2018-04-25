require('dotenv').config();
const express = require('express');
const expressGraphql = require('express-graphql');
const client = require('./database.js');
const schema = require('./graphSchema.js');

const PORT = process.env.PORT || 3000;

client.connect();

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