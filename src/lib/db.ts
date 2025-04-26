import sql, { ConnectionPool } from 'mssql';

// Retrieve connection string from environment variables
const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

// Check if connection string is defined
if (!connectionString) {
  console.error(
    'Azure SQL connection string is not defined in environment variables (AZURE_SQL_CONNECTION_STRING).'
  );
  // Throwing an error might be better in production to halt startup
  // throw new Error('Azure SQL connection string is not defined in environment variables (AZURE_SQL_CONNECTION_STRING)');
}

// Global variable for the connection pool promise.
// This ensures we only initialize the pool once.
let poolPromise: Promise<ConnectionPool> | null = null;

/**
 * Gets the singleton connection pool instance.
 * Creates the pool if it doesn't exist yet.
 *
 * @returns {Promise<ConnectionPool>} A promise that resolves with the connection pool.
 */
export const getConnectionPool = (): Promise<ConnectionPool> => {
  if (!connectionString) {
    // Return a rejected promise if the connection string is missing
    return Promise.reject(
      new Error("Azure SQL connection string not found. Cannot create pool.")
    );
  }

  if (!poolPromise) {
    poolPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('Attempting to create Azure SQL connection pool...');
        // Use the connection string directly with new ConnectionPool
        const pool = new ConnectionPool(connectionString);

        // Store the original close function
        const originalClose = pool.close.bind(pool);

        // Override close to reset the poolPromise, allowing recreation
        pool.close = () => {
          console.log("Closing Azure SQL connection pool and resetting promise.");
          poolPromise = null;
          return originalClose();
        };

        // Connect the pool
        await pool.connect();

        console.log('Azure SQL connection pool created successfully.');
        resolve(pool);
      } catch (err) {
        console.error('Failed to create Azure SQL connection pool:', err);
        poolPromise = null; // Reset promise on error to allow retry
        reject(err); // Reject the promise
      }
    });
  }
  return poolPromise;
};

// Optional: Export the sql object itself if needed for specific data types
export { sql };

// Example helper function to execute a query using the pool
// This simplifies query execution in API routes.
export async function executeQuery(query: string, params?: { [key: string]: unknown }): Promise<sql.IResult<unknown>> {
    try {
        const pool = await getConnectionPool();
        const request = pool.request();

        // Add parameters safely if provided
        if (params) {
            for (const key in params) {
                if (Object.prototype.hasOwnProperty.call(params, key)) {
                    // Note: Parameter type inference is basic here.
                    // For more complex scenarios, you might need to specify sql types explicitly.
                    // Example: request.input(key, sql.Int, params[key]);
                    request.input(key, params[key]);
                }
            }
        }

        const result = await request.query(query);
        return result; // Return the full result object (recordset, rowsAffected, etc.)
    } catch (error) {
        console.error("Error executing query:", query, "Params:", params, "Error:", error);
        // Re-throw the error so the calling API route can handle it (e.g., return 500)
        throw error;
    }
} 