/* 
  JSON Generation Script
  Created by Luke Trenaman
  Read data from the approved row of the database
  Use the JSON properties in the "Form Responses" sheet and the row values to generate
  a JSON object with all approved clubs inside of it.
*/
function generatedApprovedJSON() {
  let sitesJSON = [];
  let JSONProps = sheet.getRange(2,1,1,NUM_OUTPUTS).getValues();
  let dbRowLoc = DB_ROW_START;
  while(db.getRange(dbRowLoc + 1,1).getValue() === "Approved"){
    if(db.getRange(dbRowLoc + 1,2).getValue() === ""){
      dbRowLoc += 2;
      continue;
    }
    let dataApproved = db.getRange(dbRowLoc + 1, 2,1,NUM_OUTPUTS).getValues();
    let approvedJSONObject = {};
    //console.log(JSONProps);
    for(let i = 0;i<JSONProps[0].length;i++){
      approvedJSONObject[JSONProps[0][i]] = dataApproved[0][i];
    }
    dbRowLoc += 2;
    sitesJSON.push(approvedJSONObject);
  }
  //console.log(sitesJSON)
  return sitesJSON;
}
