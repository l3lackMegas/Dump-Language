#!/usr/bin/env node

// Dependencies
import * as fs from 'fs';

// Library
import Lexer from './lib/lexer.js'
import Parser from './lib/parser.js'
import Interpreter from './lib/interpreter.js'

var evalute = function (input) {
    try {
        var tokens = (new Lexer(input)).get();
        console.log(tokens)
        var parseTree = (new Parser(tokens)).analyze();
        // console.log(JSON.stringify(parseTree, null, 2));
        var output = (new Interpreter(parseTree)).get();
        return output;
    } catch (e) {
        return e;
    }
};

if(!process.argv[2]) {
    console.log("Please provide your file path.");
    process.exit();
}

const scriptFile = fs.readFileSync(process.argv[2], 'utf8');
evalute(scriptFile);