# Table and Room Ordering System Setup

This document explains how to set up and use the new table and room ordering system for the restaurant POS.

## Features Added

1. **Table Management**
   - Create and manage restaurant tables
   - Table capacity, location, and status tracking
   - Table selection for dine-in orders

2. **Room Service**
   - Room service ordering for hotel guests
   - Room selection for room service orders
   - Room status and service availability tracking

3. **Order Types**
   - Dine In (with table selection)
   - Takeaway
   - Room Service (with room selection)
   - Delivery

4. **Enhanced Order Tracking**
   - Orders now include table/room information
   - Better order management and tracking
   - Print receipts with table/room details

## Setup Instructions

### 1. Run Database Migrations

```bash
cd restaurant-pos-backend
node setup-tables.js
```

This will:
- Create the `tables` table
- Add new fields to the `orders` table (table_id, room_id, order_type)
- Create sample tables
- Enable room service for existing rooms

### 2. Start the Backend Server

```bash
cd restaurant-pos-backend
npm start
```

### 3. Start the Frontend

```bash
cd restaurant-pos-frontend
npm run dev
```

## Usage

### Creating Tables

1. Use the API endpoint `POST /api/tables` to create tables
2. Or run the setup script which creates sample tables

### Creating Orders

1. **Dine In Orders:**
   - Select "Dine In" as order type
   - Choose a table from available tables
   - Add items to cart and checkout

2. **Room Service Orders:**
   - Select "Room Service" as order type
   - Choose a room from occupied rooms with room service enabled
   - Add items to cart and checkout

3. **Takeaway/Delivery Orders:**
   - Select appropriate order type
   - No table/room selection needed
   - Add items to cart and checkout

### Order Management

- Orders now show table/room information in pending orders
- Receipts include table/room details
- Orders can be filtered by table/room

## API Endpoints

### Tables
- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create new table
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

### Orders (Enhanced)
- `GET /api/orders` - Get orders with table/room info
- `POST /api/orders` - Create order with table/room assignment
- `PUT /api/orders/:id` - Update order with table/room info

## Database Schema

### Tables Table
```sql
CREATE TABLE tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_number VARCHAR(20) UNIQUE NOT NULL,
  table_name VARCHAR(100),
  capacity INTEGER DEFAULT 4,
  status ENUM('available', 'occupied', 'reserved', 'maintenance') DEFAULT 'available',
  room_id INTEGER REFERENCES rooms(id),
  location VARCHAR(100),
  floor INTEGER,
  is_active BOOLEAN DEFAULT true,
  special_instructions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table (New Fields)
```sql
ALTER TABLE orders ADD COLUMN table_id INTEGER REFERENCES tables(id);
ALTER TABLE orders ADD COLUMN room_id INTEGER REFERENCES rooms(id);
ALTER TABLE orders ADD COLUMN order_type ENUM('dine_in', 'takeaway', 'room_service', 'delivery') DEFAULT 'dine_in';
```

## Sample Data

The setup script creates 5 sample tables:
- T1: Window Table (4 seats, Main Dining)
- T2: Corner Table (2 seats, Main Dining)
- T3: Family Table (6 seats, Main Dining)
- T4: VIP Table (4 seats, VIP Section)
- T5: Bar Table (2 seats, Bar Area)

## Troubleshooting

1. **Tables not showing:** Make sure the backend server is running and the setup script has been executed
2. **Room service not available:** Ensure rooms have `room_service_enabled = true`
3. **Orders not saving table info:** Check that the frontend is passing the correct props to the Cart component

## Future Enhancements

- Table reservation system
- Real-time table status updates
- Kitchen display system integration
- Mobile ordering for room service
- Table service tracking
