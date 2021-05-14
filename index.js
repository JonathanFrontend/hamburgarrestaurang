require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const User = require('./models/user');
const Food = require('./models/food');
const db = mongoose.connection;

const header = {
    algorithm: process.env.HEADER_ALG
}


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

db.on('error', (err) => {
    if (err) console.error(err);
})

function connection(){
    console.log('Works');
    db.once('open', () => {
        let tokenInCookie = '';
        let user = {}

        app.post('/register', async (req, res) => {
            console.log(req.cookies);
            bcrypt.hash('myPlaintextPassword', saltRounds, function(err, hash) {
                console.log(hash);
                res.send('hash');
            });
        });
        app.post('/login', async (req, res) => {
        
            const user = await User.findOne({
                username: req.body.username
            });

            if(user){
                bcrypt.compare(req.body.pw, user.pw, (err, hash) => {
                    if (err) console.error(err);
    
                    if (hash) {
                        const userPayload = {
                            role: 'regular',
                            iss: 'HBR',
                            exp: Math.floor(Date.now() / 1000) + (60 * 60),
                            userId: user._id
                        }
                        const token = jwt.sign(userPayload, process.env.SECRET, header);
                        tokenInCookie = token;
    
                        console.log(user);
                        console.log('hash: ', hash);
                        res.cookie('token', token);
                        res.send('You are logged in.');
                    }
                    else {
                        res.status(403).send('Login failed.').end();
                    }
                }); 
            }
            else {
                res.status(403).send('Login failed.').end();
            }
        });
        app.get('/foods', async(req, res) => {
            console.log('Method: ', req.method);
            console.log('tokenInCookie: ', tokenInCookie);
            const foods = await Food.find({});

            (req.cookies['token'] === tokenInCookie) ? res.json(foods) : res.send('Du är inte inloggad.');
        });
        app.post('/foods', async(req, res) => {
            if(req.cookies['token'] === tokenInCookie){
                const newFood = new Food({
                    name: req.body.foodName,
                    price: req.body.foodPrice
                });
                newFood.save((err) => {
                    if (err) console.error(err)
                    res.json({msg: 'Food saved!'});
                });
            } else {
                res.send('Du är inte inloggad.');
            }
        });
        app.get('/tray', async(req, res) => {
            try {
                const decoded = jwt.verify(tokenInCookie, process.env.SECRET, header);
                const user = await User.findOne({_id: decoded.userId}).populate('tray');
                console.log(decoded);
                let totalPrice = 0;
                user.tray.map(food => {
                    totalPrice += food.price;
                });
                res.json({tray: user.tray, 
                    totalPrice: totalPrice});
            } catch(err) {
                console.error(err)
                res.send('An error occurred. Try to log in again.')
            }
        });
        app.post('/tray', async(req, res) => {
            try {
                const decoded = jwt.verify(tokenInCookie, process.env.SECRET, header);
                const user = await User.findOne({_id: decoded.userId}).populate('tray');
                console.log(decoded);
                user.tray.push(req.body.foodId);
                user.save((err) => {
                    if (err) console.error(err);
                });
                res.json(user);
            } catch(err) {
                console.error(err)
                res.send('An error occurred. Try to log in again.')
            }
        });
    });

}

mongoose.connect('mongodb://localhost:27017', {useUnifiedTopology: true, useNewUrlParser: true, dbName: 'hamburgerrestaurant'});

app.listen(3000, () => connection());