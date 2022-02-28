/* 
  Database Entry Script
  Created by Luke Trenaman
  This sends data from the form with a variable amount of responses.
  The form approval string iterates through all of the database items
  They will be marked with a 1 on transfer success, marked with 0 on transfer failure
*/

//Generate a preview link using the form data
function generateEditLink(email){
  // Funny silly hacky thing
  // We found that there is a FormResponse class within Google Apps Scripts
  // Reference: https://developers.google.com/apps-script/reference/forms/form-response

  // But it can only be accessed directly through Google Forms, it's not given as data in form events
  // So we have to get creative to get the data.
  // Here we iterate through all form responses, and get the prefilled URL from the most recent submission
  
  // The idea is that hopefully, no one person submits the same form simultaneously
  // If they do, the edit links will break
  // Oh no!
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
  return SITE_NAME + "/"+DIRECTORY+"/preview/?data=" + encodeURIComponent(JSONCrush.crush(JSON.stringify(obj)));
}
//Move a row of data from form responses into the spreadsheet
function newClubFormatting(modRowLoc){
  let rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Inactive","Needs Revision","Under Review","Approved"],true)
    .setAllowInvalid(false)
    .setHelpText('Please select an item from the dropdown')
    .build();
  moderation.getRange(modRowLoc,6).setDataValidation(rule).setValue("Under Review");
  
  moderation.getRange(modRowLoc,1,1,NUMBER_OF_DASHBOARD_ITEMS).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
}
//Convert a Google Form submission into a JSON dictionary using the property names in form submission sheets
function formSubmissionToJSON(row){
  let JSONProps = sheet.getRange(2,1,1,NUM_OUTPUTS).getValues();
  let dataProposed = sheet.getRange(row,1,1,NUM_OUTPUTS).getValues();
  let formData = {};
  for(let i = 0;i<JSONProps[0].length;i++){
    formData[JSONProps[0][i]] = dataProposed[0][i];
  }
  return formData;
}
//Pull data object from data column of the spreadsheet
function getDatabaseJSON(row){
  let data = moderation.getRange(row,DATA_COL).getValue();
  return JSON.parse(data);
}
//Set data object into the data column of the spreadsheet
function setDatabaseJSON(row,obj){
  moderation.getRange(row,DATA_COL).setValue(JSON.stringify(obj));
}
function updateModerationContent(modRowLoc){
  let JSONVals = getDatabaseJSON(modRowLoc);
  let approved = JSONVals.approved;
  let proposed = JSONVals.proposed;
  let name = JSONVals.name;
  let email = JSONVals.email;
  //Make club reflect name of club and email of editor
  moderation.getRange(modRowLoc,1).setValue(name);
  moderation.getRange(modRowLoc,2).setValue(email);
  //Proposed changes can either show just proposed changes, or proposed and approved side by side
  //Account for both of these possibilities so the site renders safely
  let proposedLink = "";
  if(proposed["timestamp"] !== undefined){
    if(approved["timestamp"] !== undefined){
      proposedLink = generateUrlArguments({"proposed":proposed,"approved":approved});
    } else{
      proposedLink = generateUrlArguments({"proposed":proposed});
    }
  }
  //The approved link will only have approved content, and if it doesn't, show no link
  let approvedLink = approved["timestamp"] === undefined  ? "" : generateUrlArguments({"approved":approved});
  //We need to make these both rich text so they show up as clickable links for moderators
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
  //Create an edit link based on the email of the person who last edited the club
  moderation.getRange(modRowLoc,5).setValue(generateEditLink(email));
  //Now, look at the value of approved / proposed links to determine what to show
  //A club is approved if it only has data in its approved column
  //Any other scenario means it is under review
  moderation.getRange(modRowLoc,6).setValue(proposedLink === "" && approvedLink !== "" ? "Approved" : "Under Review");
}

//Move proposed column into approved column
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
  //Look through moderation sheet until finding a club with a matching {name}
  while(moderation.getRange(modRowLoc,1).getValue() !== ''){
    if(moderation.getRange(modRowLoc,1).getValue().toLowerCase() === name.toLowerCase()){
      isNewClub = false;
      break;
    }
    modRowLoc += 1;
  }
  return {"modRowLoc":modRowLoc,"isNewClub":isNewClub};
}

//On form submit, send the submitted data to a row in the sheet
function sendToDatabase(e) {
  console.log(generateEditLink(e));
  let row = e.range.rowStart;
  let encodedJSON = formSubmissionToJSON(row);
  let name = encodedJSON.name;
  //Seek the club
  let s = seekClub(name);
  if(s.isNewClub){
    //New club, add formatting and create the data object formatting
    newClubFormatting(s.modRowLoc)
    setDatabaseJSON(s.modRowLoc,{
      "email":encodedJSON.editorEmail,
      "name":encodedJSON.name,
      "proposed":encodedJSON,
      "approved":{}
    });
  } else{
    //Existing club, just update the relevant properties
    let currentJSON = getDatabaseJSON(s.modRowLoc);
    currentJSON.email = encodedJSON.editorEmail;
    currentJSON.proposed = encodedJSON;
    setDatabaseJSON(s.modRowLoc,currentJSON);
  }
  //Update the content according to the new value of the data row
  updateModerationContent(s.modRowLoc);
  console.log("Database transfer success");
}