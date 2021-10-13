// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { workspace } from "vscode";
import { Commands } from "./constants";
import {
  applyEmulativeOverrides,
  buildMock,
  convertToJSObjectAsString,
  copyToClipboard,
  createAsBuilder,
  createAsVariable,
  createScratchFile,
  getEmulativePropertyOverrides,
  getTargetObject,
  initialiseAndGetData,
} from "./lib";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "emulative" is now active!');

  // launch.json configuration
  const config = workspace.getConfiguration(
    "launch",
    vscode.window.activeTextEditor?.document.uri
  );

  // retrieve values
  const configurationValues: any = config.get("configurations");

  const emulativeOverrides = getEmulativePropertyOverrides(configurationValues);

  // The commandId parameter must match the command field in package.json
  const disposableCopyObject = vscode.commands.registerCommand(
    Commands.copyObject,
    async function () {
      // Get initial data
      const initialData = initialiseAndGetData();
      if (!initialData || !initialData.interfaceName || !initialData.path) {
        return;
      }
      // Get the mock object
      const mock = await buildMock(initialData.path, initialData.interfaceName);
      const targetObject = getTargetObject(mock, initialData.interfaceName);
      if (!targetObject) {
        vscode.window.showErrorMessage("Unable to create mock object.");
        return;
      }

      applyEmulativeOverrides(emulativeOverrides, targetObject);

      const mockObjectAsString = convertToJSObjectAsString(targetObject);

      // copy to clipboard
      copyToClipboard(mockObjectAsString);

      // Notify user
      vscode.window.showInformationMessage(
        `Mock object copied to the clipboard: ${mockObjectAsString}`
      );
    }
  );

  context.subscriptions.push(disposableCopyObject);

  const disposableCopyObjectScratchFile = vscode.commands.registerCommand(
    Commands.copyObjectScratchFile,
    async function () {
      // Get initial data
      const initialData = initialiseAndGetData();
      if (!initialData || !initialData.interfaceName || !initialData.path) {
        return;
      }
      // Get the mock object
      const mock = await buildMock(initialData.path, initialData.interfaceName);
      // Convert to object as string
      const targetObject = getTargetObject(mock, initialData.interfaceName);
      if (!targetObject) {
        vscode.window.showErrorMessage("Unable to create mock object.");
        return;
      }

      applyEmulativeOverrides(emulativeOverrides, targetObject);

      //@ts-ignore
      const mockObjectAsString = convertToJSObjectAsString(targetObject);

      const objectAsVariableString = createAsVariable(
        initialData.interfaceName,
        mockObjectAsString
      );
      // copy to clipboard
      copyToClipboard(objectAsVariableString);

      createScratchFile(objectAsVariableString);

      // Notify user
      vscode.window.showInformationMessage(
        `Scratch file with mock object created: ${mockObjectAsString}`
      );
    }
  );

  context.subscriptions.push(disposableCopyObjectScratchFile);

  const disposableCopyJson = vscode.commands.registerCommand(
    Commands.copyJson,
    async function () {
      // Get initial data
      const initialData = initialiseAndGetData();
      if (!initialData || !initialData.interfaceName || !initialData.path) {
        return;
      }
      // Get the mock object
      const mock = await buildMock(initialData.path, initialData.interfaceName);
      // Convert to object as string
      const targetObject = getTargetObject(mock, initialData.interfaceName);
      if (!targetObject) {
        vscode.window.showErrorMessage("Unable to create mock object.");
        return;
      }

      applyEmulativeOverrides(emulativeOverrides, targetObject);

      //@ts-ignore
      const mockObjectStringified = JSON.stringify(targetObject);

      // copy to clipboard
      copyToClipboard(mockObjectStringified);

      // Notify user
      vscode.window.showInformationMessage(
        `Mock JSON object copied to the clipboard: ${mockObjectStringified}`
      );
    }
  );

  context.subscriptions.push(disposableCopyJson);

  const disposableCopyTestBuilder = vscode.commands.registerCommand(
    Commands.copyTestDataBuilder,
    async function () {
      // Get initial data
      const initialData = initialiseAndGetData();
      if (!initialData || !initialData.interfaceName || !initialData.path) {
        return;
      }
      // Get the mock object
      const mock = await buildMock(initialData.path, initialData.interfaceName);
      // Convert to object as string
      const targetObject = getTargetObject(mock, initialData.interfaceName);
      if (!targetObject) {
        vscode.window.showErrorMessage("Unable to create mock object.");
        return;
      }

      applyEmulativeOverrides(emulativeOverrides, targetObject);

      //@ts-ignore
      const mockObjectAsString = convertToJSObjectAsString(targetObject);

      const builderFunctionAsString = createAsBuilder(
        initialData.interfaceName,
        mockObjectAsString
      );

      // copy to clipboard
      copyToClipboard(builderFunctionAsString);

      // Notify user
      vscode.window.showInformationMessage(
        `builder function for a mock object of type ${initialData.interfaceName} copied to the clipboard: ${builderFunctionAsString}`
      );
    }
  );

  context.subscriptions.push(disposableCopyTestBuilder);
}

// this method is called when your extension is deactivated
export function deactivate() {}
