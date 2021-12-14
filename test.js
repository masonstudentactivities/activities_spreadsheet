/*
  Spreadsheet Testing Script
  This script runs 7 tests on the database to ensure that everything is working properly
  The tests are as follows:
    * Ensure that every row in the moderation page is matched by an appropriate location in the database
    * Ensure that form submissions work, using a spoofed form event
    * Ensure that the TinyPNG image compression API is running
    * Approve the club to ensure that database approval works
    * Delete the club added by the spoofed form event
    * Ensure that every row in the moderation page is matched by an appropriate location in the database
    * new equivalence test that can also check whether database values compile correctly to the spreadsheet
    * unit tests on URL generation functions
    * tests on generateApprovedJSON to ensure that after approval, it contains "Form Test" club
    * tests on generateApprovedJSON to ensure that after deletion, it does not contain "Form Test" club
  Optional tests:
    * You can uncomment line 122 to test the Git API
*/
/*
File temporarily out of use due to database redesign

function assertURLEquivalence(modRowLoc,dbRowLoc){
  let dbRow = db.getRange(dbRowLoc,2,1,NUM_OUTPUTS);
  let dbRowBelow = db.getRange(dbRowLoc + 1, 2,1,NUM_OUTPUTS);
  let encodedJSON = encodeDatabaseJSON(dbRow,dbRowBelow);
  let formData = encodedJSON.formData;
  let formDataPrevious = encodedJSON.formDataPrevious;
  let proposedLink = formData["timestamp"] === '' ? "" : generateUrlArguments(formData);
  let approvedLink = formDataPrevious["timestamp"] === '' ? "" :  generateUrlArguments(formDataPrevious)
  function checkIfValid(){
    let pass = true;
    if(moderation.getRange(modRowLoc,MOD_PROPOSED_COLUMN).getValue() !== proposedLink){
      console.error("Proposed moderation preview link at row " + modRowLoc + " does not match data in database row " + dbRowLoc);
      pass = false;
    };
    if(moderation.getRange(modRowLoc,MOD_APPROVED_COLUMN).getValue() !== approvedLink){
      console.error("Approved moderation preview link at row " + modRowLoc + " does not match data in database row " + (dbRowLoc+1).toString());
      pass = false;
    };
    return pass;
  }
  if(!checkIfValid()){
    console.log("Attempting to repair database...")
    updateModerationContent(modRowLoc,dbRow,dbRowBelow);
    
  }
  return checkIfValid();
}
function testEquivalence(){
    let dbRowLoc = DB_ROW_START;
    let modRowLoc = MOD_ROW_START;
    let failure = false;
    let clubName,dbClubName,dbClubNameBelow = 'y';
    while(clubName !== '' || dbClubName !== '' || dbClubNameBelow !== ''){
      if(!assertURLEquivalence(modRowLoc,dbRowLoc)){
        failure = true;
      };
      clubName = moderation.getRange(modRowLoc,CLUB_NAME_COLUMN).getValue();
      dbClubName = db.getRange(dbRowLoc,1 + NAME_COLUMN).getValue();
      dbClubNameBelow = db.getRange(dbRowLoc + 1,1 + NAME_COLUMN).getValue();
    if(clubName !== dbClubName && clubName !== dbClubNameBelow){
      console.error("No equivalence between moderation club name \"" + clubName + "\" and possible values \"" + dbClubName + "\" and \"" + dbClubNameBelow + "\" at moderation row " + modRowLoc + " and database rows " + dbRowLoc + "-" + (dbRowLoc + 1).toString());
    } else{
      if(clubName === '' && (dbClubName !== '' || dbClubNameBelow !== '')){
        console.error("Trailing database data. No matching moderation data for database values \"" + dbClubName + "\" and \"" + dbClubNameBelow + "\" at moderation row " + modRowLoc + " and database rows " + dbRowLoc + "-" + (dbRowLoc + 1).toString());
      }
    }
    dbRowLoc += 2;
    modRowLoc += 1;
  }
  if(failure){
    throw "Database does not match moderation data.";
  } else{
    console.log("Database matches moderation data.");
  }
}
function URLUnitTests(){
  if(generateUrlArguments({
    "editorEmail":"testing",
    "clubName":"URL",
    "thumbURL":"arguments",
    "propert&y":"wooo!!"
  }) === SITE_NAME + "/preview/index.html?editorEmail=testing&clubName=URL&thumbURL=arguments&propert%26y=wooo!!"){
    console.log("Function generateUrlArguments passes");
  } else{
    throw "Function generateUrlArguments fails";
  };
  console.log(generateEditLink("Cl' &!@%O!@#$%^&*() cb ___ |}{"));
  if(generateEditLink("Cl' &!@%O!@#$%^&*() cb ___ |}{") === FORM_URL + "/viewform?usp=pp_url&entry.271970040=Cl'%20%26!%40%25O!%40%23%24%25%5E%26*()%20cb%20___%20%7C%7D%7B"){
    console.log("Function generateEditLink passes")
  } else{
    throw "Function generateEditLink fails.";
  };
}


function runTests() {
  //Ensure that every cell in the moderation sheet is paired with a location in the database
  testEquivalence();
  URLUnitTests();
  //Spoof a form submission, and ensure that it ends up within the Moderation spreadsheet AND the database
  let date = new Date()
  sheet.appendRow(["AUTOMATED TEST ON " + date.toDateString(),"masonstudentactivities@gmail.com","Form Test",TEST_IMAGE_URL]);
  onFormSubmit({"authMode":"FULL","namedValues":{"Upload any other images you'd like on the website (Image 2)":[""],"Timestamp":["11/18/2021 23:00:40"],"Upload any other images you'd like on the website (Image 3)":[""],"Upload any other images you'd like on the website (Image 1)":[""],"Upload a thumbnail":["https://drive.google.com/open?id=15rnKfzkNFBI4i8u3ucz8uJifrXZ7aB0Z"],"Email Address":["masonstudentactivities@gmail.com"],"Enter the name of your club":["Form Test"]},"range":{"columnEnd":4,"columnStart":1,"rowEnd":23,"rowStart":23},"source":{},"triggerUid":"8910972","values":["11/18/2021 23:00:40","masonstudentactivities@gmail.com","Form Test","https://drive.google.com/open?id=15rnKfzkNFBI4i8u3ucz8uJifrXZ7aB0Z","","",""]})
  //Try to approve the club, but don't upload the club to Github
  let seekObj = seekClub("Form Test");
  moderation.getRange(seekObj.modRowLoc,APPROVAL_COLUMN).setValue("Approved");
  let JSONbefore = generatedApprovedJSON();
  let presentBefore = JSONbefore.some(function(val){
    return val.clubName === "Form Test";
  });
  if(presentBefore){
    console.error("Form Test appears in the JSON object before it is approved.");
  }
  approveClub(seekObj.modRowLoc);
  let JSONafter = generatedApprovedJSON();
  let presentAfter = JSONafter.some(function(val){
    return val.clubName === "Form Test";
  });
    if(!presentAfter){
    console.error("Form Test doesn't appear in the JSON object after it is approved.");
  }
  //Delete the club to ensure that deletion works, and check to see if it is gone from the moderation sheet and database
  destroyClub("Form Test",seekObj.modRowLoc);
  //Test the Git API hook after deletion
  //githubAPI("Testing Github upload API. This commit should contain no changes");
  //After all of these tests, ensure that each moderation row can be matched by a database row.
  testEquivalence();
}
*/