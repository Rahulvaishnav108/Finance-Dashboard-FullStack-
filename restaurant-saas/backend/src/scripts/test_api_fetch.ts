// backend/src/scripts/test_api_fetch.ts
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';
const apiUrl = 'http://localhost:5000/api/v1';

async function run() {
  const payload = {
    _id: '6a104058418f82b4a570103b',
    email: 'admin@ambertable.com',
    role: 'restaurant-admin',
    restaurantId: '6a104055418f82b4a570101f',
    panel: 'admin'
  };

  const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
  console.log('Generated Admin Token:', token);

  try {
    const res = await axios.get(`${apiUrl}/admin/tables`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Response Success:', res.status);
    console.log('Tables count:', res.data?.data?.tables?.length);
    console.log('Tables:', JSON.stringify(res.data?.data?.tables, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error('Response Failed:', error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Request Failed:', error.message);
    }
  }
}

run();
