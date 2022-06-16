import * as fs from 'fs';

class Lexer {
    input = "";
    tokens = [];

    constructor(input) {
        this.input = input;
        this.scanInput();
    }

    get() {
        return this.tokens;
    }
    
	checkOperator(c) {
        return /[+\-*\/\^%=():,]/.test(c);
    }

    checkDigit(c) {
        return /[0-9]/.test(c);
    }

    checkWhiteSpace(c) {
        return /\s/.test(c);
    }

    checkWord(c) {
        return typeof c === "string" && c != ';' && !this.checkOperator(c) && !this.checkWhiteSpace(c);
    }

    checkIdentifier(c) {
        return /^\w+$/.test(c) && !this.checkOperator(c) && !this.checkWhiteSpace(c);
    }

    checkString(c) {
        return /'(.*?)'|"(.*?)"/g.test(c);
    }
	
    pushToken = function (type, value) {
		this.tokens.push({
			type: type,
			value: value
		});
		// console.log(this.tokens)
	};

	scanInput() {
		let  c, 
			_this = this,
			i = 0;

		let nextChar = function() {
			return c = _this.input[++i];
		};
		
        while (i < this.input.length) {
            c = this.input[i];
            if (this.checkWhiteSpace(c)) nextChar();
            else if (this.checkOperator(c)) {
                this.pushToken(c);
                nextChar();
            }
            else if (this.checkDigit(c)) {
                var num = c;
                while (this.checkDigit(nextChar())) num += c;
                if (c === ".") {
                    do num += c; while (this.checkDigit(nextChar()));
                }
                num = parseFloat(num);
                if (!isFinite(num)) throw "Number is too large or too small for a 64-bit double.";
                this.pushToken("number", num);
            }
            else if (this.checkWord(c)) {
                var idn = c;
                while (this.checkWord(nextChar()) || ( !this.checkString(idn) && 
                    (
                        (idn.slice(0,1) === "\"" && c == " ") || 
                        (idn.slice(0,1) === "'" && c == " ")
                    ))
                ) idn += c;
                // console.log('[' + idn + ']')
                if(this.checkIdentifier(idn)) {
                    // console.log('a', idn)
                    this.pushToken("identifier", idn);
                }
                else if(idn.slice(0,1) === "\"" && idn.slice(-1) === "\"") {
                    // console.log('s', idn)
                    this.pushToken("string", idn.slice(1, -1));
                }
                else if(idn == ">>") {
                    // console.log('r', idn)
                    this.pushToken("return");
                    nextChar();
                }
                else throw "Unrecognized token. " + idn + "ss";
            }
            else if(c == ";") {
                this.pushToken('end_fn', c);
                nextChar();
            }
            else throw "Unrecognized token. " + c;
        }
        this.pushToken("(end)");
        
        return this.tokens;
    }
};

export default Lexer;