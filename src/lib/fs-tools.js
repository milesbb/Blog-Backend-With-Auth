import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { readJSON, writeJSON, writeFile } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
const authorsJSONPath = join(dataFolderPath, "authors.json");
export const blogPostsJSONPath = join(dataFolderPath, "blogPosts.json");
export const authorsPublicFolderPath = join(
  process.cwd(),
  "./public/img/authors"
);
export const blogPostsPublicFolderPath = join(
  process.cwd(),
  "./public/img/covers"
);

export const getAuthors = () => readJSON(authorsJSONPath);

export const writeAuthors = (authorsArray) =>
  writeJSON(authorsJSONPath, authorsArray);

export const getBlogPosts = () => readJSON(blogPostsJSONPath);

export const writeBlogPosts = (blogPosts) =>
  writeJSON(blogPostsJSONPath, blogPosts);

export const saveAuthorsAvatars = (fileName, contentAsABuffer) =>
  writeFile(join(authorsPublicFolderPath, fileName), contentAsABuffer);

export const saveBlogPostsCovers = (fileName, contentAsABuffer) =>
  writeFile(join(blogPostsPublicFolderPath, fileName), contentAsABuffer);
