/**
 * @require 'common/lib'
 */
var config = require('common/config');
var Link = require('./link');

var h3 = document.querySelector('h3');

h3.innerHTML = 'demo is run: ';
h3.appendChild(new Link({
    html: config.app,
    href: config.homepage
}));

