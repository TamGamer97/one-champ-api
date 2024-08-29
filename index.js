const express = require('express');
const { JSDOM } = require('jsdom');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const PORT = process.env.PORT || 3000;

// List of user agents to rotate through
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// List of proxy servers (you should replace these with actual proxy servers)
const proxyServers = [
  'http://proxy1.example.com:8080',
  'http://proxy2.example.com:8080',
  'http://proxy3.example.com:8080'
];

function getRandomProxy() {
  return proxyServers[Math.floor(Math.random() * proxyServers.length)];
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const proxy = getRandomProxy();
      const agent = new HttpsProxyAgent(proxy);
      const userAgent = getRandomUserAgent();

      console.log(`Attempt ${i + 1} using proxy: ${proxy} and User-Agent: ${userAgent}`);

      const response = await fetch(url, {
        agent: agent,
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.google.com/'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
    }
  }
}

async function scrapePremierLeagueFixtures() {
  try {
    console.log('Starting to fetch the webpage...');
    const html = await fetchWithRetry('https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures');
    console.log('Webpage fetched successfully. Parsing HTML...');
    
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const table = document.querySelector('table');

    if (!table) {
      console.log('HTML content:', html.substring(0, 500) + '...'); // Log the first 500 characters of HTML
      throw new Error('Table not found. The website structure might have changed.');
    }

    console.log('Table found. Extracting fixtures...');

    const fixtures = [];
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach((row, index) => {
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
      
      if (index < 5) {
        console.log(`Extracted fixture: ${homeTeam} vs ${awayTeam}`);
      }
    });

    console.log(`Total fixtures extracted: ${fixtures.length}`);
    return fixtures;
  } catch (error) {
    console.error('Error scraping data:', error);
    return null;
  }
}

app.get('/', async (req, res) => {
  try {
    console.log('Received request for fixtures');
    const fixtures = await scrapePremierLeagueFixtures();
    if (fixtures) {
      console.log('Sending fixtures to client');
      res.json(fixtures);
    } else {
      console.log('Failed to fetch fixtures');
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