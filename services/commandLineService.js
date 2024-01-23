const yargs = require('yargs');
const shell = require('shelljs');
const commitService = require('./commitService');
const colors = require('colors');
const TableLayout = require('table-layout');

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
                        type: 'string'
                    })
                    .argv;
    
    
                if (argv.list) {
                    console.log('Available options:');
                    console.log('--getCommits, -gc: get all the commits, pass [since_date, until_date]');
                    console.log('--goto, -gt: go back in time where the project was', )
                }
    
                if (argv.getCommits) {
                    const dateInputs = argv.getCommits;
                    if (dateInputs?.length) {
                        const since = dateInputs[0];
                        const until = dateInputs[1];
                        await self.getCommits(since, until);
                    } else {
                        console.log('Please specify dates since & until');
                    }
                }

                if (argv.goto) {
                    await self.goto(argv.goto);
                }
            } catch (error) {
                console.log('Error while getting the input from user', error);
                return { success: false, message: 'Error while getting the input from the user' };
            }
    },

    getCommits: async (since, until) => {
        try {
            const commits = await commitService.getAllCommits(since, until);
            if (commits?.success) {
                const table = new TableLayout(commits?.message, {
                    maxWidth: 80,
                    columns: [
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

                console.log('===================================================');
                console.log(table.toString());
                console.log('===================================================');
                return commits?.message;
            }
            return []
        } catch (error) {
            console.log('Error while getting the commits', error);
            return [];
        }
    },

    goto: async (commitHash) => {
        try {
            if (!shell.which('git')) {
                shell.echo('Sorry, this script requires git');
                shell.exit(1);
            }
            shell.exec(`git checkout ${commitHash}`);
        } catch (error) {
            console.log('Error while going back to the particular commit', error);
            return { success: false, message: 'Error while going back in time' };
        }
    }
}