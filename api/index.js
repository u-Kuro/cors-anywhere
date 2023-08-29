export const config = { runtime: 'edge' };
const allowedOrigins = ['https://u-kuro.github.io'];
export default async (req) => {
    try {
        const url = new URL(req.url).searchParams.get('url');
        if (typeof url !== 'string') {
            return new Response("Missing URL parameter", { status: 400 })
        }
        const response = await fetch(url, {
            headers: {
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
            cache: 'force-cache'
        });
        if (!response.ok) {
            return response
        }
        const origin = req.headers.get('origin')
        const headers = new Headers();
        if (allowedOrigins.includes(origin)) {
            headers.set('Access-Control-Allow-Origin', origin);
        } else {
            return new Response("Origin is not allowed", { status: 403 });
        }
        const contentType = response.headers.get('content-type');
        headers.set('Content-Type', contentType);
        headers.set('Vercel-CDN-Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Access-Control-Allow-Headers', '*')
        headers.set('Content-Encoding', 'gzip')
        headers.set('Vary', 'Accept-Encoding')
        headers.set('Accept-Ranges', 'bytes')
        headers.set('Access-Control-Max-Age', '86400')
        let responseBody;
        if (contentType.includes('text')) {
            responseBody = await response.text();
        } else if (contentType.includes('json')) {
            responseBody = JSON.stringify(await response.json());
        } else if (contentType.includes('image')) {
            responseBody = await response.arrayBuffer();
        }
        return new Response(responseBody, { status: 200, headers });
    } catch (error) {
        let message = error?.message
        message = typeof message === 'string' ? message : JSON.stringify(message)
        return new Response(message, { status: 500 });
    }
}