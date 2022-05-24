const databaseHost = String("127.0.0.1").trim();
const databasePort = String("27017").trim();
const databaseUser = String("adminUser").trim();
const databasePassword = String("admin").trim();
const databaseName = String("test").trim();
const databaseConnectionOpts = String("authSource=admin").trim();

 const database = {
  // Examples of valid connection strings.
  //remoteUrl : 'mongodb://todo:bitnami@mongodb-primary:27017/todo',
  //remoteUrl : 'mongodb://0eb6bfe9-0ee0-4-231-b9ee:PpqNdxdyyys5nnQNA6SmPatk4NGkPlkLpUeqYz33ikQKTNDy4cma42500PCpt8S0GF9qm0hzv0R0FKglK3v03g==@0eb6bfe9-0ee0-4-231-b9ee.documents.azure.com:10255/?ssl=true',
  remoteUrl : `mongodb://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}?${databaseConnectionOpts}`,
  userDB : `mongodb://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort}/users?${databaseConnectionOpts}`,
  servicesDB : `mongodb://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort}/services?${databaseConnectionOpts}`,
  localUrl: 'mongodb://localhost:27017/'
};
exports.database = database