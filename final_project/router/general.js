const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
      return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

const getBooks = async (req, res) => {
    try {
      const response = await axios.get('https://example.com/api/books');
      res.status(200).json(response.data); 
    } catch (error) {
      res.status(500).json({ message: 'error de api ', error: error.message });
    }
  };
  
  public_users.get('/', getBooks);
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json({ books: books});
});
async function getBookDetails(isbn) {
  try {
      const response = await axios.get(`.com/api/books/${isbn}`);
      console.log(response.data);
  } catch (error) {
      console.error(`Error fetching book details for ISBN ${isbn}:`, error);
  }
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn',getBookDetails);

// Get books by author using async/await and Axios
async function getBooksByAuthor(req, res) {
  const { author } = req.params; 
  try {
    
      const response = await axios.get(`http://example.com/api/books/author/${author}`);
      const matchingBooks = response.data; 
      if (matchingBooks.length > 0) {
          return res.status(200).json(matchingBooks); 
      } else {
          return res.status(404).json({ message: "No books found for this author" });
      }
  } catch (error) {
      return res.status(500).json({ message: `Error fetching books by author ${author}`, error: error.message });
  }
}


public_users.get('/author/:author', getBooksByAuthor);

// Get books by title using async/await and Axios
async function getBooksByTitle(req, res) {
  const { title } = req.params; 
  try {

      const response = await axios.get(`http://example.com/api/books/title/${title}`);
      const matchingBooks = response.data;
      if (matchingBooks.length > 0) {
          return res.status(200).json(matchingBooks); 
      } else {
          return res.status(404).json({ message: "No books found with this title" });
      }
  } catch (error) {
      return res.status(500).json({ message: `Error fetching books by title ${title}`, error: error.message });
  }
}

public_users.get('/title/:title', getBooksByTitle);


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book && book.reviews) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;
