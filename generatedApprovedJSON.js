/* 
  JSON Generation Script
  Created by Luke Trenaman
  Read data from the approved row of the database
  Use the JSON properties in the "Form Responses" sheet and the row values to generate
  a JSON object with all approved clubs inside of it.
*/
function generatedApprovedJSON() {
  let sitesJSON = [];
  let modRowLoc = MOD_ROW_START;
  while(moderation.getRange(modRowLoc,1).getValue() !== ""){
    dbJSON = getDatabaseJSON(modRowLoc);
    if(dbJSON.approved !== undefined){
      sitesJSON.push(dbJSON.approved);
    }
    modRowLoc += 1;
  }
  return sitesJSON;
}