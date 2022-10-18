import PdfPrinter from "pdfmake";
import { getAuthors, getBlogPosts } from "./fs-tools.js";
import fs from "fs-extra";
import imageToBase64 from "image-to-base64";

export const createBlogPostPdf = async (id) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  const blogPosts = await getBlogPosts();

  const authors = await getAuthors();

  const blogPostIndex = blogPosts.findIndex((blogPost) => blogPost._id === id);

  const selectedBlogPost = blogPosts[blogPostIndex];

  const selectedAuthorIndex = authors.findIndex(
    (author) => author.name === selectedBlogPost.author.name
  );

  let authorName = "";

  if (selectedAuthorIndex === -1) {
    authorName = selectedBlogPost.author.name;
  } else {
    const selectedAuthor = authors[selectedAuthorIndex];

    authorName = "By " + selectedAuthor.name + " d" + selectedAuthor.surname;
  }
  const removedHTMLTagsContent = selectedBlogPost.content.substr(
    3,
    selectedBlogPost.content.length - 7
  );

  const blogPostCoverBase64 = await imageToBase64(selectedBlogPost.cover);
  const blogPostCoverImage = "data:image/jpeg;base64," + blogPostCoverBase64;

  const docDefinition = {
    content: [
      {
        image: "blogPicture",
        width: 450,
        alignment: "center",
      },
      {
        text: "\n" + selectedBlogPost.title + "\n\n",
        style: "header",
        alignment: "center",
      },
      {
        text: "\n" + selectedBlogPost.category + "\n\n",
        style: "subheader",
        alignment: "center",
      },
      //   {
      //     image: "authorPicture",
      //     width: 50,
      //     height: 50,
      //   },
      {
        text: authorName,
        alignment: "left",
      },
      {
        text: "\n" + removedHTMLTagsContent + "\n\n",
        alignment: "justify",
      },

      //   ...finalContent,
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 15,
        bold: true,
      },
      quote: {
        italics: true,
      },
      small: {
        fontSize: 8,
      },
      defaultStyle: {
        font: "Helvetica",
      },
    },
    images: {
      blogPicture: blogPostCoverImage,
      // authorPicture: selectedAuthor.avatar,
    },
  };

  //   const testDocContent = {
  //     content: [{ text: "hello" }],
  //     styles: {
  //       defaultStyle: {
  //         font: "Helvetica",
  //       },
  //     },
  //   };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);

  //   pdfReadableStream.pipe(fs.createWriteStream("test.pdf"));
  pdfReadableStream.end();

  return pdfReadableStream;

  //   add code to delete file after
};
