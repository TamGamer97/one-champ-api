const axios = require('axios');
const cheerio = require('cheerio');

async function scrapePremierLeagueFixtures() {
  try {
    const response = await axios.get('https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures');
    const html = response.data;
    const $ = cheerio.load(html);

    const table = $('caption:contains("Scores & Fixtures")').closest('table');

    if (table.length === 0) {
      console.log('Table not found. The website structure might have changed.');
      return null;
    }

    const fixtures = [];
    table.find('tbody tr').each((i, row) => {
      const $row = $(row);
      const date = $row.find('td[data-stat="date"]').text().trim();
      const time = $row.find('td[data-stat="start_time"]').text().trim();
      const homeTeam = $row.find('td[data-stat="home_team"] a').text().trim();
      var score = $row.find('td[data-stat="score"] a').text().trim();
      const awayTeam = $row.find('td[data-stat="away_team"] a').text().trim();

    //   console.log(`Debug - Row ${i + 1}:`);
    //   console.log(`Date: "${date}", Time: "${time}", Home: "${homeTeam}", Away: "${awayTeam}", Score: "${score}"`);

        if(score == '')
        {
            score = 'not played'
        }

        if(homeTeam != "")
        {
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
function displayFixtures(fixtures) {
  if (!fixtures || fixtures.length === 0) {
    console.log('No fixtures data available.');
    return;
  }

  console.log('Premier League Fixtures 2024-2025\n');
  
  fixtures.forEach((fixture, index) => {
    // console.log(`Fixture ${index + 1}:`);
    // console.log(`Date: ${fixture.Date}`);
    // console.log(`Time: ${fixture.Time}`);
    // console.log(`Home Team: ${fixture.Team1}`);
    // console.log(`Away Team: ${fixture.Team2}`);
    // console.log(`Score: ${fixture.Score}`);
    // console.log('------------------------');
  });
}

// (async () => {
//   const fixtures = await scrapePremierLeagueFixtures();
//   displayFixtures(fixtures);
  
//   // Log raw data as JSON
//   console.log(JSON.stringify(fixtures, null, 2));
// })();



const express = require('express')
const app = express()

app.get('/', (req,res)=> {
    res.send('hello')
})


app.listen(3000, () => {
    console.log('port is listening')
})