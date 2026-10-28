# CHAMPIONS Website — Beginner Setup Guide

This is a ready-to-upload static website starter. It includes:
- Responsive dark/purple design
- Class voting and vote results
- Community wall for memories, poetry and shout-outs
- Optional HTTPS image links
- Class chat with live refresh through Supabase Realtime
- Supabase database schema and basic Row Level Security (RLS)

## Important before you publish
The website starts in **demo mode**. Demo data is stored only in the current browser, not shared with other people. To share data online, configure Supabase using the steps below.

The supplied SQL allows any visitor to read and submit votes, posts and chat messages. This is a simple public community starter, not a private student-management system. Do not store sensitive information, phone numbers, addresses, passwords or private student records. Public users can submit inappropriate content; monitor and moderate posts. If you need a private class, set up Supabase Auth and restrict database policies to approved users before sharing the link.

## Part A — Make the website run on your PC
1. Extract `champions_website.zip` to a folder, e.g. `Desktop/Champions`.
2. Open `index.html` in Chrome. It should display the site.
3. To edit code, install Visual Studio Code: https://code.visualstudio.com/
4. In VS Code choose **File → Open Folder** and select the extracted folder.
5. Edit `index.html`, `style.css` or `script.js`; press `Ctrl+S`, then refresh Chrome.

## Part B — Create the online database
1. Visit https://supabase.com/ and sign in / create an account.
2. Create a new project. Save your database password privately.
3. In the project dashboard, open **SQL Editor** → **New query**.
4. Open this project's `schema.sql`, copy all its contents, paste into SQL Editor and click **Run**.
5. Open **Project Settings → API** (dashboard wording may change).
6. Copy the **Project URL** and the **anon / publishable key**. Never copy a `service_role` or secret key into browser code.
7. Open `script.js` and find the first lines:
   ```js
   const SUPABASE_URL = "";
   const SUPABASE_ANON_KEY = "";
   ```
8. Paste your Project URL and anon/publishable key between the quotation marks. Save the file.
9. Reload `index.html`. Open **Setup status** in the top bar. If the database is configured, the page will try to load shared data.
10. If tables fail to load, check the SQL ran successfully, the URL/key are correct, and the browser Console (F12) for errors.

## Part C — Publish free with GitHub Pages
1. Sign in at https://github.com/
2. Click **+** → **New repository**.
3. Name it `champions-class-community`. Set it to **Public** for the simplest GitHub Pages setup. Do not upload passwords or secret keys.
4. Create the repository.
5. Click **Add file → Upload files**.
6. Upload `index.html`, `style.css`, `script.js`, `schema.sql`, and `README.md` (or upload the extracted contents; make sure `index.html` is at repository root, not inside a second nested folder).
7. Click **Commit changes**.
8. Go to repository **Settings → Pages**.
9. Under **Build and deployment**, choose **Deploy from a branch**.
10. Choose branch `main` and folder `/(root)`, then click **Save**.
11. Wait a minute or two and refresh the Pages settings page. GitHub shows the public website URL, usually `https://YOUR-USERNAME.github.io/champions-class-community/`.
12. Open that URL on your phone and another device to test it. Send the URL to your friends.

## Part D — Test shared data
Use two separate browsers/devices:
1. Submit a vote on device A and reload/check results on device B.
2. Create a wall post on device A and press Refresh on device B.
3. Send a chat message on device A and check device B.
4. If any action errors, open browser developer tools with F12 → Console and check Supabase logs.

## Files
- `index.html` — page structure
- `style.css` — layout, colors and mobile design
- `script.js` — UI behavior and Supabase connection
- `schema.sql` — tables, constraints and starter access policies

## Known limitations / next improvements
- No real account login or admin dashboard is included in this starter.
- Posts have no edit/delete controls or moderation queue.
- Image URL field accepts HTTPS links; it does not upload files to storage.
- Anonymous public inserts can be spammed. For a real public deployment, add Supabase Auth, rate limiting / anti-spam and moderation.
- Voting is not limited to one vote per person. For trustworthy voting, require login and enforce one vote per authenticated user.
- A static GitHub Pages site cannot keep private server secrets. Never put a Supabase service-role key in client code.
