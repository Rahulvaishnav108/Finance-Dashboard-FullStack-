# Postman Assets

Import these files into the VS Code Postman extension:

- `collections/restaurant-automation-api.postman_collection.json`
- `environments/restaurant-automation-local.postman_environment.json`

Recommended local flow:

1. Start MongoDB locally on `mongodb://localhost:27017`
2. Seed local backend data with `npm run seed --workspace backend`
3. Start the backend with `npm run dev --workspace backend`
4. Select the `Restaurant Automation Local` environment
5. Run the login requests first to populate bearer token variables
6. Run the admin table requests to populate `createdTableId` and `createdQrToken`
7. Run the public table-session create request to populate `createdSessionToken`
8. The collection now forwards `createdSessionToken` automatically as the `x-session-token` header for customer session routes

Seeded credentials in the environment:

- Admin: `admin@ambertable.com` / `Admin@123`
- Customer: `guest@ambertable.com` / `Guest@123`
- Staff: `staff@ambertable.com` / `Staff@123`
- Kitchen: `kitchen@ambertable.com` / `Kitchen@123`
- Cleaning: `cleaning@ambertable.com` / `Cleaning@123`
- Super Admin: `superadmin@graphura.com` / `Super@123`

Notes:

- The backend now fails fast when MongoDB is unavailable unless `ALLOW_NO_DB=true` is explicitly set.
- Local seed data is also applied automatically on backend startup when `SEED_ON_STARTUP=true`.
- The collection now adds a cart item before attempting customer order creation, so the default run covers the happy-path order flow.
- You can run automated verification with `npm run verify:phase1 --workspace backend` without a locally installed MongoDB; it uses an in-memory Mongo instance for the verification run.
