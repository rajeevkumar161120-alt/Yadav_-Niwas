# Yadav Niwas Website

## इसमें क्या है
- Beautiful mobile-friendly home page
- Yadav Niwas welcome section
- About the home
- Environment section
- Photo gallery with the supplied photos
- Events / memories section
- Admin panel for adding photos and events
- Admin access protected by a PIN in the demo

## कैसे चलाएँ
1. इस ZIP को extract करें।
2. `index.html` खोलें।
3. Admin के लिए `admin.html` खोलें।
4. Demo PIN: `7667`
5. सुरक्षा के लिए `script.js` में `const PIN = "5347";` बदलें।

## जरूरी सुरक्षा नोट
यह version browser/localStorage आधारित है। इसका Admin PIN वास्तविक server-side security नहीं है और photo/event data उसी browser/device में save होता है।

अगर आप इसे public internet पर लगाकर चाहते हैं कि:
- सिर्फ आपके account से login हो,
- किसी दूसरे मोबाइल से भी photos/events manage हों,
- photos online permanently store हों,
- proper password/OTP authentication हो,

तो इसके लिए Firebase/Supabase जैसे backend के साथ दूसरा production version बनाना होगा। इस package में जानबूझकर कोई real password या private backend credential शामिल नहीं किया गया है।


## Privacy changes
- The owner's mobile number is NOT shown publicly on the website.
- The Google Maps screenshot used on the website has the visible phone number redacted.
- A Google Maps search link is provided instead.
- Do not put personal phone numbers, passwords, OTPs, or other private information into public website files.

## Free way to publish this version
GitHub Pages can host this static HTML/CSS/JavaScript site for free.
Basic flow:
1. Create/sign in to a GitHub account.
2. Create a new public repository, for example `yadav-niwas`.
3. Extract this ZIP and upload all files/folders from it (do not upload the ZIP itself).
4. In the repository open Settings → Pages.
5. Choose Deploy from a branch, select `main` and `/root`, then Save.
6. GitHub will provide the public Pages address.

Note: GitHub Pages is suitable for this static version. The owner-only online upload/edit dashboard needs a real authentication + database/storage backend; the current local admin page is not a secure production editor.
