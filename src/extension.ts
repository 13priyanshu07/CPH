// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {exec} from "child_process";

type testCaseError={
  err: string;
  message: string;
};

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension CPH is now active!');
  let flag=true;
  const errors: testCaseError[] = [];

  const createWorkspaceCommand = vscode.commands.registerCommand(
    "CPH.fetchTestCases",
    async () => {
      try {
        const prob_link = await vscode.window.showInputBox({
          prompt: "Enter your message",
          placeHolder: "Type your message here",
          value: "Default value", 
          validateInput: (text) => {
            if (text && text.length > 0) {
              return null; // Valid input
            } else {
              return "Input cannot be empty"; 
            }
          }
        });

        if (!prob_link) {
          vscode.window.showErrorMessage("Problem link is required. Reload the window before running the command again.");
          return;
        }
        if(!prob_link.includes("https://leetcode.com/problems")){
          vscode.window.showErrorMessage("Provided link is not of a Leetcode Problem");
          return;
        }
        // Remove input and output directory if it already exists
        if(fs.existsSync(path.join(__dirname, "../outputs"))){
          fs.rm(path.join(__dirname, "../outputs"), { recursive: true, force: true }, (err) => {
            if (err) {
              console.error('Error removing directory:', err);
            } else {
              console.log('Directory removed successfully');
            }
          });
        }
        if(fs.existsSync(path.join(__dirname, "../inputs"))){
          fs.rm(path.join(__dirname, "../inputs"), { recursive: true, force: true }, (err) => {
            if (err) {
              console.error('Error removing directory:', err);
            } else {
              console.log('Directory removed successfully');
            }
          });
        }
        
        // Dynamically import the web-scraping code
        const { getExamples } = require("../index.js");

        // Run the web scraper
        const examples = await getExamples(prob_link);

        // Inform the user of successful completion
        vscode.window.showInformationMessage("Test cases retrieved successfully!");

        // Prompt user to select their preferred programming language
        const languages = ["Python", "C++"];
        const selectedLanguage = await vscode.window.showQuickPick(languages, {
          placeHolder: "Select your preferred programming language",
        });

        if (!selectedLanguage) {
          vscode.window.showErrorMessage("Programming language selection is required.");
          return;
        }

        // Define templates and file extensions for each language
        const templates: { [key: string]: { extension: string; template: string } } = {
          Python: {
            extension: "py",
            template: `#import all the import packages. \nclass Solution(object):`,
          },
          "C++": {
            extension: "cpp",
            template: `// import all the import packages. \nclass Solution {}`,
          },
        };
        const { extension, template } = templates[selectedLanguage];

        // Create and open a new file with the appropriate template
        const doc = await vscode.workspace.openTextDocument({
          language: selectedLanguage === "C++" ? "cpp" : selectedLanguage.toLowerCase(), // Language ID for syntax highlighting
          content: template,
        });
        
        await vscode.window.showTextDocument(doc);

      } catch (error) {
        console.error("Error while running the web scraper:", error);
        vscode.window.showErrorMessage(
          "An error occurred while fetching the example. Check the console for details."
        );
      }
    }
  );

  // Command: Run test cases against user-written code
  const runTestCasesCommand = vscode.commands.registerCommand(
    "CPH.runTestCases",
    async () => {
      let outputs: string[][] = [];
      try {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
          vscode.window.showErrorMessage("No active editor found. Please write your code first.");
          return;
        }

        const userCode = activeEditor.document.getText();
        const languageId = activeEditor.document.languageId;
        
        const inputDir = path.join(__dirname, "../inputs");
        if (!fs.existsSync(inputDir)) {
          vscode.window.showErrorMessage("Input files not found. Please retrieve test cases first.");
          return;
        }

        const inputFiles = fs.readdirSync(inputDir);

        const tempCodeFile = path.join(__dirname, `temp_code.${languageId}`);
        fs.writeFileSync(tempCodeFile, userCode);

        const runCommandMap: { [key: string]: (inputPath: string) => string } = {
          python: (inputPath) => `python ${tempCodeFile} < ${inputPath}`,
          cpp: (inputPath) =>
            `g++ ${tempCodeFile} -o ${path.join(__dirname, "temp_code")} && ${path.join(
              __dirname,
              "temp_code"
            )} < ${inputPath}`,
        };

        if (!runCommandMap[languageId]) {
          vscode.window.showErrorMessage(`Unsupported language: ${languageId}. You can use Python, C++ or Java.`);
          return;
        }

        const processTestCase = (inputFilePath: string, testCaseNumber: number): Promise<void> => {
          return new Promise((resolve, reject) => {
            let inputContent = fs.readFileSync(inputFilePath, "utf-8");
  
            // Preprocess the input to extract relevant values (e.g., remove "x=")
            inputContent = inputContent
              .split("=") // split using =
              .map((part) => part.trim()) //removing whitespaces from both sides
              .slice(1) // remove the first variable name
              .map((segment) => {
                const parts = segment.split(" "); // Split by " " 
                
                  let value = parts[0];

                  // Remove commas from the end
                  if (value.endsWith(",")) {
                    value = value.slice(0, -1);
                  }

                  value=value.trim(); // Removing blank spaces
                  
                  // Check for array (list) format with brackets
                  if (value.startsWith("[") && value.endsWith("]")) {
                    value = value.slice(1, -1); // Remove surrounding brackets
                    // Checking for 2-D arrays
                    if(value.startsWith("[") && value.endsWith("]")){                    
                      value = value
                        .split("],") // Making the 2D array a multiple line input
                        .map((item) =>{
                          const element = item.trim();
                          
                          // Remove opening brackets quotes if present
                          if(element.startsWith("[") && element.endsWith("]")){
                            return element.slice(1,-1);
                          }else if(element.startsWith("[")){
                            return element.slice(1);
                          }
                          return element;
                        })
                        .join("\n");
                    }
                    
                    value = value
                      .split("\n")
                      .map((line) => {
                        
                        line = line                       
                        .split(",") // Split by commas
                        .map((item) => {
                          const element = item.trim();
                          
                          // Remove surrounding quotes if present
                          if (
                            (element.startsWith('"') && element.endsWith('"')) ||
                            (element.startsWith("'") && element.endsWith("'"))
                          ) {
                            return element.slice(1, -1); // Remove quotes
                          }
                          return element;
                        })
                        .join(" "); // Join processed elements with spaces
                        return line;
                      })
                      .join("\n"); // Join multiple lines if present
                      
                  } else {
                    // Remove surrounding quotes for single values
                    if (
                      (value.startsWith('"') && value.endsWith('"')) ||
                      (value.startsWith("'") && value.endsWith("'"))
                    ) {
                      value = value.slice(1, -1); // Remove quotes
                    }
                  }
                  return value; // Return the cleaned value
                
                 
              })
              .join("\n");
               
            console.log(`Processed input for test case ${testCaseNumber}:\n${inputContent}`);
  
            // Write the processed input to a temporary file for redirection
            const tempInputFile = path.join(__dirname, `temp_input_${testCaseNumber}.txt`);
            fs.writeFileSync(tempInputFile, inputContent);
  
            const runCommand = runCommandMap[languageId](tempInputFile);
  
            exec(runCommand, (error, stdout, stderr) => {
              if (error || stderr) {
                console.error(`Error running test case ${testCaseNumber}:`, error || stderr);
                errors.push({err: "Error encountered while running test case", message: (error as Error).message });
                flag=false;
                reject(`Test case ${testCaseNumber} failed.`);
              } else {
                outputs[testCaseNumber-1] = [];
                outputs[testCaseNumber-1][0] = `Your Output: ${stdout}`;
                console.log(`Output for test case ${testCaseNumber}:\n${stdout}`);
                resolve();
              }
  
              // Cleanup: Remove the temporary input file
              fs.unlinkSync(tempInputFile);
            });
          });
        };
        // Sequentially process all test cases
        for (let i = 0; i < inputFiles.length; i++) {
          const inputFilePath = path.join(inputDir, inputFiles[i]);
          try {
            await processTestCase(inputFilePath, i + 1);
          } catch (error) {
            console.error(error);
            flag=false;
            errors.push({err: "Error encountered while fetching input case", message: (error as Error).message });
          }
        }
      }catch (error) {
        console.error("Error while running test cases:", error);
        errors.push({err: "Error encountered while running test case", message: (error as Error).message });
        flag=false;
        vscode.window.showErrorMessage("An error occurred while running the test cases.");
      }
      
      // Get the output files
      const outputDir = path.join(__dirname, "../outputs");
      const outputFiles = fs.readdirSync(outputDir);

      // Sequentially process all test cases
      for (let i = 0; i < outputFiles.length; i++) {
        const outputFilePath = path.join(outputDir, outputFiles[i]);
        let outputContent = fs.readFileSync(outputFilePath, "utf-8");
        try {
          console.log("Expected Output:", outputContent);
          outputs[i][1] = `Expected Output: ${outputContent}`;
        } catch (error) {
          errors.push({err: "Error encountered while running expected output test case", message: (error as Error).message });
          flag=false;
          console.error(error);
        }
      }
      console.log(outputs);

      // Create a panel for comparing outputs
      const panel = vscode.window.createWebviewPanel(
        'Results',
        'Results',
        vscode.ViewColumn.One,
        {}
      );

      // Set its HTML content
      if(flag){
        panel.webview.html = getWebviewContent(outputs);
      }else{
        panel.webview.html = getWebviewError(errors);
      }
    }
    
  );

  context.subscriptions.push(createWorkspaceCommand, runTestCasesCommand);
}

function getWebviewError(errors: testCaseError[]){
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Encountered</title>
  </head>
  <body>
    <h2>Error Report</h2>
        <ul>
          ${`<li>Test Case ${errors[0].err}: ${errors[0].message}</li>`}
        </ul>
  </body>
  </html>`;
}

function getWebviewContent(outputs: string[][]) {
  
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Results</title>
  </head>
  <body>
    <h1>Test Case Results</h1>
    <div id="results-container">
    ${outputs.map((testCase, index) => `
      <div>
        <h2>Test Case ${index + 1}</h2>
        <div>
          <h3>${testCase[1]}</h3>
        </div>
        <div>
          <h3>${testCase[0]}</h3>
        </div>
        <hr>
      </div>
    `).join('')}
    </div>
  </body>
  </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
