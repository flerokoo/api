# The Funds API Server

This repository is part of the larger project:

> \> **The Funds API Server**   
>  **[The Funds React App](/)**   
> **[The Funds Backend-For-Fronend](/)**  

## Highlights

* Made with **Clean Architecture** in mind.
* **Graceful shutdown:** the app will wait for ongoing requests to finish while not accepting new ones, gracefully close DB and other connections.
* **Optional clustering:** easily configure whether to launch multiple child workers or start in single-process mode (i.e. for Docker)
* **Async Queue** for limiting the amount of concurrenly processed requests
* **Decorator-based Routes** with built-in request validation
* **Websocket and HTTP(S)** protocols support
