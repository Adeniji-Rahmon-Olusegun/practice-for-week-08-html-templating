const http = require('http');
const fs = require("fs");

const dogs = [
  {
    dogId: 1,
    name: 'Fido',
    age: 2
  },
  {
    dogId: 2,
    name: 'Fluffy',
    age: 10
  }
];

let nextDogId = 3;

function getNewDogId() {
  const newDogId = nextDogId;
  nextDogId++;
  return newDogId;
}


function getContentType(fileName) {
  const ext = fileName.split(".")[1];
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "css":
      return "text/css";
    default:
      return "text/plain";
  }
}

function getStrHtml(path) {
  let htmlPage = fs.readFileSync(path, 'utf-8');

  return htmlPage;
}

function getResPage(res, resBody) {
  
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");

  res.write(resBody)
  
  return res.end();
}

function getErrorPage(res) {
  const htmlPage = fs.readFileSync("./views/error.html", 'utf-8');
  const resBody = htmlPage
    .replace(/#{message}/g, 'Dog Not Found');

  res.statusCode = 404;
  res.setHeader("Content-Type", "text/html");
  res.write(resBody);
  return res.end();
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  if (req.method === "GET" && req.url.startsWith('/assets')) {
    const assetPath = req.url.split("/assets")[1];
    try {
      const resBody = fs.readFileSync("./assets" + assetPath);
      res.statusCode = 200;
      res.setHeader("Content-Type", getContentType(assetPath));
      res.write(resBody);
      return res.end();
    } catch {
      console.error("Cannot find asset", assetPath, "in assets folder");
    }
  }

  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  // When the request is finished processing the entire body
  req.on("end", () => {
    // Parsing the body of the request
    if (reqBody) {
      req.body = reqBody
        .split("&")
        .map((keyValuePair) => keyValuePair.split("="))
        .map(([key, value]) => [key, value.replace(/\+/g, " ")])
        .map(([key, value]) => [key, decodeURIComponent(value)])
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
      console.log(req.body);
    }

    // route handlers
    // GET /
    if (req.method === 'GET' && req.url === '/') {
      const htmlPage = fs.readFileSync("./views/index.html", 'utf-8');
      const resBody = htmlPage;

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(resBody);
      return res.end();
    }

    // Phase 1: GET /dogs
    if (req.method === 'GET' && req.url === '/dogs') {
      // Your code here
      let dogList = "";

      dogs.forEach((dog) => {
        dogList += `<li>${dog.name}</li>`;
      });

      let dogPage = getStrHtml("./views/dogs.html");
      let resPage = dogPage.replace(/#{dogsList}/g, dogList);

      console.log("happy to be here!!!")

      getResPage(res, resPage);

      return;
    }

    // Phase 2: GET /dogs/new
    if (req.method === 'GET' && req.url === '/dogs/new') {
      // Your code here
      let newDogPage = getStrHtml("./views/create-dog.html");

      getResPage(res, newDogPage);

      return;
    }

    // Phase 3: GET /dogs/:dogId
    if (req.method === 'GET' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        const dog = dogs.find(dog => dog.dogId === Number(dogId));
        // Your code here
        if (dog) {
          let dogDetailPage = getStrHtml("./views/dog-details.html");

          let respage = dogDetailPage.replace(/#{name}/g, dog.name).replace(/#{age}/g, dog.age);

          getResPage(res, respage);
          
          return;
        } else {
          return getErrorPage(res);
        }
        
      }
    }

    // Phase 4: POST /dogs
    if (req.method === 'POST' && req.url === '/dogs') {
      // Your code here
      let newDogId = getNewDogId();
      req.body["dogId"] = newDogId;
      dogs.push(req.body);

      res.statusCode = 302;

      res.setHeader("Location", `/dogs/${newDogId}`);

      return res.end();
    }

    // Phase 5: GET /dogs/:dogId/edit
    if (req.method === 'GET' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      console.log("Yea")
      if (urlParts.length === 4 && urlParts[3] === 'edit') {
        const dogId = urlParts[2];
        const dog = dogs.find(dog => dog.dogId === Number(dogId));
        // Your code here
        if (dog) {
          let editPage = getStrHtml("./views/edit-dog.html");
          let resPage = editPage.replace(/#{name}/g, dog.name).replace(/#{age}/g, dog.age).replace(/#{dogId}/g, dogId);

          getResPage(res, resPage);

          return;
        } else {
          return getErrorPage(res);
        }
        
      }
    }

    // Phase 6: POST /dogs/:dogId
    if (req.method === 'POST' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        const dog = dogs.find(dog => dog.dogId === Number(dogId));
        // Your code here
        if (dog) {
          dog.name = req.body.name;
          dog.age = req.body.age;

          res.statusCode = 302;
          res.setHeader("Location", `/dogs/${dogId}`);
          return res.end();
        } else {
          return getErrorPage(res);
        }
        
      }
    }

    // No matching endpoint
    const htmlPage = fs.readFileSync("./views/error.html", 'utf-8');
    const resBody = htmlPage
      .replace(/#{message}/g, 'Page Not Found');

    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    res.write(resBody);
    return res.end();
  });
});

const port = 5000;

server.listen(port, () => console.log('Server is listening on port', port));