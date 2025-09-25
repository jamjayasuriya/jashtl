# Order Management System Guide

## Overview

The Order Management system provides comprehensive order tracking, management, and reporting capabilities for the restaurant POS. It includes both Order Management and Table Management interfaces.

## Features

### 🎯 Order Management (`/orders`)

#### **Order Listing & Filtering**
- **Search Orders**: Search by order number, customer name, table number, or room number
- **Status Filtering**: Filter by order status (Pending, Held, Settled, Cancelled)
- **Order Type Filtering**: Filter by order type (Dine In, Takeaway, Room Service, Delivery)
- **Date Filtering**: Filter by date ranges (Today, Yesterday, Last 7 Days, All Dates)
- **Real-time Updates**: Refresh button to get latest orders

#### **Order Information Display**
- **Order Details**: Order number, customer info, order type, table/room assignment
- **Status Indicators**: Color-coded status badges
- **Order Type Icons**: Visual indicators for different order types
- **Location Info**: Table or room information when applicable
- **Financial Data**: Order totals and item counts
- **Timestamps**: Creation date and time

#### **Order Actions**
- **View Details**: Complete order information with items and totals
- **Status Updates**: Change order status (Complete, Cancel)
- **Delete Orders**: Remove orders from the system
- **Order History**: Track order progression

#### **Order Details Modal**
- **Complete Order Information**: All order details in one view
- **Item Breakdown**: Individual items with quantities, prices, and discounts
- **Customer Information**: Customer details and contact info
- **Location Details**: Table or room assignment
- **Financial Summary**: Subtotal, discounts, tax, and total
- **Order Actions**: Complete, cancel, or delete orders

### 🏢 Table Management (`/tables`)

#### **Table Listing & Management**
- **Table Grid View**: Visual table layout with status indicators
- **Search & Filter**: Find tables by number, name, location, or status
- **Status Management**: Available, Occupied, Reserved, Maintenance
- **Real-time Status**: Update table status instantly

#### **Table Information**
- **Basic Details**: Table number, name, capacity
- **Location Info**: Floor, location, room association
- **Status Tracking**: Current availability and status
- **Special Instructions**: Notes and special requirements

#### **Table Actions**
- **Add Tables**: Create new tables with full configuration
- **Edit Tables**: Update table details and settings
- **Delete Tables**: Remove tables from the system
- **Status Updates**: Mark tables as available/occupied
- **Room Association**: Link tables to specific rooms

#### **Table Configuration**
- **Table Number**: Unique identifier (e.g., T1, T2)
- **Table Name**: Descriptive name (e.g., Window Table)
- **Capacity**: Number of seats (1-20)
- **Status**: Available, Occupied, Reserved, Maintenance
- **Location**: Dining area or section
- **Floor**: Floor number (0-10)
- **Room Association**: Optional link to hotel rooms
- **Special Instructions**: Notes and requirements

## Navigation

### **Sidebar Navigation**
- **Orders Tab**: Access order management interface
- **Tables Tab**: Access table management interface
- **POS Tab**: Return to point of sale
- **Other Tabs**: Existing functionality (Dashboard, Customers, etc.)

### **URL Routes**
- `/orders` - Order Management interface
- `/tables` - Table Management interface
- `/pos` - Point of Sale interface

## Order Types & Workflow

### **1. Dine In Orders**
- **Table Selection**: Choose from available tables
- **Table Status**: Automatically updates to occupied
- **Location Tracking**: Table number displayed on order
- **Service Flow**: Order → Kitchen → Table → Payment

### **2. Takeaway Orders**
- **No Table Required**: Direct to kitchen
- **Customer Pickup**: Order ready for collection
- **Location Tracking**: Takeaway counter or pickup area

### **3. Room Service Orders**
- **Room Selection**: Choose from occupied rooms with room service enabled
- **Room Tracking**: Room number displayed on order
- **Service Flow**: Order → Kitchen → Room Delivery → Payment

### **4. Delivery Orders**
- **No Location Required**: External delivery
- **Address Tracking**: Customer delivery address
- **Service Flow**: Order → Kitchen → Delivery → Payment

## Status Management

### **Order Statuses**
- **Pending**: Order created, awaiting processing
- **Held**: Order saved, not yet completed
- **Settled**: Order completed and paid
- **Cancelled**: Order cancelled

### **Table Statuses**
- **Available**: Table ready for customers
- **Occupied**: Table in use
- **Reserved**: Table reserved for specific time
- **Maintenance**: Table under maintenance

## Data Integration

### **Order Data**
- **Customer Information**: Name, phone, email
- **Table/Room Assignment**: Location details
- **Order Items**: Products, quantities, prices, discounts
- **Financial Data**: Subtotal, discounts, tax, total
- **Timestamps**: Creation and update times
- **User Tracking**: Created by and updated by

### **Table Data**
- **Basic Information**: Number, name, capacity
- **Location Details**: Floor, area, room association
- **Status Information**: Current status and availability
- **Configuration**: Special instructions and requirements

## Usage Examples

### **Managing Dine In Orders**
1. **Create Order**: Select "Dine In" order type
2. **Choose Table**: Select from available tables
3. **Add Items**: Add products to cart
4. **Process Order**: Complete checkout
5. **Track Status**: Monitor order in Order Management
6. **Update Status**: Mark as settled when payment complete

### **Managing Room Service Orders**
1. **Create Order**: Select "Room Service" order type
2. **Choose Room**: Select from occupied rooms
3. **Add Items**: Add products to cart
4. **Process Order**: Complete checkout
5. **Track Status**: Monitor order in Order Management
6. **Update Status**: Mark as settled when payment complete

### **Managing Tables**
1. **View Tables**: Check table status and availability
2. **Add Tables**: Create new tables for the restaurant
3. **Update Status**: Mark tables as occupied/available
4. **Edit Details**: Update table information
5. **Delete Tables**: Remove unused tables

## Best Practices

### **Order Management**
- **Regular Updates**: Refresh order list frequently
- **Status Tracking**: Keep order status current
- **Customer Service**: Use order details for customer inquiries
- **Financial Accuracy**: Verify totals and payments

### **Table Management**
- **Status Accuracy**: Keep table status current
- **Capacity Planning**: Ensure adequate table capacity
- **Location Organization**: Use clear location names
- **Maintenance Tracking**: Mark tables under maintenance

### **Integration**
- **POS Workflow**: Use Order Management to track POS orders
- **Table Assignment**: Ensure proper table selection in POS
- **Status Synchronization**: Keep order and table status in sync
- **Data Consistency**: Maintain accurate order and table data

## Technical Details

### **API Endpoints**
- `GET /api/orders` - Fetch all orders
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order
- `GET /api/tables` - Fetch all tables
- `POST /api/tables` - Create new table
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

### **Data Models**
- **Order Model**: Enhanced with table_id, room_id, order_type
- **Table Model**: Complete table management with status tracking
- **Room Model**: Enhanced with room_service_enabled flag

### **Frontend Components**
- **OrderManagement.jsx**: Main order management interface
- **TableManagement.jsx**: Table management interface
- **OrderDetailsModal**: Detailed order view
- **TableModal**: Table creation/editing interface

## Troubleshooting

### **Common Issues**
1. **Orders Not Loading**: Check authentication and API connectivity
2. **Tables Not Showing**: Verify table creation and API endpoints
3. **Status Updates Failing**: Check API permissions and data validation
4. **Search Not Working**: Verify search parameters and data format

### **Data Validation**
- **Order Status**: Must be valid status value
- **Table Number**: Must be unique
- **Capacity**: Must be between 1-20
- **Required Fields**: Order type, customer, items required

## Future Enhancements

### **Planned Features**
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Filtering**: More filter options and saved filters
- **Bulk Operations**: Mass status updates and operations
- **Reporting**: Order and table analytics
- **Mobile Support**: Mobile-optimized interfaces
- **Integration**: Kitchen display system integration
