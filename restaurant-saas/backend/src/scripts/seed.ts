import { connectToDatabase, disconnectFromDatabase } from '../config/db';
import { seedDevelopmentData } from '../config/seed';

async function run(): Promise<void> {
  await connectToDatabase();
  await seedDevelopmentData();
  await disconnectFromDatabase();
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Failed to seed development data', error);
    await disconnectFromDatabase();
    process.exit(1);
  });
