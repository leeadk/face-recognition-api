const express = require('express');
const bcrypt = require('bcryptjs');
const knex = require('knex');
const cors = require('cors');
const cfg = require('./config/config.js');
const faceRecognition = require('./clarifai.js');
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


app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if (!email.trim().length || !password.trim().length) {
        return res.status(401).json('Missing credentials');
    }
    const lowercaseEmail = email.toLowerCase();
    postgres(cfg.DB.PSQL_LOGIN_DB).where(({ email: lowercaseEmail })).first().then(user => {
        if (!user) {
            return res.status(401).json('Unused email');
        }
        bcrypt.compare(password, user.hash, function (err, result) {
            if (err) {
                return res.status(401).json('Wrong credentials');
            }
            else if (result === true) {
                postgres(cfg.DB.PSQL_USER_DB).where(({ email: lowercaseEmail })).first().then(user => {
                    return res.status(200).json(user);
                })
            }
            else {
                return res.status(401).json('Wrong credentials');
            }
        });
    });
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name.trim().length || !email.trim().length || !password.trim().length) {
        return res.status(401).json('Fill the entire form');
    }
    bcrypt.hash(password, cfg.BCRYPT.SALT_ROUNDS, function (err, hash) {
        if (err) {
            return res.status(403).json('Bad request');
        }
        postgres(cfg.DB.PSQL_LOGIN_DB).insert({
            hash: hash,
            email: email.toLowerCase()
        })
            .then(() => {
                postgres(cfg.DB.PSQL_USER_DB)
                    .insert({
                        name: name,
                        email: email,
                        created_on: new Date()
                    }).then(user => {
                        return res.json(JSON.stringify(user[0]));
                    })
            }).catch(err => {
                return res.status(401).json('Email in use');
            })
    })
});

app.put('/image', async (req, res) => {
    const { id, img } = req.body;
    if (!img || !id) {
        return res.status(400).json('User information unavailable');
    }
    let imgBoxes = await faceRecognition(img);
    postgres(cfg.DB.PSQL_USER_DB).where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            return res.status(200).json(JSON.stringify({ imgBoxes: imgBoxes, entries: entries[0].entries }));
        })
        .catch(err => res.status(400).json('Internal error'))

});