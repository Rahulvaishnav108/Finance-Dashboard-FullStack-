const mongoose = require('mongoose');

const uri = 'mongodb+srv://graphuratestingDB:FChgN9ZIZBi5ItdK@graphuratestingdb.v2gcmi8.mongodb.net/RestaurantAutomation?retryWrites=true&w=majority';

async function cleanup() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const collectionsToDrop = [
    'tablesessions',
    'kitchenbatches',
    'menuitems',
    'menucategories',
    'categories',
    'orderItems',
    'restaurantMembers',
    'permissions',
    'roles',
    'couponRedemptions',
    'itemAddons',
    'menuVariants',
    'platformMetrics',
    'loyaltyRules'
  ];

  const existingCollections = (await mongoose.connection.db.listCollections().toArray()).map(c => c.name);
  console.log('Existing collections:', existingCollections);

  for (const name of collectionsToDrop) {
    if (existingCollections.includes(name)) {
      try {
        await mongoose.connection.db.dropCollection(name);
        console.log(`Dropped collection: ${name}`);
      } catch (err) {
        console.error(`Failed to drop collection: ${name}`, err);
      }
    } else {
      console.log(`Collection ${name} does not exist, skipping.`);
    }
  }

  await mongoose.disconnect();
  console.log('Done');
}

cleanup().catch(console.error);
