import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { fileURLToPath } from "node:url";
import mongoose from 'mongoose';
dotenv.config();
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log("Connected sucessfully to database", mongoose.connection.name))
  .catch(err => console.log("Failed to Connect to database with error message", err.message));

// create express app
const app = express();

// Middlewares, For static files and bodyParser for request.body
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(fileURLToPath(new URL('./views/index.html', import.meta.url)));
});


// start port listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
