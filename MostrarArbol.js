const cheerio = require('cheerio');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const AgregarMiembro = require('./AgregarMiembro');
const data = AgregarMiembro.data;
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

var Colors = {};
Colors.names = [
  '#D25252',
  '#CCDF32',
  '#629755',
  '#CC7832',
  '#6897BB',
  '#BBB529',
  '#9876AA',
  '#EFC090',
];

Colors.random = function() {
  return this.names[Math.floor(Math.random() * this.names.length)];
};


const htmlFileName = 'Test.html'; // Nombre del archivo HTML
// Carpeta para archivos estáticos (CSS y scripts)
app.use(express.static(path.join(__dirname, 'hello')));

app.get('/mostrar', (req, res) => {
  if (fs.existsSync(htmlFileName)) {
    // Si el archivo existe, genera el HTML y escribe en el archivo
    const generatedHTML = generateHTML(data);
    saveHtmlToFile(generatedHTML);
    res.send(generatedHTML);
  } else {
    res.send('El archivo HTML no existe.');
  }
});

function saveHtmlToFile(htmlContent) {
  fs.writeFileSync(htmlFileName, htmlContent, 'utf8');
}

function generateHTML(data) {
  const $ = cheerio.load(`
  <!DOCTYPE html>
  <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <title>Family tree</title>
          <link rel="stylesheet" href="/Style.css">
          <script src="/scrollbooster.min.js"></script>
          <script src="/scroll.js"></script>
      </head>
      <body>
          <h1>#MiArbolGenealogico</h1>
          
          <div class="viewport">
              <div class="content" id="app"></div>
          </div>
      </body>
  </html>`, {decodeEntities: false});

const container = $('#app');

function addChildren(children, $container, parent) {
const color = Colors.random();
$container.append(`<ul style="--stroke-color: ${color};"></ul>`);
children.forEach((child) => {
const $childrenCont = $('#' + parent + ' > ul');
const $childCont = $('#' + child).parent().children();
$childrenCont.append($childCont);
});
};

for (const name in data.people) {
// console.log(`${name}: ${data.people[name]}`);
const classname = data.people[name].classname ? data.people[name].classname : '';
const fullname = data.people[name].fullname ? data.people[name].fullname : '';
const dateBorn = data.people[name].born ? '*' + data.people[name].born : '';
const dateDied = data.people[name].died ? '&#10013;' + data.people[name].died : '';
const sep = data.people[name].born && data.people[name].died ? '&mdash;' : '';
const ul = `
      <ul class="flow-dendrogram">
          <li id="${name}">
              <div class="parents couple">
                <div class="parents-item ${classname}" data-id="${name}">
                      <div class="parents-item-name">${data.people[name].name}</div>
                      <div class="parents-item-fullname">${fullname}</div>
                      <div class="parents-item-dates">${dateBorn} ${sep} ${dateDied}</div>
                  </div>
              </div>
          </li>
      </ul>`;
container.append(ul);

const house = data.people[name].house;
const $member = $('[data-id="' + name + '"]');

if (house) {
$member.addClass('m-link');
$member.append('<a class="parents-item-link" href="' + house + '.html">' + house + '</a>');
}
}

data.families.forEach((el) => {
const $father = $('#' + el.parents[0]);
const $mother = $('#' + el.parents[1]);

// move another husband to daughter
const motherHasHusband = $('[data-id="' + el.parents[1] + '"]');
if (motherHasHusband.siblings().length) {
// console.log(motherHasHusband.closest('li').attr('id'));
const line = '<span class="line"></span>';
$father.append(line).addClass('parent2');
motherHasHusband.closest('li').after($father);
}

const fatherHasChildren = $('#' + el.parents[0] + ' > ul').length;

if (!fatherHasChildren) {
const $fatherCont = $father.find(' > .parents');
const $motherItem = $mother.find('.parents-item');

$fatherCont.attr('id', el.key);
$fatherCont.append($motherItem);

if (el.children) {
  addChildren(el.children, $father, el.parents[0]);
}
} else {
const line = '<span class="line"></span>';
$mother.addClass('parent2').append(line);
$father.append(line);
$father.after($mother);

if (el.children) {
  addChildren(el.children, $mother, el.parents[1]);
}
}
});

$('.parents').each(function(index) {
if ($(this).find('.parents-item').length == 0) {
const wifeId = $(this).parent('li').attr('id');
const $wife = $('#' + wifeId);
// console.log(wifeId);
const $content = $('[data-id="' + wifeId + '"]').closest('.flow-dendrogram').children();
$wife.after($content);
$wife.remove();
}
});

$('.flow-dendrogram').each(function(index) {
if ($(this).find('.parents-item').length == 0) {
$(this).remove();
}
});

// the case when wife has second husband and it is the last child of the group
$('ul').each(function(index) {
const $list = $(this).find('> li:not(.parent2)');
const length = $list.length;
if (length > 1) {
$list.eq($list.length - 1).addClass('m-last');
}
});

const footer = `
    <div class="footer">
      <div class="footer-buttons">
        <a href="http://localhost:3000/" target="_blank"  class="btn btn-success btn-lg"><b>Agregar Miembro</b></a>
        <a href="http://localhost:3001/mostrar" class="btn btn-danger btn-lg"><b>Mostrar Árbol</b></a>
        <form class="form-inline">
        <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
      </form>
      </div>
    </div>
  `;

  // Agregar el footer al final del cuerpo
  container.append(footer);





return $.html().replace(/^\s*[\r\n]/gm, '');

  
}

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});