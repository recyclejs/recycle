# Recycle

Recycle is a JavaScript library for creating modular applications using [Observable streams](http://reactivex.io/).

[![Join the chat at https://gitter.im/recyclejs](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/recyclejs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://img.shields.io/npm/v/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)
[![npm downloads](https://img.shields.io/npm/dm/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)

## Installation
Recycle v2.0 is installed using npm tag `beta`

```bash
npm install recyclejs@beta
```

## Project Focus - Difference From 1.0
The codebase of Recycle v1 is mostly the same as in v2,
but its API for initial setup is changed.

In version 2, Recycle has no dependencies.

Focus of the previous Recycle version (at least for documentation) 
was on React and how Recycle can be used to easily leverage Observable streams when defining components.

But using React is not a requirement.

Even though many examples will still feature React apps,
this will not be Recycle's focus.

Creating modular application using Observables can be applied to other React-like libraries, 
but also to projects on the backend (node.js)

This version will be published without "beta" tag as soon as documentation, new examples and tests are ready.

## Examples
Current examples using Recycle v2:
- [Markdown Fetcher Challenge](https://github.com/domagojk/Markdown-Fetcher-Challenge)