1. Inventory the entities you already have
The design already defines your domain model — no guessing needed:

Entity	Source file	Key fields
Tour	lib/data/tours.ts	slug, title, region, type, days/nights, price, rating, gallery[], itinerary[], inclusions[], guide
Car	lib/data/cars.ts	slug, name, type, seats, fuel, pricePerDay, tags[]
Departure	lib/data/departures.ts	date, tourSlug (FK), spotsLeft, status
JournalArticle	lib/data/journal.ts	slug, title, category, author, body[], tags[]
Booking (write)	/api/bookings payload	tourSlug (FK), date, travellers, traveller info, addons[], total
Rental (write)	/api/rentals payload	carSlug (FK), mode, dates, contact info
AirportTransfer (write)	/api/airport-transfers payload	tier, flight info, contact info
ContactMessage (write)	/api/contact payload	name, email, subject, message
2. Pick the stack
Postgres — relational, handles the FK relationships (departure→tour, booking→tour, rental→car) cleanly, and Vercel/Neon/Supabase all give you a free tier that pairs naturally with Next.js hosting.
ORM: Prisma or Drizzle — either works; Prisma has more tooling/migrations UX, Drizzle is closer to raw SQL with better type inference. Given this project has no DB yet, Prisma's migrate dev workflow is the gentler on-ramp.
3. Design the schema
Normalize the "read" entities (Tour, Car, Article), but decide per-field whether nested arrays deserve their own table or a JSON column:

Own table (queried/filtered independently, admin needs to edit rows individually): tour_itinerary_days, tour_inclusions, departures, article_body_sections
JSON column (always read/written as a whole, never queried individually): highlights: string[], good_to_know: string[], tags: string[], gallery: string[]
Core tables:


tours (id, slug UNIQUE, title, region, type, days, nights, price_cents, rating, max_travellers, image, gallery jsonb, badge, summary, description, highlights jsonb, good_to_know jsonb, guide_name, guide_note, created_at, updated_at, published boolean)
tour_itinerary_days (id, tour_id FK, day_number, title, description)
tour_inclusions (id, tour_id FK, title, description)
cars (id, slug UNIQUE, name, type, seats, fuel, price_per_day_cents, image, tags jsonb)
departures (id, tour_id FK, date, spots_left, status)
articles (id, slug UNIQUE, title, category, read_time, image, featured boolean, excerpt, author_name, author_role, published_date, quote, tags jsonb)
article_body_sections (id, article_id FK, position, heading, text)
bookings (id, tour_id FK, date, travellers, name, email, country, phone, addons jsonb, notes, total_cents, status, confirmation_id, created_at)
rentals (id, car_id FK, mode, pickup_date, return_date, name, email, phone, status, confirmation_id, created_at)
airport_transfers (id, tier, flight_number, arrival_at, passengers, name, email, status, confirmation_id, created_at)
contact_messages (id, name, email, subject, message, status, created_at)
Store money as integer cents, not float, to avoid rounding bugs at checkout.

4. Add the constraints that matter
UNIQUE on every slug (tours, cars, articles) — your routing depends on it.
FOREIGN KEY with ON DELETE RESTRICT on departures.tour_id, bookings.tour_id, rentals.car_id — don't let a tour disappear out from under an existing booking.
CHECK constraint on departures.status and enum-like fields (region, type, category) — or use Postgres ENUM types so bad data can't even be inserted.
NOT NULL on everything the frontend currently assumes is always present (it will crash on undefined otherwise — this is exactly the class of bug the placeholder layer currently can't produce, because the mock arrays are hand-authored).
5. Design the write-side validation layer
Every POST payload should get a zod (or valibot) schema colocated with its route handler, so the shape is enforced once and can be shared with the client form component:


src/lib/validation/booking.ts → bookingSchema
src/lib/validation/rental.ts → rentalSchema
Each route handler becomes bookingSchema.parse(await request.json()) — replaces the current hand-rolled if (!body.name...) checks with real type coercion and error messages.

6. Migrate the data layer without touching the pages
This is the part that makes the earlier placeholder-API decision pay off: getTours(), getTourBySlug(), getCars(), getDepartureWithTour(), getArticles() etc. keep their exact function signatures, but their bodies change from array.filter(...) to prisma.tour.findMany({ where: ... }). Since every page/route handler imports from lib/data/*, not from the mock arrays directly, no page or component needs to change — only the five lib/data/*.ts files get rewritten against Prisma.

7. Decide what needs auth
Public, no auth: all GET endpoints (tours, cars, departures, journal) and all four POST submission endpoints (booking, rental, transfer, contact) — but add rate limiting to the POSTs to prevent spam.
Admin-only (new surface you don't have yet): CRUD on tours/cars/articles, and a view over incoming bookings/rentals/transfers/messages. This needs its own auth (NextAuth/Clerk + a role check) and probably its own route group, e.g. /admin/*.
8. Supporting infrastructure
Images: move off public/images static files to S3/Cloudinary/Vercel Blob once tours are admin-editable — you can't redeploy the app every time someone adds a tour photo.
Notifications: bookings/rentals/transfers/contact should trigger an email (Resend/Postmark) to both the customer (confirmation) and the ops team (new lead) — currently they just return a confirmation ID with nowhere for a human to see it.
Migrations: prisma migrate dev locally, prisma migrate deploy in CI/CD, seed script (prisma/seed.ts) that loads the exact mock data you already have in lib/data/*.ts as the initial dataset — free seed data, no rewriting.
Want me to scaffold the actual Prisma schema file and rewrite lib/data/tours.ts against it as a first concrete step, or do you want to line up a hosted Postgres instance first?