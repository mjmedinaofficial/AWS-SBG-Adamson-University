/**
 * AWS SBG AdU — Membership Form Backend
 * 
 * This Google Apps Script receives POST requests from the join form,
 * saves receipt images to Google Drive, and logs all data to a Google Sheet.
 * 
 * SETUP:
 * 1. Replace SHEET_ID with your Google Sheet's ID (from the URL)
 * 2. Replace FOLDER_ID with your Google Drive folder's ID (from the URL)
 * 3. Deploy as a Web App (Execute as: Me, Access: Anyone)
 */

// ⚠️ REPLACE THESE WITH YOUR OWN IDS
const SHEET_ID  = 'YOUR_GOOGLE_SHEET_ID_HERE';
const FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE';

/**
 * Handles POST requests from the join form.
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Save receipt image to Google Drive
    let driveLink = '';
    if (data.fileData && data.fileName) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(data.fileData),
        data.fileType || 'image/png',
        'receipt_' + data.lastName + '_' + Date.now() + '_' + data.fileName
      );
      
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveLink = file.getUrl();
    }
    
    // Append row to Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    sheet.appendRow([
      new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }), // Timestamp
      data.firstName     || '',
      data.middleName    || '',
      data.lastName       || '',
      data.studentNumber  || '',
      data.email          || '',
      data.course         || '',
      data.year           || '',
      driveLink                                                           // Receipt link
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles GET requests (for testing if the script is deployed correctly).
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      message: 'AWS SBG AdU Membership Form backend is running.' 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
