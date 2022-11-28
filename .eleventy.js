const WeasyprintPlugin = require('./index');

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(WeasyprintPlugin, {
        pathsToRender: [{
            htmlPath: '/',
            outputPath: '/index.pdf'
        }]
    })

    return {
        dir: {
            input: 'test-input',
            output: 'test-output'
        }
    }
}