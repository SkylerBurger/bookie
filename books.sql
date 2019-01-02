DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbnType VARCHAR(255),
  isbnNumber VARCHAR(255),
  image_url VARCHAR(255),
  description TEXT,
  bookshelf VARCHAR(255)
);

INSERT INTO books (
  author,
  title,
  isbnType,
  isbnNumber,
  image_url,
  description,
  bookshelf
) VALUES (
  'Chuanming Zong',
  'Sphere Packings',
  'ISBN_13',
  '9780387227801',
  'http://books.google.com/books/content?id=AmcKBwAAQBAJ&amp;printsec=frontcover&amp;img=1&amp;zoom=1&amp;edge=curl&amp;source=gbs_api',
  'Sphere packings is one of the most fascinating and challenging subjects in mathematics. In the course of centuries, many exciting results have been obtained, ingenious methods created, related challenging problems proposed, and many surprising connections with other subjects found. This book gives a full account of this fascinating subject, especially its local aspects, discrete aspects, and its proof methods. The book includes both classical and contemporary results and provides a full treatment of the subject.',
  'boring'
); 


INSERT INTO books (
  author,
  title,
  isbnType,
  isbnNumber,
  image_url,
  description,
  bookshelf
) VALUES (
  'Dav Pilkey',
  'Captain Underpants and the Invasion of the Incredibly Naughty Cafeteria Ladies from Outer Space (Captain Underpants #3)',
  'ISBN_13',
  '9780545627962',
  'http://books.google.com/books/content?id=AVYARVGkPj0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  'Tra-la-laaa!! The NEW YORK TIMES and USA TODAY bestselling Captain Underpants series is now available in ebook edition, featuring Flip-E-Rama, bonus content, and more! He defeated the diabolical Dr. Diaper . . . He terminated the terrible talking toilets . . . Now he''s in for the fight of his life. Can Captain Underpants and his drawers hold up under the pressure from three massive, tentacled space aliens (in disguise) who are on a mission to enslave the whole planet? It''s time to probe a little further and find out in this WEDGIER alien adventure of Captain Underpants!',
  'fun'
); 