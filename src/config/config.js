/* Database */
const DATABASE_CONNECTION = `mongodb://${
  process.env.MONGO_INITDB_ROOT_USERNAME
}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${
  process.env.MONGO_INITDB_DATABASE
}`;

export { DATABASE_CONNECTION };
