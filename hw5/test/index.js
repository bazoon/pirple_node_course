const assert = require('assert');
const lib = require('../app/lib');

class Tests {
    constructor() {
        this.tests = [];
    }

    check(should, fn) {
        this.tests.push({
            description: should,
            fn: fn
        });
    }

    run() {
        let successes = [];
        let fails = [];
        this.tests.forEach((test) => {

            try {
                
                test.fn(() => {
                    // success
                    successes.push(test.description);
                });

            } catch (error) {
                fails.push([test.description, error]);
            }

        });

        successes.forEach(function (testName) {
            console.log('\x1b[32m%s\x1b[0m',testName);
        })

        fails.forEach(function ([testName, error]) {
            console.log('\x1b[31m%s\x1b[0m', testName);
            console.log(error); 
        });
    }
}

const testSuite = new Tests();

// Palindrome
testSuite.check('aha is palindrome', function (done) {
   assert.ok(lib.isPalindrome('aha'));
   done();
});

testSuite.check('asdffdsa is palindrome', function (done) {
    assert.ok(lib.isPalindrome('asdffdsa'));
    done();
 });
 
testSuite.check('foo is not palindrome', function (done) {
    assert.ok(!lib.isPalindrome('foo'));
    done();
});

testSuite.check('mamba is not palindrome', function (done) {
    assert.ok(!lib.isPalindrome('mamba'));
    done();
});

// Square equations
testSuite.check('100*x^2 + x + 20 is not solvable', function (done) {
    assert.ok(!lib.quadraticEquation(100, 1, 20));
    done();
});

testSuite.check('2*x^2 - 20*x + 20 has two roots', function (done) {
    assert.ok(lib.quadraticEquation(2, -20, 20).length === 2);
    done();
});

testSuite.check('25*x^2 + 10*x + 1 has one root', function (done) {
    assert.ok(lib.quadraticEquation(25, 10, 1) === - 0.2);
    done();
});

// Random numbers

testSuite.check('random number in [0, 10] range', function (done) {
    const i = lib.getRandomNumber(0, 10);
    assert.ok(i >= 0 && i <= 10);
    done();
});

testSuite.check('probability of number in range is 16.6', function (done) {
    let count = 0
    
    for (let i = 0; i < 1000; i++) {
        let r = lib.getRandomNumber(1, 6);
        if (r === 4) count++;
    }
    
    const ratio = count / 1000;
    
    assert.ok(ratio > 0.1 && ratio < 0.2);
    done();
});


testSuite.run();
