# MongoDB seed data

Exported from the mock arrays in `src/lib/data/*.ts` (tours, cars, journal, departures) plus
sample transactional documents for `airport-transfers` and `rentals`, whose collections don't
exist as catalog data in the code — only their booking-form payload shape does
(`src/app/api/airport-transfers/route.ts`, `src/app/api/rentals/route.ts`).

Each file is a JSON array, one document per array element. Mongo will assign `_id` automatically
on import.

## Import

```bash
mongoimport --uri "<your-connection-string>" --collection tours              --jsonArray --file tours.json
mongoimport --uri "<your-connection-string>" --collection cars               --jsonArray --file cars.json
mongoimport --uri "<your-connection-string>" --collection journal            --jsonArray --file journal.json
mongoimport --uri "<your-connection-string>" --collection departures        --jsonArray --file departures.json
mongoimport --uri "<your-connection-string>" --collection airportTransfers  --jsonArray --file airport-transfers.json
mongoimport --uri "<your-connection-string>" --collection rentals           --jsonArray --file rentals.json
```

## Notes

- `departures.tourSlug` and `rentals.carSlug` are foreign-key-style references to `tours.slug`
  and `cars.slug` respectively — no ObjectId refs, matching how the app already joins them in
  `src/lib/data/departures.ts`.
- `airport-transfers.tier` values (`standard` / `meet-greet` / `vip`) come from the hardcoded
  `TIERS` array in `src/components/forms/AirportTransferForm.tsx` — there's no separate tiers
  collection since that data isn't stored anywhere today.
- `status`/`createdAt` on `airport-transfers` and `rentals` are illustrative — the real API
  routes only return a `confirmationId` today and don't persist anything.
