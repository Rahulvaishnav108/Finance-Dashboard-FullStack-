const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, '..', 'postman', 'collections', 'restaurant-automation-api.postman_collection.json');
const rawData = fs.readFileSync(collectionPath, 'utf8');
const collection = JSON.parse(rawData);

const originalItems = collection.item;

// Define the 11 target folders in their exact sequential execution order
const folders = {
  '01-Health': [],
  '02-Auth': [],
  '11-Admin': [],
  '03-Public': [],
  '04-Customer': [],
  '05-Cart': [],
  '06-Orders': [],
  '07-Kitchen': [],
  '08-Staff': [],
  '09-Billing': [],
  '10-Notifications': []
};

// Map original folders and items
let clearCartRequest = null;

originalItems.forEach(folder => {
  const folderName = folder.name;
  if (!folder.item) return; // Skip non-folders at root

  folder.item.forEach(req => {
    if (folderName === 'System' || folderName === '01-Health') {
      folders['01-Health'].push(req);
    } else if (folderName === 'Auth' || folderName === '02-Auth') {
      folders['02-Auth'].push(req);
    } else if (folderName === 'Public' || folderName === '03-Public') {
      folders['03-Public'].push(req);
    } else if (folderName === 'Customer' || folderName === '04-Customer' || folderName === '05-Cart' || folderName === '06-Orders' || folderName === '09-Billing') {
      const name = req.name;
      if (name === 'Clear Cart') {
        clearCartRequest = req;
      } else if (name.includes('Cart')) {
        folders['05-Cart'].push(req);
      } else if (name.includes('Order') || name.includes('Cancel')) {
        folders['06-Orders'].push(req);
      } else if (name.includes('Payment')) {
        folders['09-Billing'].push(req);
      } else {
        folders['04-Customer'].push(req);
      }
    } else if (folderName === 'Kitchen' || folderName === '07-Kitchen') {
      folders['07-Kitchen'].push(req);
    } else if (folderName === 'Staff' || folderName === '08-Staff') {
      folders['08-Staff'].push(req);
    } else if (folderName === 'Cleaning') {
      // Cleaning goes into Staff
      folders['08-Staff'].push(req);
    } else if (folderName === 'Admin' || folderName === '11-Admin') {
      folders['11-Admin'].push(req);
    } else if (folderName === 'Shared' || folderName === '10-Notifications') {
      const name = req.name;
      if (name.includes('Notification')) {
        folders['10-Notifications'].push(req);
      } else if (name.includes('Upload')) {
        folders['11-Admin'].push(req);
      } else if (name.includes('Search')) {
        folders['03-Public'].push(req);
      }
    }
  });
});

// Append the deferred Clear Cart request to the end of 06-Orders
if (clearCartRequest) {
  folders['06-Orders'].push(clearCartRequest);
}

// Construct the new collection items preserving execution order
const newItems = Object.keys(folders).map(folderName => {
  return {
    name: folderName,
    item: folders[folderName]
  };
});

// Replace the items in the collection
collection.item = newItems;

// Save the new collection
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('Postman collection successfully restructured into the 11 required folders in perfect execution order!');
console.log('Folders created:', Object.keys(folders));
Object.keys(folders).forEach(k => {
  console.log(` - ${k}: ${folders[k].length} requests`);
});
