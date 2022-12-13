'use strict';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { fileURLToPath } from "node:url";
import mongoose from 'mongoose';
import UserExerciseLog from './Models/UserExerciseLog.js';

//configure .env
dotenv.config();

//configure database connection
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
 * # User Creation API
 * ___
 * ### from fcc:
 * > You can POST to /api/users with form data username to create a new user.
 * > The returned response from POST /api/users with form data username will be an object with username and _id properties.
 * ___
 * The handler will try to create the user,
 * if an error occurs on creation and it is code 11000 (Duplicate Error),
 *    find the exist user and return it.
 * else if any other error,
 *    return the error code
 * else
 *    return the newly created user
 */
app.post('/api/users', (req, res) => {
  new UserExerciseLog({ username: req.body.username }).save((err, user) => {
    if (err && err.code == 11000) {
      console.log('User already exist. Retrieving Info.');
      UserExerciseLog.findOne({ username: req.body.username }).select("_id username").exec((err1, user1) => {
        if (err1)
          res.json({ error: "There was an error in retrieving data of existing user: " + err1 });
        else if (!user1)
          res.json({ error: "This is embarassing, there seem to be a problem. Pleae try again." });
        else
          res.json(user1);
      });
    }
    else if (err && err.code)
      res.json({ error: "There was an error in creating user: " + err });
    else
      res.json({ _id: user._id, username: user.username });
  });
});

/**
 * # Get All users API
 * ___
 * ### from fcc:
 * > You can make a GET request to /api/users to get a list of all users.
 * > You can make a GET request to /api/users to get a list of all users.
 * > Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.
 */
app.get('/api/users', (req, res) => {
  UserExerciseLog.find()
    .select("_id username")
    .exec((err, docs) => {
      if (err) {
        console.log("There was an error: ", err);
        res.json({ error: 'There was an error in acquiring all users. Please try again.' });
      } else
        res.json(docs);
    });
})

/**
 * # Exercise API
 * ___
 * ### from fcc:
 * > You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
 * > The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.
 */
app.post('/api/users/:_id/exercises', (req, res) => {
  console.log("Creating new excercise entry for user(", req.params._id, ")");
  UserExerciseLog.findById(req.params._id, (err, userlog) => {
    if (err) {
      console.log("There was an error in trying to acquire the user by id.");
      console.log(err);
      res.json({ error: "There was an error in trying to acquire the user by id. Error Message:" + err });
    } else {
      let newEx = {
        description: req.body.description,
        duration: req.body.duration,
      };
      let newDate = new Date(req.body.date);
      if (newDate != "Invalid Date")
        newEx.date = newDate;

      userlog.log.push(newEx);
      userlog.save((er, newUserlog) => {
        res.json(newUserlog.last_exercise);
      });
    }
  });
});


/**
 * # Logs API
 * ___
 * ### from fcc
 * > You can make a `GET` request to `/api/users/:_id/logs` to retrieve a full exercise log of any user.
 * > A request to a user's log `GET` `/api/users/:_id/logs` returns a user object with a `count` property representing the number of exercises that belong to that user.
 * > A `GET` request to `/api/users/:_id/logs` will return the user object with a `log` array of all the exercises added.
 * > Each item in the `log` array that is returned from `GET` `/api/users/:_id/logs` is an object that should have a `description`, `duration`, and `date` properties.
 * > The `description` property of any object in the `log` array that is returned from `GET` `/api/users/:_id/logs` should be a string.
 * > The `duration` property of any object in the `log` array that is returned from `GET` `/api/users/:_id/logs should be a number.`
 * > The `date `property of any object in the `log` array that is returned from `GET` `/api/users/:_id/logs` should be a string. Use the `dateString `forma`t of the Date API.
 */
app.get('/api/users/:_id/logs', function (req, res) {
  const from = new Date(req.query.from), to = new Date(req.query.to), limit = req.query.limit;
  UserExerciseLog.findById(req.params._id)
    .select("username +count log")
    .exec((err, userlog) => {
      if (err)
        res.json({ error: "There was an error in retrieving user (" + req.params._id + ")." + err });
      else if (!userlog)
        res.json({ error: req.params._id + " user does not exist." });
      else {
        const log = userlog.log
          .filter(exercise =>
            ((from != "Invalid Date" && from <= exercise.date) || from == "Invalid Date")
            && ((to != "Invalid Date" && exercise.date <= to) || to == "Invalid Date")
          )
          .filter((e, i) => (limit && i < limit) || !limit)
          .map(e => ({ description: e.description, duration: e.duration, date: e.date.toDateString() }));
        res.json({
          _id: userlog._id,
          username: userlog.username,
          count: log.length,
          log: log
        });
      }
    });
});


// start port listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
