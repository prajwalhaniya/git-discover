const { Octokit } = require('octokit');
const colors = require('colors');

module.exports = {
    getAllCommits: async (since, until) => {
        try {
            const octokit = new Octokit();
            const commits = await octokit.request(`Get /repos/expressjs/express/commits?since=${since}&until=${until}`, {
                owner: 'expressjs',
                repo: 'express',
                ref: 'head/master',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })

            if (commits?.data.length) {
                const commitsArr = [];

                for (let i = 0; i < commits?.data.length; i++) {
                    const commit = commits?.data[i];
                    const obj = {
                        sha: colors.green(commit.sha),
                        message: colors.yellow(commit?.commit?.message)

                    }
                    commitsArr.push(obj);
                }

                return { success: true, message: commitsArr }
            }
            return { success: true, message: [] };
        } catch (error) {
            console.log('error while getting all the commits', error);
            return { success: false, message: 'Error while getting all the commits' };
        }
    }
}