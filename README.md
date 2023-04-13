# Emulative

Emulative is a VSCode extension which helps developers speed up testing by creating mock objects representing TypeScript types straight from [Visual Studio Code.](https://code.visualstudio.com/)

---

## Features

You can use Emulative to produce Typescript objects, Json objects or builder functions from Typescript types:

### Copy Typescript objects

![Copy Typescript objects](https://res.cloudinary.com/cleanswelllines/image/upload/v1634171297/copyObject_sargod.gif)

### Copy Json objects

![Copy Json objects](https://res.cloudinary.com/cleanswelllines/image/upload/v1634171292/copyJson_are4p6.gif)

### Create a scratch file with Typescript objects

![Create a scratch file with Typescript objects](https://res.cloudinary.com/cleanswelllines/image/upload/v1634171293/scratch_a4sqc0.gif)

### Create a builder function

![Create a builder function](https://res.cloudinary.com/cleanswelllines/image/upload/v1634171300/testBuilder_y6wo2c.gif)

---

## Usage

To use Emulative:

- Select the identifier of the Typescript type you would like to build a mock for then use shortcut `Ctrl/Cmd + Shift + P` to open the Command Palette
  - Type `Emulative` and the various options for copying the mock type will be presented, select the option you prefer
  - No matter the option selected, the mock type will be copied to the clipboard
- Or right click on a type in a `.ts` file
  - Then click the Emulative action you wish to perform

---

## Extension Settings

There are several options avaliable to customise Emulative under `Settings > Extensions > Emulative`
- `Property Overrides` - overwrite certain properties by updating the setting
  - Enter key value pairs where different key value pairs are delimited by commas “,”
  - The key and value are delimited by a colon “:”
  - Emulative will override any properties matching the key with the value provided
- `Max Sentence Length` - the maximum amount of words for generated string types. Randomised from 3 to 10 (default) or user set value
- `Add JSDoc comment to builder function` - if a JSDoc comment should be included above builder functions 

![Example configuration](https://user-images.githubusercontent.com/97081028/231682831-5ac6dd56-b83e-4aab-9aa6-b58bcada47e1.png)


---

## Known Issues

### Type support

Emulative is hugely dependent on the wonderful work from the team who created [intermock](https://github.com/google/intermock). Therefore, the types supported by Emulative match those [supported by intermock](https://github.com/google/intermock#type-support). If Emulative encounters a type it isn't able to handle it will try and create a stub where possible or ignore the type completely. We are hoping to improve the types handled by Emulative in future releases.

### Multiple files

Emulative is able to produce a mock type from a type which is defined in another file at one level. However, it does not currently support types with references to other types which are spread across multiple files. We are hoping to address this limitation in the next release.

---

## Release Notes

### 1.0.0

v1 release of Emulative, includes:

- Better handling of unsupported types to produce a mock object with stubs instead of throwing an error
- Document builder functions with TSDoc describing their default values
- Remove user toast notifications for a successful user action
- Security updates

### 0.1.0

Initial release of Emulative, includes ability to:

- Run Emulative via the Command Palette to produce TS objects, Json objects and builder functions to mock out a TS type
- Override specific property values

---

## Acknowledgements

Like most software these days, this wouldn't be posssible without all the amazing open source work out there. In particular, this extension relies heavily on the amazing work of the team at [intermock](https://github.com/google/intermock)

Also, thanks to [Easy Agile](https://www.easyagile.com/) for giving us the time, space, encouragement and tools to work on this extension. Come [work for us!](https://www.easyagile.com/careers/)

---

**Created by [John Folder](https://www.linkedin.com/in/john-folder-385318165/), [Conor Gould](https://www.linkedin.com/in/conorgould/), [Anthony Suker](hhttps://www.linkedin.com/in/anthony-suker/) and [David Sirotich](https://www.linkedin.com/in/david-sirotich/) at [Easy Agile](https://www.easyagile.com/)**
