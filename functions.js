const axios = require('axios');
const cheerio = require('cheerio');

const { createClient } = require('@supabase/supabase-js');

// Create a single supabase client for interacting with your database
const supabase = createClient('https://nxnlueqwonfremybejbm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bmx1ZXF3b25mcmVteWJlamJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE2NzAzODcsImV4cCI6MjAwNzI0NjM4N30.6cfViULSoEKQi0ImV8xTFwMoGL0uSy31aPRU-yUBFZ4')


const proxyRunning = {
  host: '108.170.12.14', // Proxy server IP
  port: 80
};

// IF timeout issue comes back, try changing the variable name from proxy to proxyRunnign as i've done and it works
// Also try experimenting with different headers

async function scrapeTable() {
    try {
      // Fetching the webpage content
      const { data } = await axios.get('http://fbref.com/en/comps/9/Premier-League-Stats', {proxyRunning});

      // Load the content into cheerio
      const $ = cheerio.load(data);

      // console.log($('#results2023-202491_overall').getChildNodes())

      // Selecting the table rows containing the team data
      const teams = [];
      $('tbody tr').each((i, element) => {
        // console.log(element)
        const teamName = $(element).find('td[data-stat="team"]').text().trim();
        const wins = $(element).find('td[data-stat="wins"]').text().trim();
        const draws = $(element).find('td[data-stat="ties"]').text().trim();
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

async function generateUniqueUserId(email)
{
    // Get first part of the email
    const emailLocal = email.split('@')[0]

    // Get the first 4 characters of the username (or less if the username is shorter)
    let shortUsername = emailLocal.substring(0, 4);

    // Get the current date and time
    let now = new Date();
    
    // Extract time (in milliseconds) and date components
    let timeInMillis = now.getTime(); // Returns the time in milliseconds since Jan 1, 1970

    // Combine the shortUsername, timeInMillis, and year to form the userId
    let userId = `${shortUsername}${timeInMillis}`;

    console.log('USERID CREATED: ' + userId)
    return userId;
}

function passwordCrypto(text, encrypt = true) {
  const secret = 'pmahCenO'
  if (!text || !secret) {
      throw new Error('Text and secret key are required');
  }

  // Simple Vigenère cipher implementation
  function processText(input, key, mode) {
      let result = '';
      const keyLength = key.length;

      for (let i = 0; i < input.length; i++) {
          const char = input[i];
          const keyChar = key[i % keyLength];
          const charCode = char.charCodeAt(0);
          const keyCode = keyChar.charCodeAt(0);

          let processedCharCode;
          if (mode === 'encrypt') {
              processedCharCode = (charCode + keyCode) % 256;
          } else {
              processedCharCode = (charCode - keyCode + 256) % 256;
          }

          result += String.fromCharCode(processedCharCode);
      }

      return result;
  }

  // Base64 encoding for safe storage/transmission
  function base64Encode(str) {
      return btoa(str);
  }

  function base64Decode(str) {
      return atob(str);
  }

  try {
      if (encrypt) {
          const processedText = processText(text, secret, 'encrypt');
          return base64Encode(processedText);
      } else {
          const decodedText = base64Decode(text);
          return processText(decodedText, secret, 'decrypt');
      }
  } catch (error) {
      throw new Error('Encryption/Decryption failed');
  }
}

async function scrapePremierLeagueFixtures() {
    try {
      // Fetch the HTML from the website
      const { data: html } = await axios.get('https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures', {proxyRunning});

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
      try{

        const retryAfter = error.response.headers['retry-after'];
        console.log('429 so retry after: ' + retryAfter)
      }catch{

      }
      return null;
    }
}

async function scoresSubmissionProcess()
{
    var {data} = await supabase.rpc("scores_submission_process")
    return data
}

module.exports = { scrapeTable, generateUniqueUserId, scrapePremierLeagueFixtures, passwordCrypto, scoresSubmissionProcess };
