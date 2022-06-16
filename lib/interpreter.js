class Interpreter {
    parseTree = []
    isFunctionRunning = false;

    constructor(parseTree){
        this.parseTree = parseTree;
        // console.log(JSON.stringify(parseTree, null, 2));
    }

	callOperators = {
		"+": function (a, b) { return a + b; },
		"-": function (a, b) {
			if (typeof b === "undefined") return -a;
			return a - b;
		},
		"*": function (a, b) { return a * b; },
		"/": function (a, b) { return a / b; },
		"%": function (a, b) { return a % b; },
		"^": function (a, b) { return Math.pow(a, b); }
	};

	variables = {
		e: Math.E,
        pi: Math.PI,
	};

	functions = {
        print: function (v) {
			console.log(v)
			return v;
		},
		sin: Math.sin,
		cos: Math.cos,
		tan: Math.cos,
		asin: Math.asin,
		acos: Math.acos,
		atan: Math.atan,
		abs: Math.abs,
		round: Math.round,
		ceil: Math.ceil,
		floor: Math.floor,
		log: Math.log,
		exp: Math.exp,
		sqrt: Math.sqrt,
		max: Math.max,
		min: Math.min,
		random: Math.random,
	};

	args = {};

	parseNode(node) {
		let _this = this
		if (node.type === "number") return node.value;
		else if (node.type === "string") return node.value;
        else if (node.type === "function") {
			this.functions[node.name] = function () {
				for (var i = 0; i < node.args.length; i++) {
					_this.args[node.args[i].value] = arguments[i];
				}

				let pTree = node.value;
				let ret;
				for (var i = 0; i < pTree.length; i++) {
					var value = _this.parseNode(pTree[i], i);
					// if (typeof value !== "undefined" && pTree[i].name == "print") output += value + "\n";
					ret = value;
				}
				
				// var ret = hitStatement(node.value);				
				// console.log(args)
				_this.args = {};
				
				return ret;
			};
		}
		else if (node.type === "return") {
			// console.log(node)
			return this.parseNode(node.value);
		}
		else if (this.callOperators[node.type]) {
			if (node.left) return this.callOperators[node.type](this.parseNode(node.left), this.parseNode(node.right));
			return this.callOperators[node.type](this.parseNode(node.right));
		}
		else if (node.type === "identifier") {
			// console.log(args)
			var value = this.args.hasOwnProperty(node.value) ? this.args[node.value] : this.variables[node.value];
			if (!this.isFunctionRunning && typeof value === "undefined") throw node.value + " is undefined";
			return value;
		}
		else if (node.type === "assign") {
			this.variables[node.name] = this.parseNode(node.value);
		}
		else if (node.type === "call") {
			for (var i = 0; i < node.args.length; i++) {
				node.args[i] = this.parseNode(node.args[i]);
			}
			this.isFunctionRunning = true;
			
			let output = this.functions[node.name].apply(null, node.args);
			// console.log(node, output)
			this.isFunctionRunning = false;
			return output;
			
		}
	};

	hitStatement(pTree) {
		var output = "";
		for (var i = 0; i < pTree.length; i++) {
			var value = this.parseNode(pTree[i]);
			if (typeof value !== "undefined" && pTree[i].name == "print") output += value + "\n";
		}
		return output;
	}

    get() {
        return this.hitStatement(this.parseTree);
    }
};

export default Interpreter;