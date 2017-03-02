# Inspection Viewer
The inspection viewer is a small server which accepts inspection result XML from IntelliJ and visualizes them. The project is realized as a nodejs express service.

# Quickstart
1. Check-Out project:

    `git clone https://github.com/MontiSecArc/Inspection-Viewer.git`
2. Import the project into an IDE of your choosing.
3. Run `node path_to_project/www.js``
4. Open *localhost:3000*

# Uploading a new Inspection Result
Post a multi-form-data request to *http://server_url:port/upload* where:
- CI_PROJECT_NAME represents the project for which the inspection was run (text)
- CI_BUILD_ID represents an arbitrary atomic counting entity (text)
- inspection represents the file that needs to be uploaded (file)


## Example NodeJs Post Command
Send the following request to the server (nodejs):

```javascript
var http = require("http");

var options = {
  "method": "POST",
  "hostname": "##HOST##",
  "port": null,
  "path": "/upload",
  "headers": {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
    "cache-control": "no-cache",
    "postman-token": "e9cd735b-5d65-1b44-2f04-35ee86883e2b"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.write("------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"CI_PROJECT_NAME\"\r\n\r\nMSA_Demo\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"CI_BUILD_ID\"\r\n\r\n5\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"inspection\"; filename=\"GraphQuery.xml\"\r\nContent-Type: application/xml\r\n\r\n\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--");
req.end();
```
