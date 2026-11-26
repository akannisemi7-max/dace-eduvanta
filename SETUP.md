# EduVanta + Supabase: setup (v2, reviewed)

Do the steps IN ORDER. Nothing here deletes existing data. Allow about 20 minutes.

## 1. Create the database
Supabase > **SQL Editor** > **New query** > paste ALL of `01_schema.sql` > **Run**.
Expected: "Success. No rows returned". The script runs as one transaction, so if anything fails
nothing is changed. Send me the exact error text and I will fix it.

### 1b. Choose your secret setup code (ONE line, run it as a new query)
```sql
select public.set_setup_code('type-a-long-private-phrase-here');
```
Use at least 12 characters. Write it down somewhere safe. You will type it once, when you create the
owner account. Nobody can become owner without it, and it stops working after the owner exists.

## 2. Authentication settings
**Authentication > Sign In / Providers > Email**
- Email provider: **on**
- **Confirm email: OFF**
- Minimum password length: leave at 6 (student PINs are 6 digits)
- Do NOT switch on "leaked password protection" (it would reject simple PINs)
Also keep "Allow new users to sign up" ON.

## 3. Test the student email domain (1 minute)
Student sign-in uses a made-up address like `dauss.26.001@students.eduvanta.app`.
**Authentication > Users > Add user > Create new user**: email `test.student@students.eduvanta.app`,
password `123456`, tick **Auto Confirm User**. If it is created, the domain works: delete that test user.
If Supabase refuses it, tell me and I will change the domain.

## 4. Deploy the admin function
**Edge Functions > Deploy a new function > Via Editor**
- Name: `admin-users` (exactly)
- Paste all of `functions/admin-users/index.ts`
- Turn **Verify JWT OFF** (the function checks every caller itself)
- Deploy
Optional but recommended: **Edge Functions > Secrets**, add `ALLOWED_ORIGIN` = your Netlify address
(for example `https://iridescent-capybara-e93142.netlify.app`).

## 5. Put the app on Netlify
Netlify > your site > **Deploys** > drag the **netlify-deploy** folder in. No environment variables are needed.

## 6. Create the owner account FIRST
Open the site, enter your setup code, name, email and password. Do this before sharing the link.
Then: Staff and roles > approve staff > choose the administrator.

## 7. Quick test (15 minutes, three phones)
1. Owner signs up. The top bar shows "Saved".
2. A teacher signs up on a second phone. Owner approves. Teacher signs in.
3. Owner: Staff and roles > Manage > give the teacher a subject and class.
4. Teacher: Students > add 3 students. Keep the PIN slip.
5. Teacher: Assessments and CBT > build a 3-question CBT > set "After submitting" to the option you want > Publish.
6. Student (third phone): sign in with admission number and PIN. Sit the exam. Check the score appears.
7. Teacher: Results > Pull scores > Submit. Owner: Results > Publish. Student: My results.
8. Teacher: Attendance > Clock in. Sign in on another phone as the teacher and check it is there.

## What is still limited (be aware)
- Attendance times come from each phone's clock; the administrator can correct them (logged).
- An exam's closing time is not enforced by the server. The time limit is: submissions after the limit
  are flagged "late" for the teacher.
- Items deleted on one device disappear on another after a refresh or sign-in, not instantly.
- One school only (D-Ace). A second school needs changes.
- Marking is server-side and the answer key is private, but a teacher can type any score by hand (that is a feature).
- The SQL and the Edge Function have been reviewed carefully but NOT executed against real Supabase by me.
