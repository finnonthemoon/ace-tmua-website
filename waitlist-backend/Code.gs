const WAITLIST_SHEET_NAME = "Sheet1";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doGet() {
  return jsonResponse({
    ok: true,
    service: "Ace TMUA waitlist",
  });
}

function doPost(event) {
  const email = String(event?.parameter?.email || "")
    .trim()
    .toLowerCase();
  const honeypot = String(event?.parameter?.website || "").trim();

  // Silently accept bot submissions without writing them to the sheet.
  if (honeypot) {
    return jsonResponse({ ok: true });
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return jsonResponse({ ok: false, error: "invalid_email" });
  }

  const lock = LockService.getScriptLock();
  let lockAcquired = false;

  try {
    lock.waitLock(10000);
    lockAcquired = true;

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(WAITLIST_SHEET_NAME);

    if (!sheet) {
      throw new Error(`Sheet "${WAITLIST_SHEET_NAME}" was not found.`);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Date", "Email"]);
      sheet.setFrozenRows(1);
    }

    const lastRow = sheet.getLastRow();
    const existingEmails =
      lastRow < 2
        ? []
        : sheet
            .getRange(2, 2, lastRow - 1, 1)
            .getDisplayValues()
            .flat()
            .map((value) => value.trim().toLowerCase());

    if (existingEmails.includes(email)) {
      return jsonResponse({ ok: true, duplicate: true });
    }

    sheet.appendRow([new Date(), email]);
    return jsonResponse({ ok: true, duplicate: false });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: "server_error" });
  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
