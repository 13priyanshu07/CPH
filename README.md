# Competitive Programming Helper (CPH) VS Code Extension

## Overview

The **Competitive Programming Helper (CPH)** VS Code extension enhances the workflow of solving LeetCode problems by automating the fetching of problem test cases and running user code locally. This extension eliminates the need for manual test case setup while providing robust multi-language support for local testing.

## Features

### 1. **Problem URL Fetching**

- Enable users to fetch test cases directly from LeetCode problem URLs.
- Handle problems with multiple test cases.
- Store test cases in a structured format for local testing.

### 2. **Test Case Storage**

- Test cases should be stored in files compatible with the CPH extension.
  - **Input Files**: `example1_input.txt`, `example2_input.txt`, etc.
  - **Output Files**: `example1_output.txt`, `example2_output.txt`, etc.

### 3. **Code Execution**

- Allow users to write and execute code in their preferred programming language.
- Run the code against the fetched test cases.
- Compare actual outputs with the expected outputs.

### 4. **Multi-Language Support**

- Support for commonly used programming languages:
  - Python
  - C++

## Requirements

To use this extension, ensure the following requirements are met:

- **VS Code**: Version 1.92.0 or higher.
- **Node.js**: Version 14 or higher.
- **puppeteer**: Version 19.6.2 or higher.
- **Supported Programming Languages**: Python and C++ (customizable in settings).
- **LeetCode Account**: Required for fetching problems directly from LeetCode (not mandatory for local testing).
- **Compilers**:
  - Python 3.x for Python code execution.
  - GCC for C++ code compilation.


## Installation

1. Open VS Code.
2. Go to the Extensions view (`Ctrl+Shift+X`).
3. Search for `CPH` and click **Install**.

## Usage

1. After installing the extension, run the command `CPH: Fetch Test Cases` from the command palette (`Ctrl+Shift+P`).
2. Enter the LeetCode problem URL when prompted.
3. Write your solution in the editor.
4. Run `CPH: Run Test Cases` to test your solution against the fetched test cases.
5. View the comparison results in the output panel.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
