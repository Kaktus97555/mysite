const { google } = require('googleapis');

exports.handler = async (event) => {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Bezpieczne pobieranie ID folderu - z kliknięcia na stronie LUB głównego z Netlify
    const folderId = (event.queryStringParameters && event.queryStringParameters.folderId) ? event.queryStringParameters.folderId : process.env.DRIVE_FOLDER_ID;

    if (!folderId) {
        throw new Error("Brak ID folderu. Sprawdź zmienną DRIVE_FOLDER_ID w Netlify.");
    }

    // Pobieramy pliki ORAZ foldery
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, webViewLink, thumbnailLink)', 
      orderBy: 'folder, name'
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data.files),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};const { google } = require('googleapis');

exports.handler = async (event) => {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Pobieramy ID folderu z zapytania strony. Jeśli go nie ma, używamy głównego z ustawień Netlify.
    const folderId = event.queryStringParameters.folderId || process.env.DRIVE_FOLDER_ID;

    // Pobieramy pliki ORAZ foldery
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      // Pobieramy format pliku (mimeType), miniaturkę i linki
      fields: 'files(id, name, mimeType, webViewLink, thumbnailLink)', 
      orderBy: 'folder, name' // Najpierw foldery, potem pliki, alfabetycznie
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data.files),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
