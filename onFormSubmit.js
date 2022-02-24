function setToMiddleSchool(){
  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Middle School Form Responses");
  moderation = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("2️⃣ Middle School Moderation");
  DIRECTORY = "mms";
  NEW_CLUB_FORM_ID = NEW_CLUB_FORM_ID_MMS;
}
function onFormSubmit(event) {
  let targetSheet = event.range.getSheet();
  //By default, config.js defines these values:
  /*
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("High School Form Responses");
    var moderation = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("High School Moderation");
    var directory = "mhs";
  */
 //By temporarily changing this variables globally, the sheet can handle middle school / high school site
 if(targetSheet.getName() === "High School Form Responses"){
   //These values are declared above; do nothing
 };
 if(targetSheet.getName() === "Middle School Form Responses"){
   //Alter the constants
  setToMiddleSchool();
 }

  imageCompress(event)
  sendToDatabase(event)
  //updateEditForm(event)
}
