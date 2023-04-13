import { readFile } from "fs/promises";
import * as vscode from "vscode";
import { window, workspace } from "vscode";
import { get, isEmpty, isNil } from "lodash";
import { mock } from "./easy-agile-intermock/intermock";
import * as nodePath from "path";
import * as fs from 'fs';
import { INVOCATION_COUNT, INVOCATION_COUNT_THRESHOLD } from "./constants";

export type FileTuple = [string, string];
export type FileTuples = FileTuple[];

export const createTsDoc = (targetObject: any) => {
  // Remove newline characters if the value is a string
  const inputs = Object.entries(targetObject).map((x) => ` * ${x[0]}: "${typeof (x[1]) === 'string' ? x[1].replace(/(\r\n|\n|\r)/gm, "") : x[1]}",\n`)
  return `
/**
 * Default values are:\n * \`\`\`\n * {\n${inputs.join('')} *  }\n * \`\`\`\n */
  `;
};

export const createAsBuilder = (
  targetObject: any,
  mockObjectAsString: string,
  interfaceName = "Interface"
) => {
  // Check if a user has turned off comments and if so do not add them
  const addJsdocCommentToBuilderFunction = getEmulativeAddJSDocToBuilderFunction();
  const tSDoc = addJsdocCommentToBuilderFunction ? createTsDoc(targetObject) : "";
  return `${tSDoc} export const build${interfaceName} = (overrides?: Partial<${interfaceName}>): ${interfaceName} => {
        const default${interfaceName} = ${mockObjectAsString};

        return { ...default${interfaceName}, ...overrides };
    };`;
};

export function readFiles(files: string[]): Promise<FileTuples> {
  const filePromises = files.map((file) => readFile(file));
  return new Promise((resolve) => {
    Promise.all(filePromises).then((buffers) => {
      const contents: string[][] = [];
      buffers.forEach((buffer, index) =>
        contents.push([files[index], buffer.toString()])
      );
      resolve(contents as FileTuples);
    });
  });
}

export const initialiseMockProcess = async () => {
  const metaData = getMetadataForMock();

  if (isNil(metaData)) {
    return;
  }
  // Get the mock object
  const targetObject = await buildMock(metaData.path, metaData.interfaceName);

  if (metaData.emulativeOverrides) {
    applyEmulativeOverrides(metaData.emulativeOverrides, targetObject);
  }

  return targetObject;
};

export const getMetadataForMock = () => {
  // Get the active text editor
  const editor = window.activeTextEditor;

  if (editor) {
    const document = editor.document;
    const selection = editor.selection;

    const range = document.getWordRangeAtPosition(
      selection.active,
    );

    // Get the word within the selection
    const interfaceName = document.getText(range);
    const path = document.fileName;

    if (!path) {
      window.showErrorMessage("No current file path found.");
      return;
    }

    if (!interfaceName) {
      window.showWarningMessage(
        "No interface name found. Did you select the whole name?"
      );
      return;
    }

    const emulativeOverrides = getEmulativePropertyOverrides();

    return {
      interfaceName,
      path,
      emulativeOverrides,
    };
  } else {
    window.showWarningMessage("No editor found.");
  }
};

export const getTargetObject = (mockObject: any, interfaceName: string) => {
  return get(mockObject, interfaceName);
};

export const buildMock = async (path: string, interfaceName: string) => {
  const mock = await getMockObject(path, interfaceName);
  const targetObject = getTargetObject(mock, interfaceName);
  return targetObject;
};

const getInterfaceImportedFile = async (files: FileTuples, interfaceName: string) => {
  // Find the import statement corresponding to interfaceName
  const checkForImport = new RegExp('^import');
  const fileName = files[0][0];
  const fileData = files[0][1].split('\n').filter(x => checkForImport.test(x));
  const checkForInterface = new RegExp("\\b" + interfaceName + "\\b");
  const interfaceImportStatement = fileData.find(x => checkForInterface.test(x));
  const interfaceImportStatementArray = interfaceImportStatement?.split(' ');
  if (!interfaceImportStatementArray) {
    return;
  }

  // Build the absolute path to the interface based on the import statement
  const interfaceRelativePath = interfaceImportStatementArray[(interfaceImportStatementArray.length - 1)].replace(/;|"/g, "");
  const interfaceFileName = interfaceRelativePath.split('/')[(interfaceRelativePath.split('/')).length - 1];
  const absolutePath = nodePath.dirname(fileName)
  const interfaceAbsolutePath = nodePath.resolve(absolutePath, interfaceRelativePath);
  const interfaceAbsolutePathDirectory = nodePath.dirname(interfaceAbsolutePath)
  const interfaceFileNameWithExtension = fs.readdirSync(interfaceAbsolutePathDirectory, { withFileTypes: true })
    .filter(item => !item.isDirectory())
    .map(item => item.name)
    .find(item => item.includes(interfaceFileName))
  if (!interfaceFileNameWithExtension) {
    return;
  }

  // Get mock from file
  const externalFiles = await readFiles([nodePath.join(interfaceAbsolutePathDirectory, interfaceFileNameWithExtension)]);
  return externalFiles;
}

export const getMockObject = async (path: string, interfaceName: string) => {
  try {

    const files = await readFiles([path]);

    // Try to get mock from current file
    // If empty, search through other files using getInterfaceImportedFile()
    const result = mock({
      files: files,
      interfaces: [interfaceName],
      isFixedMode: false,
      output: "object",
      isOptionalAlwaysEnabled: true,
    }) as string;

    if (!isEmpty(result)) {
      return result;
    }

    const externalFiles = await getInterfaceImportedFile(files, interfaceName);

    const externalFileResult = mock({
      files: externalFiles,
      interfaces: [interfaceName],
      isFixedMode: false,
      output: "object",
      isOptionalAlwaysEnabled: true,
    }) as string;

    return externalFileResult;
  } catch (err) {
    //@ts-ignore
    window.showWarningMessage(`intermock error: ${err.message}`);
  }
};

export const getInterfaceName = () => {
  const editor = window.activeTextEditor;

  if (editor) {
    const document = editor.document;
    const selection = editor.selection;

    const range = document.getWordRangeAtPosition(
      selection.active,
    );

    // Get the word within the selection
    return document.getText(range);
  }
};

export const copyToClipboard = (mock: string) => {
  vscode.env.clipboard.writeText(mock);
};

export const createScratchFile = (mock: string) => {
  const documentOptions = {
    content: mock,
    language: "typescript",
  };

  vscode.workspace
    .openTextDocument(documentOptions)
    .then((document) => vscode.window.showTextDocument(document));
};

export const getEmulativePropertyOverrides = () => {
  const emulativePropertyOverrides: any = workspace
    .getConfiguration()
    .get("emulative.propertyOverrides");

  if (!emulativePropertyOverrides) {
    return;
  }
  const individualPropertiesandValues = emulativePropertyOverrides.split(",");
  return individualPropertiesandValues.map((propValue: any) => {
    const substrings = propValue.split(":");
    return {
      [substrings[0]]: substrings[1],
    };
  });
};

/**
 * Has a user opted to have JSDoc comments added to the builder function?
 * @returns boolean | undefined
 */
export const getEmulativeAddJSDocToBuilderFunction = () => {
  const addDocoToBuilderFunction: boolean | undefined = workspace
    .getConfiguration()
    .get("emulative.addJsdocCommentToBuilderFunction");

  return addDocoToBuilderFunction;
};

export const mutateObjectProperty = (prop: string, value: string, obj: any) => {
  if (isNil(obj)) {
    return;
  }

  obj?.constructor === Object &&
    Object.keys(obj).forEach((key) => {
      if (key === prop) {
        obj[key] = value;
      }
      mutateObjectProperty(prop, value, obj[key]);
    });
};

export const applyEmulativeOverrides = (
  emulativeOverrides: any[],
  targetObject: any
) => {
  if (emulativeOverrides) {
    emulativeOverrides.forEach((override) => {
      const prop = Object.keys(override)[0];
      const value = override[prop];

      mutateObjectProperty(prop, value, targetObject);
    });
  }
};

export const createAsVariable = (mockObjectAsString: string) => {
  const interfaceName = getInterfaceName() || "Interface";
  const objectIdentifierWithPreferredCase =
    "const " +
    interfaceName[0].toLowerCase() +
    interfaceName.slice(1) +
    "Mock = ";
  return objectIdentifierWithPreferredCase + mockObjectAsString + ";";
};

const getAllTypescriptFiles = async () => {
  return await vscode.workspace.findFiles("**/*.ts*", "**/node_modules/**");
};

export const sendResultToTerminal = (mockObject: any) => {
  let terminalToUse = vscode.window.activeTerminal;
  // eslint-disable-next-line eqeqeq
  if (terminalToUse == null) {
    let NEXT_TERM_ID = 1;
    terminalToUse = vscode.window.createTerminal(
      `Ext Terminal #${NEXT_TERM_ID++}`
    );
  }

  terminalToUse.show();
  terminalToUse.sendText(`echo ${mockObject}`);
};

export const clearInvocationCount = (context: vscode.ExtensionContext) => {
  context.globalState.update(INVOCATION_COUNT, 0);
};

export const getInvocationCount = (context: vscode.ExtensionContext): number => {
  return context.globalState.get(INVOCATION_COUNT) || 0;
};

export const addToInvocationCount = (context: vscode.ExtensionContext) => {
  const currentCount: number = getInvocationCount(context);
  context.globalState.update(INVOCATION_COUNT, currentCount + 1);
};

export const shouldDisplayRatingMessage = (context: vscode.ExtensionContext) => {
  const currentCount: number = getInvocationCount(context);
  if (currentCount === INVOCATION_COUNT_THRESHOLD) {
    return true;
  }
  return false;
};

export const displayRatingMessageOrUpdateInvocationCount = (context: vscode.ExtensionContext) => {
  addToInvocationCount(context);

  if (shouldDisplayRatingMessage(context)) {
    window.showInformationMessage(
      "Thanks for using Intermock! If you like it, please consider rating it on the VS Code marketplace. Otherwise, please let us know how we can improve it.",
      "Rate it now",
      "Give feedback",
      "No thanks"
    ).then((selection) => {
      if (selection === "Rate it now") {
        vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=EasyAgile.emulative&ssr=false#review-details'));
      }
      if (selection === "Give feedback") {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/Easy-Agile/emulative/issues'));
      }
      if (selection === "No thanks") {
        // close the vscode information message
        vscode.commands.executeCommand('workbench.action.closeMessages');
      }
    });
  }

  // clearInvocationCount(context);
};

