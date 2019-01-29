const keys = require("./keys");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');


// Express App Setup
const app = express();
app.use(cors());
app.use(bodyParser.json());


// Postgress Client Setup
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG Connection'));

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch((err) => console.log('PG Tablet not created', err));


// Redis Client Setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();


// Express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');
  
  res.send(values.rows);
});


// redis doesn't have support for Promises.
app.get('/values/current', (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  })
})


app.post('/values', (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
})


app.listen(5000, err => {
  console.log("Listening to PORT 5000");
});




