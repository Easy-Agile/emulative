export const createTsDoc = (targetObject: string) => {
    // Remove newline characters if the value is a string
    const inputs = Object.entries(targetObject).map((x) => ` * ${x[0]}: "${typeof (x[1]) === 'string' ? x[1].replace(/(\r\n|\n|\r)/gm, "") : x[1]}",\n`)
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