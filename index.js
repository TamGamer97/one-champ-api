const express = require('express')


const app = express()

// https://onechampapi-hw950o0p.b4a.run/scrape-data
// https://dashboard.back4app.com/apps
// https://github.com/TamGamer97/one-champ-api/tree/back4app - back4app branch

const { scrapeTable, generateUniqueUserId, scrapePremierLeagueFixtures } = require('./functions.js');


app.get('/', (req, res) => {
    
    res.send('start endpoint')

})

app.get('/Premier-League-Table', async(req, res) => {

  res.send(await scrapeTable())

})

app.get('/generate-user-id', async(req, res) => { // figure out how to pass in email to request
  res.send(await generateUniqueUserId())
})

app.get('/Premier-League-Fixtures', async(req, res) => {

  res.send(await scrapePremierLeagueFixtures())

})

  
app.get('/live-matches', async (req, res) => {

  async function scrapeLivescorePremierLeagueMatches() {
    try {
      console.log('Fetching data from Livescore...');
      const { data: html } = await axios.get('https://www.livescore.com/en/football/england/premier-league/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
  
      console.log('Parsing HTML...');
      const dom = new JSDOM(html);
      const document = dom.window.document;

      console.log(document.querySelectorAll('[data-test-id=virtuoso-item-list]').length)
      return
      console.log('Extracting match data...');
      const matchElements = Array.from(document.querySelectorAll('[data-test-id="virtuoso-item-list"]'));
      
      const matches = matchElements.map(element => {
        const homeTeam = element.querySelector('[data-test-id="team-name-home"]')?.textContent.trim();
        const awayTeam = element.querySelector('[data-test-id="team-name-away"]')?.textContent.trim();
        const homeScore = element.querySelector('[data-test-id="home-score"]')?.textContent.trim();
        const awayScore = element.querySelector('[data-test-id="away-score"]')?.textContent.trim();
        const status = element.querySelector('[data-test-id="match-status"]')?.textContent.trim();
  
        return {
          HomeTeam: homeTeam,
          AwayTeam: awayTeam,
          Score: `${homeScore || ''} - ${awayScore || ''}`.trim(),
          Status: status
        };
      });
  
      console.log(`Processed ${matches.length} matches.`);
  
      if (matches.length === 0) {
        console.log('No matches found. This could be because:');
        console.log('1. There are no Premier League matches listed at the moment.');
        console.log('2. The website structure has changed.');
        console.log('3. The content is loaded dynamically and not present in the initial HTML.');
        console.log('Dumping a portion of the HTML for debugging:');
        console.log(html.slice(0, 1000)); // Print the first 1000 characters of HTML
      }
  
      return matches;
    } catch (error) {
      console.error('Error scraping matches:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      return null;
    }
  }


  const liveMatches = await scrapeLivescorePremierLeagueMatches();
  res.send(liveMatches);
});

app.get('/Team-Info', async(req, res) => {

  const teamImages = [
    { name: "Arsenal", crestUrl: "https://crests.football-data.org/57.png" },
    { name: "Aston Villa", crestUrl: "https://crests.football-data.org/58.png" },
    { name: "Blackburn Rovers FC", crestUrl: "https://crests.football-data.org/59.png" },
    { name: "Bolton Wanderers FC", crestUrl: "https://crests.football-data.org/60.png" },
    { name: "Chelsea", crestUrl: "https://crests.football-data.org/61.png" },
    { name: "Everton", crestUrl: "https://crests.football-data.org/62.png" },
    { name: "Fulham", crestUrl: "https://crests.football-data.org/63.png" },
    { name: "Liverpool", crestUrl: "https://crests.football-data.org/64.png" },
    { name: "Manchester City", crestUrl: "https://crests.football-data.org/65.png" },
    { name: "Manchester United FC", crestUrl: "https://crests.football-data.org/66.png" },
    { name: "Newcastle United FC", crestUrl: "https://crests.football-data.org/67.png" },
    { name: "Norwich City FC", crestUrl: "https://crests.football-data.org/68.png" },
    { name: "Queens Park Rangers FC", crestUrl: "https://crests.football-data.org/69.png" },
    { name: "Stoke City FC", crestUrl: "https://crests.football-data.org/70.png" },
    { name: "Sunderland AFC", crestUrl: "https://crests.football-data.org/71.png" },
    { name: "Tottenham", crestUrl: "https://crests.football-data.org/73.png" },
    { name: "West Bromwich Albion FC", crestUrl: "https://crests.football-data.org/74.png" },
    { name: "Wigan Athletic FC", crestUrl: "https://crests.football-data.org/75.png" },
    { name: "Wolves", crestUrl: "https://crests.football-data.org/76.png" },
    { name: "Hull City AFC", crestUrl: "https://crests.football-data.org/322.png" },
    { name: "Portsmouth FC", crestUrl: "https://crests.football-data.org/325.png" },
    { name: "Burnley FC", crestUrl: "https://crests.football-data.org/328.png" },
    { name: "Birmingham City FC", crestUrl: "https://crests.football-data.org/332.png" },
    { name: "Blackpool FC", crestUrl: "https://crests.football-data.org/336.png" },
    { name: "Leicester City", crestUrl: "https://crests.football-data.org/338.png" },
    { name: "Southampton", crestUrl: "https://crests.football-data.org/340.png" },
    { name: "Leeds United FC", crestUrl: "https://crests.football-data.org/341.png" },
    { name: "Derby County FC", crestUrl: "https://crests.football-data.org/342.png" },
    { name: "Middlesbrough FC", crestUrl: "https://crests.football-data.org/343.png" },
    { name: "Sheffield Wednesday FC", crestUrl: "https://crests.football-data.org/345.png" },
    { name: "Watford FC", crestUrl: "https://crests.football-data.org/346.png" },
    { name: "AFC Wimbledon", crestUrl: "https://crests.football-data.org/347.png" },
    { name: "Charlton Athletic FC", crestUrl: "https://crests.football-data.org/348.png" },
    { name: "Ipswich Town", crestUrl: "https://crests.football-data.org/349.png" },
    { name: "Nott'ham Forest", crestUrl: "https://crests.football-data.org/351.png" },
    { name: "Crystal Palace", crestUrl: "https://crests.football-data.org/354.png" },
    { name: "Reading FC", crestUrl: "https://crests.football-data.org/355.png" },
    { name: "Sheffield United FC", crestUrl: "https://crests.football-data.org/356.png" },
    { name: "Barnsley FC", crestUrl: "https://crests.football-data.org/357.png" },
    { name: "Northampton Town FC", crestUrl: "https://crests.football-data.org/376.png" },
    { name: "Millwall FC", crestUrl: "https://crests.football-data.org/384.png" },
    { name: "Rotherham United FC", crestUrl: "https://crests.football-data.org/385.png" },
    { name: "Bristol City FC", crestUrl: "https://crests.football-data.org/387.png" },
    { name: "Luton Town FC", crestUrl: "https://crests.football-data.org/389.png" },
    { name: "Notts County FC", crestUrl: "https://crests.football-data.org/391.png" },
    { name: "Huddersfield Town AFC", crestUrl: "https://crests.football-data.org/394.png" },
    { name: "Brighton", crestUrl: "https://crests.football-data.org/397.png" },
    { name: "Leyton Orient FC", crestUrl: "https://crests.football-data.org/399.png" },
    { name: "Brentford", crestUrl: "https://crests.football-data.org/402.png" },
    { name: "Milton Keynes Dons FC", crestUrl: "https://crests.football-data.org/409.png" },
    { name: "West Ham", crestUrl: "https://crests.football-data.org/563.png" },
    { name: "England", crestUrl: "https://crests.football-data.org/770.svg" },
    { name: "Bournemouth", crestUrl: "https://crests.football-data.org/1044.png" },
    { name: "Bradford City AFC", crestUrl: "https://crests.football-data.org/1067.png" },
    { name: "Bury FC", crestUrl: "https://crests.football-data.org/1068.png" },
    { name: "Burton Albion FC", crestUrl: "https://crests.football-data.org/1072.png" },
    { name: "Oldham Athletic AFC", crestUrl: "https://crests.football-data.org/1075.png" },
    { name: "Coventry City FC", crestUrl: "https://crests.football-data.org/1076.png" },
    { name: "Peterborough United FC", crestUrl: "https://crests.football-data.org/1077.png" },
    { name: "Swindon Town FC", crestUrl: "https://crests.football-data.org/1079.png" },
    { name: "Preston North End FC", crestUrl: "https://crests.football-data.org/1081.png" },
    { name: "Oxford United FC", crestUrl: "https://crests.football-data.org/1082.png" },
    { name: "Carlisle United FC", crestUrl: "https://crests.football-data.org/1136.png" },
    { name: "Grimsby Town FC", crestUrl: "https://crests.football-data.org/1137.png" },
    { name: "Plymouth Argyle FC", crestUrl: "https://crests.football-data.org/1138.png" },
    { name: "Accrington Stanley FC", crestUrl: "https://crests.football-data.org/1145.png" },
    { name: "Wycombe Wanderers FC", crestUrl: "https://crests.football-data.org/1146.png" },
    { name: "Bradford Park Avenue FC", crestUrl: "https://crests.football-data.org/4578.png" },
    { name: "Charnock Richard FC", crestUrl: null },
    { name: "Glossop North End AFC", crestUrl: null }
  ];

  res.send(teamImages)
})



app.listen(3000, () => {console.log('Listening on port 5000'); console.log('One Champ Api')})

module.exports = app