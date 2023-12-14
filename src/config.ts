const config = Object.freeze({

  http: {
    enabled: true,
    port: 80
  },

  https: {
    enabled: true,
    port: 443,
    certPath: 'creds/cert.pem',
    keyPath: 'creds/key.pem'  
  },

  // database
  database: {
    driver: 'sqlite'
  },

  cluster: {
    enabled: false,
    workers: 3
  },

  //other
  logDir: 'logs/',
  maxShutdownTime: 30
});

export default config;
