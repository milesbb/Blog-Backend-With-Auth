// Link to frontend: https://github.com/milesbb/BE-WK2-D2-FE-Cloud.git

import express from "express";
import authorsRouter from "./api/authors/index.js";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import { join } from "path";
import {
  badRequestHandler,
  genericServerErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import infoRouter from "./api/info/index.js";

const server = express();
const port = process.env.PORT || 3001;
const publicFolderPath = join(process.cwd(), "./public/img/");

console.log("public folder path: ", publicFolderPath);

server.use(
  "/public/img/authors",
  express.static(publicFolderPath + "/authors/")
);
server.use("/public/img/covers", express.static(publicFolderPath + "/covers/"));


server.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

server.use(express.json());

server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
server.use("/info", infoRouter)

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericServerErrorHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server is up and running on port " + port);
});
