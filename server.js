'use strict';

//=============
// Dependencies
//=============

const express = require('express');
const superagent = require('superagent');
const app = express();
const pg = require('pg');
const methodOverride = require('method-override');
require('dotenv').config();

app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride((req, res) => {
  if(req.body && typeof req.body === 'object' && '_method' in req.body){
    let method = req.body._method;
    delete req.body._method;
    console.log(method);
    return method;
  }
  console.log('Did not change');
}));
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
app.delete('/books/:books_id', deleteBook);
app.get('/update/:books_id', editBook);
app.put('/update/:books_id', updateBook)

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

function editBook(request, response) {
  let shelfSQL = 'SELECT DISTINCT bookshelf FROM books';
  let shelfData = [];
  client.query(shelfSQL)
    .then(result => {
      shelfData = [...result.rows];
    })
    .catch(err => console.error(err));

  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.books_id];
  
  return client.query(SQL,values)
  .then(data => {
    response.render('pages/books/edit', {details: data.rows[0], shelves: shelfData});
  })
  .catch(err => response.render('pages/error', {err}));
}

function updateBook(request, response){
  let data = request.body;

  let SQL = `UPDATE books
             SET title=$1, author=$2, image_url=$3, description=$4, isbn_type=$5, isbn_number=$6, bookshelf=$7
             WHERE id=$8`;
  let values = [data.title, data.author, data.image_url, data.description, data.isbn_type, data.isbn_number, data.bookshelf, data.id];

  return client.query(SQL, values)
    .then(result => {
      response.redirect(`/books/${data.id}`);
    })
    .catch(err => console.error(err));
            
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
      let limit = 10;
      if(result.body.items.length < 10) limit = result.body.items.length;

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
                (title, author, description, image_url, isbn_type, isbn_number, bookshelf)
                VALUES($1, $2, $3, $4, $5, $6, $7)
                RETURNING id`;

  return client.query(SQL, [request.body.title, request.body.author, request.body.description, request.body.image_url, request.body.isbn_type, request.body.isbn_number, request.body.bookshelf])
    .then( result => {
      response.render('pages/books/detail', {details: request.body, id: result.rows[0].id});
    })
    .catch(err => console.error(err));
}

function deleteBook(request, response){
  let SQL = `DELETE FROM books WHERE id=$1`;
  let values = [request.params.books_id];
  return client.query(SQL, values)
    .then(result => {
      response.redirect('/');
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
  
  volume.title ? 
  this.title = volume.title : 
  this.title = "Untitled";

  volume.authors ? 
  this.author = volume.authors.reduce((accum, auth) => {
    accum += auth + ' ';
    return accum;
  }, '') : 
  this.author = 'Unknown';

  volume.description ? 
  this.description = volume.description : 
  this.description = 'No Description Provided';

  volume.imageLinks.thumbnail ? 
  this.image_url = volume.imageLinks.thumbnail : 
  this.image_url = "img/no-cover.png";
  
  volume.industryIdentifiers[0].type ? 
  this.isbn_type = volume.industryIdentifiers[0].type : 
  this.isbn_type = '';

  volume.industryIdentifiers[0].identifier ? 
  this.isbn_number = volume.industryIdentifiers[0].identifier : 
  this.isbn_number = 'Unknown ISBN';
}