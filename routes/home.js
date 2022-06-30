const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const urls = [
    {origin: "www.google.com1", short: "google1"},
    {origin: "www.google.com2", short: "google2"},
    {origin: "www.google.com3", short: "google3"},
  ]
  res.render('home', {urls: urls});
});


module.exports = router; 