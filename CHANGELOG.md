# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2023-04-13

### Added

v1.0.1 of Emulative, new features include:

- Option to toggle JSDoc comment being generated above the builder function
- Customisable max length for generated string values
- Object properties containing 'id' are now shorter
- Right clicking on a type now has Emulate context actions for `.ts` files


## [1.0.0] - 2022-11-23

### Added

v1 release of Emulative, includes:

- Better handling of unsupported types to produce a mock object with stubs instead of throwing an error
- Document builder functions with TSDoc describing their default values
- Remove user toast notifications for a successful user action
- Security updates

## [0.1.0] - 2021-10-15

### Added

Initial release of Emulative, includes ability to:

- Run Emulative via the Command Palette to produce TS objects, Json objects and builder functions to mock out a TS type
- Override specific property values
