require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const User = require('./user');
const db = mongoose.connection;

const header = {
    algorithm: process.env.HEADER_ALG
}

const userPayload = {
    role: 'regular',
    iss: 'HBR'
}

app.post('/login', (req, res) => {
    
});

mongoose.connect('mongodb://localhost:27017', {useUnifiedTopology: true, useNewUrlParser: true, dbName: 'hamburgerrestaurant'});