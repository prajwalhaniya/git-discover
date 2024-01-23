const fs = require('fs').promises;

module.exports = {
    getConfig: async () => {
        try {
            const parsedConfig = await fs.readFile('node_modules/git-discover/config/gidi_config.json');
            config = JSON.parse(parsedConfig);
            return config;
        } catch (error) {
            console.log('Error while getting the configurations', error);
            return { success: false, message: 'Error while getting the configurations' }
        }
    }
}