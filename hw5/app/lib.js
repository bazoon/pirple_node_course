module.exports = {
    isPalindrome: function (s) {
        if (typeof s !== 'string') return false;
        const a = s.split('');
        for (let i =0; i < a.length / 2; i++) {
            if (a[i] !== a[a.length - 1 - i]) {
                return false;
            } 
        }
        
        return true;
    },
    quadraticEquation: function (a, b, c) {
        const d = b * b - 4 * a * c;
        if (d > 0) {
            let x1 = (-b + Math.sqrt(d)) / (2 * a)
            let x2 = (-b - Math.sqrt(d)) / (2 * a)
            return [x1, x2];
        } else if (d == 0) {
            console.log(b,a)
            return -b / (2 * a);
        } 
        
        return undefined;
    },
    getRandomNumber: function (start = 1, end = 10) {
        return parseInt(Math.random() * end) % (end-start+1) + start;
    }
};