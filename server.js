const express = require('express');
const bcrypt = require('bcryptjs');
var cors = require('cors')

const app = express();
const PORT = 5000;

app.listen(PORT);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: false
    })
)

const database = {
    users: [
        {
            id: '123',
            name: 'john',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'sally',
            email: 'a@a',
            password: 'a',
            entries: 0,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res) => {
    res.send("hello");
    res.send('goodbye');
});

app.get('/signin', (req, res) => {

});

app.post('/signin', (req, res) => {
    console.log(req.body);
    if (req.body.email === database.users[1].email &&
        req.body.password === database.users[1].password) {
        res.json('success');
    }
    else {
        res.status(400).json('Error logging in');
    }
});

app.get('/register', (req, res) => {
});


app.post('/register', (req, res) => {
    const { email, password, name } = req.body;
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash("B4c0/\/", salt, function (err, hash) {
            console.log(hash);
        });
    });
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    database.users.forEach(user => {
        if (user.id === id) {
            user.entries++;
            return res.json(user.entries);
        }
    })
    res.status(404).json('no such user');
});

app.post('/image', (req, res) => {
    const { id } = req.body;
    database.users.forEach(user => {
        if (user.id === id) {
            user.entries++;
            return res.json(user.entries);
        }
        res.status(400).json('not found');
    })
});


/*
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash("B4c0/\/", salt, function(err, hash) {
        // Store hash in your password DB.
    });
});

// Load hash from your password DB.
bcrypt.compare("B4c0/\/", hash, function(err, res) {
    // res === true
});
bcrypt.compare("not_bacon", hash, function(err, res) {
    // res === false
});
 
// As of bcryptjs 2.4.0, compare returns a promise if callback is omitted:
bcrypt.compare("B4c0/\/", hash).then((res) => {
    // res === true
});
*/