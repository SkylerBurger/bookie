'use strict';

//=============
// Dependencies
//=============

const express = require('express');
const superagent = require('superagent');
const app = express();
const pg = require('pg');
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

//=======================
// Database - PostgresSQL
//=======================

const client = new pg.Client('postgres://skybur:enkidu@localhost:5432/books');
client.connect();

client.on('error', err => console.log(err));

//=======
// Routes
//=======

app.get('/', home);
app.get('/form', form);
app.post('/searches', search);
app.get('/books/:books_id', bookDetail);

//==========
// Functions
//==========

function home(request, response){
  let SQL = 'SELECT * FROM books;';
  return client.query(SQL)
    .then(data => {
        response.render('pages/index', {data: data.rows});
    })
    .catch(err => response.render('pages/error', {err}));
}

function form (request, response) {
  response.render('pages/searches/new');
}

function search(request, response){
  let query = request.body.search[0];
  let searchType = request.body.search[1];
  let URL = `https://www.googleapis.com/books/v1/volumes?q=`;

  if(searchType === 'title'){
    URL += `+intitle:${query}`;
  } else if(searchType === 'author'){
    URL += `+inauthor:${query}`;
  }

  return superagent.get(URL)
    .then( result => {
      let books = result.body.items.map(book =>  new Book(book));
      response.render('pages/searches/show', {books});
    })
    .catch(err => response.render('pages/error', {err}));
}

function bookDetail (request, response) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.books_id];
  return client.query(SQL, values)
    .then(data => {
      response.render('pages/books/detail', {details: data.rows[0]});
    })
    .catch(err => response.render('pages/error', {err}));
}

app.listen(PORT, () => console.log(`APP is up on Port: ${PORT}`));

//=============
// Constructors
//=============

const Book = function(data) {
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors.reduce((accum, auth) => {
    accum += auth + ' ';
    return accum;
  }, '');
  this.description = data.volumeInfo.description;
  this.image_url = data.volumeInfo.imageLinks.thumbnail;
  this.isbn = `${data.volumeInfo.industryIdentifiers[0].type} ${data.volumeInfo.industryIdentifiers[0].identifier}`; 
}
