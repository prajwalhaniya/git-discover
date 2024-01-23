const yargs = require('yargs');
const shell = require('shelljs');
const commitService = require('./commitService');
const colors = require('colors');
const fs = require('fs').promises;
const TableLayout = require('table-layout');
const configServices = require('./configServices');


const self = module.exports = {
    greet: async () => {
        try {
            console.log('-----------------------------------');
            console.log(`${colors.red('gidi')} CLI!`);
            console.log('-----------------------------------');
            return { success: true, message: 'Greet Success!' };  
        } catch (error) {
            console.log('Error while greeting', error);
            return { success: false, message: 'Error while greeting' };
        }
    },

    loadInputs: async () => {
            try {
                const argv = yargs
                    .option('config', {
                        alias: 'c',
                        description: 'add config details',
                        type: 'array'
                    })
                    .option('list', {
                        alias: 'l',
                        description: 'List all options',
                        type: 'boolean',
                        default: false,
                    })
                    .option('getCommits', {
                        alias: 'gc',
                        description: 'Get commits by selected dates',
                        type: 'array',
                        default: false
                    })
                    .option('goto', {
                        alias: 'gt',
                        describe: 'Select a commit hash to go back in time',
                        type: 'number'
                    })
                    .option('listCommits', {
                        alias: 'lc',
                        describe: 'Lists previously fetched commits',
                        type: 'boolean',
                        default: false
                    })
                    .argv;
    
                
                if (argv.config) {
                    await self.addToGidiConfigFile(argv.config);
                }
                if (argv.list) {
                    console.log('Available options:');
                    console.log('--getCommits, -gc: get all the commits, pass [since_date, until_date]');
                    console.log('--goto, -gt: go back in time where the project was', )
                }
    
                if (argv.getCommits) {
                    const dateInputs = argv.getCommits;
                    if (dateInputs?.length === 2) {
                        const since = dateInputs[0];
                        const until = dateInputs[1];
                        await self.getCommits(since, until);
                    }
                }

                if (argv.goto) {
                    await self.goto(argv.goto);
                }

                if (argv.listCommits) {
                    await self.listCommits();
                }
            } catch (error) {
                console.log('Error while getting the input from user', error);
                return { success: false, message: 'Error while getting the input from the user' };
            }
    },

    addToGidiConfigFile: async (arr) => {
        if (!arr?.length < 3) {
            const config = {
                owner: arr[0],
                repo: arr[1],
                ref: arr[2],
                configSource: 'node_modules/git-discover/config/gidi_config.json',
                fileSource: 'node_modules/git-discover/temp/commits.json'
            }
            await fs.writeFile('config/gidi_config.json', JSON.stringify(config));
            console.log(colors.green('Configuration added'));
            return { success: true, message: 'Configuration added' };
        } else {
            console.log('Please pass all the required arguments: owner, repo & ref');
            return { success: false, message: 'Error while adding the configuration file' };
        }
    },

    createCommitsInTable: async (commits) => {
        if (commits?.length) {
            const colouredCommits = [];

            for (let i = 0; i < commits.length; i++) {
                const commit = commits[i];
                const obj = {
                    index: i,
                    sha: colors.green(commit.sha),
                    message: colors.yellow(commit?.message)
                }
                colouredCommits.push(obj);
            }

            const table = new TableLayout(colouredCommits, {
                maxWidth: 80,
                columns: [
                    {
                        name: 'Sl.no',
                        get: cellValue => (cellValue.index)
                    },
                    {
                        name: 'Commit hash',
                        get: cellValue => (cellValue.sha)
                    },
                    {
                        name: 'Message',
                        get: cellValue => (cellValue.message)
                    }
                ]
            });

            return table;
        }
        return [];
    },

    fetchCommitsFromTemp: async () => {
        const config = await configServices.getConfig();
        const commitsString = await fs.readFile(config.fileSource, 'utf-8')
        const parsedCommits = JSON.parse(commitsString);
        return parsedCommits;
    },

    getCommits: async (since, until) => {
        try {
            const commits = await commitService.getAllCommits(since, until);
            if (commits?.success) {
                const parsedCommits = await self.fetchCommitsFromTemp();
                const table = await self.createCommitsInTable(parsedCommits);
                console.log('===================================================');
                console.log(table.toString());
                console.log('===================================================');
                return commits?.commits;
            }
            return []
        } catch (error) {
            console.log('Error while getting the commits', error);
            return [];
        }
    },

    goto: async (commitIndex) => {
        try {
            if (!shell.which('git')) {
                shell.echo('Sorry, this script requires git');
                shell.exit(1);
            }
            const commits = await self.fetchCommitsFromTemp();
            const commitBasedOnIndex = commits.filter(commit => commit.index === commitIndex);

            const commitData = commitBasedOnIndex[0];
            console.log({ commitData });
            shell.exec(`git checkout ${commitData.sha}`);
        } catch (error) {
            console.log('Error while going back to the particular commit', error);
            return { success: false, message: 'Error while going back in time' };
        }
    },

    listCommits: async () => {
        try {
            const config = await configServices.getConfig();
            const commitsString = await fs.readFile(config.fileSource, 'utf-8')
            const commits = JSON.parse(commitsString);
            const table = await self.createCommitsInTable(commits);
            console.log('===================================================');
            console.log(table.toString());
            console.log('==================================================='); 
        } catch (error) {
            console.log('Error while listing all the commits', error);
            return { success: false, message: 'Error while listing all the commits' };
        }
    }
}
