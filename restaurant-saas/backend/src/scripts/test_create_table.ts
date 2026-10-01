// backend/src/scripts/test_create_table.ts
import mongoose from 'mongoose';
import * as tablesService from '../modules/tables/tables.service';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/RestaurantAutomation';

async function run() {
  console.log('Connecting to MongoDB at:', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  try {
    const restaurantId = '6a104055418f82b4a570101f';
    const tableNumber = 'T-01';

    console.log('Creating table via tablesService...');
    const table = await tablesService.createTable({
      restaurantId,
      tableNumber,
      capacity: 6,
      floor: 1,
      section: 'Private',
    });
    console.log('Table created successfully:', table);
  } catch (error) {
    console.error('Failed to create table:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
