import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const blogPostSchema = {
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and must be a string/text",
    },
  },
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and must be a string/text",
    },
  },
  readTime: {
    value: {
      in: ["readTime"],
      isInt: {
        errorMessage:
          "The read time value is a mandatory field and must be an integer",
      },
    },
  },
  author: {
    name: {
      in: ["author"],
      isString: {
        errorMessage:
          "author name is a mandatory field and must be a string/text",
      },
    },
    avatar: {
      in: ["author"],
      isString: {
        errorMessage:
          "author name is a mandatory field and must be a string/text",
      },
    },
  },
  content: {
    in: ["body"],
    isString: {
      errorMessage: "Cover is a mandatory field and must be a string/text",
    },
  },
};

export const checkBlogPostSchema = checkSchema(blogPostSchema);

export const checkValidationResult = (req, res, next) => {
  const errorsList = validationResult(req);
  if (!errorsList.isEmpty()) {
    next(
      createHttpError(
        400,
        "Validation error in request! Error(s) are displayed below",
        { errorsList: errorsList.array() }
      )
    );
  } else {
    next();
  }
};
