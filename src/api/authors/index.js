import AuthorModel from "./model.js";
import BlogPostModel from "../blogPosts/model.js";
import express from "express";
import createHttpError from "http-errors";
import { basicAuthMiddleware } from "../../lib/auth/basicAuth.js";
import { createAccessToken } from "../../lib/auth/tools.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

const authorsRouter = express.Router();

// GET ME

authorsRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const author = await AuthorModel.findById(req.author._id)
    res.send(author);
  } catch (error) {
    next(error);
  }
});

// GET ME STORIES

authorsRouter.get(
  "/me/stories",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const blogPosts = await BlogPostModel.find({ authors: req.author._id });

      res.send(blogPosts);
    } catch (error) {
      next(error);
    }
  }
);

// REGISTER

authorsRouter.post("/register", async (req, res, next) => {
  try {
    const newAuthorPre = {
      ...req.body,
      avatar: `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`,
    };
    const newAuthor = new AuthorModel(newAuthorPre);
    const { _id } = await newAuthor.save();

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
})

// LOGIN

authorsRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const author = await AuthorModel.checkCredentials(email, password, req);

    if (author) {
      const accessToken = await createAccessToken({
        _id: author._id,
        role: author.role,
      });
      res.send({ accessToken });
    } else {
      next(createHttpError(401, `Credentials are not ok!`));
    }
  } catch (error) {
    next(error);
  }
});

// GET

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await AuthorModel.find();
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC

authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const author = await AuthorModel.findById(req.params.authorId);
    if (author) {
      res.send(author);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST

authorsRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newAuthorPre = {
      ...req.body,
      avatar: `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`,
    };
    const newAuthor = new AuthorModel(newAuthorPre);
    const { _id } = await newAuthor.save();

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// PUT

authorsRouter.put("/:authorId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorModel.findByIdAndUpdate(
      req.params.authorId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedAuthor) {
      res.send(updatedAuthor);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

authorsRouter.delete("/:authorId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorModel.findByIdAndDelete(
      req.params.authorId
    );
    if (deletedAuthor) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
