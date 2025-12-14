#!/bin/sh
set -e

DB_DATA_DIR=/var/lib/postgresql/data

# Initialize PostgreSQL if not exists
if [ -z "$(ls -A "$DB_DATA_DIR")" ]; then
    echo "📦 Initializing PostgreSQL database..."
    mkdir -p "$DB_DATA_DIR"
    chown -R postgres:postgres "$DB_DATA_DIR"
    
    # Init DB
    su - postgres -c "initdb -D $DB_DATA_DIR"
    
    # Config for access
    echo "host all all 0.0.0.0/0 md5" >> "$DB_DATA_DIR/pg_hba.conf"
    echo "listen_addresses='*'" >> "$DB_DATA_DIR/postgresql.conf"
    
    # Start temp server
    su - postgres -c "pg_ctl start -D $DB_DATA_DIR -w"
    
    # Create DB and User
    echo "🛠 Creating database 'newsportal' and user 'admin'..."
    su - postgres -c "psql -c \"CREATE USER admin WITH PASSWORD 'secret123';\""
    su - postgres -c "psql -c \"CREATE DATABASE newsportal OWNER admin;\""
    
    # Stop temp server
    su - postgres -c "pg_ctl stop -D $DB_DATA_DIR -m fast"
    echo "✅ Database initialized successfully"
else
    echo "Example database already exists, skipping initialization."
    # Ensure permissions are correct (case of volume mount)
    chown -R postgres:postgres "$DB_DATA_DIR"
    chmod 700 "$DB_DATA_DIR"
fi

# Create run directory for nginx
mkdir -p /run/nginx

# Start Supervisor
echo "🚀 Starting services..."
exec supervisord -c /etc/supervisord.conf
