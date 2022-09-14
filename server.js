const express = require('express');
const bcrypt = require('bcryptjs');
const knex = require('knex');

const WSL_PROCESS_ENV = process.env.WINDOWS_HOST;
const PSQL_PORT = '5432';
const PSQL_USR = 'postgres';
const PSQL_DB = 'postgres';
const APP_PORT = 5000;
const BCRYPT_SALT_ROUNDS = 10;

const app = express();
app.listen(APP_PORT);

app.use(require('cors')())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const postgres = knex({
    client: 'pg',
    connection: {
        host: WSL_PROCESS_ENV,
        port: PSQL_PORT,
        user: PSQL_USR,
        database: PSQL_DB,
    }
});



app.get('/', (req, res) => {
    res.send("hello");
    res.send('goodbye');
});

app.get('/signin', (req, res) => {

});

app.post('/signin', (req, res) => {
});

app.get('/register', (req, res) => {

});


app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
        if (err) {
            res.status(400).json('Bcrypt failed, no changes saved');
        }
        postgres('users')
            .returning('*')
            .insert({
                name: name,
                email: email,
                passwd: hash,
                created_on: new Date()
            }).then(user => {
                res.json(user[0]);
            }).catch(err => {
                res.status(400).json('Unable to register');
            });
    })
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;

});

app.put('/image', (req, res) => {
    const { id } = req.body;

});