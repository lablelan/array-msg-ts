# array-msg-ts
generalize ts array-msg definetion
# define struct
- define on protocal.js
```js
let arr = [
    createProto('test', [
        { name: 't1', type: Number, desc: "测试字段" },
    ]),
];
```
# run
```
npm run gen
```
#result
- protocal.d.ts
```
declare namespace Protocals {
    enum testFields {
        t1 = 0,  // 测试字段
    }
    type test = [number];
}
```
