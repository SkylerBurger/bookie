'use strict';

//=============
// Dependencies
//=============

const express = require('express');
const superagent = require('superagent');
const app = express();
const pg = require('pg');
require('dotenv').config();

app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

//=======================
// Database - PostgresSQL
//=======================

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

client.on('error', err => console.log(err));

//=======
// Routes
//=======

app.get('/', home);
app.get('/form', form);
app.post('/searches', search);
app.post('/save', saveBook);
app.get('/books/:books_id', bookDetail);
app.get('/info/:books_id', infoDetail);

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

function form(request, response) {
  response.render('pages/searches/new');
}

function infoDetail (request, response) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.books_id];

  return client.query(SQL,values)
    .then(data => {
      response.render('pages/books/edit', {details: data.rows[0]});
    })
    .catch(err => response.render('pages/error', {err}));
}

function search(request, response){
  let query = request.body.search[0];
  let searchType = request.body.search[1];
  let URL = `https://www.googleapis.com/books/v1/volumes?q=`;

  if(searchType === 'title'){
    URL += `${query}`;
  } else if(searchType === 'author'){
    URL += `+inauthor:${query}`;
  }
  
  return superagent.get(URL)
    .then(result => {
      let books = [];
      let limit = 40;
      if(result.body.items.length < 40) limit = result.body.items.length;

      for(let i = 0; i < limit; i++){
        let book = new Book(result.body.items[i]);
        books.push(book);
      }
      
      response.render('pages/searches/results', {books})
    })
    .catch(err => console.error(err));
}

function saveBook(request, response){
  let SQL = `INSERT INTO books
                (title, author, description, image_url, isbnType, isbnNumber)
                VALUES($1, $2, $3, $4, $5, $6)`;

  return client.query(SQL, [request.body.title, request.body.author, request.body.description, request.body.image_url, request.body.isbnType, request.body.isbnNumber])
    .then( () => {
      response.render('pages/books/detail', {details: request.body});
    })
    .catch(err => console.error(err));
}

function bookDetail(request, response) {
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
  let volume = data.volumeInfo;
  
  volume.title ? this.title = volume.title : this.title = "Untitled";

  volume.authors ? this.author = volume.authors.reduce((accum, auth) => {
    accum += auth + ' ';
    return accum;
  }, '') : this.author = 'Unknown';

  volume.description ? this.description = volume.description : this.description = 'No Description Provided';

  volume.imageLinks.thumbnail ? this.image_url = volume.imageLinks.thumbnail : this.image_url = "img/no-cover.png";
  
  volume.industryIdentifiers[0].type ? this.isbnType = volume.industryIdentifiers[0].type : this.isbnType = '';

  volume.industryIdentifiers[0].identifier ? this.isbnNumber = volume.industryIdentifiers[0].identifier : this.isbnNumber = 'Unknown ISBN';
}
