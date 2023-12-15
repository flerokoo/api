import { AuthController } from "./api/controllers/AuthController.js";
import { CategoryController } from "./api/controllers/CategoryController.js";
import { SpendController } from "./api/controllers/SpendController.js";

const config = Object.freeze({
  controllers: [
    AuthController,
    SpendController,
    CategoryController
  ] ,

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

  websocket: {
    enabled: true,
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
