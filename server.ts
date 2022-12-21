import http from 'http'
import express from 'express';
import cors from "cors";

const port: number = 3000

class App {
  private readonly server: http.Server
  private readonly port: number

  constructor(port: number) {
    this.port = port

    const app = express()
    app.use(cors());

    this.server = new http.Server()
  }

  public Start() {
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}.`)
    })
  }
}

new App(port).Start()
