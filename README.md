# D-Ace EduVanta

School management app for D-Ace Ultimate Secondary School: staff attendance, timetables, lesson notes,
CBT exams and assignments, results and report cards. Roles: owner, administrator, teacher, student.
Data is stored in Supabase; the app is a single static page hosted on Netlify.

## Folders
- `netlify-deploy/` the finished app (`index.html`) that Netlify serves
- `src/` the readable source parts. `sh src/build.sh` rebuilds `netlify-deploy/index.html`
- `supabase/01_schema.sql` database tables, security rules and starting data
- `supabase/functions/admin-users/index.ts` server function for creating accounts and resetting passwords
- `supabase/SETUP.md` step-by-step setup, in order

## Secrets: what is and is not in this repository
- The Supabase project URL and **publishable** key are inside `src/02_core.js`. They are public by design
  (every visitor's browser receives them). The database security rules protect the data.
- **Never commit** a Supabase `service_role` or `secret` key, a database password, or a setup code.
  The admin function reads the service key from Supabase's own environment, not from this code.
- The app has no build step, so it does not use environment variables. To change the project URL or key,
  edit the first lines of `src/02_core.js` and run `sh src/build.sh`.

## Deploy
Netlify > Add new site > Import from GitHub > pick this repo. `netlify.toml` already points at `netlify-deploy`.
No environment variables are required.
