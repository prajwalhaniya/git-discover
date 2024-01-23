#! /usr/bin/env node
const commandLineService = require('../services/commandLineService');

const startCli = async () => {
    await commandLineService.greet();
    
    console.log('-----------------------------------');
    console.log('PERFORMING gidi SERVICES');
    console.log('-----------------------------------');
    
    await commandLineService.loadInputs();
    
    console.log('-----------------------------------');
}

startCli();

