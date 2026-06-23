import { NextResponse } from 'next/server';
import { getLatestPosts } from '@/lib/db';

export async function GET() {
  try {
    const posts = await getLatestPosts(20);
    const siteUrl = 'https://rebornbiz.co.kr';
    
    // RSS 2.0 XML 생성
    const rssItemsXml = posts.map(post => {
      // content_html에서 태그 제거하고 일부 텍스트만 추출 (요약용)
      const plainText = (post.content_html || '').replace(/<[^>]+>/g, '').trim();
      const description = plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
      const pubDate = new Date(post.created_at).toUTCString();
      
      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${siteUrl}/magazine/${post.id}</link>
          <description><![CDATA[${description}]]></description>
          <pubDate>${pubDate}</pubDate>
          <guid>${siteUrl}/magazine/${post.id}</guid>
        </item>
      `;
    }).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RebornBiz 매거진</title>
    <link>${siteUrl}</link>
    <description>소상공인 폐업 및 재도전을 위한 필수 정보와 가이드</description>
    <language>ko</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('RSS Feed Generation Error:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate RSS feed</error>', {
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
