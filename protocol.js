const {createProto} = require('./utils');
let arr = [
    createProto('test', [
        { name: 't1', type: Number, desc: "测试字段" },
    ]),
];
arr.sort((a,b)=>a.weight-b.weight); 
module.exports = arr;