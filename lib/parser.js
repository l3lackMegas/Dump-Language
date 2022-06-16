class Parser {
    
    tokens = []
    symbols = {}

    constructor(tokens) {
        this.tokens = tokens;
    }

	registerSymbol(id, nullDenotation, leftBindingPower, leftDenotation) {
		var sym = this.symbols[id] || {};
		this.symbols[id] = {
			leftBindingPower: sym.leftBindingPower || leftBindingPower,
			nullDenotation: sym.nullDenotation || nullDenotation,
			leftDenotation: sym.leftDenotation || leftDenotation
		};
		// console.log(id, this.symbols[id])
	}

	interpretToken(token) {
		if(!token) return null;
		var sym = Object.create(this.symbols[token.type]);
		sym.type = token.type;
		sym.value = token.value;
		return sym;
	}


	analyze() {
		let _this = this;

		let ruleInfix = function(id, leftBindingPower, rightBindingPower, leftDenotation) {
			rightBindingPower = rightBindingPower || leftBindingPower;
			_this.registerSymbol(id, null, leftBindingPower, leftDenotation || function (left) {
				
				let out = {
					type: id,
					left: left,
					right: expression(rightBindingPower)
				};
				// console.log(out)
				return out
			});
		}
		let rulePrefix = function(id, rightBindingPower) {
			
			_this.registerSymbol(id, function () {
				return {
					type: id,
					right: expression(rightBindingPower)
				};
			});
		}

		var i = 0, token = function () { return _this.interpretToken(_this.tokens[i]); };
        var advance = function () { i++; return token(); };

        var expression = function (rightBindingPower) {
            var left, t = token();
            advance();
            if(!token()) throw "Unexpected the end of script.";
            if (!t.nullDenotation) throw "Unexpected token: " + t.type;
            left = t.nullDenotation(t);
            // console.log(rightBindingPower, token())
            while (rightBindingPower < token().leftBindingPower) {
                t = token();
                advance();
                if (!t.leftDenotation) throw "Unexpected token: " + t.type;
                left = t.leftDenotation(left);
            }
            return left;
        }

        this.registerSymbol(",");
        this.registerSymbol(")");
        this.registerSymbol("(end)");
        this.registerSymbol(",");

        this.registerSymbol("return", function (ret) {
            // advance();
            return expression(2);
        });

        this.registerSymbol("end_fn", function (end_fn) {
            return end_fn;
        });

        this.registerSymbol("number", function (number) {
            return number;
        });

        this.registerSymbol("string", function (str) {
            return str;
        });

        this.registerSymbol("identifier", function (name) {
            if (token().type === "(") {
                var args = [];
                if (_this.tokens[i + 1].type === ")") advance();
                else {
                    do {
                        advance();
                        args.push(expression(2));
                    } while (token().type === ",");
                    if (token().type !== ")") throw "Expected closing parenthesis ')'";
                }
                advance();
                return {
                    type: "call",
                    args: args,
                    name: name.value
                };
            }
            return name;
        });

        this.registerSymbol("(", function () {
            let value = expression(2);
            if (token().type !== ")") throw "Expected closing parenthesis ')'";
            advance();
            return value;
        });

        rulePrefix("-", 7);
        ruleInfix("^", 6, 5);
        ruleInfix("*", 4);
        ruleInfix("/", 4);
        ruleInfix("%", 4);
        ruleInfix("+", 3);
        ruleInfix("-", 3);

        ruleInfix("=", 1, 2, function (left) {
            if (left.type === "identifier") {
                return {
                    type: "assign",
                    name: left.value,
                    value: expression(2)
                };
            }
            else if (left.type === "call") {
                throw "Invalid define function: " + left.name;
            }
            else {
                throw "Invalid value";
            }
        });

        ruleInfix(":", 1, 2, function (left) {
            if (left.type === "call") {
                for (var i = 0; i < left.args.length; i++) {
                    if (left.args[i].type !== "identifier") throw "Invalid argument name";
                }

                let actionTree = [];
                while (token().type !== "end_fn") {
                    
                    // console.log(exp)
                    actionTree.push(expression(0));
                }
                advance()

                // console.log(actionTree)

                
                let out = {
                    type: "function",
                    name: left.name,
                    args: left.args,
                    // actionTree: actionTree,
                    value: actionTree
                };

                // console.log(out)

                return out;
            }
            else throw "Invalid value";
        });

        // console.log(this.symbols)

        var parseTree = [];
        while (token().type !== "(end)") {
            // console.log(token())
            let exp = expression(0);
            // console.log(exp)
            parseTree.push(exp);
        }
        return parseTree;
    }
};

export default Parser;