// netlify/functions/getFiles.js
const { google } = require('googleapis');

exports.handler = async (event, context) => {
  try {
    // Autoryzacja za pomocą zmiennych z Netlify
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      // Obsługa ewentualnych problemów z formatowaniem klucza w Netlify
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Pobranie listy plików z Twojego folderu
    const response = await drive.files.list({
      q: `'${process.env.DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name, webViewLink, iconLink)', // To chcemy wyciągnąć
      orderBy: 'createdTime desc' // Sortowanie od najnowszych
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