import Parser from 'rss-parser';

const parser = new Parser();

const feedSources = [
    {
        url: 'https://techcommunity.microsoft.com/rss',
        source: 'Microsoft',
        logo: '/logos/microsoft.png',
    },
    {
        url: 'https://aws.amazon.com/blogs/aws/feed/',
        source: 'AWS',
        logo: '/logos/aws.png',
    },
    {
        url: 'https://cloud.google.com/blog/rss/',
        source: 'GCP',
        logo: '/logos/gcp.png',
    },
    {
        url: 'https://www.snowflake.com/feed/',
        source: 'Snowflake',
        logo: '/logos/snowflake.png',
    },
    {
        url: 'https://blogs.apache.org/rss.xml',
        source: 'Apache',
        logo: '/logos/apache.png',
    },
    {
        url: 'https://www.databricks.com/blog/feed',
        source: 'Databricks',
        logo: '/logos/databricks.png',
    },
    {
        url: 'https://openai.com/blog/rss.xml',
        source: 'OpenAI',
        logo: '/logos/openai.png',
    },
    {
        url: 'https://www.aitrends.com/feed/',
        source: 'AI Trends',
        logo: '/logos/ai.png',
    },
];

export async function fetchNews() {
    const allNews = [];

    await Promise.all(
        feedSources.map(async ({ url, source, logo }) => {
            try {
                const feed = await parser.parseURL(url);
                feed.items.slice(0, 3).forEach((item) => {
                    allNews.push({
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                        contentSnippet: item.contentSnippet,
                        source,
                        logo,
                    });
                });
            } catch (error) {
                console.error(`Error fetching news from ${source}:`, error);
            }
        })
    );

    return allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}
