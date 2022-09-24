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


app.get('/', (req, res) => {
    postgres.select('name', 'entries').from(cfg.DB.PSQL_USER_DB).then(users => res.json(users));
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    const lowercaseEmail = email.toLowerCase();
    postgres(cfg.DB.PSQL_LOGIN_DB).where(({ email: lowercaseEmail })).first().then(user => {
        if (!user) {
            return res.status(400).json('Nothing to show');
        }
        bcrypt.compare(password, user.hash, function (err, result) {
            if (err) {
                return res.status(400).json('Bcrypt err');
            }
            else if (result === true) {
                postgres(cfg.DB.PSQL_USER_DB).where(({ email: lowercaseEmail })).first().then(user => {
                    return res.status(200).json(user);
                })
            }
            else {
                return res.status(401).json('Failed to authenticate');
            }
        });
    });
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, cfg.BCRYPT.SALT_ROUNDS, function (err, hash) {
        if (err) {
            return res.status(400).json('Bcrypt failed, no changes saved');
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
                    return res.json(JSON.stringify(user[0]));
                })
        }).catch(err => {
            return res.status(400).json('Unable to register');
        })
    })
});

app.put('/image', async (req, res) => {
    const { id, img } = req.body;
    if (!img || !id) {
        return res.status(400).json('unable to get user information');
    }
    let imgBoxes = await faceRecognition(img);
    console.log(imgBoxes);
    postgres(cfg.DB.PSQL_USER_DB).where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
            // entries[0] --> this used to return the entries
            // TO
            // entries[0].entries --> this now returns the entries
            return res.status(200).json(JSON.stringify({ imgBoxes: imgBoxes, entries: entries[0].entries }));
        })
        .catch(err => res.status(400).json('unable to get entries for userid', id))

});