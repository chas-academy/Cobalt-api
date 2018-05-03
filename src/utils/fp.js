export const asyncPipe = (...functions) => data =>
  functions.reduce(async (value, func) => func(await value), data);
