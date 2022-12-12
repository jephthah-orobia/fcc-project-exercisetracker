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
 * The handler will try to create the user,
 * if an error occurs on creation and it is code 11000 (Duplicate Error),
 *    find the exist user and return it.
 * else if any other error,
 *    return the error code
 * else
 *    return the newly created user
 */
app.post('/api/users', (req, res) => {
  new User({ username: req.body.username }).save((err, doc) => {
    if (err && err.code == 11000) {
      User.findOne({ username: req.body.username }, (err1, doc1) => {
        if (err1)
          res.json({ error: err1.messages, code: err1.code });
        else
          res.json(doc1);
      });
    }
    else if (err) {
      res.json({ error: err.messages, code: err.code });
    }
    else {
      res.json(doc);
    }
  });
});

/**
 * Get All users API
 */
app.get('/api/users', (req, res) => {
  User.find().exec((err, docs) => {
    if (err) {
      console.log("There was an error:", err.code);
      res.json({ error: 'There was an error in acquiring all users. Please try again.' });
    } else
      res.json(docs);
  });
})



// start port listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
