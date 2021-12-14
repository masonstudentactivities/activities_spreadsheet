/* 
  Moderation State Checking Script
  Created by Luke Trenaman
  On every edit event, check if the edit was within the moderation spreadsheet. If it was:
  * Check if it is in the approval column
    * If a club has been moved to an "approved" state, then update the database accordingly
  * Check if it is in the deletion column
    * Prompt the moderator if they truly want to delete the club, and then delete the club.
*/
function destroyClub(moderationRow){
  moderation.deleteRow(moderationRow);
}
function whenEdit(e) {
  console.log(JSON.stringify(e));
  const as = e.source.getActiveSheet();
  if(as.getName() === "Moderation"){
    const cell = e.range;
    let columnIsApproval = e.range.columnStart === e.range.columnEnd && e.range.columnStart === APPROVAL_COLUMN;
    let columnIsDeletion = e.range.columnStart === e.range.columnEnd && e.range.columnStart === DELETION_COLUMN;
    let rowCorrect = e.range.rowStart === e.range.rowEnd && e.range.rowEnd > 2;
    let clubNameRow = e.range.rowStart;

    let clubName = as.getRange(clubNameRow,CLUB_NAME_COLUMN).getValue();
    if(columnIsDeletion){
      var response = Browser.inputBox("Are you sure you want to delete the webpage of the club " + clubName + "? Type YES below to confirm");
      if(response.toLowerCase() === "yes" && clubName === as.getRange(clubNameRow,CLUB_NAME_COLUMN).getValue()){
        //The second part of the above condition ensures that you can't delete a club that has
        //already been deleted.
        destroyClub(clubNameRow);
        githubAPI("Delete club with name " + clubName);
      } else{
        cell.setValue(false);
      }
    }
    if(columnIsApproval){
      let approvalVal = as.getRange(clubNameRow,APPROVAL_COLUMN).getValue();
      switch(approvalVal){
        case "Needs Revision":
          //Send an automated email to "Editor's Email"
        break;
        case "Under Review":
          //This is the default setting, it does nothing
        break;
        case "Approved":
          approveClub(clubNameRow);
          githubAPI("Update club with name " + clubName);
          //Move proposed data to the approved column, clear the proposed changes part of DB
        break;
      }
    }
  } else{
    return;
  }
}