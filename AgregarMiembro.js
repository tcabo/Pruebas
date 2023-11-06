const cheerio = require('cheerio');
const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const family = [];
const parents = [];
const people = {};

app.get('/', (req, res) => {
    // Serve an HTML form
    const html = `
    <html>
    <head>
        <title>Family Tree</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>
        <style>
            body {
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
                    <label class="form-label" for="firstName">Nombre:</label>
                    <input type="text" class="form-control" id="firstName" name="FirstName" required>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="lastName">Apellido:</label>
                    <input type="text" class="form-control" id="lastName" name="LastName" required>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="fullBirthname">Nombre completo:</label>
                    <input type="text" class="form-control" id="fullBirthname" name="FullBirthname">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="born">Fecha de nacimiento:</label>
                    <input type="text" class="form-control" id="born" name="Born">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="died">Fecha de defuncion:</label>
                    <input type="text" class="form-control" id="died" name="Died">
                </div>
                <div class="mb-3">
                    <label class="form-label" for="house">Edad:</label>
                    <input type="text" class="form-control" id="house" name="House">
                </div>
                <div class="mb-3">
                <label class="form-label" for="Enfermedades">Enfermedades:</label>
               
                <div class="form-check form-check-inline" >
                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault1">
                <label class="form-check-label" for="flexCheckDefault">
                Diabetes
                </label>
                </div>
                <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault2">
                <label class="form-check-label" for="flexCheckDefault">
                Hipertension
                </label>
                </div>   <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault3">
                <label class="form-check-label" for="flexCheckDefault">
                Miopia
                </label>
                </div>   <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault4">
                <label class="form-check-label" for="flexCheckDefault">
                Daltonismo
                </label>
            </div>

            <div class="mb-3">
            <select class="form-select" aria-label="Default select example">
            <option selected>Seleccione Padre</option>
            <option value="1">Juan</option>
            <option value="2">Carlos</option>
            <option value="3">Cacho</option>
          </select>
          </div>

          <div class="mb-3">
          <select class="form-select" aria-label="Default select example">
          <option selected>Seleccione madre</option>
          <option value="1">Clara</option>
          <option value="2">Juana</option>
          <option value="3">Laura</option>
        </select>
        </div>
                <button type="Agregar" class="btn btn-primary">Submit</button>
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
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        FullBirthname: req.body.FullBirthname,
        born: req.body.Born,
        died: req.body.Died,
        House: req.body.House,
        Enfermedades:req.body.Enfermedades,
        FatherId: req.body.FatherId,
        MotherId: req.body.MotherId,
        id: req.body.Id,
        Class: req.body.Class
    };

    family.push(formData);
    
    console.log(family);

    res.redirect('/');

    for (let i = 0; i < family.length; i++) {
        
        let member = family[i];
        let name = member['FirstName'];
        let born = member['born'];
        let died = member['died'];
        let id = member['id'];
        let fullname = member['FullBirthname'];
        let house = member['House'];
        let Enfermedades =member['Enfermedades'];
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

    
    
    console.log('Parents:', parents);
    console.log('People:', people);


    
});


var data = { families: parents, people: people };
module.exports = {
    data: data,
};


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

