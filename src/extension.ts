// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Commands } from "./constants";
import {
  copyToClipboard,
  createScratchFile,
  initialiseMockProcess,
  getInterfaceName,
  createAsVariable,
} from "./lib";
import stringifyObject from "stringify-object";
import { createAsBuilder } from "./helpers";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "emulative" is now active!');

  // The commandId parameter must match the command field in package.json
  const disposableCopyObject = vscode.commands.registerCommand(
    Commands.copyObject,
    async function () {
      try {
        const targetObject = await initialiseMockProcess();

        if (!targetObject) {
          vscode.window.showWarningMessage("Unable to create mock object.");
          return;
        }

        const mockObjectAsString = stringifyObject(targetObject);

        // Copy to clipboard
        copyToClipboard(mockObjectAsString);

      } catch (error: any) {
        console.error(error.message);
        vscode.window.showErrorMessage(error.message);
      }
    }
  );

  context.subscriptions.push(disposableCopyObject);

  const disposableCopyObjectScratchFile = vscode.commands.registerCommand(
    Commands.copyObjectScratchFile,
    async function () {
      try {
        const targetObject = await initialiseMockProcess();

        if (!targetObject) {
          vscode.window.showWarningMessage("Unable to create mock object.");
          return;
        }

        const mockObjectAsString = stringifyObject(targetObject);

        const objectAsVariableString = createAsVariable(mockObjectAsString);
        // copy to clipboard
        copyToClipboard(objectAsVariableString);

        createScratchFile(objectAsVariableString);

      } catch (error: any) {
        console.error(error.message);
        vscode.window.showErrorMessage(error.message);
      }
    }
  );

  context.subscriptions.push(disposableCopyObjectScratchFile);

  const disposableCopyJson = vscode.commands.registerCommand(
    Commands.copyJson,
    async function () {
      try {
        const targetObject = await initialiseMockProcess();

        if (!targetObject) {
          vscode.window.showWarningMessage("Unable to create mock object.");
          return;
        }

        const mockObjectStringified = JSON.stringify(targetObject);

        // copy to clipboard
        copyToClipboard(mockObjectStringified);

      } catch (error: any) {
        console.error(error.message);
        vscode.window.showErrorMessage(error.message);
      }
    }
  );

  context.subscriptions.push(disposableCopyJson);

  const disposableCopyTestBuilder = vscode.commands.registerCommand(
    Commands.copyTestDataBuilder,
    async function () {
      try {
        const targetObject = await initialiseMockProcess();

        if (!targetObject) {
          vscode.window.showWarningMessage("Unable to create mock object.");
          return;
        }

        const mockObjectAsString = stringifyObject(targetObject);

        const interfaceName = getInterfaceName();

        const builderFunctionAsString = createAsBuilder(
          targetObject,
          mockObjectAsString,
          interfaceName
        );

        // copy to clipboard
        copyToClipboard(builderFunctionAsString);

      } catch (error: any) {
        console.error(error.message);
        vscode.window.showErrorMessage(error.message);
      }
    }
  );

  context.subscriptions.push(disposableCopyTestBuilder);
}

// this method is called when your extension is deactivated
export function deactivate() { }
