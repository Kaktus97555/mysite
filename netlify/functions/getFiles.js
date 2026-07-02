const { google } = require('googleapis');

exports.handler = async (event) => {
  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL) throw new Error("Brak zmiennej GOOGLE_CLIENT_EMAIL.");
    if (!process.env.GOOGLE_PRIVATE_KEY) throw new Error("Brak zmiennej GOOGLE_PRIVATE_KEY.");
    
    let folderId = (event.queryStringParameters && event.queryStringParameters.folderId) ? event.queryStringParameters.folderId : process.env.DRIVE_FOLDER_ID;

    if (!folderId || folderId.trim() === "") {
        throw new Error("ID folderu jest puste! Sprawdź zmienną DRIVE_FOLDER_ID w Netlify.");
    }

    if (folderId.includes('?')) folderId = folderId.split('?')[0];
    folderId = folderId.trim();

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    const drive = google.drive({ version: 'v3', auth });

    try {
        const response = await drive.files.list({
          q: `'${folderId}' in parents and trashed=false`,
          // DODANO TUTAJ 'description' ABY SERWER POBIERAŁ OPIS FOLDERU:
          fields: 'files(id, name, mimeType, webViewLink, thumbnailLink, description)', 
          orderBy: 'folder, name',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });

        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response.data.files),
        };
        
    } catch (apiError) {
        throw new Error(`Google nie widzi folderu. Szukane ID to: [${folderId}].`);
    }

  } catch (error) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
