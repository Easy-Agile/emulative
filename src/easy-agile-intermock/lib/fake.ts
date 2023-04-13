/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import faker from 'faker';
import { fixedData } from './fixed-data';

/**
 * Wrapper for Faker, or any mocking framework
 */
export function fake(mockType: string, isFixedMode = false) {
  if (isFixedMode) {
    return fixedData[mockType];
  }

  // faker.fake is deprecated and will be removed in the future
  // see https://fakerjs.dev/api/fake.html#fake
  // & https://fakerjs.dev/api/helpers.html#fake for the replacement method definition
  return faker.fake(`{{${mockType}}}`);
}
