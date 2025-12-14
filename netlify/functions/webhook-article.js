// Note: This is a serverless function for Netlify
// Since this is a frontend-only app with localStorage, actual webhook processing
// needs to happen client-side. This function serves as a bridge.

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const apiKey = event.headers['x-api-key'];

        if (!apiKey) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Missing API key. Include X-API-Key header.' }),
            };
        }

        const body = JSON.parse(event.body || '{}');

        // Validate required fields
        if (!body.title || !body.content) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: title, content' }),
            };
        }

        // Return the validated data - frontend will handle the actual storage
        // This is because localStorage is client-side only
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Article data validated. Use client-side handler to store.',
                apiKey: apiKey,
                article: {
                    title: body.title,
                    content: body.content,
                    excerpt: body.excerpt || body.content.substring(0, 200) + '...',
                    category: body.category || '',
                    author: body.author || 'API',
                    image: body.image || '',
                    featured: body.featured || false,
                    tags: body.tags || [],
                },
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error: ' + error.message }),
        };
    }
};
