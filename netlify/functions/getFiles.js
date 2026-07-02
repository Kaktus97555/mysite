const { google } = require('googleapis');

exports.handler = async (event) => {
  try {
    // 1. Sprawdzamy czy zmienne środowiskowe w ogóle istnieją
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
        throw new Error("Brak zmiennej GOOGLE_CLIENT_EMAIL w ustawieniach Netlify.");
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error("Brak zmiennej GOOGLE_PRIVATE_KEY w ustawieniach Netlify.");
    }
    if (!process.env.DRIVE_FOLDER_ID && !(event.queryStringParameters && event.queryStringParameters.folderId)) {
        throw new Error("Brak zmiennej DRIVE_FOLDER_ID w ustawieniach Netlify.");
    }

    // 2. Formatujemy klucz
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    // 3. Autoryzacja
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    const drive = google.drive({ version: 'v3', auth });

    // 4. Pobieramy ID
    const folderId = (event.queryStringParameters && event.queryStringParameters.folderId) ? event.queryStringParameters.folderId : process.env.DRIVE_FOLDER_ID;

    // 5. Pobieramy pliki
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, webViewLink, thumbnailLink)', 
      orderBy: 'folder, name'
    });

    // Sukces! Zwracamy dane
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response.data.files),
    };

  } catch (error) {
    // KULOODPORNOŚĆ: Zawsze zwracaj odpowiedź w formacie JSON, nawet przy najgorszym błędzie
    return {
      statusCode: 200, // Wymuszamy 200, żeby frontend odebrał JSON z komunikatem
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
