# Emulative

Mock your Typescript types straight from [Visual Studio Code.](https://code.visualstudio.com/)

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

---

## Extension Settings

You can overwrite certain properties by updating the Prop Overrides setting under `Settings > Extensions > Emulative > Prop Overrides`

- Enter key value pairs where different key value pairs are delimited by commas “,”
- The key and value are delimited by a colon “:”
- Emulative will override any properties matching the key with the value provided

![Example configuration](https://res.cloudinary.com/cleanswelllines/image/upload/v1634263767/configuration_a4sypv.png)

---

## Known Issues

### Type support

Emulative is hugely dependent on the wonderful work from the team who created [intermock](https://github.com/google/intermock). Therefore, the types supported by Emulative match those [supported by intermock](https://github.com/google/intermock#type-support).

### Multiple files

Emulative does not currently support types spread across multiple files.

---

## Release Notes

### 1.0.0

v1 release of Emulative, includes:

- Better handling of unsupported types to produce a mock object with stubs instead of throwing an error
- Document builder functions with TSDoc describing their default values
- Fix the poorly formatted user toast notifications

### 0.1.0

Initial release of Emulative, includes ability to:

- Run Emulative via the Command Palette to produce TS objects, Json objects and builder functions to mock out a TS type
- Override specific property values

---

## Acknowledgements

Like most software these days, this wouldn't be posssible without all the amazing open source work out there. In particular, this extension relies heavily on the amazing work of the team at [intermock](https://github.com/google/intermock)

Also, thanks to [Easy Agile](https://www.easyagile.com/) for giving me the time, space, encouragement and tools to work on this extension. Come [work for us!](https://www.easyagile.com/careers/)

---

**Created by [John Folder](https://twitter.com/john_folder) and [Conor Gould](https://www.linkedin.com/in/conorgould/) at [Easy Agile](https://www.easyagile.com/)**
