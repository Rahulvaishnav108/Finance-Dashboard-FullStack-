// backend/src/scripts/seed_more_tables.ts
import mongoose from 'mongoose';
import * as tablesService from '../modules/tables/tables.service';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/RestaurantAutomation';

const tablesToSeed = [
  { tableNumber: 'T-02', capacity: 4, floor: 1, section: 'Indoor' },
  { tableNumber: 'T-03', capacity: 2, floor: 1, section: 'Bar' },
  { tableNumber: 'T-04', capacity: 8, floor: 2, section: 'Private' },
  { tableNumber: 'T-05', capacity: 4, floor: 2, section: 'Indoor' },
];

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const restaurantId = '6a104055418f82b4a570101f';

  for (const t of tablesToSeed) {
    try {
      console.log(`Creating table ${t.tableNumber}...`);
      const table = await tablesService.createTable({
        restaurantId,
        tableNumber: t.tableNumber,
        capacity: t.capacity,
        floor: t.floor,
        section: t.section,
      });
      console.log(`Table ${t.tableNumber} created:`, table._id);
    } catch (err: any) {
      console.error(`Failed to create table ${t.tableNumber}:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Done!');
}

run();
