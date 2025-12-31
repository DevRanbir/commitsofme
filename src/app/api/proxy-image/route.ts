import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return new NextResponse('Failed to fetch image', { status: response.status });
        }

        const blob = await response.blob();
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(blob, {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error('Error fetching image:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
