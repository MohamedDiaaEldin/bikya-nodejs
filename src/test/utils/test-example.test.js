const assert = require("assert");



const add_two_number = (num1, num2)=>{
    return num1  +  num2 
}






describe("Adding Two numbers ", () => {
    it("Positive Numbers", () => {
        const result = add_two_number(1,2)
        const expected = 3
        assert.equal(result, expected);
      });
    
    it("Negative Numbers", () => {
        const result = add_two_number(-5, -1)
        const expected = -6
        assert.equal(result, expected);
    });
    
});
