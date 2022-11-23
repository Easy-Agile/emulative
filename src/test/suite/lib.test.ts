import { createTsDoc } from "../../lib";

describe("createTsDoc", () => {
    it("should add a TS Document to a string", () => {
        const targetTsDoc = createTsDoc("this");
        expect(typeof targetTsDoc).toBe("string");
    });
});
