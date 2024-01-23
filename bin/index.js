#! /usr/bin/env node
const commandLineService = require('../services/commandLineService');

const startCli = async () => {
    await commandLineService.greet();
    await commandLineService.loadInputs();
    
    console.log('-----------------------------------');
}

startCli();

