// /pages/api/news.js
import Parser from "rss-parser";
const parser = new Parser();

export default async function handler(req, res) {
  const feeds = [
    "https://techcrunch.com/tag/artificial-intelligence/feed/",
    "https://www.theverge.com/rss/artificial-intelligence/index.xml",
    "https://www.moneycontrol.com/rss/technology.xml",
    "https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms",
    "https://inc42.com/feed/"
  ];

  let newsItems = [];

  for (let feed of feeds) {
    try {
      const parsedFeed = await parser.parseURL(feed);
      parsedFeed.items.forEach(item => {
        newsItems.push({
          title: item.title,
          link: item.link,
          source: parsedFeed.title,
          date: item.pubDate,
          summary: item.contentSnippet,
          image: item.enclosure?.url 
              || item["media:content"]?.url 
              || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/400/200`
        });
      });
    } catch (err) {
      console.error(`Error fetching ${feed}`, err);
    }
  }

  // Sort latest first
  newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.status(200).json(newsItems);
}
