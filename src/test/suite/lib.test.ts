import { createAsBuilder, createTsDoc } from "../../lib";

/* Step 1: Define a type or interface */
type targetObject = {
    targetName: string;
    targetIds: number[];
}

/* Step 2: Use Emulative to generate a testDataBuilder function */
/**
 * Default values are:
 * ```
 * {
 * targetName: "ex",
 * targetIds: "7765",
 *  }
 * ```
 */
export const buildtargetObject = (overrides?: Partial<targetObject>): targetObject => {
    const defaulttargetObject = {
        targetName: 'ex',
        targetIds: [
            7765
        ]
    };

    return { ...defaulttargetObject, ...overrides };
};

/* Step 3: Use it in your tests! */
describe("createTsDoc", () => {
    it("should return a string", () => {
        const exampleTargetObject = buildtargetObject();
        const targetTsDoc = createTsDoc(exampleTargetObject);
        expect(typeof targetTsDoc).toBe("string");
    });

    it("should display default values in TS Doc format", () => {
        const exampleTargetObject = buildtargetObject({ targetName: "test 1", targetIds: [1, 2, 3] });
        const expectedTsDoc = `/**\n * Default values are:\n * \`\`\`\n * {\n * targetName: \"test 1\",\n * targetIds: \"1,2,3\",\n *  }\n * \`\`\`\n */`;

        const targetTsDoc = createTsDoc(exampleTargetObject);
        expect(targetTsDoc.trim()).toEqual(expectedTsDoc.trim());
    });
});


describe("createAsBuilder", () => {
    it("should return a string", () => {
        const exampleTargetObject = buildtargetObject();
        const exampleMockObjectAsString = `{targetName: 'ex',targetIds: [7765]};`;
        const exampleInterfaceName = `defaulttargetObject`;
        const targetBuilderFunction = createAsBuilder(exampleTargetObject, exampleMockObjectAsString, exampleInterfaceName);
        expect(typeof targetBuilderFunction).toBe("string");
    });
});