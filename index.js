const nodeStaticServer = require("node-static");
const weasyprint = require('weasyprint'); 
const http = require("http");
const lodashMerge = require("lodash.merge");
const util = require("util");
const path = require("path");
const fs = require('fs');

const globalOptions = {
  serverPort: 8090,
};

module.exports = function (eleventyConfig, suppliedOptions = {}) {
  let options = lodashMerge({}, globalOptions, suppliedOptions);

  eleventyConfig.on("eleventy.after", async () => {
    console.log("hello from here")
    // Exit early if no paths supplied
    if (!options.pathsToRender || !options.pathsToRender.length > 0) {
      console.error(
        "[eleventy-plugin-weasyprint-pdf] ERROR: Provide pathsToRender as array of {htmlPath, outputPath}"
      );
      return;
    }
    
    const htmlOutputDir = options.htmlOutputDir || eleventyConfig.dir.output

    // Need to run a local web server because Prince works best with HTML URLs
    // (instead of HTML files on filesystem)
    const fileServer = new nodeStaticServer.Server(htmlOutputDir);

    const weasyServer = http.createServer(function (request, response) {
      request
        .addListener("end", function () {
          fileServer.serve(request, response);
        })
        .resume();
    });

    weasyServer.listen(options.serverPort);

    // Map through
    await Promise.all(
      options.pathsToRender.map(async ({ htmlPath, outputPath }) => {
        const fullOutputPath = path.join(htmlOutputDir, outputPath)

        console.log({fullOutputPath})

        try {
          const pdfBuffer = await weasyprint(`http://localhost:${options.serverPort}${htmlPath}`, {
            command: 'weasyprint',
            pdfVariant: 'pdf/ua-1',
          })
  
          await fs.promises.writeFile(fullOutputPath, pdfBuffer)
        } catch(err) {
          console.log("ERROR: ", util.inspect(err));
        }



      })
    );

    weasyServer.close();
  });
};
