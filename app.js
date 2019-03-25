const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const fs = require('fs');

const queries = require('./queries.js');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/vis.html'));

app.get('/numerosity', (req, res) => res.sendFile(__dirname + '/public/numerosity.html'));
app.get('/numerosity_data', (req, res) => {

  let constraints = {};

  // specify state
  if(req.query.states) {
    let states = JSON.parse(req.query.states);
    if(Array.isArray(states) && states.length > 0) {
      constraints.states = states;
    }
  }

  // perform db query with given constraints
  queries.numerosityTask(constraints, function(err, data) {
    if(err) return res.json(err);
    res.json(data);
  });
});


app.get('/get_facilities_TX', (req, res) => res.sendFile(__dirname + '/public/facilities_TX.txt'));

app.get('/get_facilities_LA', (req, res) => res.sendFile(__dirname + '/public/facilities_LA.txt'));

app.get('/get_yearly', (req, res) => res.sendFile(__dirname + '/public/yearly_TX_LA.txt'));

app.get('/get_top20_TX_LA', (req, res) => res.sendFile(__dirname + '/public/top20_TX_LA.txt'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
