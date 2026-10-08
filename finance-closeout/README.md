# Daily Closeout

This React app is integrated into FinanceOS at `/closeout/` and appears in the FinanceOS sidebar for analysts and admins. Its production assets are built into `frontend/closeout`; the root project build and startup scripts build those assets automatically.

From the repository root, install dependencies and run the integrated apps:

```powershell
npm install --prefix finance-closeout
npm run dev
```

Run `npm test --prefix finance-closeout` for the closeout unit tests or `npm run build:closeout` to build only this app.

The closeout workflow imports sales and settlement CSVs for one business date, reviews duplicate, unmatched, and amount-mismatch exceptions, requires a note for each exception, confirms the closeout, and exports a report. The **Shift notes** workspace supports creating, editing, searching, and deleting handoff notes.

CSV headers:

- Sales: `order_id,sale_time,payment_method,amount`
- Settlements: `order_id,settled_at,payment_method,amount`

Files are limited to 5 MB and 10,000 rows. CSV processing happens in the browser. Shift notes are stored in browser local storage, separated by FinanceOS account when embedded, and are not synced to the server or other devices.

Source project: [Rahulvaishnav108/Automation-closeout](https://github.com/Rahulvaishnav108/Automation-closeout).
