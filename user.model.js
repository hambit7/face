const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    name: String,
    username: String,
    password: String
}, {
    collection: 'users'
});

module.exports = mongoose.model('User', User);