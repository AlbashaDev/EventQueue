import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { log } from './vite';

/**
 * Script to set up the database when deployed.
 * This will automatically create all tables from the schema.
 */
async function setupDatabase() {
  log('Starting database setup...', 'db-setup');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    log('DATABASE_URL environment variable is not set!', 'db-setup');
    process.exit(1);
  }
  
  try {
    // Create a connection pool
    const pool = new Pool({ connectionString });
    
    // Connect to the database
    await pool.connect();
    log('Connected to database successfully', 'db-setup');
    
    // Initialize Drizzle with the pool
    const db = drizzle(pool);
    
    // Check if the database has any tables
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
    `);
    
    if (result.rows.length === 0) {
      log('No tables found in the database. Creating schema...', 'db-setup');
      
      // Push the schema to the database
      await migrate(db, { migrationsFolder: './migrations' });
      log('Schema created successfully', 'db-setup');
      
      // Create default admin user
      await pool.query(`
        INSERT INTO users (username, password, is_admin, is_approved, created_at)
        VALUES ('admin', 'admin123', true, true, NOW())
      `);
      log('Default admin user created', 'db-setup');
    } else {
      log(`Found ${result.rows.length} existing tables. Database already set up.`, 'db-setup');
    }
    
    // Close the connection
    await pool.end();
    log('Database setup completed successfully', 'db-setup');
    
  } catch (error) {
    log(`Database setup failed: ${error}`, 'db-setup');
    process.exit(1);
  }
}

// Run the setup
setupDatabase();