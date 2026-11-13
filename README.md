# Descanso Comida • Cafe — Event Packages & Gallery Website

A separate, responsive website for presenting the cafe's event packages, buffet menu, and previous events. It is not connected to PesoPlan/EUnify.

## Included
- Home, event packages, buffet menu categories, event gallery, and venue information.
- 51 themes: a new black-and-white default theme (theme 00) plus the original 50 coordinated themes. Themes 1–50 use `logos/1.png` through `logos/50.png`; theme 00 uses `logos/0.png`. The selected theme is stored on the current device.
- Offline app shell using a service worker; open the website once while online before expecting offline access.
- Local content cache and pending-change marker; the admin editor saves locally first and syncs after connection returns.
- Supabase Auth admin sign-in and a single cloud content record.
- 48 JPG gallery slots using the cafe's original photo filenames: `event-gallery/6.jpg` through `event-gallery/53.jpg`. No sample/stock photos are included.

## Supabase setup
The site is configured to use the new, separate Descanso Supabase project URL and publishable key supplied by the owner in `config.js`. A publishable key is designed for browser apps; keep RLS enabled and never put a secret/service-role key in this file.

1. In the new Supabase project, open **Authentication → Users** and create the cafe administrator account. Disable public sign-ups in Auth settings if the website only needs one administrator.
2. Copy the admin user's UUID.
3. Open `supabase/setup.sql`, replace `ADMIN_USER_UUID` with that UUID (keep the single quotes), and run the SQL in Supabase SQL Editor.
4. Deploy the entire folder to a static host (GitHub Pages, Netlify, etc.) using HTTPS.
5. Visit the deployed website while online. Use **Admin** to sign in. Save the initial content once to publish the default packages/menu to the cloud.
6. Test offline by loading the site once online, then disconnecting. Changes made in the admin editor are stored locally; after reconnecting, keep the site open briefly for synchronization.

### Security model
- Visitors can read the public website content.
- Only the exact Supabase Auth user UUID set as `owner_id` can update the cloud record.
- The browser contains only the project's publishable key. Do not add a Supabase secret/service-role key.
- The SQL inserts one content row. The website does not create arbitrary cloud rows.

## Editing website content
Open Admin → sign in → edit the fields → Save website changes. You can edit cafe wording, package inclusions/prices, menu categories, individual food names, and upload or replace a photo for each food item. Food photos are resized and compressed in the browser, saved with the website content, and reused automatically in both the buffet list and its adjacent carousel. No HTML or JavaScript editing is needed for routine menu updates.

## Photo placeholders
`event-gallery/` public gallery uses only the cafe's JPG photos, `6.jpg`–`53.jpg`. The MOV files (`1.MOV`–`5.MOV`) and HEIC files (`54.HEIC`–`78.HEIC`) are intentionally not linked or cached by the website. The gallery has no event-number captions because all photos belong to one event. Replace the empty JPG placeholders with the cafe's actual photos using the exact same filenames.

## Notes / limitations
- Food images are compressed to JPEG before being saved inside the site content. A large number of high-resolution food images can increase local storage use and the size of the shared Supabase content record; use reasonably sized source photos and test cloud sync after adding several images.
- Offline access requires a secure HTTPS host (or localhost) and one successful online visit to install/cache the app shell.
- The Supabase JavaScript client and Google Fonts are loaded from their CDNs. The main website layout and saved local content remain available offline after first use, but cloud sign-in/sync and external fonts require internet.
- This starter sync uses one shared content record. Avoid editing the same content simultaneously on multiple devices; the latest successful save wins.
- This project has not been connected to or tested against your live Supabase project from this environment. Run the SQL and test sign-in, public read, admin update, and offline sync before publishing.


## Theme and logo assets
The 50 theme definitions are stored in `themes.js`. The numbered logo images are in `logos/`. Each theme selects the matching numbered header logo. Replace these logo files with Descanso-approved matching artwork if the current numbered assets are not the cafe brand artwork.
