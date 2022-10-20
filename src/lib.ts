import { readFile } from "fs/promises";
import * as vscode from "vscode";
import { writeSync } from "clipboardy";
import { mock as IntermockTS } from "intermock";
import { window, workspace } from "vscode";
import { get, isNil } from "lodash";

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

    // Get the word within the selection
    const interfaceName = document.getText(selection);
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

    const emulativeOverrides =
      getEmulativePropertyOverrides();

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

export const getMockObject = async (path: string, interfaceName: string) => {
  try {
    const files = await readFiles([path]);

    const result = IntermockTS({
      files,
      interfaces: [interfaceName],
      isFixedMode: false,
      output: "object",
      isOptionalAlwaysEnabled: true,
    }) as string;

    return result;
  } catch (err) {
    //@ts-ignore
    window.showWarningMessage(`intermock error: ${err.message}`);
  }
};

const createTsDoc = (targetObject: string) => {
  // Remove newline characters if the value is a string
  const inputs = Object.entries(targetObject).map((x) => ` * ${x[0]}: "${typeof(x[1]) === 'string' ? x[1].replace(/(\r\n|\n|\r)/gm, "") : x[1]}",\n`)
    return `
/**
 * Default values are:\n * \`\`\`\n * {\n${inputs.join('')} *  }\n * \`\`\`\n */
  `
}

export const createAsBuilder = (
  targetObject: any,
  mockObjectAsString: string,
  interfaceName = "Interface"
) => {
  const tSDoc = createTsDoc(targetObject);
  return `${tSDoc} export const build${interfaceName} = (overrides?: Partial<${interfaceName}>): ${interfaceName} => {
		const default${interfaceName} = ${mockObjectAsString};

		return { ...default${interfaceName}, ...overrides };
	};`;
};

export const getInterfaceName = () => {
  const editor = window.activeTextEditor;

  if (editor) {
    const document = editor.document;
    const selection = editor.selection;

    // Get the word within the selection
    return document.getText(selection);
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

export const convertToJSObjectAsString = (obj: any) => {
  let cleaned = JSON.stringify(obj, null, 2);

  return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
    return match.replace(/"/g, "");
  });
};

export const getEmulativePropertyOverrides = () => {
  const emulativePropertyOverrides: any =
    workspace.getConfiguration().get("emulative.propOverrides")

  if (!emulativePropertyOverrides) {
    return;
  }
  const individualPropertiesandValues =
    emulativePropertyOverrides.split(",");
  return individualPropertiesandValues.map((propValue: any) => {
    const substrings = propValue.split(":");
    return {
      [substrings[0]]: substrings[1],
    };
  });
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
