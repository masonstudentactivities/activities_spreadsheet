/* 
  Database Entry Script
  Created by Luke Trenaman
  This sends data from the form with a variable amount of responses.
  The form approval string iterates through all of the database items
  They will be marked with a 1 on transfer success, marked with 0 on transfer failure
*/

//If you've decided to add more options to the form, just make sure the array below lines up with all of your form question types:

//Send form conditions to the database, return how many there is
function topRowTransfer(){
  let headers = []
    let inc = 1;
    while(sheet.getRange(JSON_ROW,inc).getValue() !== ""){
      let headerVal = sheet.getRange(JSON_ROW,inc).getValue();
      let cell = db.getRange(1,inc+1);
      cell.setValue(headerVal);
      cell.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
      inc++;
    }
    return inc - 1;
}
//Generate a preview link using the form data
function generateEditLink(name){
  return formURL + "/viewform?usp=pp_url&entry.271970040=" + encodeURIComponent(name);
}
function generateUrlArguments(obj){
  function encodeQueryData(data) {
    const ret = [];
    for (let d in data)
      if(d.includes("URL")){
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d].replace("open?","uc?")));
      } else{
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
      }
    return ret.join('&');
  }
  return SITE_NAME + "/preview/index.html?" + encodeQueryData(obj);
}
function generateFormArguments(name){
  return "This feature does not yet exist";
}
//Move a row of data from form responses into the spreadsheet
function newClubFormatting(modRowLoc,dbRowLoc,dbRow,dbRowBelow){
  let NUMBER_OF_DASHBOARD_ITEMS = 7;
  let rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Needs Revision","Under Review","Approved"],true)
    .setAllowInvalid(false)
    .setHelpText('Please select an item from the dropdown')
    .build();
  //moderation.getRange(modRowLoc,5).setValue(generateEditLink());
  moderation.getRange(modRowLoc,6).setDataValidation(rule).setValue("Under Review");
  let checkboxRule = SpreadsheetApp.newDataValidation()
  .requireCheckbox()
  .build();
  moderation.getRange(modRowLoc,7).setDataValidation(checkboxRule).setValue(false);
  moderation.getRange(modRowLoc,1,1,NUMBER_OF_DASHBOARD_ITEMS).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  //Add proposed and approved titles to the database
  let proposed = db.getRange(dbRowLoc,1);
  proposed.setBackground("#ffe599")
  proposed.setValue("Proposed");
  let approved = db.getRange(dbRowLoc + 1,1);
  approved.setBackground("#93c47d");
  approved.setValue("Approved");
  //Add colors to database
  dbRow.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  dbRow.setBackground("#fff2cc");
  dbRowBelow.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  dbRowBelow.setBackground("#b6d7a8");
}
function encodeDatabaseJSON(dbRow,dbRowBelow){
  let JSONProps = sheet.getRange(2,1,1,NUM_OUTPUTS).getValues();
  let dataProposed = dbRow.getValues();
  let dataApproved = dbRowBelow.getValues();
  //console.log(JSONProps);
  let formData = {};
  for(let i = 0;i<JSONProps[0].length;i++){
    formData[JSONProps[0][i]] = dataProposed[0][i];
  }
  //console.log(JSON.stringify(formData));
  let formDataPrevious = {};
  for(let i = 0;i<JSONProps[0].length;i++){
    formDataPrevious[JSONProps[0][i]] = dataApproved[0][i];
  }
  return {"formData":formData,"formDataPrevious":formDataPrevious};
}
function updateModerationContent(modRowLoc,dbRow,dbRowBelow){
  let JSONVals = encodeDatabaseJSON(dbRow,dbRowBelow);
  let formData = JSONVals.formData;
  let formDataPrevious = JSONVals.formDataPrevious;
  let name = dbRow.getValues()[0][2];
  let email = dbRow.getValues()[0][1];
  if(name !== ''){
    moderation.getRange(modRowLoc,1).setValue(name);
  }
  if(email !== ''){
    moderation.getRange(modRowLoc,2).setValue(email);
  }
  let proposedLink = formData["timestamp"] === '' ? "" : generateUrlArguments(formData);
  let approvedLink = formDataPrevious["timestamp"] === '' ? "" :  generateUrlArguments(formDataPrevious)
  moderation.getRange(modRowLoc,MOD_PROPOSED_COLUMN).setValue(proposedLink);
  moderation.getRange(modRowLoc,MOD_APPROVED_COLUMN).setValue(approvedLink);
  if(name !== ''){
    moderation.getRange(modRowLoc,5).setValue(generateEditLink(name));
  }
  moderation.getRange(modRowLoc,6).setValue(proposedLink === "" && approvedLink !== "" ? "Approved" : "Under Review");
}
function approveClub(row){
  //Translate the row position within the database to the row position within moderation
  let dbRowLoc = (row - 2) * 2;
  let dbRow = db.getRange(dbRowLoc,2,1,NUM_OUTPUTS);
  let dbRowBelow = db.getRange(dbRowLoc + 1, 2,1,NUM_OUTPUTS);
  //console.log(dbRow.getValues());
  let swap = dbRow.getValues();
  dbRowBelow.setValues(swap);
  dbRow.clearContent();
  updateModerationContent(row,dbRow,dbRowBelow);
}
function seekClub(name){
  let dbRowLoc = DB_ROW_START;
  let modRowLoc = MOD_ROW_START;
  let isNewClub = true;
  while(moderation.getRange(modRowLoc,1).getValue() !== ''){
    if(moderation.getRange(modRowLoc,1).getValue().toLowerCase() === name.toLowerCase()){
      //console.log("match club found!");
      isNewClub = false;
      //clubFound = true;
      break;
    }
    dbRowLoc += 2;
    modRowLoc += 1;
  }
  return {"dbRowLoc":dbRowLoc,"modRowLoc":modRowLoc,"isNewClub":isNewClub};
}
function databaseEntry(row,proposedData,approvedData){
  let name = sheet.getRange(row,NAME_COLUMN).getValue();
  //Seek the club
  let s = seekClub(name);
  let dbRowLoc = s.dbRowLoc;
  let modRowLoc = s.modRowLoc;
  let isNewClub = s.isNewClub;

  //Declare variables for those within the spreadsheet, and those currently being put into "proposed"
  let dbRow = db.getRange(dbRowLoc,2,1,NUM_OUTPUTS);
  let dbRowBelow = db.getRange(dbRowLoc + 1, 2,1,NUM_OUTPUTS);
  if(proposedData !== undefined && proposedData !== false){
    dbRow.setValues(proposedData);
  }
  if(approvedData !== undefined && approvedData !== false){
    dbRowBelow.setValues(approvedData);
  }
  updateModerationContent(modRowLoc,dbRow,dbRowBelow);

  //put form values into database
  //console.log(dbRow);
  if(isNewClub){
    newClubFormatting(modRowLoc,dbRowLoc,dbRow,dbRowBelow)
  }

  //console.log(name);
  //Enter data into "proposed"

  //Enter selected values into leftmost columns
  return true;
  //Return whether the dataBaseEntry is successful or not
}

//Iterate through all form responses and send them into the database
function sendToDatabase(e) {
  let row = e.range.rowStart;
  /*function setCharAt(str,index,chr) {
      if(index > str.length-1) return str;
      return str.substring(0,index) + chr + str.substring(index+1);
  }
    let appStrObj = sheet.getRange(3,2);*/
    //Read all top row values from form response tab
    topRowTransfer(); //This is the number of form outputs
    //let appStr = appStrObj.getValue().toString();
    //let i = FORM_ROW_START;
    //while (sheet.getRange(i,1).getValue() !== '') {
        //Check if this club is approved
        //if(appStr[i-FORM_ROW_START] === "1"){
        //} else{
          //If this is the most recent submission, add new data to the approval string
          //if(appStr.length === i-FORM_ROW_START){
          //  appStr += "0";
          //}
          //console.log(appStr);  
          let inputValues = sheet.getRange(row,1,1,NUM_OUTPUTS).getValues();
          //if(
            databaseEntry(row,inputValues,false)
          //){
        //    appStr = setCharAt(appStr,i-FORM_ROW_START,"1");
        //  }
        //}
        //i++
    //}
    //appStrObj.setValue(appStr);
    console.log("Database transfer success");
}
