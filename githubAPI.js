/*
  Code adapted from this gist: https://gist.github.com/pamelafox/ea0474daa137f035b489bf78cc5797ea
  by Luke Trenaman
 */
/* A bare-bones GithubClient, just used for commits */
function GithubClient(owner, repo, username) {
  this.owner = owner;
  this.repo = repo;
  this.username = username;
}
 
/* 
Commits content to the Github repo.
Does not do *anything* to handle errors.
@param {string} content - Content to commit
@param {string} email - Committer email
@returns {string} URL of new commit
*/
GithubClient.prototype.commit = function(content, filename, email,msg) {
  // Get the head of the main branch
  // See http://developer.github.com/v3/git/refs/
  var branch = this.makeRequest("get", "refs/heads/main");
  var lastCommitSha = branch['object']['sha'];
  
  // Get the last commit
  // See http://developer.github.com/v3/git/commits/
  var lastCommit = this.makeRequest("get", "commits/" + lastCommitSha);
  console.log(JSON.stringify(lastCommit));
  var lastTreeSha = lastCommit['tree']['sha'];
  // Create tree object (also implicitly creates a blob based on content)
  // See http://developer.github.com/v3/git/trees/
  try{
    console.log()
  //generatedApprovedJSON()
  let spreadsheetCommitTree = [
    {path: filename,
      content: content,
      mode: "100644"
     }
  ];
  let clubsObject = generatedApprovedJSON();
  for(let i = 0;i<clubsObject.length;i++){
    //clubsObject[i].thumbnail;
    //clubsObject[i].name;
    let fileID = clubsObject[i].thumbURL.split("?id=")[1];
    let imageFile = DriveApp.getFileById(fileID);
    let imageBlob = imageFile.getBlob();
    let fileExtension = imageBlob.getContentType().split("/")[1]; //Convert image/png into png
    console.log(fileExtension);
    let base64Image = Utilities.base64Encode(imageBlob.getBytes());
    let fileName = clubsObject[i].name + "." + fileExtension;
    let gitAPIData = UrlFetchApp.fetch("https://api.github.com/repos/masonstudentactivities/masonstudentactivities/contents/thumbnails/" + fileName);
    
    spreadsheetCommitTree.push({
      "path": "thumbnails/" + fileName,
      "content": base64Image,
      "mode": "100644",
      "type": "blob",
      "sha": gitAPIData.sha
    });
  }


  var newContentTree = this.makeRequest("post", "trees",
                                         {base_tree: lastTreeSha,
                                         tree: spreadsheetCommitTree})
  }
  catch(e){
    console.log(e)
  }
  var newContentTreeSha = newContentTree["sha"];
  
  
  var committer = {"name": "masonstudentactivities",
                "email": email};        
  
  // Create commit
  // See http://developer.github.com/v3/git/commits/
  var date = new Date().toLocaleDateString("en-us");
  var message = "Committing spreadsheet content on " + date;
  var newCommit = this.makeRequest("post", "commits",
                                          {parents: [lastCommitSha],
                                          tree: newContentTreeSha,
                                          committer: committer,
                                          message: msg});
  var newCommitSha = newCommit['sha'];
  
  // Update branch to point to new commit
  // See http://developer.github.com/v3/git/refs/
  console.log(this.makeRequest("patch", "refs/heads/main", {sha: newCommitSha}));
  return newCommit["html_url"];
};

/* 
Makes authenticated HTTP request to Github client.
@param {string} method - HTTP method
@param {string} email - Committer email
@returns {string} URL of new commit
*/
GithubClient.prototype.makeRequest = function(method, resource, data) {
  var GITHUB_URL = "https://api.github.com" +
    "/repos/" + this.owner + "/" + this.repo + "/git/" + resource;
  //console.log(GITHUB_URL)
   var headers = {
    "Authorization" : "token " + GIT_API_KEY,
    "Accept" : "application/vnd.github.v3+json"
  };
  
  var options = {'headers': headers, method: method};
  
  if (data) {
    options['contentType'] = 'application/json';
    options['payload'] = JSON.stringify(data);
  }
  var response = UrlFetchApp.fetch(GITHUB_URL, options);
  return JSON.parse(response);
}
function githubAPI(msg){
  let client = new GithubClient(GIT_USER,REPO_NAME,GIT_USER)
  console.log("Committing to Github with message: " + msg);
  try{
    console.log(client.commit(JSON.stringify(generatedApprovedJSON()),"pages.json",EMAIL,msg));
  } catch(e){
    throw "Github client failed with error: " + e;
  }
  console.log("Commit to Github Successful!");
}