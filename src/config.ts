const config = Object.freeze({
  // http(s)
  https: false,
  certPath: 'creds/cert.pem',
  keyPath: 'creds/key.pem',

  // database
  dbDriver: 'sqlite',

  // cluster
  useCluster: false,
  workers: 3,

  //other
  logDir: 'logs/',
  maxShutdownTime: 30
});

export default config;
