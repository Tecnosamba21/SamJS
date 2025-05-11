![SamJS](icon.png)

# [SamJS](https://samjs.vercel.app)

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Tecnosamba21/SamJS)

SamJS is an **Open Source** in-real-time JavaScript runner for
testing and prototyping your JS code.

<details>
  <summary>📚 Table of contents</summary>

- [SamJS](#samjs)
  - [Functionalities:](#functionalities)
  - [Import modules](#import-modules)
  - [Use `fetch`](#use-fetch)
  - [Use the console methods -\> `log`, `info`, `warning`, `error`](#use-the-console-methods---log-info-warning-error)
  - [Change the theme](#change-the-theme)
    - [Dark mode](#dark-mode)
    - [Light mode](#light-mode)

</details>
<br>

![SamJS GUI](GUI.png)

## Functionalities:

- **Instant** run the code when it's modificated
- **Async functions** like `fetch` or your custom ones
- **Import libraries** using the `require` method
- **Code autocomplanation** while you type

## Import modules

You can **import modules** in your program by using the async method `require`:

```javascript
require(<url>) -> Promise(<library>)
```

An example importing `random-words`:

```javascript
const rw = await require('https://esm.sh/random-words@1.1.2')
console.log(rw['wordList'])
```

[Open in SamJS 🔌](https://samjs.vercel.app?c=Y29uc3QlMjBydyUyMCUzRCUyMGF3YWl0JTIwcmVxdWlyZSgnaHR0cHMlM0ElMkYlMkZlc20uc2glMkZyYW5kb20td29yZHMlNDAxLjEuMicpJTBBY29uc29sZS5sb2cocnclNUInd29yZExpc3QnJTVEKQ==)

> [!NOTE]
> You can only import libraries wich use [ECMAScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) modules

## Use `fetch`

You can also use the method `fetch` in SamJS, for using it correctly, follow this structure:

```javascript
fetch(<url>)
    .then(res => <action>)
```

Otherwise, you will get an empty object (`{}`) as the response.

An example calling the *pokeapi*:

```javascript
fetch('https://pokeapi.co/api/v2/pokemon/ditto')
   .then(res => res.json())
   .then(response => console.log(response.name)) // Prints 'ditto'
```

[Open in SamJS 🔌](https://samjs.vercel.app?c=ZmV0Y2goJ2h0dHBzJTNBJTJGJTJGcG9rZWFwaS5jbyUyRmFwaSUyRnYyJTJGcG9rZW1vbiUyRmRpdHRvJyklMEElMjAlMjAlMjAudGhlbihyZXMlMjAlM0QlM0UlMjByZXMuanNvbigpKSUwQSUyMCUyMCUyMC50aGVuKHJlc3BvbnNlJTIwJTNEJTNFJTIwY29uc29sZS5sb2cocmVzcG9uc2UubmFtZSkp)

## Use the console methods -> `log`, `info`, `warning`, `error`

SamJS supports **four different** print methods:

```javascript
console.log('This is a log')
console.info('This is some info')
console.warning('This is a warning')
console.error('This is an error')
```

[Open in SamJS 🔌](https://samjs.vercel.app?c=Y29uc29sZS5sb2coJ1RoaXMlMjBpcyUyMGElMjBsb2cnKSUwQWNvbnNvbGUuaW5mbygnVGhpcyUyMGlzJTIwc29tZSUyMGluZm8nKSUwQWNvbnNvbGUud2FybmluZygnVGhpcyUyMGlzJTIwYSUyMHdhcm5pbmcnKSUwQWNvbnNvbGUuZXJyb3IoJ1RoaXMlMjBpcyUyMGFuJTIwZXJyb3InKQ==)

The example in the app:

![Log example](image.png)

## Change the theme

You can switch between dark and light modes by pressing the theme button:

![Theme switching](image-1.png)

### Dark mode

![Dark mode](DarkMode.png)

### Light mode

![Light mode](image-3.png)
