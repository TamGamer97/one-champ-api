const axios = require('axios');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

async function scrapeTable() {
    try {
      // Fetching the webpage content
      const { data } = await axios.get('https://fbref.com/en/comps/9/Premier-League-Stats');

      // Load the content into cheerio
      const $ = cheerio.load(data);

      // console.log($('#results2023-202491_overall').getChildNodes())

      // Selecting the table rows containing the team data
      const teams = [];
      $('tbody tr').each((i, element) => {
        // console.log(element)
        const teamName = $(element).find('td[data-stat="team"]').text().trim();
        const wins = $(element).find('td[data-stat="wins"]').text().trim();
        const draws = $(element).find('td[data-stat="draws"]').text().trim();
        const losses = $(element).find('td[data-stat="losses"]').text().trim();
        const points = $(element).find('td[data-stat="points"]').text().trim();

        // Push the data into the array
        teams.push({
          teamName,
          wins,
          draws,
          losses,
          points
        });

        if(i == 19) {return false}
      });

      // Output the scraped data
      // console.log(teams);
      return teams
    } catch (error) {
      console.error(`Error occurred while scraping: ${error}`);
    }
}

async function generateUniqueUserId()
{
    // Get the first 4 characters of the username (or less if the username is shorter)
    let shortUsername = email.substring(0, 4);

    // Get the current date and time
    let now = new Date();
    
    // Extract time (in milliseconds) and date components
    let timeInMillis = now.getTime(); // Returns the time in milliseconds since Jan 1, 1970

    // Combine the shortUsername, timeInMillis, and year to form the userId
    let userId = `${shortUsername}${timeInMillis}`;

    return userId;
}

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

module.exports = { scrapeTable, generateUniqueUserId, scrapePremierLeagueFixtures };
