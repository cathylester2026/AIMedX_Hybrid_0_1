# AIMedX Hybrid 0.1

A vertical slice combining the xPlayer facilitated-room model with the Single Player hospital context and resource framing.

## Flow
Landing -> Facilitated session -> QR/code -> Initials -> Persona -> Table -> Hospital reveal -> Mission/inherited reality -> Tension -> Resources -> 60-second discussion -> Stop.

## Local setup
1. Copy `.env.example` to `.env` and add the Supabase project URL and anon key.
2. In Supabase SQL Editor, run `supabase/schema.sql` once.
3. Run `npm install`.
4. Run `npm run dev`.

Without environment variables the app runs in local demo mode. Local demo mode is useful for visual review on one browser, but multi-device QR participation requires Supabase.

## GitHub Pages
1. Create a new repository, for example `AIMedX_Hybrid_0_1`.
2. Add repository secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if using GitHub Actions, or provide them during your build.
3. Build with `npm run build` and publish the `dist` folder.
4. `vite.config.js` uses a relative production base so it works under a repository subpath.

## Acceptance check
- Join from at least 6 phones across 3 tables.
- Confirm the facilitator participant count updates without refresh.
- Advance each room phase and confirm phones follow within 1.5 seconds.
- Confirm each table receives the configured hospital, mission, tension, and resources.
