'use strict';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { fileURLToPath } from "node:url";
import mongoose from 'mongoose';
import User from './Models/User.js';
dotenv.config();
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log("Connected sucessfully to database", mongoose.connection.name))
  .catch(err => console.log("Failed to Connect to database with error message", err.message));

// create express app
const app = express();

// Middlewares, For static files and bodyParser for request.body
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Home Page
 */
app.get('/', (req, res) => {
  res.sendFile(fileURLToPath(new URL('../views/index.html', import.meta.url)));
});

/**
 * User Creation API
 */
app.post('api/users', (req, res) => {
  console.log('creating new user', req.body.username);
  new User({ username: req.body.username }, (err, doc) => {
    if (err.code == 11000) {
      console.log('username already exist');
      User.findOne({ username: req.body.username }, (err1, doc1) => {
        if (err1)
          res.json({ error: err1.messages, code: err1.code });
        else
          res.json(doc1);
      });
    }
    else if (err) {
      console.log('There was an error in creating the user, error code:', err.code);
      res.json({ error: err.messages, code: err.code });
    }
    else {
      console.log('username created with _id:', doc._id);
      res.json(doc);
    }
  });
})



// start port listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
