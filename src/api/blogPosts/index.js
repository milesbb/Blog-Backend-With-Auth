import express from "express";
import BlogPostModel from "./model.js";
import { extname } from "path";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHttpError from "http-errors";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "BEwk3d2/blogPostsDB",
      public_id: (req, file) => req.params.blogPostId,
    },
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("cover");

const blogPostsRouter = express.Router();

// MONGOOSE ENDPOINTS

// GET

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const blogPosts = await BlogPostModel.find();
    res.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPost = await BlogPostModel.findById(req.params.blogPostId);
    if (blogPost) {
      res.send(blogPost);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogPostId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC BY CATEGORY

blogPostsRouter.get("/search/:category", async (req, res, next) => {
  try {
    console.log(req.params.category);
    const blogPosts = await BlogPostModel.find({category: `${req.params.category}`});
    if (blogPosts) {
      res.send(blogPosts);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogPostId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST

blogPostsRouter.post("/", async (req, res, next) => {
  try {
    const newBlogPost = new BlogPostModel(req.body);
    const { _id } = await newBlogPost.save();

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// PUT

blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
      req.params.blogPostId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogPostId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const deletedBlogPost = await BlogPostModel.findByIdAndDelete(
      req.params.blogPostId
    );
    if (deletedBlogPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogPostId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST CLOUDINARY COVER IMAGE

blogPostsRouter.post(
  "/:blogPostId/cloudinary",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      console.log("file: " + req.file);

      const fileName = req.params.blogPostId + extname(req.file.originalname);

      const cloudinaryURL =
        "https://res.cloudinary.com/dycynydei/image/upload/BEwk3d2/blogPostsDB/" +
        fileName;

      const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
        req.params.blogPostId,
        { cover: cloudinaryURL },
        { new: true, runValidators: true }
      );
      if (updatedBlogPost) {
        res.send(updatedBlogPost);
      } else {
        next(
          createHttpError(
            404,
            `User with id ${req.params.blogPostId} not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// MONGOOSE ENDPOINTS END

export default blogPostsRouter;
