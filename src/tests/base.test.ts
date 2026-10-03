const sum = (a:number,b:number)=>a+b


import {expect,test} from 'vitest';


test('adds 9+1 to equal 10',()=>{
    expect(sum(9,1)).toBe(10)
})