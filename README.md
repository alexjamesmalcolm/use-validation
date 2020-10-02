[![npm](https://img.shields.io/npm/v/@alexjamesmalcolm/use-validation)](https://www.npmjs.com/package/@alexjamesmalcolm/use-validation)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/alexjamesmalcolm/use-validation/Build%20%26%20Test)](https://github.com/alexjamesmalcolm/use-validation/actions)
[![Coveralls github](https://img.shields.io/coveralls/github/alexjamesmalcolm/use-validation)](https://coveralls.io/github/alexjamesmalcolm/use-validation)
[![npm bundle size](https://img.shields.io/bundlephobia/min/@alexjamesmalcolm/use-validation)](https://www.npmjs.com/package/@alexjamesmalcolm/use-validation)
![MIT License](https://img.shields.io/npm/l/@alexjamesmalcolm/use-validation)

# useValidation

This is a React custom hook meant for assisting in the retrieval of remote data and the caching of it once acquired using redux.

## Documentation

Read the [documentation](http://www.alexjamesmalcolm.com/use-validation/), if there's a concept you'd like further explained or a feature you would like requested you can open an issue.

## TODO

- Allow for custom reducer names
- Internalize state management so `reducer` does not need to be exported
- ~~Allow passing a function instead of a number to `ttl` in case it needs to be determined programmatically.~~
- Mask my personal email address with GitHub's privacy email address
- Implement dependency array to replace `resourceId`
- Somehow get a unique identifier from supplied `getResource` function to replace `resourceId`
