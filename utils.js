class Proto {
    constructor(name, fields, weight) {
        const reg = /^[a-zA-Z_][a-zA-Z0-9_]*/m;
        if (typeof name !== 'string') {
            throw new Error(`Proto name[${name}] is not string`);
        }
        if (!reg.test(name)) {
            throw new Error(`Proto name[${name}] Error`);
        }
        this.name = name;
        let names = new Set();
        for (let f of fields) {
            if (!f.name) {
                throw new Error(`Proto fields name[${name}] fields must have name`);
            }
            if (typeof f.name !== 'string') {
                throw new Error(`Proto fields name[${f.name}] fields must string`);
            }
            if (!reg.test(f.name)) {
                throw new Error(`Proto fields name[${f.name}] Error`);
            }
            if (!f.type) {
                throw new Error(`Proto name[${name}] fields must have type`);
            }
            if (typeof f.type !== 'string' && !(f.type instanceof Object)) {
                throw new Error(`Proto obj[${name}] field[${f.name}] type[${f.type instanceof Object}] type must be string or object`);
            }
            if (names.has(f.name)) {
                throw new Error(`Proto field name[${f.name}] exist`); 
            }
            names.add(f.name);
        }
        this.fields = fields;
        if (typeof weight !== 'number') {
            throw new Error(`Proto weight[${weight}] is not number`);
        }
        this.weight = weight;
    }
}

/**
 * 生成协议对象
 * @param {*} name 协议名
 * @param {*} fields 字段信息{name:字段名,type:字段类型,desc:备注信息}[]
 * @param {*} weight 排序权重,数字大的在上下文中顺序靠后
 */
function createProto(name, fields, weight = 0) {
    return new Proto(name, fields, weight);
}

/**
 * 翻译函数
 * @param {*} check 翻译的类型 支持基础类型String、Number、Array及context内的类型
 * @param {*} context 上下文,存放已翻译的对象类型
 */
function transType(check, context = {}) {
    let res = null;
    if (Array.isArray(check)) {
        check = check[0];
        res = transType(check, context);
        res = `Array<${res}>`;
    } else {
        let name = check.name || check;
        if (name == 'String') {
            res = 'string';
        } else if (name == 'Number') {
            res = 'number';
        } else {
            let obj = context[check.name || check];
            if (!obj) {
                throw new Error(`transArr cant find check[${check}] ERROR`)
            }
            res = obj.name;
        }
    }
    return res;
}

/**
 * 生成枚举及类型声明块
 * @param {*} obj Proto
 * @param {*} context 上下文
 * @param {*} space 格式化空格
 */
function genTsDefinitions(obj, context = {}, space = '    ') {
    if (obj.constructor !== Proto) {
        throw new Error(`genTsDefinitions obj Error ${obj}`);
    }
    const nextLine = '\r\n';
    let rows = [];
    let types = [];
    for (let index = 0; index < obj.fields.length; ++index) {
        rows.push(`${obj.fields[index].name} = ${index},  // ${obj.fields[index].desc || obj.fields[index].name}`);
        let type = '';
        let check = obj.fields[index].type;
        type = transType(check, context);
        types.push(type);
    }
    let template = `${nextLine}${space}enum ${obj.name}Fields {${nextLine}`;
    for (let str of rows) {
        template += `${space}${space}${str}${nextLine}`;
    }
    template += `${space}}`;
    let declearType = `${space}type ${obj.name} = [${types.join(',')}];${nextLine}`;
    return template + nextLine + declearType;
}

function gen(arr) {
    let context = {};
    let output = "declare namespace Protocals {";
    for (let obj of arr) {
        output += genTsDefinitions(obj, context);
        context[obj.name] = obj;
    }
    output += "}";
    return output;
}

module.exports = {
    genTsDefinitions,
    createProto,
    gen,
}