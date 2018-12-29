'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

app.get('/', home);
app.post('/searches', search);

function home(request, response){
  response.render('pages/index');
}

function search(request, response){
  let query = request.body.search[0]; //give us the title or author
  let URL = `https://www.googleapis.com/books/v1/volumes?q=${query}`;
  return superagent.get(URL)
    .then( result => {
      console.log(JSON.parse(result));
    })
    .catch(err => console.log(err));
}

app.listen(PORT, () => console.log(`APP is up on Port: ${PORT}`));