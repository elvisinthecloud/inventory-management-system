import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db'; // Assuming db utility is in src/lib

/**
 * Handles GET requests to fetch all products.
 * URL: /api/products
 */
export async function GET(request: Request) {
  try {
    // Define the SQL query to select all products, ordered by category then name
    const query = `
      SELECT id, name, category, price, stock
      FROM Products
      ORDER BY category, name;
    `;

    // Execute the query using the helper function from db.ts
    // No parameters needed for this query
    const result = await executeQuery(query);

    // Check if rows were returned
    if (!result.recordset) {
        console.warn('No products found in the database.');
        return NextResponse.json({ products: [] }, { status: 200 }); // Return empty array if no products
    }

    // Successfully retrieved products
    console.log(`Fetched ${result.recordset.length} products.`);
    return NextResponse.json({ products: result.recordset }, { status: 200 });

  } catch (error) {
    // Handle potential errors during database interaction
    console.error('API Error: Failed to fetch products:', error);

    // Return a generic server error response
    return NextResponse.json(
        { message: 'Internal Server Error', error: (error as Error).message },
        { status: 500 }
    );
  }
}

// Note: It's good practice to explicitly mark API routes as dynamic
// if they depend on runtime data (like database queries) to avoid
// potential caching issues, especially with Next.js App Router.
export const dynamic = 'force-dynamic'; 