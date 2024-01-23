const { Octokit } = require('octokit');
const configServices = require('./configServices');
const fs = require('fs').promises;

module.exports = {
    getAllCommits: async (since, until) => {
        try {
            const config = await configServices.getConfig();
            console.log({ config });
            const octokit = new Octokit();
            const commits = await octokit.request(`Get /repos/${config.owner}/${config.repo}/commits?since=${since}&until=${until}`, {
                owner: config.owner,
                repo: config.repo,
                ref: config.ref,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })

            if (commits?.data.length) {
                const commitsArr = [];
                const commitsColouredArr = [];

                for (let i = 0; i < commits?.data.length; i++) {
                    const commit = commits?.data[i];
                    
                    const obj = {
                        index: i,
                        sha: commit.sha,
                        message: commit?.commit?.message
                    }
                    

                    commitsArr.push(obj);
                }
                await fs.writeFile(config.fileSource, JSON.stringify(commitsArr), (err) => {
                    if (err) {
                        console.log('Error while writing to the file', err);
                    }
                    console.log('Successfully written to the file');
                })
                return { success: true, commits: commitsArr };
            }
            return { success: true, message: [] };
        } catch (error) {
            console.log('error while getting all the commits', error);
            return { success: false, message: 'Error while getting all the commits' };
        }
    }
}
