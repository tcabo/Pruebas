const cheerio = require('cheerio');


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



function html(sampleData) {
    const $ = cheerio.load(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Family tree</title>
                <link rel="stylesheet" href="Style.css">
                <script src="scrollbooster.min.js"></script>
                <script src="js/main.js"></script>
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

    for (const name in sampleData.people) {
        // console.log(`${name}: ${sampleData.people[name]}`);
        let classname = sampleData.people[name].classname ? sampleData.people[name].classname : '';
        let fullname = sampleData.people[name].fullname ? sampleData.people[name].fullname : '';
        let dateBorn = sampleData.people[name].born ? '*' + sampleData.people[name].born : '';
        let dateDied = sampleData.people[name].died ? '&#10013;' + sampleData.people[name].died : '';
        let sep = sampleData.people[name].born && sampleData.people[name].died ? '&mdash;' : '';
        let ul = `
            <ul class="flow-dendrogram">
                <li id="${name}">
                    <div class="parents couple">
                        <div class="parents-item ${classname}" sampleData-id="${name}">
                            <div class="parents-item-name">${sampleData.people[name].name}</div>
                            <div class="parents-item-fullname">${fullname}</div>
                            <div class="parents-item-dates">${dateBorn} ${sep} ${dateDied}</div>
                        </div>
                    </div>
                </li>
            </ul>`;
        container.append(ul);

        let house = sampleData.people[name].house;
        let $member = $('[sampleData-id="' + name + '"]');

        if (house) {
            $member.addClass('m-link');
            $member.append('<a class="parents-item-link" href="' + house + '.html">' + house + '</a>');
        }
    }

    sampleData.families.forEach((el) => {
        let $father = $('#' + el.parents[0]);
        let $mother = $('#' + el.parents[1]);

        // move another husband to daughter
        let motherHasHusband = $('[sampleData-id="' + el.parents[1] + '"]');
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
            let $content = $('[sampleData-id="' + wifeId + '"]').closest('.flow-dendrogram').children();
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

      // Sample sampleData (replace with your actual sampleData)
const sampleData = {
    families: [
        {
            key: '1_2',
            parents: ['1', '2'],
            children: ['3', '4'],
        },
        // Add more family sampleData here if needed
    ],
    people: {
        1: {
            name: 'John',
            fullname: 'John Doe',
            born: '1980-01-01',
            died: '2020-12-31',
            classname: 'father',
            house: 'Doe House',
        },
        2: {
            name: 'Jane',
            fullname: 'Jane Doe',
            born: '1982-03-15',
            died: '2021-02-28',
            classname: 'mother',
            house: 'Doe House',
        },
        3: {
            name: 'Alice',
            fullname: 'Alice Doe',
            born: '2005-07-10',
            died: '2025-06-20',
            classname: 'daughter',
            house: '',
        },
        4: {
            name: 'Bob',
            fullname: 'Bob Doe',
            born: '2008-12-05',
            died: '',
            classname: 'son',
            house: '',
        },
        // Add more people sampleData here if needed
    },
};

// Call the html(sampleData) function with the sample sampleData
const generatedHTML = html(sampleData);

console.log(generatedHTML); // Log the generated HTML to the console