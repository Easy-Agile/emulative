import { readFile } from "fs/promises";
import * as vscode from "vscode";
import { writeSync } from "clipboardy";
import { mock as IntermockTS } from "intermock";
import { filter, map } from "lodash";

export type FileTuple = [string, string];
export type FileTuples = FileTuple[];

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

export const initialiseAndGetData = () => {
  // Get the active text editor
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const document = editor.document;
    const selection = editor.selection;

    // Get the word within the selection
    const interfaceName = document.getText(selection);
    const path = vscode.window.activeTextEditor?.document.fileName;

    if (!path) {
      vscode.window.showErrorMessage("No path found.");
      return;
    }

    if (!interfaceName) {
      vscode.window.showErrorMessage("No interface name found.");
      return;
    }

    return {
      interfaceName,
      path,
    };
  } else {
    vscode.window.showErrorMessage("No editor found.");
  }
};

export const getTargetObject = (mockObject: any, interfaceName: string) => {
  return mockObject[interfaceName];
};

export const buildMock = (path: string, interfaceName: string) => {
  return getMockObject(path, interfaceName);
};

export const getMockObject = async (path: string, interfaceName: string) => {
  try {
    const files = await readFiles([path]);

    const result = IntermockTS({
      files,
      interfaces: [interfaceName],
      isFixedMode: false,
      output: "object",
    }) as string;

    return result;
  } catch (err) {
    //@ts-ignore
    console.log(err.message);
  }
};

export const createAsBuilder = (
  interfaceName: string,
  mockObjectAsString: string
) => {
  return `export const build${interfaceName} = (overrides?: Partial<${interfaceName}>): ${interfaceName} => {
		const default${interfaceName} = ${mockObjectAsString};

		return { ...default${interfaceName}, ...overrides };
	};`;
};

export const createAsVariable = (
  interfaceName: string,
  mockObjectAsString: string
) => {
  const objectIdentifierWithPreferredCase =
    "const " +
    interfaceName[0].toLowerCase() +
    interfaceName.slice(1) +
    "Mock = ";
  return objectIdentifierWithPreferredCase + mockObjectAsString + ";";
};

export const copyToClipboard = (mock: string) => {
  writeSync(mock);
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

export const convertToJSObjectAsString = (obj: any) => {
  let cleaned = JSON.stringify(obj, null, 2);

  return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
    return match.replace(/"/g, "");
  });
};

export const getEmulativePropertyOverrides = (
  configurationVariablesArray: any[]
) => {
  const configurationVariables = configurationVariablesArray[0];
  const emulativePropertyOverridesString: string =
    configurationVariables?.env?.emulativePropertyOverrides;
  const individualPropertiesandValues =
    emulativePropertyOverridesString.split(",");
  return individualPropertiesandValues.map((propValue) => {
    const substrings = propValue.split(":");
    return {
      [substrings[0]]: substrings[1],
    };
  });
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

export const mutateObjectProperty = (prop: string, value: string, obj: any) => {
  obj.constructor === Object &&
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
