const puppeteer = require("puppeteer");
const fs=require("fs");
const path = require("path");

const getExamples = async (prob_link) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto(prob_link, {
    waitUntil: "domcontentloaded",
  });

  // Waiting for the dynamic content to load.
  try {
    await page.waitForSelector(".elfjS pre", { timeout: 5000 }); // Waiting for a <pre> tag within .elfjS
  }catch (error) {
    console.error("Examples did not load within the expected time.");
  }

  // Extract the examples.
  const examples = await page.evaluate(() => {
    const container = document.querySelector(".elfjS");
    if (!container) return [];

    try{
      const exampleBlocks = container.querySelectorAll(".example-block");
      if (exampleBlocks.length > 0){
        return Array.from(container.querySelectorAll(".example-block"), (block) =>
          Array.from(block.querySelectorAll("p")).map((p) => p.textContent.trim()).join("\n")
        );
      }
      
    }catch(error){
      console.log(error);
    }

    try{
      const preElements = container.querySelectorAll("pre");
      if(preElements){
        return Array.from(preElements).map((pre) => pre.innerText.trim());
      }
      
    }catch(error){
      console.log(error);
    }
    
    
    
  });
  console.log(examples);
  // Directory to save the files
  const inputDir = path.join(__dirname, "inputs");
  const outputDir = path.join(__dirname, "outputs");

  // Ensure the directories exist
  [inputDir, outputDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Save each example to separate files
  examples.forEach((example, index) => {
    // Split the example into lines and filter out empty lines
    const parts = example.split("\n").filter(Boolean);
    console.log(parts);
  
    let inputLine = '';
    let outputLine = '';
    let inputStarted = false;
    let outputStarted = false;

    // Iterate through the parts to capture both Input and Output blocks
    for (let line of parts) {
      if (line.startsWith("Input:")) {
        inputStarted = true;
        inputLine = line.replace('Input:', '').trim();  // Capture the first line of Input
      } else if (!line.startsWith("Output:") && inputStarted) {
        // Continue collecting lines for the Input block
        inputLine += '\n' + line.trim();
        console.log(inputLine);
      } else if (line.startsWith("Output:")) {
        outputStarted = true;
        outputLine = line.replace('Output:', '').trim();  // Capture the first line of Output
        inputStarted = false; // Stop collecting input
      }else if (outputStarted && !line.startsWith("Explanation:")) {
        // Continue collecting lines for the Output block
        outputLine += '\n' + line.trim();
      }else if(line.startsWith("Explanation:")){
        outputStarted = false;
      }
    }
  
    // Extract the content after "Input:" and "Output:"
    const input = inputLine ? inputLine.replace("Input:", "").trim() : "No input found";
    const output = outputLine ? outputLine.replace("Output:", "").trim() : "No output found";
  
    // Define file names
    const inputFileName = path.join(inputDir,`example${index + 1}_input.txt`);
    const outputFileName = path.join(outputDir,`example${index + 1}_output.txt`);
  
    // Write input to a file
    try {
      fs.writeFileSync(inputFileName, input);
      console.log(`Input file created: ${inputFileName}`);
    } catch (err) {
      console.error(`Error writing input file for example ${index + 1}:`, err);
    }

    // Write output to a file
    try {
      fs.writeFileSync(outputFileName, output);
      console.log(`Output file created: ${outputFileName}`);
    } catch (err) {
      console.error(`Error writing output file for example ${index + 1}:`, err);
    }
  });
  await browser.close();
  return examples;
};

module.exports = { getExamples };
