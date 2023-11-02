const cheerio = require('cheerio');
const express = require('express');
const bodyParser = require('body-parser');


var Colors = {};
Colors.names = [
    '#D25252',
    '#CCDF32',
    '#629755',
    '#CC7832',
    '#6897BB',
    '#BBB529',
    '#9876AA',
    '#EFC090'
];

Colors.random = function() {
    return this.names[Math.floor(Math.random() * this.names.length)];
};

function html(data) {
    const $ = cheerio.load(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Family tree</title>
                <link rel="stylesheet" href="Style.css">
                <script src="scrollbooster.min.js"></script>
                <script src="scroll.js"></script>
            </head>
            <body>
                <h1>test</h1>
                <div class="viewport">
                    <div class="content" id="app"></div>
                </div>
            </body>
        </html>`, { decodeEntities: false });

    const container = $('#app');

    function addChildren(children, $container, parent) {
        let color = Colors.random();
        $container.append(`<ul style="--stroke-color: ${color};"></ul>`);
        children.forEach((child) => {
            let $childrenCont = $('#' + parent + ' > ul');
            let $childCont = $('#' + child).parent().children();
            $childrenCont.append($childCont);
        });
    };

    for (const name in data.people) {
        // console.log(`${name}: ${data.people[name]}`);
        let classname = data.people[name].classname ? data.people[name].classname : '';
        let fullname = data.people[name].fullname ? data.people[name].fullname : '';
        let dateBorn = data.people[name].born ? '*' + data.people[name].born : '';
        let dateDied = data.people[name].died ? '&#10013;' + data.people[name].died : '';
        let sep = data.people[name].born && data.people[name].died ? '&mdash;' : '';
        let ul = `
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

        let house = data.people[name].house;
        let $member = $('[data-id="' + name + '"]');

        if (house) {
            $member.addClass('m-link');
            $member.append('<a class="parents-item-link" href="' + house + '.html">' + house + '</a>');
        }
    }

    data.families.forEach((el) => {
        let $father = $('#' + el.parents[0]);
        let $mother = $('#' + el.parents[1]);

        // move another husband to daughter
        let motherHasHusband = $('[data-id="' + el.parents[1] + '"]');
        if (motherHasHusband.siblings().length) {
            // console.log(motherHasHusband.closest('li').attr('id'));
            let line = '<span class="line"></span>';
            $father.append(line).addClass('parent2');
            motherHasHusband.closest('li').after($father);
        }

        let fatherHasChildren = $('#' + el.parents[0] + ' > ul').length;

        if (!fatherHasChildren) {
            let $fatherCont = $father.find(' > .parents');
            let $motherItem = $mother.find('.parents-item');

            $fatherCont.attr('id', el.key);
            $fatherCont.append($motherItem);

            if (el.children) {
                addChildren(el.children, $father, el.parents[0]);
            }

        } else {
            let line = '<span class="line"></span>';
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
            let wifeId = $(this).parent('li').attr('id');
            let $wife = $('#' + wifeId);
            // console.log(wifeId);
            let $content = $('[data-id="' + wifeId + '"]').closest('.flow-dendrogram').children();
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
        let $list = $(this).find('> li:not(.parent2)');
        let length = $list.length;
        if (length > 1) {
            $list.eq($list.length - 1).addClass('m-last');
        }});

        return $.html().replace(/^\s*[\r\n]/gm,"");
      
};




      const app = express();
      app.use(bodyParser.urlencoded({ extended: true }));
      
      const family = [];
      
      app.get('/', (req, res) => {
          // Serve an HTML form
          const html = `
              <html>
                  <body>
                      <form id="myForm" action="/" method="post">
                      <label for="First Name:">First Name:</label>
                      <input type="text" id="First Name:" name="First Name:" required>
                      <br/><br/>
                     
                      <label for="Last Name:">Last Name:</label>
                      <input type="text" id="Last Name:" name="Last Name:" required>
                      <br/><br/>
                      
                  
                      <label for="Full Birthname">Full Birthname:</label>
                      <input type="text" id="Middle Name:" name="Middle Name:" >
                      <br/><br/>
                      
                      <label for="Born:">Born:</label>
                      <input type="text" id="Born:" name="Born:" >
                      <br/><br/>
                  
                      <label for="Died:">Died:</label>
                      <input type="text" id="Died:" name="Died:" >
                      <br/><br/>
                  
                      <label for="House:">House:</label>
                      <input type="text" id="House:" name="House:" >
                      <br/><br/>
                  
                      <label for="Parents:">Parents:</label>
                      <input type="text" id="Parents:" name="Parents:" >
                      <br/><br/>
                  
                      <label for="Father Id:">Father Id:</label>
                      <input type="text" id="Father Id:" name="Father Id:" >
                      <br/><br/>
                  
                      <label for="Mother Id:">Mother Id:</label>
                      <input type="text" id="Mother Id:" name="Mother Id:" >
                      <br/><br/>
                  
                      <label for="Id:">Id:</label>
                      <input type="text" id="Id:" name="Id:" >
                      <br/><br/>
                  
                      <label for="Class:">Mother Id:</label>
                      <input type="text" id="Class:" name="Class:" >
                      <br/><br/>
                      <input type="submit" value="Submit">
                      </form>
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
      
          // Send a response or perform other actions here
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

