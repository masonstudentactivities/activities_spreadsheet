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
@param {string} filename - Name of the thumbnail
@param {string} email - Committer email
@param {string} msg - Commit message to be sent
@returns {string} URL of new commit
*/
GithubClient.prototype.commit = function (content, filename, email, msg) {
  // Get the head of the main branch
  // See http://developer.github.com/v3/git/refs/
  var branch = this.makeRequest("get", "refs/heads/main");
  var lastCommitSha = branch["object"]["sha"];
  console.log(lastCommitSha);

  // Get the last commit
  // See http://developer.github.com/v3/git/commits/
  var lastCommit = this.makeRequest("get", "commits/" + lastCommitSha);
  console.log(JSON.stringify(lastCommit));
  var lastTreeSha = lastCommit["tree"]["sha"];
  // Create tree object (also implicitly creates a blob based on content)
  // See http://developer.github.com/v3/git/trees/
  let spreadsheetCommitTree = [
    { path: filename, content: content, mode: "100644" },
  ];
  let clubsObject = generatedApprovedJSON();
  for (let i = 0; i < clubsObject.length; i++) {
    let fileID = clubsObject[i].thumbURL.split("?id=")[1];
    let imageFile = DriveApp.getFileById(fileID);
    let imageBlob = imageFile.getBlob();
    let fileExtension = imageBlob.getContentType().split("/")[1]; //Convert image/png into png
    let base64Image = Utilities.base64Encode(imageBlob.getBytes()); //Turn into blob

    let gitBlob = this.makeRequest("post", "blobs", { //Now able to put into gh-pages with blob API
      content: base64Image,
      encoding: "base64",
    });
    let fileName = clubsObject[i].name + "." + fileExtension;

    let commitObj = { //Tell gh-pages where to put the changes
      path: "public/images/thumbnails/" + DIRECTORY + "/" + fileName,
      mode: "100644",
      type: "blob",
      sha: gitBlob.sha,
    };
    spreadsheetCommitTree.push(commitObj);
  }

  var newContentTree = this.makeRequest("post", "trees", {
    base_tree: lastTreeSha,
    tree: spreadsheetCommitTree,
  });
  var newContentTreeSha = newContentTree["sha"];

  var committer = { name: "masonstudentactivities", email: email };

  // Create commit
  // See http://developer.github.com/v3/git/commits/
  var newCommit = this.makeRequest("post", "commits", {
    parents: [lastCommitSha],
    tree: newContentTreeSha,
    committer: committer,
    message: msg,
  });
  var newCommitSha = newCommit["sha"];

  // Update branch to point to new commit
  // See http://developer.github.com/v3/git/refs/
  console.log(
    this.makeRequest("patch", "refs/heads/main", { sha: newCommitSha })
  );
  return newCommit["html_url"];
};

/* 
Makes authenticated HTTP request to Github client.
@param {string} method - HTTP method
@param {string} email - Committer email
@param {object} data - JSON upload
@returns {string} URL of new commit
*/
GithubClient.prototype.makeRequest = function (method, resource, data) {
  var GITHUB_URL =
    "https://api.github.com" +
    "/repos/" +
    this.owner +
    "/" +
    this.repo +
    "/git/" +
    resource;
  //console.log(GITHUB_URL)
  var headers = {
    Authorization: "token " + GIT_API_KEY,
    Accept: "application/vnd.github.v3+json",
  };

  var options = { headers: headers, method: method };

  if (data) {
    options["contentType"] = "application/json";
    options["payload"] = JSON.stringify(data);
  }
  var response = UrlFetchApp.fetch(GITHUB_URL, options);
  return JSON.parse(response);
};
function githubAPI(msg) {
  let client = new GithubClient(GIT_USER, REPO_NAME, GIT_USER);
  console.log("Committing to Github with message: " + msg);
  console.log(
    client.commit(
      JSON.stringify(generatedApprovedJSON()),
      "src/pages" + DIRECTORY.toUpperCase() + ".json",
      EMAIL,
      msg
    )
  );
  console.log("Commit to Github Successful!");
}
