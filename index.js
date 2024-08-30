const express = require('express')
const axios = require('axios');
const cheerio = require('cheerio');

const app = express()

// const { JSDOM } = require('jsdom');


app.get('/', (req, res) => {
    
    res.send('start endpoint')

})

app.get('/scrape-data', async(req, res) => {
    async function scrapePremierLeagueFixtures() {
      try {
        // Fetch the HTML from the website
        const { data: html } = await axios.get('https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures');
    
        // Load the HTML into cheerio
        const $ = cheerio.load(html);
    
        const table = $('table');

    
        if (!table.length) {
          console.log('Table not found. The website structure might have changed.');
          return null;
        }
    
        const fixtures = [];
    
        // Traverse the rows in the table's tbody
        $('tbody tr').each((index, element) => {
          const date = $(element).find('td[data-stat="date"]').text().trim();
          const time = $(element).find('td[data-stat="start_time"]').text().trim();
          const homeTeam = $(element).find('td[data-stat="home_team"] a').text().trim();
          let score = $(element).find('td[data-stat="score"] a').text().trim();
          const awayTeam = $(element).find('td[data-stat="away_team"] a').text().trim();
    
          if (score === '') {
            score = 'not played';
          }
    
          if (homeTeam) {
            fixtures.push({
              Date: date,
              Time: time,
              Team1: homeTeam,
              Team2: awayTeam,
              Score: score,
            });
          }
        });
    
        return fixtures;
      } catch (error) {
        console.error('Error scraping data:', error);
        return null;
      }
    }

    console.log('efe')
      const f =  await scrapePremierLeagueFixtures()

      res.send(f)

    })

app.listen(4000, () => {console.log('listenign')})

module.exports = app