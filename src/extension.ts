// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { writeSync } from 'clipboardy';
import { mock as IntermockTS } from 'intermock';
import { readFiles } from './lib';
import { Commands } from './constants';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "emulative" is now active!');

	// The commandId parameter must match the command field in package.json
	const disposableCopyObject = vscode.commands.registerCommand(Commands.copyObject, async function () {
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
			vscode.window.showErrorMessage('Unable to create mock object.');
			return;
		}
		//@ts-ignore
		const mockObjectAsString = convertToJSObjectAsString(targetObject);

		// copy to clipboard
		copyToClipboard(mockObjectAsString);

		// Notify user
		vscode.window.showInformationMessage(`Mock object copied to the clipboard: ${mockObjectAsString}`);
	});

	context.subscriptions.push(disposableCopyObject);

	const disposableCopyObjectScratchFile = vscode.commands.registerCommand(Commands.copyObjectScratchFile, async function () {
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
			vscode.window.showErrorMessage('Unable to create mock object.');
			return;
		}
		//@ts-ignore
		const mockObjectAsString = convertToJSObjectAsString(targetObject);

		const objectAsVariableString = createAsVariable(initialData.interfaceName, mockObjectAsString);
		// copy to clipboard
		copyToClipboard(objectAsVariableString);

		createScratchFile(objectAsVariableString);

		// Notify user
		vscode.window.showInformationMessage(`Scratch file with mock object created: ${mockObjectAsString}`);
	});

	context.subscriptions.push(disposableCopyObjectScratchFile);

	const disposableCopyJson = vscode.commands.registerCommand(Commands.copyJson, async function () {
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
			vscode.window.showErrorMessage('Unable to create mock object.');
			return;
		}
		//@ts-ignore
		const mockObjectStringified = JSON.stringify(targetObject);

		// copy to clipboard
		copyToClipboard(mockObjectStringified);

		// Notify user
		vscode.window.showInformationMessage(`Mock JSON object copied to the clipboard: ${mockObjectStringified}`);
	});

	context.subscriptions.push(disposableCopyJson);

	const disposableCopyTestBuilder = vscode.commands.registerCommand(Commands.copyTestDataBuilder, async function () {
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
			vscode.window.showErrorMessage('Unable to create mock object.');
			return;
		}
		//@ts-ignore
		const mockObjectAsString = convertToJSObjectAsString(targetObject);

		const builderFunctionAsString = createAsBuilder(initialData.interfaceName, mockObjectAsString);

		// copy to clipboard
		copyToClipboard(builderFunctionAsString);

		// Notify user
		vscode.window.showInformationMessage(`builder function for a mock object of type ${initialData.interfaceName} copied to the clipboard: ${builderFunctionAsString}`);
	});

	context.subscriptions.push(disposableCopyTestBuilder);
}

const initialiseAndGetData = () => {
	// Get the active text editor
	const editor = vscode.window.activeTextEditor;

	if (editor) {
		const document = editor.document;
		const selection = editor.selection;

		// Get the word within the selection
		const interfaceName = document.getText(selection);
		const path  = vscode.window.activeTextEditor?.document.fileName;

		if (!path) {
			vscode.window.showErrorMessage('No path found.');
			return;
		}

		if (!interfaceName) {
			vscode.window.showErrorMessage('No interface name found.');
			return;
		}

		return {
			interfaceName,
			path
		};
		} else {
			vscode.window.showErrorMessage('No editor found.');
		}
};

const getTargetObject = (mockObject: any, interfaceName: string) => {
	return mockObject[interfaceName];
};

const buildMock = (path: string, interfaceName: string) => {
	return getMockObject(path, interfaceName);
};

const sendResultToTerminal = (mockObject: any) => {
	let terminalToUse = vscode.window.activeTerminal;
	// eslint-disable-next-line eqeqeq
	if (terminalToUse == null) {
		let NEXT_TERM_ID = 1;
		terminalToUse = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
	}

	terminalToUse.show();
	terminalToUse.sendText(`echo ${mockObject}`);
};

const getMockObject = async (path: string, interfaceName: string) => {
	try {
		const files = await readFiles([path]);

		const result = IntermockTS({
			files,
			interfaces: [interfaceName],
			isFixedMode: false,
			output: 'object',
		}) as string;

		return result;
	  } catch (err) {
		  //@ts-ignore
		console.log(err.message);
	  }
};

const createAsBuilder = (interfaceName: string, mockObjectAsString: string) => {
	return `export const build${interfaceName} = (overrides?: Partial<${interfaceName}>): ${interfaceName} => {
		const default${interfaceName} = ${mockObjectAsString};

		return { ...default${interfaceName}, ...overrides };
	};`;
};

const createAsVariable = (interfaceName: string, mockObjectAsString: string) => {
	const objectIdentifierWithPreferredCase = 'const ' + interfaceName[0].toLowerCase() + interfaceName.slice(1) + 'Mock = ';
	return objectIdentifierWithPreferredCase + mockObjectAsString + ';';
};

const copyToClipboard = (mock: string) => {
	writeSync(mock);

};

const createScratchFile = (mock: string) => {
	const documentOptions = {
		content: mock, 
		language: 'typescript'
	};

	vscode.workspace.openTextDocument(documentOptions).then(
		document => vscode.window.showTextDocument(document));
};

const convertToJSObjectAsString = (obj: any) => {
    var cleaned = JSON.stringify(obj, null, 2);

    return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
        return match.replace(/"/g, "");
    });
};

// this method is called when your extension is deactivated
export function deactivate() {}
