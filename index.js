import express from 'express';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import cors from 'cors';

cors({ origin: true });

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});
app.use(express.json({ limit: '1mb' }));

app.get("/scraper", async (request, response) => {
  let link = request.query.link;

  if (!link) {
    response.status(400).send("Link is required");
    return;
  }

  if (!link.includes("http") || !link.includes("https")) link = "https://" + link;

  const res = await fetch(link);
  const html = await res.text();
  const $ = cheerio.load(html);

  const getFavicon = () =>
    $(`link[rel="shortcut icon"]`).attr('href') ||
    $(`link[rel="alternate icon"]`).attr('href') ||
    $(`link[rel="icon"]`).attr('href') ||
    $(`link[rel="apple-touch-icon"]`).attr('href') ||
    $(`link[rel="apple-touch-icon-precomposed"]`).attr('href')

  const getMetatag = (name) =>
    $(`meta[name=${name}]`).attr('content') ||
    $(`meta[name="og:${name}"]`).attr('content') ||
    $(`meta[property="og:${name}"]`).attr('content') ||
    $(`meta[name="twitter:${name}"]`).attr('content') ||
    $(`meta[name="twitter:${name}:src"]`).attr('content') ||
    $(`.${name}`).text().replace(/\n/g, "")


  const data = {
    url: link,
    title: $('title').first().text(),
    favicon: getFavicon(),
    description: getMetatag('description'),
    image: getMetatag('image'),
    author: getMetatag('author'),
  }

  console.log(data);
  response.send(JSON.stringify(data));
})