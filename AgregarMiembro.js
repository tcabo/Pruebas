const cheerio = require('cheerio');
const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const family = [];

app.get('/', (req, res) => {
    // Serve an HTML form
    const html = `
    <html>
    <head>
        <title>Family Tree</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
        <style>
            body {
                background-image: url('tree_of_gondor_wallpaper_by_ghigo1972-d2pguge.png');
                background-size: cover;
                background-repeat: no-repeat;
            }
            .container {
                margin-top: 30px;
            }
            .form-label {
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="display-4 text-center">#MiArbolGenealogico</h1>
            <form id="myForm" action="/" method="post">
                <div class="mb-3">
                    <label class="form-label" for="firstName">First Name:</label>
                    <input type="text" class="form-control" id="firstName" name="FirstName" required>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="lastName">Last Name:</label>
                    <input type="text" class="form-control" id="lastName" name="LastName" required>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="fullBirthname">Full Birthname:</label>
                    <input type="text" class="form-control" id="fullBirthname" name="FullBirthname">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="born">Born:</label>
                    <input type="text" class="form-control" id="born" name="Born">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="died">Died:</label>
                    <input type="text" class="form-control" id="died" name="Died">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="house">House:</label>
                    <input type="text" class="form-control" id="house" name="House">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="parents">Parents:</label>
                    <input type="text" class="form-control" id="parents" name="Parents">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="fatherId">Father Id:</label>
                    <input type="text" class="form-control" id="fatherId" name="FatherId">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="motherId">Mother Id:</label>
                    <input type="text" class="form-control" id="motherId" name="MotherId">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="id">Id:</label>
                    <input type="text" class="form-control" id="id" name="Id">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="class">Class:</label>
                    <input type="text" class="form-control" id="class" name="Class">
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
        </div>
    </body>
    </html>
    `;

    res.send(html);
});

app.post('/', (req, res) => {
    // Handle form submission
    const formData = {
      FirstName: req.body.name,
        born: req.body.email,
        died: req.body.email,
        id:req.body.email,
    };

    family.push(formData);

  
    console.log(family);

    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

let parents = [];
let people = {};

for (let i = 0; i < family.length; i++) {
  let member = family[i];
  let name = member['FirstName'];
  let born = member['Born'];
  let died = member['Died'];
  let id = member['Id'];
  let fullname = member['FullBirthname'];
  let house = member['House'];
  let idFather = member['FatherId'];
  let idMother = member['MotherId'];
  let parentsKey = `${idFather}_${idMother}`;
  let classname = member['Class'];

  let couple = parents.find(i => i.key === parentsKey);
  let parentArr = [];

  if (idFather != '') {
      parentArr.push(idFather);
  }
  if (idMother != '') {
      parentArr.push(idMother);
  }

  if (couple) {
      couple.children.push(id);
  } else {
      if (idFather || idMother) {
          parents.push({
              key: parentsKey,
              parents: parentArr,
              children: [id]
          });
      }
  }

  people[id] = {
      name: name,
      fullname: fullname,
      born: born,
      died: died,
      classname: classname,
      house: house
  };
}

let data = { families: parents, people: people };

