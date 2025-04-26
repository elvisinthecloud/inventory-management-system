import { NextResponse } from 'next/server';
import { getConnectionPool, sql } from '@/lib/db';
import { ConnectionPool, Transaction, Request as SqlRequest } from 'mssql';

// Define the expected structure for items in the request body
interface StockUpdateItem {
  id: number;
  quantitySold: number;
}

/**
 * Handles PATCH requests to update stock levels for multiple products.
 * Expects a request body: { items: [{ id: number, quantitySold: number }, ...] }
 * URL: /api/products/stock
 */
export async function PATCH(request: Request) {
  let transaction: Transaction | null = null;

  try {
    // 1. Parse and Validate Request Body
    const body = await request.json();

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { message: 'Invalid request body. Expected { items: [{ id: number, quantitySold: number }, ...] }.' },
        { status: 400 }
      );
    }

    // Validate individual items
    const itemsToUpdate: StockUpdateItem[] = body.items;
    for (const item of itemsToUpdate) {
      if (typeof item.id !== 'number' || typeof item.quantitySold !== 'number' || item.quantitySold <= 0) {
        return NextResponse.json(
          { message: 'Invalid item data in request. Each item must have a numeric id and a positive numeric quantitySold.' },
          { status: 400 }
        );
      }
    }

    console.log(`API: Received stock update request for ${itemsToUpdate.length} items.`);

    // 2. Get Connection Pool and Start Transaction
    const pool: ConnectionPool = await getConnectionPool();
    transaction = pool.transaction();
    await transaction.begin();
    console.log('Database transaction started.');

    // 3. Execute Updates within Transaction
    for (const item of itemsToUpdate) {
        console.log(`Attempting to update stock for product ID: ${item.id}, quantity sold: ${item.quantitySold}`);
        const req = transaction.request(); // Create request within the transaction
        req.input('id', sql.Int, item.id);
        req.input('quantitySold', sql.Int, item.quantitySold);

        // This query attempts to decrement stock only if sufficient stock exists.
        // The database constraint (CHECK stock >= 0) provides an additional layer of safety.
        const updateQuery = `
            UPDATE Products
            SET stock = stock - @quantitySold
            WHERE id = @id AND stock >= @quantitySold;
        `;

        const result = await req.query(updateQuery);

        // Check if the update affected any row. If not, stock was insufficient or ID didn't exist.
        if (result.rowsAffected[0] === 0) {
            console.error(`Stock update failed for product ID: ${item.id}. Insufficient stock or product not found.`);
            // Throw an error to trigger the transaction rollback
            throw new Error(`Insufficient stock or product not found for ID: ${item.id}`);
        }
         console.log(`Successfully updated stock for product ID: ${item.id}`);
    }

    // 4. Commit Transaction if all updates succeeded
    await transaction.commit();
    console.log('Database transaction committed successfully.');

    return NextResponse.json({ message: 'Stock updated successfully.' }, { status: 200 });

  } catch (error) {
    // 5. Rollback Transaction on any error
    console.error('API Error: Failed to update stock:', error);
    if (transaction) {
      try {
        await transaction.rollback();
        console.log('Database transaction rolled back due to error.');
      } catch (rollbackError) {
        console.error('Failed to rollback transaction:', rollbackError);
        // Log additional error but proceed to return the original error response
      }
    }

    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error && error.message.startsWith('Insufficient stock')) {
        statusCode = 409; // Conflict status for stock issues
        errorMessage = error.message;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }


    return NextResponse.json(
      { message: 'Failed to update stock', error: errorMessage },
      { status: statusCode }
    );
  }
}

// Mark as dynamic as it depends on runtime data and performs mutations
export const dynamic = 'force-dynamic'; 