function onFormSubmit(event) {
  imageCompress(event)
  sendToDatabase(event)
  //updateEditForm(event)
}

/* Original onFormSubmit(event) and helper functions
function onFormSubmit(event) {
  var key = "TINYPNG_API_KEY"
  Logger.log("Response to form received... Processing images...")
  Logger.log(`Using key ${key} for TinyPNG API.` )
  var tnID = getImageID(event)
  var tnFile = DriveApp.getFileById(tnID)
  Logger.log(`Original image size in MB: ${imageMB(tnID)}`)
  // if (imageMB(tnID) >= 1) {
  if (true) {
    Logger.log("Image is being compressed...")
    // API call
    var response = JSON.parse(callTinyPNG(tnFile, key).getContentText())
    Logger.log(`Response received! ${response}`)
    var newImageMIMEtype = response["output"]["type"]
    var newImageURL = response["output"]["url"]
    Logger.log(`Getting image from ${newImageURL} ...`)
    var newImageBlob = UrlFetchApp.fetch(newImageURL).getBlob()
    file = {
      title: tnFile.getName(),
      mimeType: newImageMIMEtype
    };
    Drive.Files.update(file, tnID, newImageBlob)
    Logger.log(`New image size in MB: ${imageMB(tnID)}`)
  }
  sendToDatabase();
}

function callTinyPNG(tnFile, key) {
  // Make a POST request with a JSON payload.
  var imageData = tnFile.getBlob()
  var options = {
    'method' : 'post',
    'headers' : {'Authorization': `Basic ${key}`},
    'payload' : imageData
  };
  var response = UrlFetchApp.fetch('https://api.tinify.com/shrink', options);
  return response
}

function getImageID(event) {
  //  {Email Address=[%YOUR EMAIL HERE%], Upload any other images you'd like on the website (Image 3)=[], Upload any other images you'd like on the website (Image 2)=[], Upload a thumbnail=[https://drive.google.com/open?id=1vEVTtgdwM2vpyDaluJDLgucn7B6JH_p1], Timestamp=[11/3/2021 21:58:01], Upload any other images you'd like on the website (Image 1)=[], Enter the name of your club=[sry for the spam :(]}
  //  Documentation: https://developers.google.com/apps-script/guides/triggers/events#form-submit
  // Thumbnail image location in Drive
  var tn = event.namedValues["Upload a thumbnail"][0]
  // Thumbnail file ID
  return tn.split("=")[1]
}

// Returns size of image in MB (divide by 1000000)
function imageMB(id) {
  return (DriveApp.getFileById(id).getSize() / 1000000)
}


  // Get Thumbnail image URL
  // var tnURL = Drive.Files.get(tnID).webContentLink
  // return tnURL
*/
