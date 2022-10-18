import express from "express";
import BlogPostModel from "./model.js";

import { extname, join } from "path";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pipeline } from "stream";
import sgMail from "@sendgrid/mail";
import { Transform } from "json2csv";
import createHttpError from "http-errors";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "BEwk2d2/blogPosts",
    },
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("avatar");

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

// MONGOOSE ENDPOINTS END

// SEND EMAIL

blogPostsRouter.get("/email", (req, res, next) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: "milesjbb@gmail.com",
      from: "milesjbb@gmail.com",
      subject: "Post created!",
      text: `Post created`,
      html: "<strong>Post created</strong>",
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("email sent!");
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    next(error);
  }
});

// CREATE BLOG POST PDF

blogPostsRouter.get("/:id/pdf", async (req, res, next) => {
  try {
    const idParam = req.params.id;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=blogPost${idParam}.pdf`
    );

    const source = await createBlogPostPdf(idParam);
    const destination = res;

    pipeline(source, destination, (error) => {
      if (error) console.log(error);
    });
  } catch (error) {
    next(error);
  }
});

// POST CLOUDINARY COVER IMAGE

blogPostsRouter.post(
  "/:id/cloudinary",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      console.log("file: " + req.file);

      const fileName = req.params.id + extname(req.file.originalname);

      const cloudinaryURL =
        "https://res.cloudinary.com/dycynydei/image/upload/BEwk2d2/blogPosts/" +
        fileName;

      const blogPostsArray = await getBlogPosts();

      const blogPostIndex = blogPostsArray.findIndex(
        (blogPost) => blogPost._id === req.params.id
      );

      if (blogPostIndex !== -1) {
        const oldBlogPost = blogPostsArray[blogPostIndex];

        const editedBlogPost = {
          ...oldBlogPost,
          updatedAt: new Date(),
          cover: cloudinaryURL,
        };

        blogPostsArray[blogPostIndex] = editedBlogPost;

        console.log("Edit Blog Post, updated entry:", editedBlogPost);

        await writeBlogPosts(blogPostsArray);

        res.send({
          message: "Image has been uploaded successfully",
          editedBlogPost: editedBlogPost,
        });
      } else {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
