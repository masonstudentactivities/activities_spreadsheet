/* 
  Image Compression Script
  Created by Jessica Li
*/

function imageCompress(event) {
  Logger.log(`Using key ${TINYPNG_API_KEY} for TinyPNG API.` )
  Logger.log("Response to form received... Processing  response...")
  let tnID = eventProcess(event)
  Logger.log("Compressing thumbnail...")
  compressFile(tnID, TINYPNG_API_KEY)
  Logger.log("Successfully compressed thumbnail!")
  Logger.log("Success!")
}

// Turns event data into IDs
function eventProcess(event) {
  /* ex: event.namedValues
    {Email Address=[%YOUR EMAIL HERE%], Upload any other images you'd like on the website (Image 3)=[], Upload any other images you'd like on the website (Image 2)=[], Upload a thumbnail=[https://drive.google.com/open?id=1vEVTtgdwM2vpyDaluJDLgucn7B6JH_p1], Timestamp=[11/3/2021 21:58:01], Upload any other images you'd like on the website (Image 1)=[], Enter the name of your club=[sry for the spam :(]}
    Documentation: https://developers.google.com/apps-script/guides/triggers/events#form-submit
  */
  var tnID = event.namedValues["Upload a thumbnail"][0].split("=")[1]
  Logger.log(`Thumbnail ID: ${tnID};`)
  return tnID;
}


// Compresses and updates a file (identified by id) 
function compressFile(id) {
  Logger.log(`Original size: ${imageSize(id)} MB`)
  var imageData = DriveApp.getFileById(id).getBlob()
  var response = callTinyPNG(imageData)
  var mimeType = response["output"]["type"]
  var responseURL = response["output"]["url"]
  var newImageData = UrlFetchApp.fetch(responseURL).getBlob()
  var file = {
      title: DriveApp.getFileById(id).getName(),
      mimeType: mimeType
    };
  Drive.Files.update(file, id, newImageData)
  Logger.log(`New size: ${imageSize(id)} MB`)
}

// Calls TinyPNG API
function callTinyPNG(imageData) {
  // Make a POST request with a JSON payload.
  var options = {
    'method' : 'post',
    'headers' : {'Authorization': `Basic ${TINYPNG_API_KEY}`},
    'payload' : imageData
  };
  var response = UrlFetchApp.fetch('https://api.tinify.com/shrink', options);
  return JSON.parse(response.getContentText())
}

// Returns size of image in MB (divide by 1000000)
function imageSize(id) {
  return (DriveApp.getFileById(id).getSize() / 1000000)
}
