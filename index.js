const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    const { data } = await axios.get('https://example.com');  // Change this URL to the site you want to scrape
    const $ = cheerio.load(data);

    const scrapedData = [];

    // Example: Scraping all <h2> tags
    $('p').each((i, elem) => {
      scrapedData.push($(elem).text());
    });

    res.json(scrapedData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred during scraping');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
