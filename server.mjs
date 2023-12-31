import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

// notice that the result of `remix build` is "just a module"
import * as build from "./build/index.js";

const app = express();
app.use(express.static("public"));

// Add CORS and proxy middleware
app.use(cors());
app.use('/api', createProxyMiddleware({
  target: 'https://api.coingecko.com/', // replace with the API you're making requests to
  changeOrigin: true,
}));

// and your app is "just a request handler"
app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
  console.log("App listening on http://localhost:3000");
});