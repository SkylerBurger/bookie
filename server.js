'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

app.get('/hello', hello);

function hello(request, response){
  response.render('pages/index');
}

app.listen(PORT, () => console.log(`APP is up on Port: ${PORT}`));