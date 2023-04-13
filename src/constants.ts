export enum Commands {
  copyObject = "emulative.copyObject",
  copyObjectScratchFile = "emulative.copyObjectScratchFile",
  copyJson = "emulative.copyJson",
  copyJsonScratchFile = "emulative.copyJsonScratchFile",
  copyTestDataBuilder = "emulative.copyTestDataBuilder",
  testDataBuilderScratchFile = "emulative.testDataBuilderScratchFile",
}

export const INVOCATION_COUNT = "emulative.invocationCount";

export const INVOCATION_COUNT_THRESHOLD = 5;

export const FUNCTION_MOCK = `() => { }`;
