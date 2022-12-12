import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { fileURLToPath } from "node:url";
dotenv.config();

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
