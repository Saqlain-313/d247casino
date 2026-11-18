const fs = require('fs');
const path = require('path');

const casinoList = JSON.parse(
  fs.readFileSync('/Users/ansarhusain/Documents/Reddy-777/Casino/d247-vs/casino-list.json', 'utf8')
);

const gmtFile = fs.readFileSync(
  '/Users/ansarhusain/Documents/Reddy-777/d247casino/client/src/components/tables/GameMarketTable.jsx',
  'utf8'
);

const cvcFile = fs.readFileSync(
  '/Users/ansarhusain/Documents/Reddy-777/d247casino/client/src/components/video/CasinoVideoCards.jsx',
  'utf8'
);

console.log(`Total games in casino-list.json: ${casinoList.length}`);

const missingInGmt = [];
const mappedInGmt = [];

for (const game of casinoList) {
  const slug = game.eventName;
  // Look for exact key in TABLE_COMPONENTS
  const quotedRegex = new RegExp(`['"]?${slug}['"]?\\s*:`);
  if (quotedRegex.test(gmtFile)) {
    mappedInGmt.push(slug);
  } else {
    missingInGmt.push(slug);
  }
}

console.log(`Mapped in GameMarketTable: ${mappedInGmt.length}`);
console.log(`Missing in GameMarketTable (${missingInGmt.length}):`, missingInGmt);

// Check reference files in Casino/d247-vs
const missingRef = [];
for (const game of casinoList) {
  const refPath = path.join('/Users/ansarhusain/Documents/Reddy-777/Casino/d247-vs', game.eventName, 'rendered.html');
  if (!fs.existsSync(refPath)) {
    missingRef.push(game.eventName);
  }
}
console.log(`Missing rendered.html in ref (${missingRef.length}):`, missingRef);
