import { NextResponse } from 'next/server';
import { executeQuery, sql } from '@/lib/db'; // Assuming db utility is in src/lib

// Add the RouteContext interface back
interface RouteContext {
  params: {
    categoryName: string;
  };
}

/**
 * Handles GET requests to fetch products by category name.
 * URL: /api/products/category/[categoryName]
 * Example: /api/products/category/Chiles
 */
// Revert function signature to use context object
export async function GET(
    request: Request,
    context: RouteContext // Use the interface here
) {
  // Extract the category name from the context object
  const { categoryName } = context.params;

  // Decode the category name in case it contains URL-encoded characters (e.g., %20 for space)
  const decodedCategoryName = decodeURIComponent(categoryName);

  console.log(`API: Fetching products for category: ${decodedCategoryName}`);

  try {
    // Define the SQL query with a parameter placeholder for the category
    const query = `
      SELECT id, name, category, price, stock
      FROM Products
      WHERE category = @categoryName
      ORDER BY name;
    `;

    // Define the parameters object for the query
    // Use sql.NVarChar to explicitly define the type for security and correctness
    const params = {
        categoryName: decodedCategoryName
        // Example if specifying type: categoryName: { type: sql.NVarChar, value: decodedCategoryName }
        // For mssql library, direct value often works if type inference is sufficient
    };

    // Execute the parameterized query
    const result = await executeQuery(query, params);

    // Check if rows were returned
    if (!result.recordset || result.recordset.length === 0) {
      console.warn(`No products found for category: ${decodedCategoryName}`);
      // Return empty array if no products found for this category, still a success (200)
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    // Successfully retrieved products for the category
    console.log(`Fetched ${result.recordset.length} products for category: ${decodedCategoryName}.`);
    return NextResponse.json({ products: result.recordset }, { status: 200 });

  } catch (error) {
    // Handle potential errors during database interaction
    console.error(`API Error: Failed to fetch products for category ${decodedCategoryName}:`, error);

    // Return a generic server error response
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Mark as dynamic as it depends on runtime parameters and DB data
export const dynamic = 'force-dynamic'; 