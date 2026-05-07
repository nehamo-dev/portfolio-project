export default async function handler(req, res) {
  const feed = await fetch('https://nehamo.substack.com/feed');
  const xml = await feed.text();

  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 3) {
    const block = match[1];
    const title    = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)    || block.match(/<title>(.*?)<\/title>/))?.[1]       || '';
    const link     = block.match(/<link>(.*?)<\/link>/)?.[1]                   || '';
    const pubDate  = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]             || '';
    const desc     = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || block.match(/<description>([\s\S]*?)<\/description>/))?.[1] || '';

    const snippet = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 140) + '…';
    const date    = new Date(pubDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    items.push({ title, link, date, snippet });
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.json({ items });
}
