const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
  };

  const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return user ? true : false;
  };


regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username) || !authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
    req.session.token = token;
  
    return res.status(200).json({ message: "Login successful", token });
  });
  

regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const token = req.session.token;
  
    if (!token) {
      return res.status(403).json({ message: "No token provided. Please login" });
    }
  
    try {
      const decoded = jwt.verify(token, 'secretkey');
      const username = decoded.username;
      if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
      }
      if (!books[isbn].reviews) {
        books[isbn].reviews = [];
      }
      let reviewExists = false;
      for (let i = 0; i < books[isbn].reviews.length; i++) {
        if (books[isbn].reviews[i].username === username) {
          books[isbn].reviews[i].review = review;
          reviewExists = true;
          break;
        }
      }
      if (!reviewExists) {
        books[isbn].reviews.push({ username, review });
      }
      return res.status(200).json({ message: "Review added/updated successfully" });
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  });


  
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
  
    const token = req.session.token;
  
    if (!token) {
      return res.status(403).json({ message: "No token provided. Please login" });
    }
  
    try {
      const decoded = jwt.verify(token, 'secretkey');
      const username = decoded.username;
  
      if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
      }
      if (!books[isbn].reviews) {
        return res.status(404).json({ message: "No reviews for this book" });
      }
      const reviewIndex = books[isbn].reviews.findIndex(review => review.username === username);
  
      if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found" });
      }
      books[isbn].reviews.splice(reviewIndex, 1);
  
      return res.status(200).json({ message: "Review deleted successfully" });
  
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  });
  
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
