import fs from "fs";
import http from "http";
import { replaceTemplate } from "./modules/index.ts";

/**
 ******* File System Module
 */

// fs.readFile("./txt/input.txt", "utf-8", (err, data) => {
//   const dataG = data;
//   console.log(dataG);

//   fs.writeFile("./txt/output.txt", `Output: ${dataG}`, (err) => {
//     if (err) throw err;
//     console.log("File has been written!");
//   });
// });

/*
 ******* Serever Module
 */
interface Product {
  id: number;
  productName: string;
  image: string;
  from: string;
  nutrients: string;
  quantity: string;
  price: string;
  organic: boolean;
  description: string;
}

const tempOverview: string = fs.readFileSync(
  `${import.meta.dirname}/templates/template-overview.html`,
  "utf-8",
);
const tempCard: string = fs.readFileSync(
  `${import.meta.dirname}/templates/template-card.html`,
  "utf-8",
);
const tempProduct: string = fs.readFileSync(
  `${import.meta.dirname}/templates/template-product.html`,
  "utf-8",
);

const data: string = fs.readFileSync(
  `${import.meta.dirname}/dev_data/data.json`,
  "utf-8",
);
const dataObj: Product[] = JSON.parse(data);

const server: http.Server = http.createServer((req, res) => {
  const { searchParams: query, pathname } = new URL(
    req.url as string,
    `http://${req.headers.host}`,
  );

  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHtml: string = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    res.end(tempOverview.replace(/{% PRODUCT_CARDS %}/g, cardsHtml));
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });

    const id = Number(query.get("id"));
    res.end(replaceTemplate(tempProduct, dataObj[id]));
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(JSON.stringify(dataObj));
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(8000, "localhost", () => {
  console.log("Listening to requests on port 8000");
});
