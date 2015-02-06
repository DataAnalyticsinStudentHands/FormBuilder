/**
 * Created by Carl on 2/6/2015.
 */
var dd = {
    content: [
        { text: 'Tables', style: 'header' },
        'Official documentation is in progress, this document is just a glimpse of what is possible with pdfmake and its layout engine.',
        {
            style: 'tableExample',
            table: {
                widths: [200, '*'],
                body: [
                    ['Questions', 'Response'],
                    ['fixed-width cells have exactly the specified width', {
                        text: 'nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here',
                        italics: true,
                        color: 'gray'
                    }],
                    ['fixed-width cells have exactly the specified width', {
                        text: 'nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here nothing interesting here',
                        italics: true,
                        color: 'gray'
                    }]
                ]
            },
            layout: 'noBorders'
        }
    ],
    styles: {
        header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
        },
        subheader: {
            fontSize: 16,
            bold: true,
            margin: [0, 10, 0, 5]
        },
        tableExample: {
            margin: [0, 5, 0, 15]
        },
        tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'black'
        }
    },
    defaultStyle: {
        // alignment: 'justify'
    }
};