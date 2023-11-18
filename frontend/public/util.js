export const sleep = (time) => new Promise(resolve => setTimeout(() => resolve(), time))

const colorMap = Object.fromEntries([
    'black', 'dark_blue', 'dark_green', 'dark_aqua', 'dark_red', 'dark_purple', 'gold', 'gray',
    'dark_gray', 'blue', 'green', 'aqua', 'red', 'light_purple', 'yellow', 'white'
].map((c, i) => [c, "§" + i.toString(16)]))
export const formatColorFromString = name => colorMap[name.toLowerCase()];
//color parser
const colors = [
    '#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#FFAA00', '#AAAAAA',
    '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'
];
export const formatColor = (data, default_color = 0) => {
    if (data == null) return 'Fail to get';
    return data.split('').reduce((ret, char, index, arr) =>
        ret += char == '§' ? '</span>' : arr[index - 1] == '§' ? '<span style="color:' + colors[parseInt(char, 16)] + '">' : char,
        '<span style="color:' + colors[default_color] + '">') + '</span>';
}

export const toDefault = (v, u, d) => v == u ? d : v;

export const formatDateTime = (date) => {
    if (date == null) return 'Fail to get';
    date = new Date(date);
    let y = date.getFullYear();
    let m = date.getMonth() + 1; //注意这个“+1”
    m = m < 10 ? ('0' + m) : m;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    let second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
};

export const formatNameString = name => name.toLowerCase().split('_').reduce((ret, word) => ret + word[0].toUpperCase() + word.slice(1) + ' ', '');

export const compairVersion = (v1, v2) => {
    //补位0，或者使用其它字符
    const ZERO_STR = '000000000000000000000000000000000000000000';
    if (v1 === v2)
        return 0;
    let len1 = v1 ? v1.length : 0;
    let len2 = v2 ? v2.length : 0;
    if (len1 === 0 && len2 === 0)
        return 0;
    if (len1 === 0)
        return 1;
    if (len2 === 0)
        return -1;
    const arr1 = v1.split('.');
    const arr2 = v2.split('.');
    const length = Math.min(arr1.length, arr2.length);
    for (let i = 0; i < length; i++) {
        let a = arr1[i];
        let b = arr2[i];
        if (a.length < b.length)
            a = ZERO_STR.substring(0, b.length - a.length) + a;
        else if (a.length > b.length)
            b = ZERO_STR.substring(0, a.length - b.length) + b;
        if (a < b)
            return 1;
        else if (a > b)
            return -1;
    }
    if (arr1.length < arr2.length)
        return 1;
    else if (arr1.length > arr2.length)
        return -1;
    return 0;
}

// Array.equals()
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
//Array.remove
Array.prototype.remove = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });
// Object.equals()
Object.prototype.equals = function (object2) {
    //For the first loop, we only check for types
    for (propName in this) {
        //Check for inherited methods and properties - like .equals itself
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
        //Return false if the return value is different
        if (this.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        }
        //Check instance type
        else if (typeof this[propName] != typeof object2[propName]) {
            //Different types => not equal
            return false;
        }
    }
    //Now a deeper check using other objects property names
    for (propName in object2) {
        //We must check instances anyway, there may be a property that only exists in object2
        //I wonder, if remembering the checked values from the first loop would be faster or not 
        if (this.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        }
        else if (typeof this[propName] != typeof object2[propName]) {
            return false;
        }
        //If the property is inherited, do not check any more (it must be equa if both objects inherit it)
        if (!this.hasOwnProperty(propName))
            continue;

        //Now the detail check and recursion

        //This returns the script back to the array comparing
        /**REQUIRES Array.equals**/
        if (this[propName] instanceof Array && object2[propName] instanceof Array) {
            // recurse into the nested arrays
            if (!this[propName].equals(object2[propName]))
                return false;
        }
        else if (this[propName] instanceof Object && object2[propName] instanceof Object) {
            // recurse into another objects
            //console.log("Recursing to compare ", this[propName],"with",object2[propName], " both named \""+propName+"\"");
            if (!this[propName].equals(object2[propName]))
                return false;
        }
        //Normal value comparison for strings and numbers
        else if (this[propName] != object2[propName]) {
            return false;
        }
    }
    //If everything passed, let's say YES
    return true;
}