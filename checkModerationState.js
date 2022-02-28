/* 
  Moderation State Checking Script
  Created by Luke Trenaman
  On every edit event, check if the edit was within the moderation spreadsheet. If it was:
  * Check if it is in the approval column
    * If a club has been moved to an "approved" state, then update the database accordingly
  * Check if it is in the deletion column
    * Prompt the moderator if they truly want to delete the club, and then delete the club.
*/
function manualUpdateMHS() {
  githubAPI("Manually update website for high school");
}
function manualUpdateMMS() {
  setToMiddleSchool();
  githubAPI("Manually update website for middle school");
}
function destroyClub(moderationRow) {
  moderation.deleteRow(moderationRow);
}

function runModeration(e, activeSheet) {
  let columnIsApproval =
    e.range.columnStart === e.range.columnEnd &&
    e.range.columnStart === APPROVAL_COLUMN;
  let clubNameRow = e.range.rowStart;

  let clubName = activeSheet.getRange(clubNameRow, CLUB_NAME_COLUMN).getValue();
  if (columnIsApproval) {
    let approvalVal = activeSheet.getRange(clubNameRow, APPROVAL_COLUMN).getValue();
    switch (approvalVal) {
      case "Inactive":
        githubAPI("Deactive club with name " + clubName);
        //Keep sheet content but do not display the information
        break;
      case "Needs Revision":
        let data = getDatabaseJSON(clubNameRow);
        let editLink = moderation.getRange(clubNameRow, 5).getValue();
        let feedback = Browser.inputBox(
          `Sending email to editor ${data.email} -> Your club proposal has been provided with the following feedback:`
        );
        MailApp.sendEmail({
          to: data.email,
          subject: `Your club ${clubName} has been marked as Needs Revision.`,
          htmlBody:
            "Your club proposal has been provided with the following feedback:<br/>" +
            feedback +
            "<br/> You're able to edit your club with this link:" +
            `<a href="${editLink}">${editLink}</a>`,
        });
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
}

function whenEdit(e) {
  console.log(JSON.stringify(e));
  const activeSheet = e.source.getActiveSheet();
  if (activeSheet.getName() === "1️⃣ High School Moderation") {
    runModeration(e, activeSheet);
  } else if (as.getName() === "2️⃣ Middle School Moderation") {
    setToMiddleSchool();
    runModeration(e, activeSheet);
  } else {
    return;
  }
}
function testEmail() {
  MailApp.sendEmail({
    to: "luke.trenaman30@masonohioschools.com",
    subject: `Your club has been marked as Needs Revision.`,
    htmlBody:
      "Your club proposal has been provided with the following feedback:<br/> feeback",
  });
}
