const fs = require('fs');
const path = require('path');
const https = require('https');
require("dotenv").config();

const apiKey = process.env.POSTMAN_API_KEY;
const collectionUid = '51575152-b8989f12-6bf5-4bbe-9be8-a63ad56ab939';
const collectionPath = path.join(__dirname, '..', 'postman', 'collections', 'restaurant-automation-api.postman_collection.json');

const rawData = fs.readFileSync(collectionPath, 'utf8');
const collectionData = JSON.parse(rawData);

// Wrap collection in {"collection": ...} as required by the Postman API
const payload = JSON.stringify({
  collection: collectionData
});

const options = {
  hostname: 'api.getpostman.com',
  port: 443,
  path: `/collections/${collectionUid}`,
  method: 'PUT',
  headers: {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('Sending request to Postman API to sync collection...');
const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log(`Response status code: ${res.statusCode}`);
    try {
      const parsed = JSON.parse(responseBody);
      console.log('Response body:', JSON.stringify(parsed, null, 2));
      if (res.statusCode === 200) {
        console.log('Successfully synchronized Postman collection in workspace!');
      } else {
        console.error('Failed to sync Postman collection.');
        process.exit(1);
      }
    } catch (e) {
      console.log('Raw response:', responseBody);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
  process.exit(1);
});

req.write(payload);
req.end();
