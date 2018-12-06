const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/users', { useNewUrlParser: true });

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.set('view engine', 'ejs');

const router = require('./router');

app.use('/', router);

app.listen(3000);