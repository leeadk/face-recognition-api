const express = require('express');
const bcrypt = require('bcryptjs');
const knex = require('knex');

const WSL_PROCESS_ENV = process.env.WINDOWS_HOST;
const PSQL_USER_DB = 'users';
const PSQL_LOGIN_DB = 'login';
const PSQL_USR = 'postgres';
const PSQL_DB = 'postgres';
const PSQL_PORT = 5432;
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
    const { email, password } = req.body;
    postgres(PSQL_LOGIN_DB).where(({ email: email })).first().then(user => {
        bcrypt.compare(password, user.hash, function (err, result) {
            if (err) {
                res.status(400).json('Bcrypt err');
            }
            if (result === true) {
                res.status(200).json('Success');
            }
            else {
                res.status(400).json('Failed to authenticate');
            }
        });
    });
});

app.get('/register', (req, res) => {

});


app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
        if (err) {
            res.status(400).json('Bcrypt failed, no changes saved');
        }
        postgres(PSQL_LOGIN_DB).insert({
            hash: hash,
            email: email
        }).then(() => {
            postgres(PSQL_USER_DB).returning('*')
                .insert({
                    name: name,
                    email: email,
                    created_on: new Date()
                }).then(user => {
                    res.json(user[0]);
                })
        }).catch(err => {
            res.status(400).json('Unable to register');
        })
    })
});

app.put('/image', (req, res) => {
    const { id } = req.body;

});