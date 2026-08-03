# Connect the Ace TMUA waitlist to Google Sheets

The website sends email addresses to a small Google Apps Script web app. The
script writes only a date and validated email address to the existing Sheet. No
Google password, API key or private spreadsheet link is placed on the website.

## One-time setup

1. Sign into Google as `aceitstudios0@gmail.com`, the owner of the waitlist
   spreadsheet.
2. Open the spreadsheet named `waitlistEmails`.
3. Check that the response tab is named `Sheet1` and its first row contains
   `Date` in column A and `Email` in column B.
4. In the spreadsheet, select **Extensions → Apps Script**.
5. Delete the sample function in the editor.
6. Copy the complete contents of `waitlist-backend/Code.gs` into the editor.
7. Select **Save**, and name the project `Ace TMUA waitlist`.
8. Select **Deploy → New deployment**.
9. Next to **Select type**, choose **Web app**.
10. Set **Execute as** to **Me**.
11. Set **Who has access** to **Anyone**. Do not select an option that requires
    visitors to sign into Google.
12. Select **Deploy** and approve the requested access to the spreadsheet.
13. Copy the Web App URL ending in `/exec`.
14. Open `js/waitlist.js` and paste that URL into
    `GOOGLE_APPS_SCRIPT_URL`.

## Test it

1. Open the deployed website and submit an email address that is not already in
   the Sheet.
2. Confirm that a new row appears with the date and lower-case email address.
3. Submit the same address again and confirm that a duplicate row is not added.
4. Test an invalid address and confirm that the website rejects it.

## Updating the Apps Script later

Saving the code is not enough to update the live web app. In Apps Script, choose
**Deploy → Manage deployments**, edit the existing deployment, choose **New
version**, and deploy it. The `/exec` URL can stay the same.

## What the endpoint can do

The public endpoint can only run the code in `Code.gs`. It validates email
addresses, ignores the hidden anti-spam field, prevents duplicate emails and
appends valid addresses to the Sheet. It does not give visitors access to read
or edit the spreadsheet.
