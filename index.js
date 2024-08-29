const express = require('express');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = 3000;

async function scrapePremierLeagueFixtures() {
  try {
    const response = await fetch('https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures');
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const table = document.querySelector('table');

    if (!table) {
      console.log('Table not found. The website structure might have changed.');
      return null;
    }

    const fixtures = [];
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
      const date = row.querySelector('td[data-stat="date"]')?.textContent.trim();
      const time = row.querySelector('td[data-stat="start_time"]')?.textContent.trim();
      const homeTeam = row.querySelector('td[data-stat="home_team"] a')?.textContent.trim();
      let score = row.querySelector('td[data-stat="score"] a')?.textContent.trim();
      const awayTeam = row.querySelector('td[data-stat="away_team"] a')?.textContent.trim();

      if (score === '') {
        score = 'not played';
      }

      if (homeTeam) {
        fixtures.push({
          Date: date,
          Time: time,
          Team1: homeTeam,
          Team2: awayTeam,
          Score: score
        });
      }
    });

    return fixtures;
  } catch (error) {
    console.error('Error scraping data:', error);
    return null;
  }
}

app.get('/', async (req, res) => {
  try {
    const fixtures = await scrapePremierLeagueFixtures();
    if (fixtures) {
        console.log('displaying fixtures')
      res.json(fixtures);
    } else {
      res.status(500).json({ error: 'Failed to fetch fixtures' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});