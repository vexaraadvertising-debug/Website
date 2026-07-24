import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_PRODUCTS } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], suggestions: [] });
    }

    try {
      const dbProducts = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          isActive: true
        },
        take: 5,
        select: {
          id: true,
          slug: true,
          name: true,
          basePrice: true,
          images: { take: 1, select: { url: true } }
        }
      });

      if (dbProducts && dbProducts.length > 0) {
        return NextResponse.json({
          products: dbProducts,
          suggestions: [`${query} t-shirt`, `oversized ${query}`, `${query} anime`],
          trending: ["Tokyo Drift Oversized", "Minimalist Series", "Anime Legends"]
        });
      }
    } catch {
      // Fallback to mock search if DB fails
    }

    const fallbackProducts = MOCK_PRODUCTS.filter(
      p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    return NextResponse.json({
      products: fallbackProducts.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        basePrice: p.price,
        images: [{ url: p.image }]
      })),
      suggestions: [`${query} t-shirt`, `oversized ${query}`, `${query} anime`],
      trending: ["Tokyo Drift Oversized", "Minimalist Series", "Anime Legends"]
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
