/* 
  Spreadsheet Configuration Script
  Created by Luke Trenaman
  This is a useful list of constants that the project uses.
  This is also where all of the API keys are contained.
  If you want to update an API key, just change one of the variables below.
  If you're having any trouble with the Spreadsheet, feel free to email me at trenamanluke@gmail.com
*/



/* -- SPREADSHEET OBJECTS -- */
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses");
var db = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Database");
var moderation = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Moderation");

/* -- RESPONSE SHEET CONSTANTS -- */
//JSON header properties are in the second row
const JSON_ROW = 2;
//Names are stored in the third column of the response sheet 
const NAME_COLUMN = 3; 
//This constant refers to the first row of the form responses that does not contain header information
const FORM_ROW_START = 3;
//This constant refers to the number of form questions. Set this to the number of text-filled columns in the "Form Responses" sheet
const NUM_OUTPUTS = 7;


/* -- DATABASE SHEET CONSTANTS -- */
//This constant refers to the first row of the database that does not contain header information
const DB_ROW_START = 2;

/* -- MODERATION SHEET CONSTANTS -- */
const CLUB_NAME_COLUMN = 1; //The name of club's are in the 1st column of the moderation sheet
const APPROVAL_COLUMN = 6; //The approval dropdown is in the 6th column of the moderation sheet
const DELETION_COLUMN = 7; //The deletion checkbox is in the 7th column of the moderation sheet
const DATA_COL = 8;

//This constant refers to the first row of the moderation dashboard that does not contain header information
const MOD_ROW_START = 3;
const MOD_NAME_COLUMN = 1;
const MOD_PROPOSED_COLUMN = 3;
const MOD_APPROVED_COLUMN = 4;


