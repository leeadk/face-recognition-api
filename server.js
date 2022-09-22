const express = require('express');
const bcrypt = require('bcryptjs');
const knex = require('knex');
const cors = require('cors');
const cfg = require('./config/config.js');
const app = express();


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(cfg.APP.PORT);


const postgres = knex({
    client: cfg.DB.POSTGRES_CLIENT,
    connection: {
        host: cfg.DB.WSL_PROCESS_ENV,
        port: cfg.DB.PSQL_PORT,
        user: cfg.DB.PSQL_USR,
        database: cfg.DB.PSQL_DB,
    }
});



app.get('/', (req, res) => {
    res.send("hello");
});

app.get('/signin', (req, res) => {

});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    const lowercaseEmail = email.toLowerCase();
    postgres(cfg.DB.PSQL_LOGIN_DB).where(({ email: lowercaseEmail })).first().then(user => {
        if (!user) {
            return res.status(400).send('Nothing to show');
        }
        bcrypt.compare(password, user.hash, function (err, result) {
            if (err) {
                return res.status(400).send('Bcrypt err');
            }
            else if (result === true) {
                postgres(cfg.DB.PSQL_USER_DB).where(({ email: lowercaseEmail })).first().then(user => {
                    return res.status(200).json(user);
                })
            }
            else {
                return res.status(401).send('Failed to authenticate');
            }
        });
    });
});

app.get('/register', (req, res) => {

});


app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, cfg.BCRYPT.SALT_ROUNDS, function (err, hash) {
        if (err) {
            res.status(400).json('Bcrypt failed, no changes saved');
        }
        postgres(cfg.DB.PSQL_LOGIN_DB).insert({
            hash: hash,
            email: email.toLowerCase()
        }).then(() => {
            postgres(cfg.DB.PSQL_USER_DB)//.returning('*')
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
    const { id, img } = req.body;
});