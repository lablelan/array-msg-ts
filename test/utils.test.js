const utils = require('../utils');
const { expect } = require("chai");
function codeError() {
    expect(true).to.eql(false);
}
describe('utils', function () {
    it('name error', () => {
        // 命名错误
        try {
            utils.createProto('1hi', []);
            codeError();
        } catch (error) {
            expect(error.message).to.eql('Proto name[1hi] Error');
        }
        // 命名类型错误
        try {
            utils.createProto(123, [{ name: '123', type: Number }]);
            codeError();
        } catch (error) {
            expect(error.message).to.eql('Proto name[123] is not string');
        }
    });
    it('fields error', () => {
        // 字段名错误
        try {
            utils.createProto('hi', [{ name: '123', type: Number }]);
            codeError();
        } catch (error) {
            expect(error.message).to.eql('Proto fields name[123] Error');
        }
        // 字段名类型错误
        try {
            utils.createProto('hi', [{ name: 123, type: Number }]);
            codeError();
        } catch (error) {
            expect(error.message).to.eql('Proto fields name[123] fields must string');
        }
        // 必需提供类型
        try {
            utils.createProto('hi', [{ name: 'hi123' }]);
            // 通过说明代码有问题
            codeError();
        } catch (error) {
            expect(error.message).to.eql('Proto name[hi] fields must have type');
        }
        // 类型必需为对象或字符串
        try {
            utils.createProto('hi', [{ name: 'hi123', type: 12344 }]);
            codeError();
        } catch (error) {
            expect(error.message).to.eql('Proto obj[hi] field[hi123] type[false] type must be string or object');
        }
        // 字段名重复
        try {
            utils.createProto('hi', [{ name: 'hi123', type: Number }, { name: 'hi123', type: Number }]);
            codeError();
        } catch (error) {
            expect(error.message).to.eql('Proto field name[hi123] exist');
        }
    });
    it('create', () => {
        // 正常创建
        let p1 = utils.createProto('hi', [{ name: 'hi123', type: Number }]);
        expect(p1.name).to.eql('hi');
        expect(p1.fields).to.eql([{ name: 'hi123', type: Number }]);
        expect(p1.weight).to.eql(0);
        // 正常创建 带排序权重
        let p2 = utils.createProto('hi', [{ name: 'hi123', type: Number }], 2);
        expect(p2.name).to.eql('hi');
        expect(p2.fields).to.eql([{ name: 'hi123', type: Number }]);
        expect(p2.weight).to.eql(2);
        // 正常创建 多字段 多类型
        let fields = [{ name: 'hi1', type: Number }, { name: 'hi2', type: String }, { name: 'hi3', type: Array(Number) }];
        let p3 = utils.createProto('hi', fields);
        expect(p3.name).to.eql('hi');
        expect(p3.fields).to.eql(fields);
        expect(p3.weight).to.eql(0);
    });
    it('genTsDefinitions', () => {
        let name1 = 'Hi1';
        let fields1 = [{ name: 'hi1', type: Number }];
        // 普通类型生成模版
        let p1 = utils.createProto(name1, fields1);
        let template1 = utils.genTsDefinitions(p1, {}, '');
        expect(template1).to.eq(`\r\nenum Hi1Fields {\r\nhi1 = 0,  // hi1\r\n}\r\ntype Hi1 = [number];\r\n`);
        // 数组类型生成模版
        let name2 = 'Hi2';
        let fields2 = [{ name: 'hi1', type: Array(Number) }];
        let p2 = utils.createProto(name2, fields2);
        let template2 = utils.genTsDefinitions(p2, {}, '');
        expect(template2).to.eq(`\r\nenum Hi2Fields {\r\nhi1 = 0,  // hi1\r\n}\r\ntype Hi2 = [Array<number>];\r\n`);
        // 上下文提供类型生成模版
        let name3 = 'Hi3';
        let fields3 = [{ name: 'hi1', type: 'Hi1' }];
        let p3 = utils.createProto(name3, fields3);
        let template3 = utils.genTsDefinitions(p3, { 'Hi1': p1 }, '');
        expect(template3).to.eq(`\r\nenum Hi3Fields {\r\nhi1 = 0,  // hi1\r\n}\r\ntype Hi3 = [Hi1];\r\n`);
        // 多层嵌套
        let name4 = 'Hi4';
        let fields4 = [{ name: 'hi3', type: 'Hi3' }];
        let p4 = utils.createProto(name4, fields4);
        let template4 = utils.genTsDefinitions(p4, { 'Hi3': p3 }, '');
        expect(template4).to.eq(`\r\nenum Hi4Fields {\r\nhi3 = 0,  // hi3\r\n}\r\ntype Hi4 = [Hi3];\r\n`);
        let name5 = 'Hi5';
        let fields5 = [{ name: 'hi5', type: Array('Hi3') }];
        let p5 = utils.createProto(name5, fields5);
        let template5 = utils.genTsDefinitions(p5, { 'Hi3': p3 }, '');
        expect(template5).to.eq(`\r\nenum Hi5Fields {\r\nhi5 = 0,  // hi5\r\n}\r\ntype Hi5 = [Array<Hi3>];\r\n`);
        // 找不到上下文
        let name6 = 'Hi5';
        let fields6 = [{ name: 'hi6', type: Array('Hi3') }];
        let p6 = utils.createProto(name6, fields6);
        try {
            utils.genTsDefinitions(p6, {}, '');
            codeError();
        } catch (error) {
            expect(error.message).to.eql('transArr cant find check[Hi3] ERROR');
        }
        expect(template5).to.eq(`\r\nenum Hi5Fields {\r\nhi5 = 0,  // hi5\r\n}\r\ntype Hi5 = [Array<Hi3>];\r\n`);
    });
    it('gen', () => {
        let p1 = utils.createProto('Hi1', [{ name: 'hi1', type: Number }]);
        let p2 = utils.createProto('Hi2', [{ name: 'hi1', type: Array(Number) }]);
        let p3 = utils.createProto('Hi3', [{ name: 'hi1', type: 'Hi1' },{ name: 'hi2', type: 'Hi2' }]);
        let output = utils.gen([p1,p2,p3]);
        const line = '\r\n';
        const space = '    ';
        expect(output).to.eql(`declare namespace Protocals {${line}${space}enum Hi1Fields {${line}${space}${space}hi1 = 0,  // hi1${line}${space}}${line}${space}type Hi1 = [number];${line}${line}${space}enum Hi2Fields {${line}${space}${space}hi1 = 0,  // hi1${line}${space}}${line}${space}type Hi2 = [Array<number>];${line}${line}${space}enum Hi3Fields {${line}${space}${space}hi1 = 0,  // hi1${line}${space}${space}hi2 = 1,  // hi2${line}${space}}${line}${space}type Hi3 = [Hi1,Hi2];${line}}`);
    })
})