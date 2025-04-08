function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById('1eDCtymwOHL344zKvPJ_zFSVOWD7iHB97_aDR6jCsiUg')
                    .getSheetByName('Data'); // Ganti dengan nama sheet Anda
    
    const newRow = [
      new Date(),
      data.weight,
      data.pricePerKg,
      data.bubutQuantity,
      data.total,
      data.paid,
      data.change
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Data berhasil disimpan"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}