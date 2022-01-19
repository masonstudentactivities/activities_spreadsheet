/* 
  Database Entry Script
  Created by Luke Trenaman
  This sends data from the form with a variable amount of responses.
  The form approval string iterates through all of the database items
  They will be marked with a 1 on transfer success, marked with 0 on transfer failure
*/

//Generate a preview link using the form data
function manualGenerateEditLink(){
  console.log(generateEditLink('mckayd@masonohioschools.com'));
}
function generateEditLink(email){
  var form = FormApp.openById(NEW_CLUB_FORM_ID);
  var formResponses = form.getResponses();
  for (var i = formResponses.length - 1; i >= 0; i--) {
    var formResponse = formResponses[i];
    if(formResponse.getRespondentEmail() === email){
      return formResponse.toPrefilledUrl();
    }
  }
  return "Error while generating prefilled URL in sendToDatabase.gs";
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
  return SITE_NAME + "/"+directory+"/preview/?data=" + encodeURIComponent(JSONCrush.crush(JSON.stringify(obj)));
}
function generateFormArguments(name){
  return "This feature does not yet exist";
}
//Move a row of data from form responses into the spreadsheet
function newClubFormatting(modRowLoc){
  let NUMBER_OF_DASHBOARD_ITEMS = 8;
  let rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Inactive","Needs Revision","Under Review","Approved"],true)
    .setAllowInvalid(false)
    .setHelpText('Please select an item from the dropdown')
    .build();
  //moderation.getRange(modRowLoc,5).setValue(generateEditLink());
  moderation.getRange(modRowLoc,6).setDataValidation(rule).setValue("Under Review");
  
  moderation.getRange(modRowLoc,1,1,NUMBER_OF_DASHBOARD_ITEMS).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
}
function formSubmissionToJSON(row){
  let JSONProps = sheet.getRange(2,1,1,NUM_OUTPUTS).getValues();
  let dataProposed = sheet.getRange(row,1,1,NUM_OUTPUTS).getValues();
  let formData = {};
  for(let i = 0;i<JSONProps[0].length;i++){
    formData[JSONProps[0][i]] = dataProposed[0][i];
  }
  return formData;
}
function getDatabaseJSON(row){
  let data = moderation.getRange(row,DATA_COL).getValue();
  return JSON.parse(data);
}
function setDatabaseJSON(row,obj){
  moderation.getRange(row,DATA_COL).setValue(JSON.stringify(obj));
}
function updateModerationContent(modRowLoc){
  let JSONVals = getDatabaseJSON(modRowLoc);
  let approved = JSONVals.approved;
  let proposed = JSONVals.proposed;
  let name = JSONVals.name;
  let email = JSONVals.email;
  if(name !== undefined){
    moderation.getRange(modRowLoc,1).setValue(name);
  }
  if(email !== undefined){
    moderation.getRange(modRowLoc,2).setValue(email);
  }
  let proposedLink = "";
  if(proposed["timestamp"] !== undefined){
    if(approved["timestamp"] !== undefined){
      proposedLink = generateUrlArguments({"proposed":proposed,"approved":approved});
    } else{
      proposedLink = generateUrlArguments({"proposed":proposed});
    }
  }
  let approvedLink = approved["timestamp"] === undefined  ? "" : generateUrlArguments({"approved":approved});
  let richProposed = SpreadsheetApp.newRichTextValue()
   .setText(proposedLink)
   .setLinkUrl(proposedLink)
   .build();
   let richApproved = SpreadsheetApp.newRichTextValue()
   .setText(approvedLink)
   .setLinkUrl(approvedLink)
   .build();
  moderation.getRange(modRowLoc,MOD_PROPOSED_COLUMN).setRichTextValue(richProposed);
  moderation.getRange(modRowLoc,MOD_APPROVED_COLUMN).setRichTextValue(richApproved);
  if(name !== undefined){
    moderation.getRange(modRowLoc,5).setValue(generateEditLink(email));
  }
  moderation.getRange(modRowLoc,6).setValue(proposedLink === "" && approvedLink !== "" ? "Approved" : "Under Review");
}

function approveClub(row){
  let clubObj = getDatabaseJSON(row);
  clubObj.approved = clubObj.proposed;
  
  //Extract drive link and determine the file extension of the uploaded image
  let fileID = clubObj.approved.thumbURL.split("?id=")[1];
  let imageFile = DriveApp.getFileById(fileID);
  let fileExtension = imageFile.getMimeType().split("/")[1]; //Convert image/png into png
  clubObj.approved.fileExtension = fileExtension;

  clubObj.proposed = {};
  setDatabaseJSON(row,clubObj);
  updateModerationContent(row);
}
function seekClub(name){
  let modRowLoc = MOD_ROW_START;
  let isNewClub = true;
  while(moderation.getRange(modRowLoc,1).getValue() !== ''){
    if(moderation.getRange(modRowLoc,1).getValue().toLowerCase() === name.toLowerCase()){
      isNewClub = false;
      break;
    }
    modRowLoc += 1;
  }
  return {"modRowLoc":modRowLoc,"isNewClub":isNewClub};
}

//Iterate through all form responses and send them into the database
function sendToDatabase(e) {
  console.log(generateEditLink(e));
  let row = e.range.rowStart;
  let encodedJSON = formSubmissionToJSON(row);
  let name = encodedJSON.name;
  //Seek the club
  let s = seekClub(name);
  if(s.isNewClub){
    newClubFormatting(s.modRowLoc)
    setDatabaseJSON(s.modRowLoc,{
      "email":encodedJSON.editorEmail,
      "name":encodedJSON.name,
      "proposed":encodedJSON,
      "approved":{}
    });
  } else{
    let currentJSON = getDatabaseJSON(s.modRowLoc);
    currentJSON.email = encodedJSON.editorEmail;
    currentJSON.proposed = encodedJSON;
    setDatabaseJSON(s.modRowLoc,currentJSON);
  }
  updateModerationContent(s.modRowLoc);
  console.log("Database transfer success");
}