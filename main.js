var moment = require('moment');

var myDate = new Date();
var newDate = moment(myDate).format('LL');

console.log(myDate);
console.log(newDate);