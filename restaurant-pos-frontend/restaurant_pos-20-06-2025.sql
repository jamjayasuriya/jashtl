-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 20, 2025 at 03:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `restaurant_pos`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `drop_multiple_indices` ()   BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 64 DO
        SET @sql = CONCAT('ALTER TABLE `', @table_name, '` DROP INDEX `', @index_base, i, '`');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `barcodes`
--

CREATE TABLE `barcodes` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Hot food'),
(2, 'Beverages'),
(3, 'Food'),
(5, 'Appetizers'),
(6, 'Main Courses'),
(7, 'Desserts'),
(8, 'Appetizers'),
(9, 'Main Courses'),
(10, 'Desserts'),
(11, 'Appetizers'),
(12, 'Main Courses'),
(13, 'Desserts');

-- --------------------------------------------------------

--
-- Table structure for table `customerpayments`
--

CREATE TABLE `customerpayments` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `amount` decimal(10,0) DEFAULT NULL,
  `payment_type` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `dues` decimal(10,2) NOT NULL DEFAULT 0.00,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `address`, `dues`, `createdAt`, `updatedAt`) VALUES
(1, 'Running Customer', NULL, '123-456-7890', NULL, 1040.84, '2025-03-21 01:24:29', '2025-05-04 08:27:29'),
(2, 'Loganadan', 'loga@gmail.com', '075885854', 'Weel Bpron, South Africa', 0.00, '2025-05-20 05:08:15', '2025-05-20 05:08:15'),
(3, 'John Doe', NULL, '0772305441', NULL, 24.04, '2025-03-21 01:24:29', '2025-05-01 06:06:29'),
(6, 'Saman Kumara', 'saman@gmail.com', '0572252365', 'Haputale Estate,\nHaputale', 6.10, '2025-05-14 04:01:42', '2025-05-14 04:02:29'),
(9, 'Somasekara', 'some@gmail.com', '0755545962', 'Koslanda', 0.00, '2025-06-14 04:13:44', '2025-06-14 04:13:44');

-- --------------------------------------------------------

--
-- Table structure for table `customer_dues`
--

CREATE TABLE `customer_dues` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_dues`
--

INSERT INTO `customer_dues` (`id`, `customer_id`, `sale_id`, `amount`) VALUES
(1, 1, 145, 100.00),
(2, 1, 146, 100.00),
(3, 1, 147, 100.00),
(4, 1, 148, 4.39),
(5, 1, 149, 2.36),
(6, 1, 150, 1.49),
(7, 1, 151, 8.99),
(8, 1, 152, 0.10),
(9, 1, 159, 3.05),
(10, 1, 186, 4.99),
(11, 1, 188, 6.50),
(12, 3, 203, 3.99),
(13, 3, 230, 2.49),
(14, 3, 231, 2.49),
(15, 3, 243, 5.50),
(16, 3, 244, 3.59),
(17, 3, 247, 5.98),
(18, 1, 339, 87.99),
(19, 6, 354, 6.10);

-- --------------------------------------------------------

--
-- Table structure for table `customer_payments`
--

CREATE TABLE `customer_payments` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` enum('cash','card') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `id` int(11) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `value` decimal(10,0) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goods_returns`
--

CREATE TABLE `goods_returns` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `return_date` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guests`
--

CREATE TABLE `guests` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_no` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `postcode` varchar(10) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guests`
--

INSERT INTO `guests` (`id`, `first_name`, `last_name`, `phone_no`, `email`, `gender`, `address`, `postcode`, `city`, `country`, `booking_id`, `created_at`, `updated_at`) VALUES
(1, 'Jane-1', 'Smith sharmasekara', '0987654321', 'jane.smith@example2.com', 'Female', '456 Elm St', '67890', 'Los Angeles', 'USA', 2, '2025-06-09 10:10:45', '2025-06-09 10:10:45'),
(2, 'Jane', 'Smith', '987-654-3210', 'jane.smith@example.com', 'Female', '456 Tea Lane', '12345', 'Tea Town', 'Tealand', 1, '2025-06-09 10:18:16', '2025-06-09 10:18:16');

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `type` enum('in','out') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `cart_discount` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','settled','cancelled') DEFAULT 'pending',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `sale_id` int(11) DEFAULT NULL,
  `cart_discount_type` varchar(20) NOT NULL DEFAULT 'percentage'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `customer_id`, `created_by`, `cart_discount`, `tax_amount`, `subtotal`, `total`, `status`, `created_at`, `updated_at`, `sale_id`, `cart_discount_type`) VALUES
(1, 'ORD-001-20250528', 1, 35, 0.00, 0.00, 19.95, 19.95, 'settled', '2025-05-28 03:52:23', '2025-06-03 10:21:49', 402, 'percentage'),
(3, 'ORD-1748422461287', 1, 35, 2.00, 0.00, 32.97, 30.97, 'settled', '2025-05-28 08:54:21', '2025-05-28 11:06:21', 160, 'percentage'),
(6, 'ORD-1748434207856', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-05-28 12:10:07', '2025-05-29 04:49:09', 398, 'percentage'),
(8, 'ORD-1748497837288', 2, 35, 0.00, 0.00, 8.99, 8.99, 'settled', '2025-05-29 05:50:37', '2025-06-04 05:07:02', 405, 'percentage'),
(10, 'ORD-1748507306407', 1, 35, 0.00, 0.00, 11.97, 11.97, 'settled', '2025-05-29 08:28:26', '2025-05-30 03:46:43', 399, 'percentage'),
(11, 'D0011', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-05-29 11:23:56', '2025-06-04 08:31:38', 417, 'percentage'),
(12, 'D0012', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-05-29 11:27:57', '2025-06-04 07:01:53', 415, 'percentage'),
(13, 'O0013', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-05-29 11:28:41', '2025-06-06 07:04:51', 418, 'percentage'),
(15, 'ORD-0015', 1, 35, 0.00, 0.00, 5.50, 5.50, 'settled', '2025-06-03 09:27:17', '2025-06-04 07:10:21', 416, 'percentage'),
(16, 'ORD-0016', 1, 35, 0.00, 0.00, 10.99, 10.99, 'settled', '2025-06-03 09:34:23', '2025-06-03 09:34:33', 400, 'percentage'),
(17, 'ORD-0017', 1, 35, 0.00, 0.00, 3.99, 3.99, 'pending', '2025-06-03 09:55:01', '2025-06-03 09:55:37', NULL, 'percentage'),
(18, 'ORD-0018', 1, 35, 0.00, 0.00, 3.99, 3.99, 'pending', '2025-06-03 10:01:28', '2025-06-03 10:06:53', NULL, 'percentage'),
(19, 'ORD-0019', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-06-03 10:16:13', '2025-06-03 10:16:21', 401, 'percentage'),
(20, 'ORD-0020', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-06-03 10:27:59', '2025-06-03 10:28:13', 403, 'percentage'),
(21, 'ORD-0021', 1, 35, 0.00, 0.00, 10.99, 10.99, 'settled', '2025-06-03 11:09:02', '2025-06-13 12:13:52', 424, 'percentage'),
(22, 'ORD-0022', 1, 35, 0.00, 0.00, 8.99, 8.99, 'settled', '2025-06-04 04:27:06', '2025-06-07 13:14:41', 419, 'percentage'),
(23, 'ORD-0023', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-06-04 05:21:37', '2025-06-04 05:21:45', 408, 'percentage'),
(24, 'ORD-0024', 1, 35, 0.00, 0.00, 10.99, 10.99, 'pending', '2025-06-04 05:24:16', '2025-06-04 05:24:16', NULL, 'percentage'),
(25, 'ORD-0025', 1, 35, 0.00, 0.00, 10.99, 10.99, 'settled', '2025-06-04 05:24:19', '2025-06-04 05:24:23', 412, 'percentage'),
(26, 'ORD-0026', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-06-04 06:01:22', '2025-06-04 06:01:28', 413, 'percentage'),
(27, 'ORD-0027', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-06-04 06:44:48', '2025-06-04 06:57:31', 414, 'percentage'),
(28, 'ORD-0028', 1, 35, 0.00, 0.00, 3.99, 3.99, 'pending', '2025-06-05 08:23:43', '2025-06-05 08:23:43', NULL, 'percentage'),
(29, 'ORD-0029', 1, 35, 0.00, 0.00, 3.99, 3.99, 'pending', '2025-06-06 05:32:06', '2025-06-06 05:32:06', NULL, 'percentage'),
(30, 'ORD-0030', 1, 35, 0.00, 0.00, 3.99, 3.99, 'pending', '2025-06-07 10:08:29', '2025-06-07 10:08:29', NULL, 'percentage'),
(31, 'ORD-0031', 1, 35, 0.00, 0.00, 8.98, 8.98, 'pending', '2025-06-13 06:12:32', '2025-06-13 06:12:32', NULL, 'percentage'),
(32, 'ORD-0032', 1, 35, 0.00, 0.00, 4.99, 4.99, 'settled', '2025-06-13 06:45:12', '2025-06-13 06:45:17', 420, 'percentage'),
(33, 'ORD-0033', 1, 35, 0.00, 0.00, 3.99, 3.99, 'settled', '2025-06-13 12:20:27', '2025-06-13 12:20:34', 425, 'percentage'),
(35, 'ORD-0034', 1, 35, 0.00, 0.00, 6.18, 6.18, 'pending', '2025-06-19 17:19:37', '2025-06-19 17:19:37', NULL, 'percentage');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `item_discount` decimal(10,2) DEFAULT 0.00,
  `item_total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `quantity`, `price`, `item_discount`, `item_total`) VALUES
(9, 12, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(10, 13, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(15, 10, 10, 'Garlic Bread', 3, 3.99, 0.00, 11.97),
(17, 15, 11, 'Tiramisu', 1, 5.50, 0.00, 5.50),
(18, 16, 13, 'Test Product', 1, 10.99, 0.00, 10.99),
(20, 17, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(24, 18, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(25, 19, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(26, 1, 10, 'Garlic Bread', 5, 3.99, 0.00, 19.95),
(27, 20, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(29, 11, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(32, 21, 13, 'Test Product', 1, 10.99, 0.00, 10.99),
(34, 8, 7, 'Margherita Pizza', 1, 8.99, 0.00, 8.99),
(36, 22, 7, 'Margherita Pizza', 1, 8.99, 0.00, 8.99),
(37, 23, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(38, 24, 13, 'Test Product', 1, 10.99, 0.00, 10.99),
(39, 25, 13, 'Test Product', 1, 10.99, 0.00, 10.99),
(41, 26, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(42, 27, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(43, 28, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(44, 29, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(45, 30, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(46, 31, 12, 'Chocolate Cake', 1, 4.99, 0.00, 4.99),
(47, 31, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(48, 32, 12, 'Chocolate Cake', 1, 4.99, 0.00, 4.99),
(49, 33, 10, 'Garlic Bread', 1, 3.99, 0.00, 3.99),
(51, 35, 1, 'Burger', 1, 6.18, 0.00, 6.18);

-- --------------------------------------------------------

--
-- Table structure for table `paymenttypes`
--

CREATE TABLE `paymenttypes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_types`
--

CREATE TABLE `payment_types` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `printers`
--

CREATE TABLE `printers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('receipt','kitchen') NOT NULL,
  `ip_address` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `image_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `category_id`, `stock`, `createdAt`, `updatedAt`, `image_path`) VALUES
(1, 'Burger', 6.18, 1, 9, '2025-03-22 13:13:04', '2025-06-14 06:27:19', '/uploads/burger.jpg'),
(2, 'Product 2', 200.00, 1, 34, '2025-03-28 17:48:09', '2025-06-04 05:22:21', '/uploads/product2.jpg'),
(7, 'Margherita Pizza', 8.99, 2, 10, '2025-03-22 13:13:04', '2025-06-11 05:29:14', '/uploads/margheritapizza.jpg'),
(8, 'Pepperoni Pizza', 9.99, 2, 16, '2025-03-22 13:13:04', '2025-04-02 09:43:28', NULL),
(9, 'Caesar Salad', 6.50, 1, 0, '2025-03-22 13:13:04', '2025-05-15 11:49:41', '/uploads/ceasarsalad.jpg'),
(10, 'Garlic Bread', 3.99, 1, 0, '2025-03-22 13:13:04', '2025-06-13 12:20:34', '/uploads/garlicbread.jpg'),
(11, 'Tiramisu', 5.50, 3, 94, '2025-03-22 13:13:04', '2025-06-11 05:33:00', NULL),
(12, 'Chocolate Cake', 4.99, 3, 1, '2025-03-22 13:13:04', '2025-06-13 07:02:52', NULL),
(13, 'Test Product', 10.99, 1, 39, '2025-04-09 12:01:32', '2025-06-13 12:13:50', '/uploads/test.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `product_purchases`
--

CREATE TABLE `product_purchases` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `purchasing_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `purchase_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proforma_invoices`
--

CREATE TABLE `proforma_invoices` (
  `id` int(11) NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `guest_id` int(11) NOT NULL,
  `room_number` varchar(10) DEFAULT NULL,
  `event_id` int(11) DEFAULT NULL,
  `issue_date` datetime NOT NULL,
  `due_date` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `bill_discount` decimal(10,2) DEFAULT 0.00,
  `service_charge` decimal(10,2) DEFAULT 0.00,
  `gratuity` decimal(10,2) DEFAULT 0.00,
  `final_amount` decimal(10,2) NOT NULL,
  `remarks` text DEFAULT NULL,
  `status` enum('draft','issued','fulfilled','cancelled') DEFAULT 'draft',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proforma_invoices`
--

INSERT INTO `proforma_invoices` (`id`, `invoice_no`, `guest_id`, `room_number`, `event_id`, `issue_date`, `due_date`, `total_amount`, `bill_discount`, `service_charge`, `gratuity`, `final_amount`, `remarks`, `status`, `created_at`, `updated_at`) VALUES
(1, 'PI-HOTEL-20250611-799', 1, NULL, NULL, '2025-06-11 00:00:00', NULL, 30.00, 0.00, 2.00, 1.00, 33.00, 'Room service order', 'draft', '2025-06-11 11:20:37', '2025-06-11 11:20:37');

-- --------------------------------------------------------

--
-- Table structure for table `proforma_invoice_items`
--

CREATE TABLE `proforma_invoice_items` (
  `id` int(11) NOT NULL,
  `proforma_invoice_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `item_discount` decimal(10,2) DEFAULT 0.00,
  `category` varchar(50) DEFAULT NULL,
  `preparation_time` int(11) DEFAULT NULL,
  `line_total` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proforma_invoice_items`
--

INSERT INTO `proforma_invoice_items` (`id`, `proforma_invoice_id`, `product_id`, `quantity`, `unit_price`, `item_discount`, `category`, `preparation_time`, `line_total`, `created_at`) VALUES
(1, 1, 1, 2, 15.00, 0.00, NULL, NULL, 30.00, '2025-06-11 11:20:37');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `grn_number` varchar(255) NOT NULL,
  `invoice_no` varchar(255) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `purchase_type` enum('cash','credit') NOT NULL,
  `payment_type` enum('cash','cheque','bank_transfer') DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `bill_discount` decimal(10,2) DEFAULT 0.00,
  `bill_discount_percentage` decimal(5,2) DEFAULT 0.00,
  `final_amount` decimal(10,2) NOT NULL,
  `purchase_date` datetime NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `status` enum('active','partially_returned','returned') NOT NULL DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `grn_number`, `invoice_no`, `supplier_id`, `purchase_type`, `payment_type`, `total_amount`, `bill_discount`, `bill_discount_percentage`, `final_amount`, `purchase_date`, `remarks`, `status`, `createdAt`, `updatedAt`) VALUES
(2, 'GRN-1744226331470', '44858', 1, 'cash', 'cash', 64.90, 5.00, 0.00, 59.90, '2025-04-09 19:18:51', 'Test cash purchase', 'active', '2025-04-09 19:18:51', '2025-06-11 05:33:14'),
(41, 'GRN-1745390737681', 'GRN-1745390737681', 1, 'credit', NULL, 17.98, 1.00, 0.00, 16.98, '2025-04-23 06:45:37', 'Test Credit Sale', 'active', '2025-04-23 06:45:37', '2025-04-23 07:05:34'),
(42, 'GRN-1745392020036', '565656', 1, 'credit', NULL, 16.50, 2.00, 0.00, 14.50, '2025-04-23 07:07:00', 'Teat Purchase', 'active', '2025-04-23 07:07:00', '2025-06-11 05:33:00'),
(46, 'GRN-1747196554969', '7544', 1, 'cash', 'cash', 4.75, 0.00, 0.00, 4.75, '2025-05-14 04:22:34', NULL, 'active', '2025-05-14 04:22:34', '2025-05-14 04:22:34'),
(47, 'GRN-1747196720031', '7888', 1, 'cash', 'cash', 224.25, 0.00, 0.00, 224.25, '2025-05-14 04:25:20', NULL, 'active', '2025-05-14 04:25:20', '2025-05-14 04:25:20'),
(48, 'GRN-1747218386980', '888', 1, 'cash', 'cash', 412.50, 0.00, 0.00, 412.50, '2025-05-14 10:26:26', NULL, 'active', '2025-05-14 10:26:26', '2025-05-14 10:26:26'),
(49, 'GRN-1749618195989', '77', 1, 'cash', 'cheque', 4.99, 0.00, 0.00, 4.99, '2025-06-11 05:03:15', NULL, 'active', '2025-06-11 05:03:15', '2025-06-11 05:03:15'),
(50, 'GRN-1749619691530', '999', 1, 'cash', 'cash', 49.94, 0.00, 0.00, 49.94, '2025-06-11 05:28:11', NULL, 'active', '2025-06-11 05:28:11', '2025-06-11 05:29:14');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `purchasing_price` decimal(10,2) NOT NULL,
  `item_discount` decimal(10,2) DEFAULT 0.00,
  `item_discount_percentage` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`id`, `purchase_id`, `product_id`, `quantity`, `purchasing_price`, `item_discount`, `item_discount_percentage`) VALUES
(48, 41, 13, 2, 10.99, 4.00, 0.00),
(63, 46, 10, 1, 4.75, 0.00, 0.00),
(64, 47, 10, 75, 2.99, 0.00, 0.00),
(65, 48, 11, 75, 5.50, 0.00, 0.00),
(66, 49, 12, 1, 4.99, 0.00, 0.00),
(68, 50, 12, 1, 4.99, 0.00, 0.00),
(69, 50, 7, 5, 8.99, 0.00, 0.00),
(70, 42, 11, 3, 5.50, 0.00, 0.00),
(71, 2, 1, 10, 6.49, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_returns`
--

CREATE TABLE `purchase_returns` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `invoice_no` varchar(255) NOT NULL,
  `return_date` datetime NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_return_items`
--

CREATE TABLE `purchase_return_items` (
  `id` int(11) NOT NULL,
  `purchase_return_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity_returned` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) DEFAULT NULL,
  `receipt_number` varchar(50) NOT NULL,
  `type` enum('receipt','invoice') NOT NULL DEFAULT 'receipt',
  `created_at` datetime NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) NOT NULL DEFAULT 'Unknown',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cart_discount` decimal(5,2) NOT NULL DEFAULT 0.00,
  `cart_discount_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `dues` decimal(10,2) NOT NULL DEFAULT 0.00,
  `presented_amount` decimal(10,2) DEFAULT NULL,
  `content` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `receipts`
--

INSERT INTO `receipts` (`id`, `sale_id`, `receipt_number`, `type`, `created_at`, `customer_id`, `user_name`, `subtotal`, `cart_discount`, `cart_discount_type`, `tax_rate`, `tax_amount`, `total`, `total_paid`, `dues`, `presented_amount`, `content`) VALUES
(1, 205, 'REC-TEST-20250524', 'receipt', '2025-05-24 08:32:00', 1, 'adminuser', 3.99, 0.00, 'percentage', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(2, 380, 'REC-380-1748066829933', 'receipt', '2025-05-24 06:07:09', 1, 'adminuser', 9.00, 0.00, 'percentage', 0.00, 0.00, 9.00, 9.00, 0.00, 9.00, NULL),
(3, 381, 'REC-381-1748066942238', 'receipt', '2025-05-24 06:09:02', 1, 'adminuser', 3.99, 0.00, 'percentage', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(4, 382, 'REC-382-1748068687463', 'receipt', '2025-05-24 06:38:07', 1, 'adminuser', 9.00, 0.00, 'percentage', 0.00, 0.00, 9.00, 9.00, 0.00, 9.00, NULL),
(5, 383, 'REC-383-1748234359264', 'receipt', '2025-05-26 04:39:19', 1, 'adminuser', 21.98, 0.00, 'fixed', 0.00, 0.00, 21.98, 21.98, 0.00, 21.98, NULL),
(6, 384, 'REC-384-1748239798707', 'receipt', '2025-05-26 06:09:58', 1, 'adminuser', 21.98, 0.00, 'fixed', 0.00, 0.00, 21.98, 21.98, 0.00, 21.98, NULL),
(7, 385, 'REC-385-1748240019500', 'receipt', '2025-05-26 06:13:39', 1, 'adminuser', 10.99, 0.00, 'fixed', 0.00, 0.00, 10.99, 21.58, 0.00, 21.58, NULL),
(8, 386, 'REC-386-1748240501285', 'receipt', '2025-05-26 06:21:41', 1, 'adminuser', 20.98, 0.00, 'fixed', 0.00, 0.00, 20.98, 20.98, 0.00, 20.98, NULL),
(9, 387, 'REC-387-1748244700588', 'receipt', '2025-05-26 07:31:40', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(10, 388, 'REC-388-1748249049251', 'receipt', '2025-05-26 08:44:09', 1, 'adminuser', 20.98, 2.00, 'percentage', 0.00, 6.64, 25.62, 25.62, 0.00, 25.62, NULL),
(11, 389, 'REC-389-1748251284954', 'receipt', '2025-05-26 09:21:24', 1, 'adminuser', 4.10, 2.00, 'percentage', 0.00, 0.94, 3.04, 3.04, 0.00, 3.04, NULL),
(12, 390, 'REC-390-1748252605876', 'receipt', '2025-05-26 09:43:25', 1, 'adminuser', 5.10, 0.00, 'fixed', 0.00, 0.00, 5.10, 5.10, 0.00, 5.10, NULL),
(13, 391, 'REC-391-1748252870126', 'receipt', '2025-05-26 09:47:50', 1, 'adminuser', 200.00, 0.00, 'fixed', 0.00, 0.00, 200.00, 200.00, 0.00, 200.00, NULL),
(14, 392, 'REC-392-1748252961806', 'receipt', '2025-05-26 09:49:21', 1, 'adminuser', 6.10, 0.00, 'fixed', 0.00, 0.00, 6.10, 6.10, 0.00, 6.10, NULL),
(15, 393, 'REC-393-1748254079822', 'receipt', '2025-05-26 10:07:59', 1, 'adminuser', 10.99, 0.00, 'fixed', 0.00, 0.00, 10.99, 10.99, 0.00, 10.99, NULL),
(16, 394, 'REC-394-1748255185969', 'receipt', '2025-05-26 10:26:25', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(17, 395, 'REC-395-1748255424930', 'receipt', '2025-05-26 10:30:24', 1, 'adminuser', 17.30, 2.00, 'percentage', 0.00, 7.65, 22.95, 22.95, 0.00, 22.95, NULL),
(18, 396, 'REC-396-1748257921919', 'receipt', '2025-05-26 11:12:01', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(19, 398, 'REC-398-1748494148930', 'receipt', '2025-05-29 04:49:08', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(20, 399, 'REC-399-1748576803336', 'receipt', '2025-05-30 03:46:43', 1, 'adminuser', 11.97, 0.00, 'fixed', 0.00, 0.00, 11.97, 11.97, 0.00, 11.97, NULL),
(21, 400, 'REC-400-1748943273447', 'receipt', '2025-06-03 09:34:33', 1, 'adminuser', 10.99, 0.00, 'fixed', 0.00, 0.00, 10.99, 10.99, 0.00, 10.99, NULL),
(22, 401, 'REC-401-1748945781831', 'receipt', '2025-06-03 10:16:21', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(23, 402, 'REC-402-1748946109594', 'receipt', '2025-06-03 10:21:49', 1, 'adminuser', 19.95, 0.00, 'fixed', 0.00, 0.00, 19.95, 39.50, 0.00, 39.50, NULL),
(24, 403, 'REC-403-1748946493937', 'receipt', '2025-06-03 10:28:13', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(25, 404, 'REC-404-1748946611878', 'receipt', '2025-06-03 10:30:11', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 7.98, 0.00, 7.98, NULL),
(26, 405, 'REC-405-1749013621840', 'receipt', '2025-06-04 05:07:01', 2, 'adminuser', 8.99, 0.00, 'fixed', 0.00, 0.00, 8.99, 8.99, 0.00, 8.99, NULL),
(27, 406, 'REC-406-1749013950189', 'receipt', '2025-06-04 05:12:30', 2, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(28, 407, 'REC-407-1749013989715', 'receipt', '2025-06-04 05:13:09', 2, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(29, 408, 'REC-408-1749014504917', 'receipt', '2025-06-04 05:21:44', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(30, 409, 'REC-409-1749014516403', 'receipt', '2025-06-04 05:21:56', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(31, 410, 'REC-410-1749014541076', 'receipt', '2025-06-04 05:22:21', 1, 'adminuser', 400.00, 0.00, 'fixed', 0.00, 0.00, 400.00, 400.00, 0.00, 400.00, NULL),
(32, 411, 'REC-411-1749014652143', 'receipt', '2025-06-04 05:24:12', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(33, 412, 'REC-412-1749014663745', 'receipt', '2025-06-04 05:24:23', 1, 'adminuser', 10.99, 0.00, 'fixed', 0.00, 0.00, 10.99, 10.99, 0.00, 10.99, NULL),
(34, 413, 'REC-413-1749016887140', 'receipt', '2025-06-04 06:01:27', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(35, 414, 'REC-414-1749020251035', 'receipt', '2025-06-04 06:57:31', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(36, 415, 'REC-415-1749020512934', 'receipt', '2025-06-04 07:01:52', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(37, 416, 'REC-416-1749021021789', 'receipt', '2025-06-04 07:10:21', 1, 'adminuser', 5.50, 0.00, 'fixed', 0.00, 0.00, 5.50, 5.50, 0.00, 5.50, NULL),
(38, 417, 'REC-417-1749025898083', 'receipt', '2025-06-04 08:31:38', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(39, 418, 'REC-418-1749193491532', 'receipt', '2025-06-06 07:04:51', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(40, 419, 'REC-419-1749302080679', 'receipt', '2025-06-07 13:14:40', 1, 'manager1', 19.98, 0.00, 'fixed', 0.00, 0.00, 19.98, 19.98, 0.00, 19.98, NULL),
(41, 420, 'REC-420-1749797116830', 'receipt', '2025-06-13 06:45:16', 1, 'adminuser', 4.99, 0.00, 'fixed', 0.00, 0.00, 4.99, 4.99, 0.00, 4.99, NULL),
(42, 421, 'REC-421-1749797405369', 'receipt', '2025-06-13 06:50:05', 1, 'adminuser', 4.99, 0.00, 'fixed', 0.00, 0.00, 4.99, 4.99, 0.00, 4.99, NULL),
(43, 422, 'REC-422-1749798172953', 'receipt', '2025-06-13 07:02:52', 1, 'adminuser', 4.99, 0.00, 'fixed', 0.00, 0.00, 4.99, 4.99, 0.00, 4.99, NULL),
(44, 424, 'REC-424-1749816831123', 'receipt', '2025-06-13 12:13:51', 1, 'adminuser', 10.99, 0.00, 'fixed', 0.00, 0.00, 10.99, 10.99, 0.00, 10.99, NULL),
(45, 425, 'REC-425-1749817234319', 'receipt', '2025-06-13 12:20:34', 1, 'adminuser', 3.99, 0.00, 'fixed', 0.00, 0.00, 3.99, 3.99, 0.00, 3.99, NULL),
(46, 426, 'REC-426-1749882439874', 'receipt', '2025-06-14 06:27:19', 1, 'adminuser', 6.18, 0.00, 'fixed', 0.00, 0.00, 6.18, 6.18, 0.00, 6.18, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `item_discount` decimal(5,2) DEFAULT 0.00,
  `cart_discount` decimal(5,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `paid_bycash` decimal(10,2) DEFAULT 0.00,
  `paid_bycheque` decimal(10,2) DEFAULT 0.00,
  `paid_bycard` decimal(10,2) DEFAULT 0.00,
  `paid_byvoucher` decimal(10,2) DEFAULT 0.00,
  `on_credit` decimal(10,2) DEFAULT 0.00,
  `total_except_credit` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `paid_bygiftcard` decimal(10,2) DEFAULT 0.00,
  `cart_discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `tax_rate` decimal(5,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `user_id`, `customer_id`, `total_amount`, `item_discount`, `cart_discount`, `tax_amount`, `paid_bycash`, `paid_bycheque`, `paid_bycard`, `paid_byvoucher`, `on_credit`, `total_except_credit`, `createdAt`, `updatedAt`, `paid_bygiftcard`, `cart_discount_type`, `tax_rate`, `total`) VALUES
(136, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 12:39:20', '2025-03-28 12:39:20', 0.00, 'fixed', 0.00, 400.00),
(137, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 12:50:38', '2025-03-28 12:50:38', 0.00, 'fixed', 0.00, 400.00),
(138, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 17:02:37', '2025-03-28 17:02:37', 0.00, 'fixed', 0.00, 400.00),
(139, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 17:03:50', '2025-03-28 17:03:50', 0.00, 'fixed', 0.00, 400.00),
(140, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 17:04:45', '2025-03-28 17:04:45', 0.00, 'fixed', 0.00, 400.00),
(141, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 17:05:03', '2025-03-28 17:05:03', 0.00, 'fixed', 0.00, 400.00),
(142, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 17:05:30', '2025-03-28 17:05:30', 0.00, 'fixed', 0.00, 400.00),
(143, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 17:06:40', '2025-03-28 17:06:40', 0.00, 'fixed', 0.00, 400.00),
(144, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 17:07:44', '2025-03-28 17:07:44', 0.00, 'fixed', 0.00, 400.00),
(145, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 18:03:06', '2025-03-28 18:03:06', 0.00, 'fixed', 0.00, 400.00),
(146, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 260.00, '2025-03-28 18:09:33', '2025-03-28 18:09:33', 0.00, 'fixed', 0.00, 400.00),
(147, 35, 1, 400.00, 20.00, 50.00, 30.00, 300.00, 0.00, 0.00, 0.00, 100.00, 300.00, '2025-03-28 18:32:00', '2025-03-28 18:32:00', 0.00, 'fixed', 0.00, 400.00),
(148, 35, 1, 8.99, 0.00, 5.00, 0.40, 0.00, 0.00, 0.00, 0.00, 4.39, 4.60, '2025-03-28 19:30:49', '2025-03-28 19:30:49', 0.00, 'fixed', 0.00, 8.99),
(149, 35, 1, 8.99, 5.00, 0.50, 0.87, 2.00, 0.00, 0.00, 0.00, 2.36, 6.63, '2025-03-28 19:42:27', '2025-03-28 19:42:27', 0.00, 'fixed', 0.00, 8.99),
(150, 35, 1, 8.99, 5.00, 3.00, 0.50, 0.00, 0.00, 0.00, 0.00, 1.49, 7.50, '2025-03-29 04:19:53', '2025-03-29 04:19:53', 0.00, 'fixed', 0.00, 8.99),
(151, 35, 1, 8.99, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 8.99, 0.00, '2025-03-29 04:20:26', '2025-03-29 04:20:26', 0.00, 'fixed', 0.00, 8.99),
(152, 35, 1, 8.99, 5.99, 1.00, 0.10, 2.00, 0.00, 0.00, 0.00, 0.10, 8.89, '2025-03-29 04:22:01', '2025-03-29 04:22:01', 0.00, 'fixed', 0.00, 8.99),
(153, 35, 1, 10.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 0.00, 10.00, '2025-03-29 04:44:27', '2025-03-29 04:44:27', 0.00, 'fixed', 0.00, 10.00),
(154, 35, 1, 10.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 0.00, 10.00, '2025-03-29 04:47:55', '2025-03-29 04:47:55', 0.00, 'fixed', 0.00, 10.00),
(155, 35, 1, 8.99, 5.00, 2.00, 0.50, 2.49, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-03-29 05:07:41', '2025-03-29 05:07:41', 0.00, 'fixed', 0.00, 8.99),
(156, 35, 1, 8.99, 5.00, 2.00, 0.00, 1.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-03-29 05:15:11', '2025-03-29 05:15:11', 0.00, 'fixed', 0.00, 8.99),
(157, 35, 1, 8.99, 2.00, 0.07, 3.60, 10.52, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-03-29 05:17:08', '2025-03-29 05:17:08', 0.00, 'fixed', 0.00, 8.99),
(158, 35, 1, 8.99, 5.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-03-29 05:54:18', '2025-03-29 05:54:18', 0.00, 'fixed', 0.00, 8.99),
(159, 35, 1, 8.99, 5.00, 1.00, 0.06, 0.00, 0.00, 0.00, 0.00, 3.05, 5.94, '2025-03-29 07:28:23', '2025-03-29 07:28:23', 0.00, 'fixed', 0.00, 8.99),
(160, 35, 1, 17.98, 3.00, 2.00, 3.25, 16.23, 0.00, 0.00, 0.00, 0.00, 17.98, '2025-03-31 11:52:43', '2025-03-31 11:52:43', 0.00, 'fixed', 0.00, 17.98),
(161, 35, 1, 8.99, 2.00, 0.00, 0.00, 0.00, 6.99, 0.00, 0.00, 0.00, 8.99, '2025-03-31 12:35:57', '2025-03-31 12:35:57', 0.00, 'fixed', 0.00, 8.99),
(162, 35, 1, 8.99, 5.00, 2.00, 0.00, 0.00, 1.99, 0.00, 0.00, 0.00, 8.99, '2025-03-31 12:45:42', '2025-03-31 12:45:42', 0.00, 'fixed', 0.00, 8.99),
(163, 35, 1, 3.99, 3.00, 0.25, 0.59, 0.00, 1.33, 0.00, 0.00, 0.00, 3.99, '2025-03-31 12:50:47', '2025-03-31 12:50:47', 0.00, 'fixed', 0.00, 3.99),
(164, 35, 1, 10.00, 5.00, 0.00, 0.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, '2025-03-31 12:58:48', '2025-03-31 12:58:48', 0.00, 'fixed', 0.00, 10.00),
(165, 35, 1, 8.99, 5.00, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 8.99, '2025-03-31 13:02:53', '2025-03-31 13:02:53', 0.00, 'fixed', 0.00, 8.99),
(166, 35, 1, 8.99, 5.00, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 8.99, '2025-03-31 13:07:34', '2025-03-31 13:07:34', 0.00, 'fixed', 0.00, 8.99),
(167, 35, 1, 9.99, 0.00, 0.00, 0.00, 0.00, 9.99, 0.00, 0.00, 0.00, 9.99, '2025-03-31 13:10:00', '2025-03-31 13:10:00', 0.00, 'fixed', 0.00, 9.99),
(168, 35, 1, 8.99, 5.00, 1.00, 0.75, 0.00, 3.74, 0.00, 0.00, 0.00, 3.74, '2025-03-31 13:18:34', '2025-03-31 13:18:34', 0.00, 'fixed', 0.00, 8.99),
(173, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-01 13:27:29', '2025-04-01 13:27:29', 0.00, 'fixed', 0.00, 8.99),
(174, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-01 13:29:01', '2025-04-01 13:29:01', 0.00, 'fixed', 0.00, 8.99),
(175, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-01 13:32:59', '2025-04-01 13:32:59', 0.00, 'fixed', 0.00, 8.99),
(176, 35, 1, 208.99, 0.00, 0.00, 0.00, 208.99, 0.00, 0.00, 0.00, 0.00, 208.99, '2025-04-01 13:38:35', '2025-04-01 13:38:35', 0.00, 'fixed', 0.00, 208.99),
(177, 35, 1, 208.99, 0.00, 0.00, 0.00, 208.99, 0.00, 0.00, 0.00, 0.00, 208.99, '2025-04-01 13:39:45', '2025-04-01 13:39:45', 0.00, 'fixed', 0.00, 208.99),
(178, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-01 13:48:43', '2025-04-01 13:48:43', 0.00, 'fixed', 0.00, 8.99),
(179, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-01 13:50:12', '2025-04-01 13:50:12', 0.00, 'fixed', 0.00, 8.99),
(180, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-01 14:27:01', '2025-04-01 14:27:01', 0.00, 'fixed', 0.00, 8.99),
(181, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-01 14:32:46', '2025-04-01 14:32:46', 0.00, 'fixed', 0.00, 8.99),
(182, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-01 14:34:21', '2025-04-01 14:34:21', 0.00, 'fixed', 0.00, 8.99),
(183, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-01 14:43:38', '2025-04-01 14:43:38', 0.00, 'fixed', 0.00, 8.99),
(184, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-04-02 05:00:56', '2025-04-02 05:00:56', 0.00, 'fixed', 0.00, 8.99),
(185, 35, 3, 6.50, 0.00, 0.00, 0.00, 6.50, 0.00, 0.00, 0.00, 0.00, 6.50, '2025-04-02 08:40:43', '2025-04-02 08:40:43', 0.00, 'fixed', 0.00, 6.50),
(186, 35, 1, 5.99, 0.00, 2.00, 1.00, 0.00, 0.00, 0.00, 0.00, 4.99, 0.00, '2025-04-02 09:21:07', '2025-04-02 09:21:07', 0.00, 'fixed', 0.00, 5.99),
(187, 35, 1, 6.50, 0.00, 0.00, 0.00, 0.00, 6.50, 0.00, 0.00, 0.00, 6.50, '2025-04-02 09:24:51', '2025-04-02 09:24:51', 0.00, 'fixed', 0.00, 6.50),
(188, 35, 1, 6.50, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6.50, 0.00, '2025-04-02 09:30:10', '2025-04-02 09:30:10', 0.00, 'fixed', 0.00, 6.50),
(189, 35, 1, 6.50, 0.00, 0.00, 0.00, 6.50, 0.00, 0.00, 0.00, 0.00, 6.50, '2025-04-02 09:30:30', '2025-04-02 09:30:30', 0.00, 'fixed', 0.00, 6.50),
(190, 35, 1, 9.99, 0.00, 0.00, 0.00, 0.00, 9.99, 0.00, 0.00, 0.00, 9.99, '2025-04-02 09:43:28', '2025-04-02 09:43:28', 0.00, 'fixed', 0.00, 9.99),
(191, 35, 3, 6.50, 0.00, 0.00, 0.00, 0.00, 0.00, 6.50, 0.00, 0.00, 6.50, '2025-04-02 09:45:31', '2025-04-02 09:45:31', 0.00, 'fixed', 0.00, 6.50),
(192, 35, 3, 6.50, 0.00, 0.00, 0.00, 0.00, 6.50, 0.00, 0.00, 0.00, 6.50, '2025-04-02 09:46:05', '2025-04-02 09:46:05', 0.00, 'fixed', 0.00, 6.50),
(193, 35, 1, 6.50, 0.00, 0.00, 0.00, 0.00, 6.50, 0.00, 0.00, 0.00, 6.50, '2025-04-02 09:46:34', '2025-04-02 09:46:34', 0.00, 'fixed', 0.00, 6.50),
(194, 35, 1, 6.50, 0.33, 0.00, 0.00, 6.17, 0.00, 0.00, 0.00, 0.00, 6.17, '2025-04-02 13:17:25', '2025-04-02 13:17:25', 0.00, 'fixed', 0.00, 6.50),
(195, 35, 1, 6.50, 0.00, 0.00, 0.00, 6.50, 0.00, 0.00, 0.00, 0.00, 6.50, '2025-04-02 13:36:47', '2025-04-02 13:36:47', 0.00, 'fixed', 0.00, 6.50),
(196, 35, 3, 3.99, 0.20, 0.00, 0.00, 3.79, 0.00, 0.00, 0.00, 0.00, 3.79, '2025-04-09 03:23:38', '2025-04-09 03:23:38', 0.00, 'fixed', 0.00, 3.99),
(197, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-09 11:02:35', '2025-04-09 11:02:35', 0.00, 'fixed', 0.00, 3.99),
(198, 35, 1, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-04-09 12:03:15', '2025-04-09 12:03:15', 0.00, 'fixed', 0.00, 10.99),
(199, 35, 3, 8.98, 0.00, 0.00, 0.00, 8.98, 0.00, 0.00, 0.00, 0.00, 8.98, '2025-04-09 17:02:25', '2025-04-09 17:02:25', 0.00, 'fixed', 0.00, 8.98),
(200, 35, 1, 11.98, 0.00, 0.00, 0.00, 11.98, 0.00, 0.00, 0.00, 0.00, 11.98, '2025-04-17 18:19:04', '2025-04-17 18:19:04', 0.00, 'fixed', 0.00, 11.98),
(201, 35, 1, 11.98, 0.00, 0.00, 0.00, 11.98, 0.00, 0.00, 0.00, 0.00, 11.98, '2025-04-25 10:15:59', '2025-04-25 10:15:59', 0.00, 'fixed', 0.00, 11.98),
(202, 35, 3, 3.99, 0.08, 0.00, 0.00, 3.91, 0.00, 0.00, 0.00, 0.00, 3.91, '2025-04-30 08:49:58', '2025-04-30 08:49:58', 0.00, 'fixed', 0.00, 3.99),
(203, 35, 3, 3.99, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3.99, 0.00, '2025-04-30 09:27:05', '2025-04-30 09:27:05', 0.00, 'fixed', 0.00, 3.99),
(204, 35, 3, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-04-30 09:29:31', '2025-04-30 09:29:31', 0.00, 'fixed', 0.00, 10.99),
(205, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 09:30:48', '2025-04-30 09:30:48', 0.00, 'fixed', 0.00, 3.99),
(206, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 09:31:19', '2025-04-30 09:31:19', 0.00, 'fixed', 0.00, 3.99),
(207, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 09:35:58', '2025-04-30 09:35:58', 0.00, 'fixed', 0.00, 3.99),
(208, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-04-30 09:37:00', '2025-04-30 09:37:00', 0.00, 'fixed', 0.00, 4.99),
(209, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 09:46:12', '2025-04-30 09:46:12', 0.00, 'fixed', 0.00, 3.99),
(210, 35, 3, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 09:46:45', '2025-04-30 09:46:45', 0.00, 'fixed', 0.00, 3.99),
(211, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 10:01:04', '2025-04-30 10:01:04', 0.00, 'fixed', 0.00, 3.99),
(212, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 10:04:30', '2025-04-30 10:04:30', 0.00, 'fixed', 0.00, 3.99),
(213, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 10:15:48', '2025-04-30 10:15:48', 0.00, 'fixed', 0.00, 3.99),
(214, 35, 3, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 10:19:48', '2025-04-30 10:19:48', 0.00, 'fixed', 0.00, 3.99),
(215, 35, 3, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 10:36:19', '2025-04-30 10:36:19', 0.00, 'fixed', 0.00, 3.99),
(216, 35, 3, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 10:51:42', '2025-04-30 10:51:42', 0.00, 'fixed', 0.00, 3.99),
(217, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 10:56:19', '2025-04-30 10:56:19', 0.00, 'fixed', 0.00, 3.99),
(218, 35, 3, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 11:02:57', '2025-04-30 11:02:57', 0.00, 'fixed', 0.00, 3.99),
(219, 35, NULL, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-04-30 11:04:19', '2025-04-30 11:04:19', 0.00, 'fixed', 0.00, 3.99),
(220, 35, 1, 5.99, 0.06, 2.00, 0.98, 4.91, 0.00, 0.00, 0.00, 0.00, 4.91, '2025-04-30 11:13:35', '2025-04-30 11:13:35', 0.00, 'fixed', 0.00, 5.99),
(221, 35, 1, 5.99, 0.12, 1.00, 0.00, 2.99, 0.00, 0.00, 0.00, 0.00, 4.87, '2025-04-30 11:22:09', '2025-04-30 11:22:09', 0.00, 'fixed', 0.00, 5.99),
(222, 35, 1, 5.99, 0.12, 1.00, 0.00, 2.99, 0.00, 0.00, 0.00, 0.00, 4.87, '2025-04-30 11:32:57', '2025-04-30 11:32:57', 0.00, 'fixed', 0.00, 5.99),
(223, 35, 3, 6.50, 0.13, 2.00, 0.00, 2.50, 0.00, 0.00, 0.00, 0.00, 4.37, '2025-04-30 11:49:00', '2025-04-30 11:49:00', 0.00, 'fixed', 0.00, 6.50),
(224, 35, 1, 3.99, 0.04, 1.00, 0.00, 1.99, 0.00, 0.00, 0.00, 0.00, 2.95, '2025-04-30 11:58:09', '2025-04-30 11:58:09', 0.00, 'fixed', 0.00, 3.99),
(225, 35, 1, 3.99, 0.04, 1.00, 0.00, 1.99, 0.00, 0.00, 0.00, 0.00, 2.95, '2025-04-30 12:01:46', '2025-04-30 12:01:46', 0.00, 'fixed', 0.00, 3.99),
(226, 35, 1, 3.99, 0.04, 1.00, 0.00, 1.99, 0.00, 0.00, 0.00, 0.00, 2.95, '2025-04-30 12:07:15', '2025-04-30 12:07:15', 0.00, 'fixed', 0.00, 3.99),
(227, 35, 1, 3.99, 0.00, 1.00, 0.30, 3.29, 0.00, 0.00, 0.00, 0.00, 3.29, '2025-04-30 12:10:42', '2025-04-30 12:10:42', 0.00, 'fixed', 0.00, 3.99),
(228, 35, 3, 3.99, 0.04, 1.00, 0.20, 2.19, 0.00, 0.00, 0.00, 0.00, 3.15, '2025-04-30 12:11:47', '2025-04-30 12:11:47', 0.00, 'fixed', 0.00, 3.99),
(229, 35, 1, 3.99, 0.04, 1.00, 0.20, 2.19, 0.00, 0.00, 0.00, 0.00, 3.15, '2025-04-30 12:16:51', '2025-04-30 12:16:51', 0.00, 'fixed', 0.00, 3.99),
(230, 35, 3, 4.99, 0.10, 1.00, 0.50, 0.00, 0.00, 0.00, 0.00, 2.49, 1.90, '2025-05-01 03:32:57', '2025-05-01 03:32:57', 0.00, 'fixed', 0.00, 4.99),
(231, 35, 3, 4.99, 0.10, 1.00, 0.50, 0.00, 0.00, 0.00, 0.00, 2.49, 1.90, '2025-05-01 03:36:07', '2025-05-01 03:36:07', 0.00, 'fixed', 0.00, 4.99),
(232, 35, 1, 4.99, 0.10, 0.99, 0.00, 2.00, 0.00, 0.00, 0.00, 0.00, 3.90, '2025-05-01 04:15:47', '2025-05-01 04:15:47', 0.00, 'fixed', 0.00, 4.99),
(233, 35, 1, 3.99, 0.08, 0.00, 0.00, 2.00, 0.00, 0.00, 0.00, 0.00, 3.91, '2025-05-01 04:18:21', '2025-05-01 04:18:21', 0.00, 'fixed', 0.00, 3.99),
(234, 35, 1, 3.99, 0.04, 0.00, 0.00, 2.99, 0.00, 0.00, 0.00, 0.00, 3.95, '2025-05-01 04:19:46', '2025-05-01 04:19:46', 0.00, 'fixed', 0.00, 3.99),
(235, 35, 1, 3.99, 0.04, 0.00, 0.00, 2.99, 0.00, 0.00, 0.00, 0.00, 3.95, '2025-05-01 04:21:33', '2025-05-01 04:21:33', 0.00, 'fixed', 0.00, 3.99),
(236, 35, 1, 3.99, 0.04, 0.00, 0.00, 2.99, 0.00, 0.00, 0.00, 0.00, 3.95, '2025-05-01 05:04:29', '2025-05-01 05:04:29', 0.00, 'fixed', 0.00, 3.99),
(237, 35, 1, 3.99, 1.00, 0.00, 0.00, 2.99, 0.00, 0.00, 0.00, 0.00, 2.99, '2025-05-01 05:27:08', '2025-05-01 05:27:08', 0.00, 'fixed', 0.00, 3.99),
(238, 35, NULL, 3.99, 2.00, 0.00, 0.00, 1.99, 0.00, 0.00, 0.00, 0.00, 1.99, '2025-05-01 05:38:05', '2025-05-01 05:38:05', 0.00, 'fixed', 0.00, 3.99),
(239, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-01 05:40:19', '2025-05-01 05:40:19', 0.00, 'fixed', 0.00, 3.99),
(240, 35, 3, 3.99, 2.00, 0.00, 0.00, 1.99, 0.00, 0.00, 0.00, 0.00, 1.99, '2025-05-01 05:42:08', '2025-05-01 05:42:08', 0.00, 'fixed', 0.00, 3.99),
(241, 35, 3, 3.99, 2.00, 0.50, 0.00, 1.49, 0.00, 0.00, 0.00, 0.00, 1.49, '2025-05-01 05:46:22', '2025-05-01 05:46:22', 0.00, 'fixed', 0.00, 3.99),
(242, 35, 3, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 3.99, '2025-05-01 05:47:20', '2025-05-01 05:47:20', 0.00, 'fixed', 0.00, 3.99),
(243, 35, 3, 6.50, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5.50, 0.00, '2025-05-01 05:51:39', '2025-05-01 05:51:39', 0.00, 'fixed', 0.00, 6.50),
(244, 35, 3, 3.99, 0.40, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3.59, 0.00, '2025-05-01 05:54:03', '2025-05-01 05:54:03', 0.00, 'fixed', 0.00, 3.99),
(245, 35, 1, 200.00, 50.00, 20.00, 32.46, 162.46, 0.00, 0.00, 0.00, 0.00, 162.46, '2025-05-01 05:57:50', '2025-05-01 05:57:50', 0.00, 'fixed', 0.00, 200.00),
(246, 35, 1, 3.99, 1.00, 0.00, 0.00, 2.99, 0.00, 0.00, 0.00, 0.00, 2.99, '2025-05-01 06:05:21', '2025-05-01 06:05:21', 0.00, 'fixed', 0.00, 3.99),
(247, 35, 3, 7.98, 2.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5.98, 0.00, '2025-05-01 06:06:29', '2025-05-01 06:06:29', 0.00, 'fixed', 0.00, 7.98),
(248, 35, NULL, 3.99, 0.00, 0.00, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 3.99, '2025-05-01 06:07:11', '2025-05-01 06:07:11', 0.00, 'fixed', 0.00, 3.99),
(249, 35, NULL, 3.99, 0.00, 0.00, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 3.99, '2025-05-01 06:08:27', '2025-05-01 06:08:27', 0.00, 'fixed', 0.00, 3.99),
(250, 35, 3, 3.99, 1.00, 0.50, 0.62, 0.00, 0.00, 3.11, 0.00, 0.00, 3.11, '2025-05-01 06:10:27', '2025-05-01 06:10:27', 0.00, 'fixed', 0.00, 3.99),
(251, 35, NULL, 3.99, 1.00, 0.50, 0.62, 0.00, 3.11, 0.00, 0.00, 0.00, 3.11, '2025-05-01 06:11:35', '2025-05-01 06:11:35', 0.00, 'fixed', 0.00, 3.99),
(252, 35, 3, 3.99, 1.00, 1.00, 0.00, 0.01, 1.98, 0.00, 0.00, 0.00, 1.99, '2025-05-01 06:13:08', '2025-05-01 06:13:08', 0.00, 'fixed', 0.00, 3.99),
(253, 35, 1, 3.99, 1.00, 1.00, 0.50, 0.00, 0.00, 2.49, 0.00, 0.00, 2.49, '2025-05-01 06:31:05', '2025-05-01 06:31:05', 0.00, 'fixed', 0.00, 3.99),
(254, 35, 1, 3.99, 2.00, 1.00, 0.25, 0.00, 0.00, 0.00, 0.00, 0.00, 1.24, '2025-05-01 06:58:00', '2025-05-01 06:58:00', 0.00, 'fixed', 0.00, 3.99),
(255, 35, 1, 19.95, 1.00, 0.00, 0.00, 18.95, 0.00, 0.00, 0.00, 0.00, 18.95, '2025-05-01 07:01:32', '2025-05-01 07:01:32', 0.00, 'fixed', 0.00, 19.95),
(256, 35, 1, 19.95, 0.00, 0.00, 0.00, 19.95, 0.00, 0.00, 0.00, 0.00, 19.95, '2025-05-01 07:03:28', '2025-05-01 07:03:28', 0.00, 'fixed', 0.00, 19.95),
(257, 35, 3, 65.00, 0.00, 0.00, 0.00, 0.01, 0.00, 0.00, 0.00, 0.00, 65.00, '2025-05-01 07:07:23', '2025-05-01 07:07:23', 0.00, 'fixed', 0.00, 65.00),
(258, 35, 1, 3.99, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2.99, '2025-05-01 07:15:37', '2025-05-01 07:15:37', 0.00, 'fixed', 0.00, 3.99),
(259, 35, 1, 3.99, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-01 07:26:03', '2025-05-01 07:26:03', 3.99, 'fixed', 0.00, 3.99),
(260, 35, 1, 3.99, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-01 07:56:58', '2025-05-01 07:56:58', 3.99, 'fixed', 0.00, 3.99),
(261, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-01 08:23:08', '2025-05-01 08:23:08', 0.00, 'fixed', 0.00, 3.99),
(262, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-01 08:28:21', '2025-05-01 08:28:21', 0.00, 'fixed', 0.00, 3.99),
(263, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-01 10:49:25', '2025-05-01 10:49:25', 0.00, 'fixed', 0.00, 3.99),
(264, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-01 11:17:58', '2025-05-01 11:17:58', 0.00, 'fixed', 0.00, 3.99),
(265, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-01 11:22:32', '2025-05-01 11:22:32', 0.00, 'fixed', 0.00, 3.99),
(266, 35, 1, 3.99, 0.00, 2.00, 0.00, 1.99, 0.00, 0.00, 0.00, 0.00, 1.99, '2025-05-02 02:43:51', '2025-05-02 02:43:51', 0.00, 'fixed', 0.00, 3.99),
(267, 35, 1, 3.99, 1.00, 0.06, 0.73, 3.66, 0.00, 0.00, 0.00, 0.00, 3.66, '2025-05-02 02:45:07', '2025-05-02 02:45:07', 0.00, 'fixed', 0.00, 3.99),
(268, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 02:59:59', '2025-05-02 02:59:59', 0.00, 'fixed', 0.00, 3.99),
(269, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 03:03:55', '2025-05-02 03:03:55', 0.00, 'fixed', 0.00, 3.99),
(270, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 03:04:15', '2025-05-02 03:04:15', 0.00, 'fixed', 0.00, 3.99),
(271, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 03:07:36', '2025-05-02 03:07:36', 0.00, 'fixed', 0.00, 3.99),
(272, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 03:08:04', '2025-05-02 03:08:04', 0.00, 'fixed', 0.00, 3.99),
(273, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 03:10:10', '2025-05-02 03:10:10', 0.00, 'fixed', 0.00, 3.99),
(274, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 03:10:27', '2025-05-02 03:10:27', 0.00, 'fixed', 0.00, 3.99),
(275, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-02 03:11:41', '2025-05-02 03:11:41', 0.00, 'fixed', 0.00, 4.99),
(276, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 03:11:58', '2025-05-02 03:11:58', 0.00, 'fixed', 0.00, 3.99),
(277, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 03:34:32', '2025-05-02 03:34:32', 0.00, 'fixed', 0.00, 3.99),
(278, 35, 1, 14.98, 0.00, 0.00, 0.00, 14.98, 0.00, 0.00, 0.00, 0.00, 14.98, '2025-05-02 03:35:16', '2025-05-02 03:35:16', 0.00, 'fixed', 0.00, 14.98),
(279, 35, 1, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-05-02 03:35:38', '2025-05-02 03:35:38', 0.00, 'fixed', 0.00, 10.99),
(280, 35, 1, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-05-02 03:35:54', '2025-05-02 03:35:54', 0.00, 'fixed', 0.00, 10.99),
(281, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 03:38:38', '2025-05-02 03:38:38', 0.00, 'fixed', 0.00, 3.99),
(282, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 09:03:51', '2025-05-02 09:03:51', 0.00, 'fixed', 0.00, 3.99),
(283, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-02 09:07:50', '2025-05-02 09:07:50', 0.00, 'fixed', 0.00, 3.99),
(284, 35, 1, 200.00, 0.00, 0.00, 0.00, 200.00, 0.00, 0.00, 0.00, 0.00, 200.00, '2025-05-02 10:51:58', '2025-05-02 10:51:58', 0.00, 'fixed', 0.00, 200.00),
(285, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 03:59:42', '2025-05-03 03:59:42', 0.00, 'fixed', 0.00, 3.99),
(286, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 04:19:31', '2025-05-03 04:19:31', 0.00, 'fixed', 0.00, 3.99),
(287, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 04:20:08', '2025-05-03 04:20:08', 0.00, 'fixed', 0.00, 3.99),
(288, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 04:26:44', '2025-05-03 04:26:44', 0.00, 'fixed', 0.00, 3.99),
(289, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 04:28:34', '2025-05-03 04:28:34', 0.00, 'fixed', 0.00, 3.99),
(290, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 04:35:12', '2025-05-03 04:35:12', 0.00, 'fixed', 0.00, 3.99),
(291, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 04:45:11', '2025-05-03 04:45:11', 0.00, 'fixed', 0.00, 3.99),
(292, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 04:48:38', '2025-05-03 04:48:38', 0.00, 'fixed', 0.00, 3.99),
(293, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 04:49:14', '2025-05-03 04:49:14', 0.00, 'fixed', 0.00, 3.99),
(294, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 04:53:37', '2025-05-03 04:53:37', 0.00, 'fixed', 0.00, 3.99),
(295, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 05:00:59', '2025-05-03 05:00:59', 0.00, 'fixed', 0.00, 3.99),
(296, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-03 05:07:25', '2025-05-03 05:07:25', 0.00, 'fixed', 0.00, 4.99),
(297, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 05:33:27', '2025-05-03 05:33:27', 0.00, 'fixed', 0.00, 3.99),
(298, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 05:37:49', '2025-05-03 05:37:49', 0.00, 'fixed', 0.00, 3.99),
(299, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 06:13:10', '2025-05-03 06:13:10', 0.00, 'fixed', 0.00, 3.99),
(300, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 06:15:33', '2025-05-03 06:15:33', 0.00, 'fixed', 0.00, 3.99),
(301, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 06:37:05', '2025-05-03 06:37:05', 0.00, 'fixed', 0.00, 3.99),
(302, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 06:37:42', '2025-05-03 06:37:42', 0.00, 'fixed', 0.00, 3.99),
(303, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 06:38:48', '2025-05-03 06:38:48', 0.00, 'fixed', 0.00, 3.99),
(304, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 06:39:12', '2025-05-03 06:39:12', 0.00, 'fixed', 0.00, 3.99),
(305, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 06:46:59', '2025-05-03 06:46:59', 0.00, 'fixed', 0.00, 3.99),
(307, 35, 1, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-05-03 06:52:02', '2025-05-03 06:52:02', 0.00, 'fixed', 0.00, 10.99),
(308, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-03 06:54:28', '2025-05-03 06:54:28', 0.00, 'fixed', 0.00, 4.99),
(309, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-03 06:54:54', '2025-05-03 06:54:54', 0.00, 'fixed', 0.00, 4.99),
(310, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-03 06:55:54', '2025-05-03 06:55:54', 0.00, 'fixed', 0.00, 4.99),
(312, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-03 06:58:00', '2025-05-03 06:58:00', 0.00, 'fixed', 0.00, 4.99),
(313, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-03 06:58:36', '2025-05-03 06:58:36', 0.00, 'fixed', 0.00, 4.99),
(314, 35, 1, 4.99, 1.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-03 06:59:58', '2025-05-03 06:59:58', 0.00, 'fixed', 0.00, 4.99),
(315, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-03 07:54:06', '2025-05-03 07:54:06', 0.00, 'fixed', 0.00, 4.99),
(318, 35, 1, 15.49, 0.00, 0.00, 0.00, 15.49, 0.00, 0.00, 0.00, 0.00, 15.49, '2025-05-03 08:08:15', '2025-05-03 08:08:15', 0.00, 'fixed', 0.00, 15.49),
(320, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-03 08:13:23', '2025-05-03 08:13:23', 0.00, 'fixed', 0.00, 4.99),
(321, 35, 1, 6.10, 2.00, 1.00, 1.39, 4.49, 0.00, 0.00, 0.00, 0.00, 4.49, '2025-05-03 08:14:10', '2025-05-03 08:14:10', 0.00, 'fixed', 0.00, 6.10),
(322, 35, 1, 6.10, 0.12, 1.00, 1.39, 4.49, 0.00, 0.00, 0.00, 0.00, 6.37, '2025-05-03 10:16:57', '2025-05-03 10:16:57', 0.00, 'fixed', 0.00, 6.10),
(323, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-03 11:31:32', '2025-05-03 11:31:32', 0.00, 'fixed', 0.00, 6.10),
(324, 35, 1, 6.10, 0.01, 1.00, 1.39, 4.49, 0.00, 0.00, 0.00, 0.00, 6.48, '2025-05-03 11:34:23', '2025-05-03 11:34:23', 0.00, 'fixed', 0.00, 6.10),
(325, 35, 1, 6.10, 3.00, 0.00, 0.00, 3.10, 0.00, 0.00, 0.00, 0.00, 3.10, '2025-05-03 11:51:51', '2025-05-03 11:51:51', 0.00, 'fixed', 0.00, 6.10),
(326, 35, NULL, 20.00, 2.00, 0.00, 0.00, 18.00, 0.00, 0.00, 0.00, 0.00, 18.00, '2025-05-03 12:09:21', '2025-05-03 12:09:21', 0.00, 'fixed', 0.00, 20.00),
(327, 35, NULL, 20.00, 2.00, 0.00, 0.00, 18.00, 0.00, 0.00, 0.00, 0.00, 18.00, '2025-05-03 12:12:42', '2025-05-03 12:12:42', 0.00, 'fixed', 0.00, 20.00),
(328, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-03 12:21:22', '2025-05-03 12:21:22', 0.00, 'fixed', 0.00, 6.10),
(329, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-05-04 04:23:00', '2025-05-04 04:23:00', 0.00, 'fixed', 0.00, 8.99),
(330, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-05-04 05:16:25', '2025-05-04 05:16:25', 0.00, 'fixed', 0.00, 4.99),
(331, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-04 05:28:21', '2025-05-04 05:28:21', 0.00, 'fixed', 0.00, 6.10),
(332, 35, 1, 6.50, 0.00, 0.00, 0.00, 6.50, 0.00, 0.00, 0.00, 0.00, 6.50, '2025-05-04 05:31:25', '2025-05-04 05:31:25', 0.00, 'fixed', 0.00, 6.50),
(333, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-04 05:45:45', '2025-05-04 05:45:45', 0.00, 'fixed', 0.00, 6.10),
(334, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-05-04 07:58:40', '2025-05-04 07:58:40', 0.00, 'fixed', 0.00, 8.99),
(335, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-04 07:59:04', '2025-05-04 07:59:04', 0.00, 'fixed', 0.00, 6.10),
(339, 35, 1, 214.49, 26.50, 0.00, 0.00, 100.00, 0.00, 0.00, 0.00, 87.99, 100.00, '2025-05-04 08:27:29', '2025-05-04 08:27:29', 0.00, 'fixed', 0.00, 214.49),
(342, 35, 1, 4.99, 2.00, 0.00, 0.00, 2.99, 0.00, 0.00, 0.00, 0.00, 2.99, '2025-05-10 04:19:57', '2025-05-10 04:19:57', 0.00, 'fixed', 0.00, 4.99),
(343, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-10 04:32:12', '2025-05-10 04:32:12', 0.00, 'fixed', 0.00, 6.10),
(344, 35, 1, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-05-10 04:32:49', '2025-05-10 04:32:49', 0.00, 'fixed', 0.00, 10.99),
(345, 35, 1, 6.50, 0.00, 0.00, 0.00, 6.50, 0.00, 0.00, 0.00, 0.00, 6.50, '2025-05-10 04:38:16', '2025-05-10 04:38:16', 0.00, 'fixed', 0.00, 6.50),
(346, 35, 1, 6.10, 0.10, 0.00, 0.00, 6.00, 0.00, 0.00, 0.00, 0.00, 6.00, '2025-05-10 04:39:32', '2025-05-10 04:39:32', 0.00, 'fixed', 0.00, 6.10),
(347, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-05-10 04:58:44', '2025-05-10 04:58:44', 0.00, 'fixed', 0.00, 8.99),
(348, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-10 05:38:08', '2025-05-10 05:38:08', 0.00, 'fixed', 0.00, 6.10),
(350, 35, 1, 14.97, 0.00, 0.00, 0.00, 14.97, 0.00, 0.00, 0.00, 0.00, 14.97, '2025-05-10 07:19:38', '2025-05-10 07:19:38', 0.00, 'fixed', 0.00, 14.97),
(351, 35, 1, 13.00, 0.00, 0.00, 0.00, 13.00, 0.00, 0.00, 0.00, 0.00, 13.00, '2025-05-14 03:08:13', '2025-05-14 03:08:13', 0.00, 'fixed', 0.00, 13.00),
(352, 35, 1, 13.00, 0.00, 0.00, 0.00, 13.00, 0.00, 0.00, 0.00, 0.00, 13.00, '2025-05-14 03:09:13', '2025-05-14 03:09:13', 0.00, 'fixed', 0.00, 13.00),
(353, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-14 03:29:01', '2025-05-14 03:29:01', 0.00, 'fixed', 0.00, 6.10),
(354, 35, NULL, 6.10, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6.10, 0.00, '2025-05-14 04:02:29', '2025-05-14 04:02:29', 0.00, 'fixed', 0.00, 6.10),
(355, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-14 06:57:11', '2025-05-14 06:57:11', 0.00, 'fixed', 0.00, 3.99),
(356, 35, 1, 24.98, 0.00, 0.00, 0.00, 24.98, 0.00, 0.00, 0.00, 0.00, 24.98, '2025-05-15 07:25:58', '2025-05-15 07:25:58', 0.00, 'fixed', 0.00, 24.98),
(357, 35, 1, 12.60, 0.00, 0.00, 0.00, 12.60, 0.00, 0.00, 0.00, 0.00, 12.60, '2025-05-15 11:49:41', '2025-05-15 11:49:41', 0.00, 'fixed', 0.00, 12.60),
(358, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-15 11:57:29', '2025-05-15 11:57:29', 0.00, 'fixed', 0.00, 6.10),
(359, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-16 12:13:57', '2025-05-16 12:13:57', 0.00, 'fixed', 0.00, 6.10),
(360, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-17 03:34:11', '2025-05-17 03:34:11', 0.00, 'fixed', 0.00, 6.10),
(361, 35, 1, 4.99, 0.00, 0.00, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 4.99, '2025-05-17 03:36:22', '2025-05-17 03:36:22', 0.00, 'fixed', 0.00, 4.99),
(362, 36, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-17 05:43:32', '2025-05-17 05:43:32', 0.00, 'fixed', 0.00, 6.10),
(363, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-17 07:34:11', '2025-05-17 07:34:11', 0.00, 'fixed', 0.00, 3.99),
(364, 35, 1, 6.10, 0.00, 0.00, 0.00, 12.20, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-17 08:25:34', '2025-05-17 08:25:34', 0.00, 'fixed', 0.00, 6.10),
(365, 35, 1, 6.10, 0.00, 0.00, 0.00, 12.20, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-17 08:53:24', '2025-05-17 08:53:24', 0.00, 'fixed', 0.00, 6.10),
(366, 35, 1, 6.10, 0.00, 0.00, 0.00, 5.00, 0.00, 1.10, 0.00, 0.00, 6.10, '2025-05-17 09:01:07', '2025-05-17 09:01:07', 0.00, 'fixed', 0.00, 6.10),
(367, 36, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-20 03:11:02', '2025-05-20 03:11:02', 0.00, 'fixed', 0.00, 3.99),
(368, 35, 1, 4.99, 0.00, 0.00, 0.00, 3.00, 0.00, 1.99, 0.00, 0.00, 4.99, '2025-05-20 04:11:48', '2025-05-20 04:11:48', 0.00, 'fixed', 0.00, 4.99),
(369, 35, 1, 10.09, 0.00, 0.00, 0.00, 5.00, 0.00, 5.09, 0.00, 0.00, 10.09, '2025-05-20 05:06:53', '2025-05-20 05:06:53', 0.00, 'fixed', 0.00, 10.09),
(370, 35, 3, 7.98, 0.00, 2.00, 1.50, 7.48, 0.00, 0.00, 0.00, 0.00, 7.48, '2025-05-20 11:09:20', '2025-05-20 11:09:20', 0.00, 'fixed', 0.00, 7.98),
(371, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-20 11:26:36', '2025-05-20 11:26:36', 0.00, 'fixed', 0.00, 3.99),
(372, 35, 1, 7.98, 0.00, 0.00, 0.00, 7.98, 0.00, 0.00, 0.00, 0.00, 7.98, '2025-05-20 11:58:40', '2025-05-20 11:58:40', 0.00, 'fixed', 0.00, 7.98),
(373, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-23 03:53:02', '2025-05-23 03:53:02', 0.00, 'fixed', 0.00, 3.99),
(374, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-23 04:10:56', '2025-05-23 04:10:56', 0.00, 'fixed', 0.00, 3.99),
(375, 35, 1, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-05-23 04:13:10', '2025-05-23 04:13:10', 0.00, 'fixed', 0.00, 8.99),
(376, 35, 1, 5.50, 0.00, 0.00, 0.00, 5.50, 0.00, 0.00, 0.00, 0.00, 5.50, '2025-05-23 04:14:47', '2025-05-23 04:14:47', 0.00, 'fixed', 0.00, 5.50),
(377, 35, 1, 5.50, 0.00, 0.00, 0.00, 5.50, 0.00, 0.00, 0.00, 0.00, 5.50, '2025-05-23 04:16:55', '2025-05-23 04:16:55', 0.00, 'fixed', 0.00, 5.50),
(380, 35, 1, 10.00, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 9.00, 0.00, 9.00, '2025-05-24 06:07:09', '2025-05-24 06:07:09', 0.00, 'fixed', 0.00, 9.00),
(381, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-24 06:09:02', '2025-05-24 06:09:02', 0.00, 'fixed', 0.00, 3.99),
(382, 35, 1, 10.00, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 9.00, 0.00, 9.00, '2025-05-24 06:38:07', '2025-05-24 06:38:07', 0.00, 'fixed', 0.00, 9.00),
(383, 35, 1, 21.98, 0.00, 0.00, 0.00, 10.00, 0.00, 11.98, 0.00, 0.00, 21.98, '2025-05-26 04:39:19', '2025-05-26 04:39:19', 0.00, 'fixed', 0.00, 21.98),
(384, 35, 1, 21.98, 0.00, 0.00, 0.00, 10.00, 0.00, 11.98, 0.00, 0.00, 21.98, '2025-05-26 06:09:58', '2025-05-26 06:09:58', 0.00, 'fixed', 0.00, 21.98),
(385, 35, 1, 10.99, 0.00, 0.00, 0.00, 15.99, 0.00, 5.59, 0.00, 0.00, 10.99, '2025-05-26 06:13:39', '2025-05-26 06:13:39', 0.00, 'fixed', 0.00, 10.99),
(386, 35, 1, 21.98, 1.00, 0.00, 0.00, 10.00, 0.00, 10.98, 0.00, 0.00, 20.98, '2025-05-26 06:21:41', '2025-05-26 06:21:41', 0.00, 'fixed', 0.00, 20.98),
(387, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-26 07:31:40', '2025-05-26 07:31:40', 0.00, 'fixed', 0.00, 3.99),
(388, 35, 1, 21.98, 1.00, 2.00, 6.64, 20.00, 0.00, 5.62, 0.00, 0.00, 25.62, '2025-05-26 08:44:08', '2025-05-26 08:44:08', 0.00, 'percentage', 0.00, 25.62),
(389, 35, 1, 6.10, 2.00, 2.00, 0.94, 2.00, 0.00, 1.04, 0.00, 0.00, 3.04, '2025-05-26 09:21:24', '2025-05-26 09:21:24', 0.00, 'percentage', 0.00, 3.04),
(390, 35, 1, 6.10, 1.00, 0.00, 0.00, 5.10, 0.00, 0.00, 0.00, 0.00, 5.10, '2025-05-26 09:43:25', '2025-05-26 09:43:25', 0.00, 'fixed', 0.00, 5.10),
(391, 35, 1, 200.00, 0.00, 0.00, 0.00, 200.00, 0.00, 0.00, 0.00, 0.00, 200.00, '2025-05-26 09:47:50', '2025-05-26 09:47:50', 0.00, 'fixed', 0.00, 200.00),
(392, 35, 1, 6.10, 0.00, 0.00, 0.00, 6.10, 0.00, 0.00, 0.00, 0.00, 6.10, '2025-05-26 09:49:21', '2025-05-26 09:49:21', 0.00, 'fixed', 0.00, 6.10),
(393, 35, 1, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-05-26 10:07:59', '2025-05-26 10:07:59', 0.00, 'fixed', 0.00, 10.99),
(394, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-26 10:26:25', '2025-05-26 10:26:25', 0.00, 'fixed', 0.00, 3.99),
(395, 35, 1, 18.30, 1.00, 2.00, 7.65, 20.00, 0.00, 2.95, 0.00, 0.00, 22.95, '2025-05-26 10:30:24', '2025-05-26 10:30:24', 0.00, 'percentage', 0.00, 22.95),
(396, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-26 11:12:01', '2025-05-26 11:12:01', 0.00, 'fixed', 0.00, 3.99),
(398, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-05-29 04:49:08', '2025-05-29 04:49:08', 0.00, 'fixed', 0.00, 3.99),
(399, 35, 1, 11.97, 0.00, 0.00, 0.00, 11.97, 0.00, 0.00, 0.00, 0.00, 11.97, '2025-05-30 03:46:43', '2025-05-30 03:46:43', 0.00, 'fixed', 0.00, 11.97),
(400, 35, 1, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-06-03 09:34:33', '2025-06-03 09:34:33', 0.00, 'fixed', 0.00, 10.99),
(401, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-03 10:16:21', '2025-06-03 10:16:21', 0.00, 'fixed', 0.00, 3.99),
(402, 35, 1, 19.95, 0.00, 0.00, 0.00, 39.50, 0.00, 0.00, 0.00, 0.00, 19.95, '2025-06-03 10:21:49', '2025-06-03 10:21:49', 0.00, 'fixed', 0.00, 19.95),
(403, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-03 10:28:13', '2025-06-03 10:28:13', 0.00, 'fixed', 0.00, 3.99),
(404, 35, 1, 3.99, 0.00, 0.00, 0.00, 7.98, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-03 10:30:11', '2025-06-03 10:30:11', 0.00, 'fixed', 0.00, 3.99),
(405, 35, 2, 8.99, 0.00, 0.00, 0.00, 8.99, 0.00, 0.00, 0.00, 0.00, 8.99, '2025-06-04 05:07:01', '2025-06-04 05:07:01', 0.00, 'fixed', 0.00, 8.99),
(406, 35, 2, 3.99, 0.00, 0.00, 0.00, 2.00, 0.00, 0.00, 1.99, 0.00, 3.99, '2025-06-04 05:12:30', '2025-06-04 05:12:30', 0.00, 'fixed', 0.00, 3.99),
(407, 35, 2, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-04 05:13:09', '2025-06-04 05:13:09', 0.00, 'fixed', 0.00, 3.99),
(408, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-04 05:21:44', '2025-06-04 05:21:44', 0.00, 'fixed', 0.00, 3.99),
(409, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-04 05:21:56', '2025-06-04 05:21:56', 0.00, 'fixed', 0.00, 3.99),
(410, 35, 1, 400.00, 0.00, 0.00, 0.00, 400.00, 0.00, 0.00, 0.00, 0.00, 400.00, '2025-06-04 05:22:21', '2025-06-04 05:22:21', 0.00, 'fixed', 0.00, 400.00),
(411, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-04 05:24:12', '2025-06-04 05:24:12', 0.00, 'fixed', 0.00, 3.99),
(412, 35, 1, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-06-04 05:24:23', '2025-06-04 05:24:23', 0.00, 'fixed', 0.00, 10.99),
(413, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-04 06:01:27', '2025-06-04 06:01:27', 0.00, 'fixed', 0.00, 3.99),
(414, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-04 06:57:30', '2025-06-04 06:57:30', 0.00, 'fixed', 0.00, 3.99),
(415, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-04 07:01:52', '2025-06-04 07:01:52', 0.00, 'fixed', 0.00, 3.99),
(416, 35, 1, 5.50, 0.00, 0.00, 0.00, 5.50, 0.00, 0.00, 0.00, 0.00, 5.50, '2025-06-04 07:10:21', '2025-06-04 07:10:21', 0.00, 'fixed', 0.00, 5.50),
(417, 35, 1, 3.99, 0.00, 0.00, 0.00, 2.00, 0.00, 1.99, 0.00, 0.00, 3.99, '2025-06-04 08:31:37', '2025-06-04 08:31:38', 0.00, 'fixed', 0.00, 3.99),
(418, 35, 1, 3.99, 0.00, 0.00, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 3.99, '2025-06-06 07:04:51', '2025-06-06 07:04:51', 0.00, 'fixed', 0.00, 3.99),
(419, 36, 1, 19.98, 0.00, 0.00, 0.00, 19.98, 0.00, 0.00, 0.00, 0.00, 19.98, '2025-06-07 13:14:40', '2025-06-07 13:14:40', 0.00, 'fixed', 0.00, 19.98),
(420, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-06-13 06:45:16', '2025-06-13 06:45:16', 0.00, 'fixed', 0.00, 4.99),
(421, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-06-13 06:50:05', '2025-06-13 06:50:05', 0.00, 'fixed', 0.00, 4.99),
(422, 35, 1, 4.99, 0.00, 0.00, 0.00, 4.99, 0.00, 0.00, 0.00, 0.00, 4.99, '2025-06-13 07:02:52', '2025-06-13 07:02:52', 0.00, 'fixed', 0.00, 4.99),
(424, 35, 1, 10.99, 0.00, 0.00, 0.00, 10.99, 0.00, 0.00, 0.00, 0.00, 10.99, '2025-06-13 12:13:50', '2025-06-13 12:13:50', 0.00, 'fixed', 0.00, 10.99),
(425, 35, 1, 3.99, 0.00, 0.00, 0.00, 3.99, 0.00, 0.00, 0.00, 0.00, 3.99, '2025-06-13 12:20:34', '2025-06-13 12:20:34', 0.00, 'fixed', 0.00, 3.99),
(426, 35, 1, 6.18, 0.00, 0.00, 0.00, 6.18, 0.00, 0.00, 0.00, 0.00, 6.18, '2025-06-14 06:27:19', '2025-06-14 06:27:19', 0.00, 'fixed', 0.00, 6.18);

-- --------------------------------------------------------

--
-- Table structure for table `sale_payments`
--

CREATE TABLE `sale_payments` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `details` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_payments`
--

INSERT INTO `sale_payments` (`id`, `sale_id`, `payment_method`, `amount`, `details`, `createdAt`, `updatedAt`) VALUES
(75, 136, 'cash', 300.00, NULL, '2025-03-28 12:39:20', '2025-03-28 12:39:20'),
(76, 136, 'credit', 100.00, NULL, '2025-03-28 12:39:20', '2025-03-28 12:39:20'),
(77, 137, 'cash', 300.00, NULL, '2025-03-28 12:50:38', '2025-03-28 12:50:38'),
(78, 137, 'credit', 100.00, NULL, '2025-03-28 12:50:38', '2025-03-28 12:50:38'),
(79, 138, 'cash', 300.00, NULL, '2025-03-28 17:02:37', '2025-03-28 17:02:37'),
(80, 138, 'credit', 100.00, NULL, '2025-03-28 17:02:37', '2025-03-28 17:02:37'),
(81, 140, 'cash', 300.00, NULL, '2025-03-28 17:04:45', '2025-03-28 17:04:45'),
(82, 140, 'credit', 100.00, NULL, '2025-03-28 17:04:46', '2025-03-28 17:04:46'),
(83, 141, 'cash', 300.00, NULL, '2025-03-28 17:05:03', '2025-03-28 17:05:03'),
(84, 141, 'credit', 100.00, NULL, '2025-03-28 17:05:03', '2025-03-28 17:05:03'),
(85, 142, 'cash', 300.00, NULL, '2025-03-28 17:05:30', '2025-03-28 17:05:30'),
(86, 142, 'credit', 100.00, NULL, '2025-03-28 17:05:30', '2025-03-28 17:05:30'),
(87, 143, 'cash', 300.00, NULL, '2025-03-28 17:06:41', '2025-03-28 17:06:41'),
(88, 143, 'credit', 100.00, NULL, '2025-03-28 17:06:41', '2025-03-28 17:06:41'),
(89, 144, 'cash', 300.00, NULL, '2025-03-28 17:07:45', '2025-03-28 17:07:45'),
(90, 144, 'credit', 100.00, NULL, '2025-03-28 17:07:45', '2025-03-28 17:07:45'),
(91, 145, 'cash', 300.00, NULL, '2025-03-28 18:03:07', '2025-03-28 18:03:07'),
(92, 145, 'credit', 100.00, NULL, '2025-03-28 18:03:07', '2025-03-28 18:03:07'),
(93, 146, 'cash', 300.00, NULL, '2025-03-28 18:09:34', '2025-03-28 18:09:34'),
(94, 146, 'credit', 100.00, NULL, '2025-03-28 18:09:34', '2025-03-28 18:09:34'),
(95, 147, 'cash', 300.00, NULL, '2025-03-28 18:32:00', '2025-03-28 18:32:00'),
(96, 147, 'credit', 100.00, NULL, '2025-03-28 18:32:01', '2025-03-28 18:32:01'),
(97, 148, 'credit', 4.39, '{}', '2025-03-28 19:30:50', '2025-03-28 19:30:50'),
(98, 149, 'cash', 2.00, '{}', '2025-03-28 19:42:27', '2025-03-28 19:42:27'),
(99, 149, 'credit', 2.36, '{}', '2025-03-28 19:42:28', '2025-03-28 19:42:28'),
(100, 150, 'credit', 1.49, '{}', '2025-03-29 04:19:53', '2025-03-29 04:19:53'),
(101, 151, 'credit', 8.99, '{}', '2025-03-29 04:20:27', '2025-03-29 04:20:27'),
(102, 152, 'cash', 2.00, '{}', '2025-03-29 04:22:01', '2025-03-29 04:22:01'),
(103, 152, 'credit', 0.10, '{}', '2025-03-29 04:22:01', '2025-03-29 04:22:01'),
(104, 153, 'cash', 10.00, NULL, '2025-03-29 04:44:27', '2025-03-29 04:44:27'),
(105, 154, 'cash', 10.00, NULL, '2025-03-29 04:47:55', '2025-03-29 04:47:55'),
(106, 155, 'cash', 2.49, '{}', '2025-03-29 05:07:42', '2025-03-29 05:07:42'),
(107, 156, 'cash', 1.98, '{}', '2025-03-29 05:15:11', '2025-03-29 05:15:11'),
(108, 156, 'cash', 0.01, '{}', '2025-03-29 05:15:11', '2025-03-29 05:15:11'),
(109, 157, 'cash', 10.52, '{}', '2025-03-29 05:17:09', '2025-03-29 05:17:09'),
(110, 158, 'cash', 3.99, '{}', '2025-03-29 05:54:18', '2025-03-29 05:54:18'),
(111, 159, 'credit', 3.05, '{}', '2025-03-29 07:28:24', '2025-03-29 07:28:24'),
(112, 160, 'cash', 16.23, '{}', '2025-03-31 11:52:43', '2025-03-31 11:52:43'),
(113, 161, 'online', 6.99, '{\"cheque_number\":\"454545454\",\"bank_name\":\"boc\"}', '2025-03-31 12:35:57', '2025-03-31 12:35:57'),
(114, 162, 'online', 1.99, '{\"cheque_number\":\"4545\",\"bank_name\":\"boc\"}', '2025-03-31 12:45:42', '2025-03-31 12:45:42'),
(115, 163, 'online', 1.33, '{\"cheque_number\":\"4545\",\"bank_name\":\"boc\"}', '2025-03-31 12:50:47', '2025-03-31 12:50:47'),
(116, 164, 'online', 5.00, '{\"cheque_number\":\"4545\",\"bank_name\":\"boc\"}', '2025-03-31 12:58:49', '2025-03-31 12:58:49'),
(117, 165, 'online', 3.99, '{\"cheque_number\":\"45454\",\"bank_name\":\"boc\"}', '2025-03-31 13:02:53', '2025-03-31 13:02:53'),
(118, 166, 'online', 3.99, '{\"cheque_number\":\"4658\",\"bank_name\":\"pbank\"}', '2025-03-31 13:07:34', '2025-03-31 13:07:34'),
(119, 167, 'online', 9.99, '{\"cheque_number\":\"58578\",\"bank_name\":\"bcc\"}', '2025-03-31 13:10:00', '2025-03-31 13:10:00'),
(120, 168, 'cheque', 3.74, '{\"cheque_number\":\"45858\",\"bank_name\":\"DFCC\"}', '2025-03-31 13:18:34', '2025-03-31 13:18:34'),
(121, 173, 'cash', 8.97, '{\"amount\":8.97}', '2025-04-01 13:27:29', '2025-04-01 13:27:29'),
(122, 173, 'cash', 0.02, '{\"amount\":0.02}', '2025-04-01 13:27:29', '2025-04-01 13:27:29'),
(123, 174, 'cash', 8.97, '{\"amount\":8.97}', '2025-04-01 13:29:01', '2025-04-01 13:29:01'),
(124, 174, 'cash', 0.02, '{\"amount\":0.02}', '2025-04-01 13:29:01', '2025-04-01 13:29:01'),
(125, 175, 'cash', 8.99, '{\"amount\":8.99}', '2025-04-01 13:32:59', '2025-04-01 13:32:59'),
(126, 176, 'cash', 208.98, '{\"amount\":208.98}', '2025-04-01 13:38:35', '2025-04-01 13:38:35'),
(127, 176, 'cash', 0.01, '{\"amount\":0.01}', '2025-04-01 13:38:35', '2025-04-01 13:38:35'),
(128, 177, 'cash', 208.98, '{\"amount\":208.98}', '2025-04-01 13:39:45', '2025-04-01 13:39:45'),
(129, 177, 'cash', 0.01, '{\"amount\":0.01}', '2025-04-01 13:39:45', '2025-04-01 13:39:45'),
(130, 178, 'cash', 8.99, '{\"amount\":8.99}', '2025-04-01 13:48:43', '2025-04-01 13:48:43'),
(131, 179, 'cash', 8.99, '{\"amount\":8.99}', '2025-04-01 13:50:12', '2025-04-01 13:50:12'),
(132, 180, 'cash', 8.99, '{\"amount\":8.99}', '2025-04-01 14:27:01', '2025-04-01 14:27:01'),
(133, 181, 'cash', 8.99, '{\"amount\":8.99}', '2025-04-01 14:32:46', '2025-04-01 14:32:46'),
(134, 182, 'cash', 8.99, '{}', '2025-04-01 14:34:22', '2025-04-01 14:34:22'),
(135, 183, 'cash', 8.98, '{\"amount\":8.98}', '2025-04-01 14:43:38', '2025-04-01 14:43:38'),
(136, 183, 'cash', 0.01, '{\"amount\":0.01}', '2025-04-01 14:43:38', '2025-04-01 14:43:38'),
(137, 184, 'cash', 8.99, '{}', '2025-04-02 05:00:57', '2025-04-02 05:00:57'),
(138, 185, 'cash', 6.50, '{}', '2025-04-02 08:40:43', '2025-04-02 08:40:43'),
(139, 186, 'credit', 4.99, '{}', '2025-04-02 09:21:07', '2025-04-02 09:21:07'),
(140, 187, 'cheque', 6.50, '{\"cheque_number\":\"4545\",\"bank_name\":\"boc\"}', '2025-04-02 09:24:51', '2025-04-02 09:24:51'),
(141, 188, 'credit', 6.50, '{}', '2025-04-02 09:30:10', '2025-04-02 09:30:10'),
(142, 189, 'cash', 6.50, '{}', '2025-04-02 09:30:30', '2025-04-02 09:30:30'),
(143, 190, 'cheque', 9.99, '{\"cheque_number\":\"45454\",\"bank_name\":\"boc\"}', '2025-04-02 09:43:28', '2025-04-02 09:43:28'),
(144, 191, 'card', 6.50, '{\"card_type\":\"Visa\",\"reference_number\":\"45454\"}', '2025-04-02 09:45:31', '2025-04-02 09:45:31'),
(145, 192, 'cheque', 6.50, '{\"cheque_number\":\"45454\",\"bank_name\":\"boc\"}', '2025-04-02 09:46:05', '2025-04-02 09:46:05'),
(146, 193, 'cheque', 6.50, '{\"gift_voucher_number\":\"5555\",\"gift_voucher_balance\":\"25\"}', '2025-04-02 09:46:34', '2025-04-02 09:46:34'),
(147, 194, 'cash', 6.17, '{}', '2025-04-02 13:17:25', '2025-04-02 13:17:25'),
(148, 195, 'cash', 6.50, '{}', '2025-04-02 13:36:47', '2025-04-02 13:36:47'),
(149, 196, 'cash', 3.79, '{}', '2025-04-09 03:23:38', '2025-04-09 03:23:38'),
(150, 197, 'cash', 3.99, '{}', '2025-04-09 11:02:35', '2025-04-09 11:02:35'),
(151, 198, 'cash', 10.99, '{}', '2025-04-09 12:03:15', '2025-04-09 12:03:15'),
(152, 199, 'cash', 8.98, '{}', '2025-04-09 17:02:25', '2025-04-09 17:02:25'),
(153, 200, 'cash', 11.98, '{}', '2025-04-17 18:19:04', '2025-04-17 18:19:04'),
(154, 201, 'cash', 11.98, '{}', '2025-04-25 10:15:59', '2025-04-25 10:15:59'),
(155, 202, 'cash', 3.91, '{}', '2025-04-30 08:49:58', '2025-04-30 08:49:58'),
(156, 203, 'credit', 3.99, '{}', '2025-04-30 09:27:05', '2025-04-30 09:27:05'),
(157, 204, 'cash', 10.99, '{}', '2025-04-30 09:29:31', '2025-04-30 09:29:31'),
(158, 205, 'cash', 3.99, '{}', '2025-04-30 09:30:48', '2025-04-30 09:30:48'),
(159, 206, 'cash', 3.99, '{}', '2025-04-30 09:31:19', '2025-04-30 09:31:19'),
(160, 207, 'cash', 3.99, '{}', '2025-04-30 09:35:58', '2025-04-30 09:35:58'),
(161, 208, 'cash', 4.99, '{}', '2025-04-30 09:37:00', '2025-04-30 09:37:00'),
(162, 209, 'cash', 3.99, '{}', '2025-04-30 09:46:12', '2025-04-30 09:46:12'),
(163, 210, 'cash', 3.99, '{}', '2025-04-30 09:46:45', '2025-04-30 09:46:45'),
(164, 211, 'cash', 3.99, '{}', '2025-04-30 10:01:04', '2025-04-30 10:01:04'),
(165, 212, 'cash', 3.99, '{}', '2025-04-30 10:04:30', '2025-04-30 10:04:30'),
(166, 213, 'cash', 3.99, '{}', '2025-04-30 10:15:48', '2025-04-30 10:15:48'),
(167, 214, 'cash', 3.99, '{}', '2025-04-30 10:19:49', '2025-04-30 10:19:49'),
(168, 215, 'cash', 3.99, '{}', '2025-04-30 10:36:19', '2025-04-30 10:36:19'),
(169, 216, 'cash', 3.99, '{}', '2025-04-30 10:51:42', '2025-04-30 10:51:42'),
(170, 217, 'cash', 3.99, '{}', '2025-04-30 10:56:19', '2025-04-30 10:56:19'),
(171, 218, 'cash', 3.99, '{}', '2025-04-30 11:02:57', '2025-04-30 11:02:57'),
(172, 219, 'cash', 3.99, '{}', '2025-04-30 11:04:19', '2025-04-30 11:04:19'),
(173, 220, 'cash', 4.91, '{}', '2025-04-30 11:13:35', '2025-04-30 11:13:35'),
(174, 221, 'cash', 2.99, '{}', '2025-04-30 11:22:09', '2025-04-30 11:22:09'),
(175, 222, 'cash', 2.99, '{}', '2025-04-30 11:32:57', '2025-04-30 11:32:57'),
(176, 223, 'cash', 2.50, '{}', '2025-04-30 11:49:00', '2025-04-30 11:49:00'),
(177, 224, 'cash', 1.99, '{}', '2025-04-30 11:58:09', '2025-04-30 11:58:09'),
(178, 225, 'cash', 1.99, '{}', '2025-04-30 12:01:46', '2025-04-30 12:01:46'),
(179, 226, 'cash', 1.99, '{}', '2025-04-30 12:07:15', '2025-04-30 12:07:15'),
(180, 227, 'cash', 3.29, '{}', '2025-04-30 12:10:42', '2025-04-30 12:10:42'),
(181, 228, 'cash', 2.19, '{}', '2025-04-30 12:11:47', '2025-04-30 12:11:47'),
(182, 229, 'cash', 2.19, '{}', '2025-04-30 12:16:51', '2025-04-30 12:16:51'),
(183, 230, 'credit', 2.49, '{}', '2025-05-01 03:32:57', '2025-05-01 03:32:57'),
(184, 231, 'credit', 2.49, '{}', '2025-05-01 03:36:07', '2025-05-01 03:36:07'),
(185, 232, 'cash', 2.00, '{}', '2025-05-01 04:15:47', '2025-05-01 04:15:47'),
(186, 233, 'cash', 2.00, '{}', '2025-05-01 04:18:21', '2025-05-01 04:18:21'),
(187, 234, 'cash', 2.99, '{}', '2025-05-01 04:19:46', '2025-05-01 04:19:46'),
(188, 235, 'cash', 2.99, '{}', '2025-05-01 04:21:33', '2025-05-01 04:21:33'),
(189, 236, 'cash', 2.99, '{}', '2025-05-01 05:04:29', '2025-05-01 05:04:29'),
(190, 237, 'cash', 2.99, '{}', '2025-05-01 05:27:08', '2025-05-01 05:27:08'),
(191, 238, 'cash', 1.99, '{}', '2025-05-01 05:38:05', '2025-05-01 05:38:05'),
(192, 239, 'cash', 3.99, '{}', '2025-05-01 05:40:19', '2025-05-01 05:40:19'),
(193, 240, 'cash', 1.99, '{}', '2025-05-01 05:42:08', '2025-05-01 05:42:08'),
(194, 241, 'cash', 1.49, '{}', '2025-05-01 05:46:22', '2025-05-01 05:46:22'),
(195, 242, 'cheque', 3.99, '{\"gift_voucher_number\":\"454545\",\"gift_voucher_balance\":\"4545\"}', '2025-05-01 05:47:20', '2025-05-01 05:47:20'),
(196, 243, 'credit', 5.50, '{}', '2025-05-01 05:51:39', '2025-05-01 05:51:39'),
(197, 244, 'credit', 3.59, '{}', '2025-05-01 05:54:03', '2025-05-01 05:54:03'),
(198, 245, 'cash', 162.46, '{}', '2025-05-01 05:57:50', '2025-05-01 05:57:50'),
(199, 246, 'cash', 2.99, '{}', '2025-05-01 06:05:21', '2025-05-01 06:05:21'),
(200, 247, 'credit', 5.98, '{}', '2025-05-01 06:06:29', '2025-05-01 06:06:29'),
(201, 248, 'card', 3.99, '{\"card_type\":\"Visa\",\"reference_number\":\"45455\"}', '2025-05-01 06:07:11', '2025-05-01 06:07:11'),
(202, 249, 'card', 3.99, '{\"card_type\":\"Visa\",\"reference_number\":\"4545485\"}', '2025-05-01 06:08:27', '2025-05-01 06:08:27'),
(203, 250, 'card', 3.11, '{\"card_type\":\"MasterCard\",\"reference_number\":\"45454\"}', '2025-05-01 06:10:27', '2025-05-01 06:10:27'),
(204, 251, 'cheque', 3.11, '{\"gift_voucher_number\":\"45454\",\"gift_voucher_balance\":\"25\"}', '2025-05-01 06:11:35', '2025-05-01 06:11:35'),
(205, 252, 'cheque', 1.98, '{\"gift_voucher_number\":\"45454\",\"gift_voucher_balance\":\"454\"}', '2025-05-01 06:13:08', '2025-05-01 06:13:08'),
(206, 252, 'cash', 0.01, '{}', '2025-05-01 06:13:08', '2025-05-01 06:13:08'),
(207, 253, 'card', 2.49, '{\"card_type\":\"Visa\",\"reference_number\":\"4544\"}', '2025-05-01 06:31:05', '2025-05-01 06:31:05'),
(208, 254, 'voucher', 1.24, '{\"gift_voucher_number\":\"4555\",\"gift_voucher_balance\":\"2355\"}', '2025-05-01 06:58:00', '2025-05-01 06:58:00'),
(209, 255, 'cash', 18.95, '{}', '2025-05-01 07:01:32', '2025-05-01 07:01:32'),
(210, 256, 'cash', 19.95, '{}', '2025-05-01 07:03:28', '2025-05-01 07:03:28'),
(211, 257, 'voucher', 64.99, '{\"gift_voucher_number\":\"45855\",\"gift_voucher_balance\":\"12544\"}', '2025-05-01 07:07:23', '2025-05-01 07:07:23'),
(212, 257, 'cash', 0.01, '{}', '2025-05-01 07:07:23', '2025-05-01 07:07:23'),
(213, 258, 'voucher', 2.99, '{\"gift_voucher_number\":\"455555\",\"gift_voucher_balance\":\"2585\"}', '2025-05-01 07:15:37', '2025-05-01 07:15:37'),
(214, 259, 'voucher', 3.99, '{\"gift_voucher_number\":\"4555\",\"gift_voucher_balance\":\"33333\"}', '2025-05-01 07:26:03', '2025-05-01 07:26:03'),
(215, 260, 'voucher', 3.99, '{\"gift_voucher_number\":\"55565655\",\"gift_voucher_balance\":\"658989\"}', '2025-05-01 07:56:58', '2025-05-01 07:56:58'),
(216, 261, 'cash', 3.99, '{}', '2025-05-01 08:23:09', '2025-05-01 08:23:09'),
(217, 262, 'cash', 3.99, '{}', '2025-05-01 08:28:21', '2025-05-01 08:28:21'),
(218, 263, 'cash', 3.99, '{}', '2025-05-01 10:49:25', '2025-05-01 10:49:25'),
(219, 264, 'cash', 3.99, '{}', '2025-05-01 11:17:58', '2025-05-01 11:17:58'),
(220, 265, 'cash', 3.99, '{}', '2025-05-01 11:22:32', '2025-05-01 11:22:32'),
(221, 266, 'cash', 1.99, '{}', '2025-05-02 02:43:51', '2025-05-02 02:43:51'),
(222, 267, 'cash', 3.66, '{}', '2025-05-02 02:45:07', '2025-05-02 02:45:07'),
(223, 268, 'cash', 3.99, '{}', '2025-05-02 02:59:59', '2025-05-02 02:59:59'),
(224, 269, 'cash', 3.99, '{}', '2025-05-02 03:03:55', '2025-05-02 03:03:55'),
(225, 270, 'cash', 3.99, '{}', '2025-05-02 03:04:15', '2025-05-02 03:04:15'),
(226, 271, 'cash', 3.99, '{}', '2025-05-02 03:07:37', '2025-05-02 03:07:37'),
(227, 272, 'cash', 3.99, '{}', '2025-05-02 03:08:04', '2025-05-02 03:08:04'),
(228, 273, 'cash', 3.99, '{}', '2025-05-02 03:10:10', '2025-05-02 03:10:10'),
(229, 274, 'cash', 3.99, '{}', '2025-05-02 03:10:27', '2025-05-02 03:10:27'),
(230, 275, 'cash', 4.99, '{}', '2025-05-02 03:11:41', '2025-05-02 03:11:41'),
(231, 276, 'cash', 3.99, '{}', '2025-05-02 03:11:58', '2025-05-02 03:11:58'),
(232, 277, 'cash', 3.99, '{}', '2025-05-02 03:34:32', '2025-05-02 03:34:32'),
(233, 278, 'cash', 14.98, '{}', '2025-05-02 03:35:16', '2025-05-02 03:35:16'),
(234, 279, 'cash', 10.99, '{}', '2025-05-02 03:35:38', '2025-05-02 03:35:38'),
(235, 280, 'cash', 10.99, '{}', '2025-05-02 03:35:54', '2025-05-02 03:35:54'),
(236, 281, 'cash', 3.99, '{}', '2025-05-02 03:38:38', '2025-05-02 03:38:38'),
(237, 282, 'cash', 3.99, '{}', '2025-05-02 09:03:51', '2025-05-02 09:03:51'),
(238, 283, 'cash', 3.99, '{}', '2025-05-02 09:07:50', '2025-05-02 09:07:50'),
(239, 284, 'cash', 200.00, '{}', '2025-05-02 10:51:58', '2025-05-02 10:51:58'),
(240, 285, 'cash', 3.99, '{}', '2025-05-03 03:59:42', '2025-05-03 03:59:42'),
(241, 286, 'cash', 3.99, '{}', '2025-05-03 04:19:31', '2025-05-03 04:19:31'),
(242, 287, 'cash', 3.99, '{}', '2025-05-03 04:20:08', '2025-05-03 04:20:08'),
(243, 288, 'cash', 3.99, '{}', '2025-05-03 04:26:44', '2025-05-03 04:26:44'),
(244, 289, 'cash', 3.99, '{}', '2025-05-03 04:28:34', '2025-05-03 04:28:34'),
(245, 290, 'cash', 3.99, '{}', '2025-05-03 04:35:12', '2025-05-03 04:35:12'),
(246, 291, 'cash', 3.99, '{}', '2025-05-03 04:45:11', '2025-05-03 04:45:11'),
(247, 292, 'cash', 3.99, '{}', '2025-05-03 04:48:38', '2025-05-03 04:48:38'),
(248, 293, 'cash', 3.99, '{}', '2025-05-03 04:49:14', '2025-05-03 04:49:14'),
(249, 294, 'cash', 3.99, '{}', '2025-05-03 04:53:37', '2025-05-03 04:53:37'),
(250, 295, 'cash', 3.99, '{}', '2025-05-03 05:00:59', '2025-05-03 05:00:59'),
(251, 296, 'cash', 4.99, '{}', '2025-05-03 05:07:25', '2025-05-03 05:07:25'),
(252, 297, 'cash', 3.99, '{}', '2025-05-03 05:33:27', '2025-05-03 05:33:27'),
(253, 298, 'cash', 3.99, '{}', '2025-05-03 05:37:49', '2025-05-03 05:37:49'),
(254, 299, 'cash', 3.99, '{}', '2025-05-03 06:13:10', '2025-05-03 06:13:10'),
(255, 300, 'cash', 3.99, '{}', '2025-05-03 06:15:33', '2025-05-03 06:15:33'),
(256, 301, 'cash', 3.99, '{}', '2025-05-03 06:37:05', '2025-05-03 06:37:05'),
(257, 302, 'cash', 3.99, '{}', '2025-05-03 06:37:42', '2025-05-03 06:37:42'),
(258, 303, 'cash', 3.99, '{}', '2025-05-03 06:38:48', '2025-05-03 06:38:48'),
(259, 304, 'cash', 3.99, '{}', '2025-05-03 06:39:12', '2025-05-03 06:39:12'),
(260, 305, 'cash', 3.99, '{}', '2025-05-03 06:46:59', '2025-05-03 06:46:59'),
(261, 307, 'cash', 10.99, '{}', '2025-05-03 06:52:02', '2025-05-03 06:52:02'),
(262, 308, 'cash', 4.99, '{}', '2025-05-03 06:54:28', '2025-05-03 06:54:28'),
(263, 309, 'cash', 4.99, '{}', '2025-05-03 06:54:54', '2025-05-03 06:54:54'),
(264, 310, 'cash', 4.99, '{}', '2025-05-03 06:55:55', '2025-05-03 06:55:55'),
(265, 312, 'cash', 4.99, '{}', '2025-05-03 06:58:01', '2025-05-03 06:58:01'),
(266, 313, 'cash', 4.99, '{}', '2025-05-03 06:58:36', '2025-05-03 06:58:36'),
(267, 314, 'cash', 3.99, '{}', '2025-05-03 06:59:58', '2025-05-03 06:59:58'),
(268, 315, 'cash', 4.99, '{}', '2025-05-03 07:54:06', '2025-05-03 07:54:06'),
(269, 318, 'cash', 6.50, '{}', '2025-05-03 08:08:15', '2025-05-03 08:08:15'),
(270, 318, 'cash', 8.99, '{}', '2025-05-03 08:08:15', '2025-05-03 08:08:15'),
(271, 320, 'cash', 4.99, '{}', '2025-05-03 08:13:23', '2025-05-03 08:13:23'),
(272, 321, 'cash', 4.49, '{}', '2025-05-03 08:14:10', '2025-05-03 08:14:10'),
(273, 322, 'cash', 4.49, NULL, '2025-05-03 10:16:57', '2025-05-03 10:16:57'),
(274, 323, 'cash', 6.10, '{}', '2025-05-03 11:31:33', '2025-05-03 11:31:33'),
(275, 324, 'cash', 4.49, NULL, '2025-05-03 11:34:23', '2025-05-03 11:34:23'),
(276, 325, 'cash', 3.10, '{}', '2025-05-03 11:51:52', '2025-05-03 11:51:52'),
(277, 326, 'cash', 18.00, NULL, '2025-05-03 12:09:21', '2025-05-03 12:09:21'),
(278, 327, 'cash', 18.00, NULL, '2025-05-03 12:12:42', '2025-05-03 12:12:42'),
(279, 328, 'cash', 6.10, '{}', '2025-05-03 12:21:22', '2025-05-03 12:21:22'),
(280, 329, 'cash', 8.99, '{}', '2025-05-04 04:23:00', '2025-05-04 04:23:00'),
(281, 330, 'cash', 4.99, '{}', '2025-05-04 05:16:25', '2025-05-04 05:16:25'),
(282, 331, 'cash', 6.10, '{}', '2025-05-04 05:28:21', '2025-05-04 05:28:21'),
(283, 332, 'cash', 6.50, '{}', '2025-05-04 05:31:25', '2025-05-04 05:31:25'),
(284, 333, 'cash', 6.10, '{}', '2025-05-04 05:45:45', '2025-05-04 05:45:45'),
(285, 334, 'cash', 8.99, '{}', '2025-05-04 07:58:40', '2025-05-04 07:58:40'),
(286, 335, 'cash', 6.10, '{}', '2025-05-04 07:59:04', '2025-05-04 07:59:04'),
(287, 339, 'cash', 100.00, '{}', '2025-05-04 08:27:29', '2025-05-04 08:27:29'),
(288, 339, 'credit', 87.99, '{}', '2025-05-04 08:27:29', '2025-05-04 08:27:29'),
(289, 342, 'cash', 2.99, '{}', '2025-05-10 04:19:57', '2025-05-10 04:19:57'),
(290, 343, 'cash', 6.10, '{}', '2025-05-10 04:32:12', '2025-05-10 04:32:12'),
(291, 344, 'cash', 10.99, '{}', '2025-05-10 04:32:49', '2025-05-10 04:32:49'),
(292, 345, 'cash', 6.50, '{}', '2025-05-10 04:38:16', '2025-05-10 04:38:16'),
(293, 346, 'cash', 6.00, '{}', '2025-05-10 04:39:32', '2025-05-10 04:39:32'),
(294, 347, 'cash', 8.99, '{}', '2025-05-10 04:58:44', '2025-05-10 04:58:44'),
(295, 348, 'cash', 6.10, '{}', '2025-05-10 05:38:08', '2025-05-10 05:38:08'),
(296, 350, 'cash', 14.97, '{}', '2025-05-10 07:19:38', '2025-05-10 07:19:38'),
(297, 351, 'cash', 13.00, '{}', '2025-05-14 03:08:13', '2025-05-14 03:08:13'),
(298, 352, 'cash', 13.00, '{}', '2025-05-14 03:09:14', '2025-05-14 03:09:14'),
(299, 353, 'cash', 6.10, '{}', '2025-05-14 03:29:01', '2025-05-14 03:29:01'),
(300, 354, 'credit', 6.10, '{}', '2025-05-14 04:02:29', '2025-05-14 04:02:29'),
(301, 355, 'cash', 3.99, '{}', '2025-05-14 06:57:11', '2025-05-14 06:57:11'),
(302, 356, 'cash', 24.96, '{}', '2025-05-15 07:25:59', '2025-05-15 07:25:59'),
(303, 356, 'cash', 0.02, '{}', '2025-05-15 07:25:59', '2025-05-15 07:25:59'),
(304, 357, 'cash', 12.60, '{}', '2025-05-15 11:49:41', '2025-05-15 11:49:41'),
(305, 358, 'cash', 6.10, '{}', '2025-05-15 11:57:29', '2025-05-15 11:57:29'),
(306, 359, 'cash', 6.10, '{}', '2025-05-16 12:13:58', '2025-05-16 12:13:58'),
(307, 360, 'cash', 6.10, '{}', '2025-05-17 03:34:11', '2025-05-17 03:34:11'),
(308, 361, 'card', 4.99, '{\"card_type\":\"MasterCard\",\"reference_number\":\"125585\"}', '2025-05-17 03:36:23', '2025-05-17 03:36:23'),
(309, 362, 'cash', 6.10, '{}', '2025-05-17 05:43:32', '2025-05-17 05:43:32'),
(310, 363, 'cash', 3.99, '{}', '2025-05-17 07:34:11', '2025-05-17 07:34:11'),
(311, 364, 'cash', 6.10, '{\"presentedAmount\":\"10\"}', '2025-05-17 08:25:34', '2025-05-17 08:25:34'),
(312, 364, 'cash', 6.10, '{\"presentedAmount\":\"20\"}', '2025-05-17 08:25:34', '2025-05-17 08:25:34'),
(313, 365, 'cash', 6.10, '{\"presentedAmount\":0}', '2025-05-17 08:53:25', '2025-05-17 08:53:25'),
(314, 365, 'cash', 6.10, '{\"presentedAmount\":0}', '2025-05-17 08:53:25', '2025-05-17 08:53:25'),
(315, 366, 'cash', 5.00, '{\"presentedAmount\":0}', '2025-05-17 09:01:07', '2025-05-17 09:01:07'),
(316, 366, 'card', 1.10, '{\"card_type\":\"Visa\",\"reference_number\":\"4555\"}', '2025-05-17 09:01:07', '2025-05-17 09:01:07'),
(317, 367, 'cash', 3.99, '{\"presentedAmount\":\"20\"}', '2025-05-20 03:11:02', '2025-05-20 03:11:02'),
(318, 368, 'cash', 3.00, '{\"presentedAmount\":\"10\"}', '2025-05-20 04:11:48', '2025-05-20 04:11:48'),
(319, 368, 'card', 1.99, '{\"card_type\":\"Visa\",\"reference_number\":\"4555\"}', '2025-05-20 04:11:48', '2025-05-20 04:11:48'),
(320, 369, 'cash', 5.00, '{\"presentedAmount\":\"20\"}', '2025-05-20 05:06:53', '2025-05-20 05:06:53'),
(321, 369, 'card', 5.09, '{\"card_type\":\"Visa\",\"reference_number\":\"7555\"}', '2025-05-20 05:06:53', '2025-05-20 05:06:53'),
(322, 370, 'cash', 7.48, '{\"presentedAmount\":\"20\"}', '2025-05-20 11:09:21', '2025-05-20 11:09:21'),
(323, 371, 'cash', 3.99, '{\"presentedAmount\":\"5\"}', '2025-05-20 11:26:37', '2025-05-20 11:26:37'),
(324, 372, 'cash', 7.98, '{\"presentedAmount\":\"15\"}', '2025-05-20 11:58:40', '2025-05-20 11:58:40'),
(325, 373, 'cash', 3.99, '{\"presentedAmount\":0}', '2025-05-23 03:53:02', '2025-05-23 03:53:02'),
(326, 374, 'cash', 3.99, '{\"presentedAmount\":0}', '2025-05-23 04:10:56', '2025-05-23 04:10:56'),
(327, 375, 'cash', 8.99, '{\"presentedAmount\":\"10\"}', '2025-05-23 04:13:10', '2025-05-23 04:13:10'),
(328, 376, 'cash', 5.50, '{\"presentedAmount\":0}', '2025-05-23 04:14:47', '2025-05-23 04:14:47'),
(329, 377, 'cash', 5.50, '{\"presentedAmount\":0}', '2025-05-23 04:16:55', '2025-05-23 04:16:55'),
(331, 380, 'gift_voucher', 9.00, '{\"gift_voucher_number\": \"GV123\"}', '2025-05-24 06:07:09', '2025-05-24 06:07:09'),
(332, 381, 'cash', 3.99, '{\"presentedAmount\":0}', '2025-05-24 06:09:02', '2025-05-24 06:09:02'),
(333, 382, 'gift_voucher', 9.00, '{\"gift_voucher_number\": \"GV123\"}', '2025-05-24 06:38:07', '2025-05-24 06:38:07'),
(334, 383, 'cash', 10.00, '{\"presentedAmount\":\"20\"}', '2025-05-26 04:39:19', '2025-05-26 04:39:19'),
(335, 383, 'card', 11.98, '{\"card_type\":\"Visa\",\"reference_number\":\"65858\"}', '2025-05-26 04:39:19', '2025-05-26 04:39:19'),
(336, 384, 'cash', 10.00, '{\"presentedAmount\":\"20\"}', '2025-05-26 06:09:58', '2025-05-26 06:09:58'),
(337, 384, 'card', 11.98, '{\"card_type\":\"Visa\",\"reference_number\":\"65858\"}', '2025-05-26 06:09:58', '2025-05-26 06:09:58'),
(338, 385, 'cash', 5.00, '{\"presentedAmount\":\"10\"}', '2025-05-26 06:13:39', '2025-05-26 06:13:39'),
(339, 385, 'card', 5.59, '{\"card_type\":\"Visa\",\"reference_number\":\"8988\"}', '2025-05-26 06:13:39', '2025-05-26 06:13:39'),
(340, 385, 'cash', 10.99, '{\"presentedAmount\":\"20\"}', '2025-05-26 06:13:39', '2025-05-26 06:13:39'),
(341, 386, 'cash', 10.00, '{\"presentedAmount\":\"20\"}', '2025-05-26 06:21:41', '2025-05-26 06:21:41'),
(342, 386, 'card', 10.98, '{\"card_type\":\"MasterCard\",\"reference_number\":\"4585\"}', '2025-05-26 06:21:41', '2025-05-26 06:21:41'),
(343, 387, 'cash', 3.99, '{\"presentedAmount\":\"5\"}', '2025-05-26 07:31:40', '2025-05-26 07:31:40'),
(344, 388, 'cash', 20.00, '{\"presentedAmount\":\"50\"}', '2025-05-26 08:44:09', '2025-05-26 08:44:09'),
(345, 388, 'card', 5.62, '{\"card_type\":\"\",\"reference_number\":\"\"}', '2025-05-26 08:44:09', '2025-05-26 08:44:09'),
(346, 389, 'cash', 2.00, '{\"presentedAmount\":\"10\"}', '2025-05-26 09:21:24', '2025-05-26 09:21:24'),
(347, 389, 'card', 1.04, '{\"card_type\":\"Visa\",\"reference_number\":\"6555\"}', '2025-05-26 09:21:24', '2025-05-26 09:21:24'),
(348, 390, 'cash', 5.10, '{\"presentedAmount\":\"20\"}', '2025-05-26 09:43:25', '2025-05-26 09:43:25'),
(349, 391, 'cash', 200.00, '{\"presentedAmount\":\"500\"}', '2025-05-26 09:47:50', '2025-05-26 09:47:50'),
(350, 392, 'cash', 6.10, '{\"presentedAmount\":\"10\"}', '2025-05-26 09:49:21', '2025-05-26 09:49:21'),
(351, 393, 'cash', 10.99, '{\"presentedAmount\":\"20\"}', '2025-05-26 10:07:59', '2025-05-26 10:07:59'),
(352, 394, 'cash', 3.99, '{\"presentedAmount\":\"4\"}', '2025-05-26 10:26:25', '2025-05-26 10:26:25'),
(353, 395, 'cash', 20.00, '{\"presentedAmount\":\"50\"}', '2025-05-26 10:30:24', '2025-05-26 10:30:24'),
(354, 395, 'card', 2.95, '{\"card_type\":\"Visa\",\"reference_number\":\"88888\"}', '2025-05-26 10:30:24', '2025-05-26 10:30:24'),
(355, 396, 'cash', 3.99, '{\"presentedAmount\":\"10\"}', '2025-05-26 11:12:01', '2025-05-26 11:12:01'),
(356, 398, 'cash', 3.99, '{\"presentedAmount\":\"10\"}', '2025-05-29 04:49:08', '2025-05-29 04:49:08'),
(357, 399, 'cash', 11.97, '{\"presentedAmount\":\"15\"}', '2025-05-30 03:46:43', '2025-05-30 03:46:43'),
(358, 400, 'cash', 10.99, '{\"presentedAmount\":\"25\"}', '2025-06-03 09:34:33', '2025-06-03 09:34:33'),
(359, 401, 'cash', 3.99, '{\"presentedAmount\":\"10\"}', '2025-06-03 10:16:21', '2025-06-03 10:16:21'),
(360, 402, 'cash', 19.55, '{\"presentedAmount\":\"20\"}', '2025-06-03 10:21:49', '2025-06-03 10:21:49'),
(361, 402, 'cash', 19.95, '{\"presentedAmount\":0}', '2025-06-03 10:21:49', '2025-06-03 10:21:49'),
(362, 403, 'cash', 3.99, '{\"presentedAmount\":\"5\"}', '2025-06-03 10:28:13', '2025-06-03 10:28:13'),
(363, 404, 'cash', 3.99, '{\"presentedAmount\":\"5\"}', '2025-06-03 10:30:11', '2025-06-03 10:30:11'),
(364, 404, 'cash', 3.99, '{\"presentedAmount\":\"15\"}', '2025-06-03 10:30:11', '2025-06-03 10:30:11'),
(365, 405, 'cash', 8.99, '{}', '2025-06-04 05:07:01', '2025-06-04 05:07:01'),
(366, 406, 'cash', 2.00, '{}', '2025-06-04 05:12:30', '2025-06-04 05:12:30'),
(367, 406, 'gift_voucher', 1.99, '{\"gift_voucher_number\":\"444\",\"gift_voucher_balance\":\"5858\"}', '2025-06-04 05:12:30', '2025-06-04 05:12:30'),
(368, 407, 'cash', 3.99, '{}', '2025-06-04 05:13:09', '2025-06-04 05:13:09'),
(369, 408, 'cash', 3.99, '{}', '2025-06-04 05:21:44', '2025-06-04 05:21:44'),
(370, 409, 'cash', 3.99, '{}', '2025-06-04 05:21:56', '2025-06-04 05:21:56'),
(371, 410, 'cash', 400.00, '{}', '2025-06-04 05:22:21', '2025-06-04 05:22:21'),
(372, 411, 'cash', 3.99, '{}', '2025-06-04 05:24:12', '2025-06-04 05:24:12'),
(373, 412, 'cash', 10.99, '{}', '2025-06-04 05:24:23', '2025-06-04 05:24:23'),
(374, 413, 'cash', 3.99, '{}', '2025-06-04 06:01:27', '2025-06-04 06:01:27'),
(375, 414, 'cash', 3.99, '{}', '2025-06-04 06:57:31', '2025-06-04 06:57:31'),
(376, 415, 'cash', 3.99, '{}', '2025-06-04 07:01:52', '2025-06-04 07:01:52'),
(377, 416, 'cash', 5.50, '{}', '2025-06-04 07:10:21', '2025-06-04 07:10:21'),
(378, 417, 'cash', 2.00, '{}', '2025-06-04 08:31:38', '2025-06-04 08:31:38'),
(379, 417, 'card', 1.99, '{\"card_type\":\"MasterCard\",\"reference_number\":\"56565\"}', '2025-06-04 08:31:38', '2025-06-04 08:31:38'),
(380, 418, 'card', 3.99, '{\"card_type\":\"Visa\",\"reference_number\":\"45858\"}', '2025-06-06 07:04:51', '2025-06-06 07:04:51'),
(381, 419, 'cash', 19.98, '{}', '2025-06-07 13:14:40', '2025-06-07 13:14:40'),
(382, 420, 'cash', 4.99, '{}', '2025-06-13 06:45:16', '2025-06-13 06:45:16'),
(383, 421, 'cash', 4.99, '{}', '2025-06-13 06:50:05', '2025-06-13 06:50:05'),
(384, 422, 'cash', 4.99, '{}', '2025-06-13 07:02:52', '2025-06-13 07:02:52'),
(385, 424, 'cash', 10.99, '{}', '2025-06-13 12:13:51', '2025-06-13 12:13:51'),
(386, 425, 'cash', 3.99, '{}', '2025-06-13 12:20:34', '2025-06-13 12:20:34'),
(387, 426, 'cash', 6.18, '{}', '2025-06-14 06:27:19', '2025-06-14 06:27:19');

-- --------------------------------------------------------

--
-- Table structure for table `sale_products`
--

CREATE TABLE `sale_products` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `item_discount` decimal(10,2) DEFAULT 0.00,
  `item_discount_percentage` decimal(5,2) DEFAULT 0.00,
  `item_total` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_products`
--

INSERT INTO `sale_products` (`id`, `sale_id`, `product_id`, `name`, `quantity`, `price`, `item_discount`, `item_discount_percentage`, `item_total`) VALUES
(92, 136, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(93, 136, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(94, 137, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(95, 137, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(96, 138, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(97, 138, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(98, 139, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(99, 139, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(100, 140, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(101, 140, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(102, 141, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(103, 141, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(104, 142, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(105, 142, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(106, 143, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(107, 143, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(108, 144, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(109, 144, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(110, 145, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(111, 145, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(112, 146, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(113, 146, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(114, 147, 1, 'Product 1', 2, 100.00, 20.00, 10.00, 0.00),
(115, 147, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(116, 148, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(117, 149, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(118, 150, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(119, 151, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(120, 152, 7, 'Margherita Pizza', 1, 8.99, 5.99, 66.63, 0.00),
(121, 153, 1, 'Test Product', 1, 10.00, 0.00, 0.00, 0.00),
(122, 154, 1, 'Test Product', 1, 10.00, 0.00, 0.00, 0.00),
(123, 155, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(124, 156, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(125, 157, 7, 'Margherita Pizza', 1, 8.99, 2.00, 22.25, 0.00),
(126, 158, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(127, 159, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(128, 160, 7, 'Margherita Pizza', 2, 8.99, 3.00, 16.69, 0.00),
(129, 161, 7, 'Margherita Pizza', 1, 8.99, 2.00, 22.25, 0.00),
(130, 162, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(131, 163, 10, 'Garlic Bread', 1, 3.99, 3.00, 75.19, 0.00),
(132, 164, 7, 'Margherita Pizza', 1, 10.00, 5.00, 50.00, 0.00),
(133, 165, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(134, 166, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(135, 167, 8, 'Pepperoni Pizza', 1, 9.99, 0.00, 0.00, 0.00),
(136, 168, 7, 'Margherita Pizza', 1, 8.99, 5.00, 55.62, 0.00),
(139, 173, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(140, 174, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(141, 175, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(142, 176, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(143, 176, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(144, 177, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(145, 177, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(146, 178, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(147, 179, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(148, 180, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(149, 181, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(150, 182, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(151, 183, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(152, 184, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(153, 185, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 0.00),
(154, 186, 1, 'Burger', 1, 5.99, 0.00, 0.00, 0.00),
(155, 187, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 0.00),
(156, 188, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 0.00),
(157, 189, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 0.00),
(158, 190, 8, 'Pepperoni Pizza', 1, 9.99, 0.00, 0.00, 0.00),
(159, 191, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 0.00),
(160, 192, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 0.00),
(161, 193, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 0.00),
(162, 194, 9, 'Caesar Salad', 1, 6.50, 0.33, 5.00, 0.00),
(163, 195, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 0.00),
(164, 196, 10, 'Garlic Bread', 1, 3.99, 0.20, 5.00, 0.00),
(165, 197, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(166, 198, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 0.00),
(167, 199, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(168, 199, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(169, 200, 1, 'Burger', 2, 5.99, 0.00, 0.00, 0.00),
(170, 201, 1, 'Burger', 2, 5.99, 0.00, 0.00, 0.00),
(171, 202, 10, 'Garlic Bread', 1, 3.99, 0.08, 2.00, 0.00),
(172, 203, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(173, 204, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 0.00),
(174, 205, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(175, 206, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(176, 207, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(177, 208, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(178, 209, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(179, 210, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(180, 211, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(181, 212, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(182, 213, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(183, 214, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(184, 215, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(185, 216, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(186, 217, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(187, 218, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(188, 219, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(189, 220, 1, 'Burger', 1, 5.99, 0.06, 1.00, 0.00),
(190, 221, 1, 'Burger', 1, 5.99, 0.12, 2.00, 0.00),
(191, 222, 1, 'Burger', 1, 5.99, 0.12, 2.00, 0.00),
(192, 223, 9, 'Caesar Salad', 1, 6.50, 0.13, 2.00, 0.00),
(193, 224, 10, 'Garlic Bread', 1, 3.99, 0.04, 1.00, 0.00),
(194, 225, 10, 'Garlic Bread', 1, 3.99, 0.04, 1.00, 0.00),
(195, 226, 10, 'Garlic Bread', 1, 3.99, 0.04, 1.00, 0.00),
(196, 227, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(197, 228, 10, 'Garlic Bread', 1, 3.99, 0.04, 1.00, 0.00),
(198, 229, 10, 'Garlic Bread', 1, 3.99, 0.04, 1.00, 0.00),
(199, 230, 12, 'Chocolate Cake', 1, 4.99, 0.10, 2.00, 0.00),
(200, 231, 12, 'Chocolate Cake', 1, 4.99, 0.10, 2.00, 0.00),
(201, 232, 12, 'Chocolate Cake', 1, 4.99, 0.10, 2.00, 0.00),
(202, 233, 10, 'Garlic Bread', 1, 3.99, 0.08, 1.99, 0.00),
(203, 234, 10, 'Garlic Bread', 1, 3.99, 0.04, 1.00, 0.00),
(204, 235, 10, 'Garlic Bread', 1, 3.99, 0.04, 1.00, 0.00),
(205, 236, 10, 'Garlic Bread', 1, 3.99, 0.04, 1.00, 0.00),
(206, 237, 10, 'Garlic Bread', 1, 3.99, 1.00, 25.06, 0.00),
(207, 238, 10, 'Garlic Bread', 1, 3.99, 2.00, 50.13, 0.00),
(208, 239, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(209, 240, 10, 'Garlic Bread', 1, 3.99, 2.00, 50.13, 0.00),
(210, 241, 10, 'Garlic Bread', 1, 3.99, 2.00, 50.13, 0.00),
(211, 242, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(212, 243, 9, 'Caesar Salad', 1, 6.50, 1.00, 15.38, 0.00),
(213, 244, 10, 'Garlic Bread', 1, 3.99, 0.40, 10.00, 0.00),
(214, 245, 2, 'Product 2', 1, 200.00, 50.00, 25.00, 0.00),
(215, 246, 10, 'Garlic Bread', 1, 3.99, 1.00, 25.06, 0.00),
(216, 247, 10, 'Garlic Bread', 2, 3.99, 2.00, 25.06, 0.00),
(217, 248, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(218, 249, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(219, 250, 10, 'Garlic Bread', 1, 3.99, 1.00, 25.06, 0.00),
(220, 251, 10, 'Garlic Bread', 1, 3.99, 1.00, 25.06, 0.00),
(221, 252, 10, 'Garlic Bread', 1, 3.99, 1.00, 25.06, 0.00),
(222, 253, 10, 'Garlic Bread', 1, 3.99, 1.00, 25.06, 0.00),
(223, 254, 10, 'Garlic Bread', 1, 3.99, 2.00, 50.13, 0.00),
(224, 255, 10, 'Garlic Bread', 5, 3.99, 1.00, 5.01, 0.00),
(225, 256, 10, 'Garlic Bread', 5, 3.99, 0.00, 0.00, 0.00),
(226, 257, 9, 'Caesar Salad', 10, 6.50, 0.00, 0.00, 0.00),
(227, 258, 10, 'Garlic Bread', 1, 3.99, 1.00, 25.06, 0.00),
(228, 259, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(229, 260, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(230, 261, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(231, 262, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(232, 263, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(233, 264, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(234, 265, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(235, 266, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(236, 267, 10, 'Garlic Bread', 1, 3.99, 1.00, 25.06, 0.00),
(237, 268, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(238, 269, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(239, 270, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(240, 271, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(241, 272, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(242, 273, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(243, 274, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(244, 275, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(245, 276, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(246, 277, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(247, 278, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(248, 278, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 0.00),
(249, 279, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 0.00),
(250, 280, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 0.00),
(251, 281, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(252, 282, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(253, 283, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(254, 284, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 0.00),
(255, 285, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(256, 286, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(257, 287, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(258, 288, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(259, 289, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(260, 290, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(261, 291, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(262, 292, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(263, 293, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(264, 294, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(265, 295, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(266, 296, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(267, 297, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(268, 298, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(269, 299, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(270, 300, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(271, 301, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(272, 302, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(273, 303, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(274, 304, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(275, 305, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 0.00),
(277, 307, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 0.00),
(278, 308, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(279, 309, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(280, 310, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(282, 312, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(283, 313, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(284, 314, 12, 'Chocolate Cake', 1, 4.99, 1.00, 20.04, 0.00),
(285, 315, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(288, 318, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 0.00),
(289, 318, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 0.00),
(291, 320, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 0.00),
(292, 321, 1, 'Burger', 1, 6.10, 2.00, 32.79, 0.00),
(293, 322, 1, 'Burger', 1, 6.10, 0.12, 2.00, 0.00),
(294, 323, 1, 'Burger', 1, 6.10, 0.00, 0.00, 0.00),
(295, 324, 1, 'Burger', 1, 6.10, 0.01, 0.12, 0.00),
(296, 325, 1, 'Burger', 1, 6.10, 3.00, 49.18, 0.00),
(297, 326, 1, 'Product A', 2, 10.00, 2.00, 10.00, 20.00),
(298, 327, 1, 'Product A', 2, 10.00, 2.00, 10.00, 20.00),
(299, 328, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(300, 329, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 8.99),
(301, 330, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 4.99),
(302, 331, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(303, 332, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 6.50),
(304, 333, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(305, 334, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 8.99),
(306, 335, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(319, 339, 7, 'Margherita Pizza', 1, 8.99, 1.00, 11.12, 8.99),
(320, 339, 2, 'Product 2', 1, 200.00, 25.00, 12.50, 200.00),
(321, 339, 11, 'Tiramisu', 1, 5.50, 0.50, 9.09, 5.50),
(324, 342, 12, 'Chocolate Cake', 1, 4.99, 2.00, 40.08, 4.99),
(325, 343, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(326, 344, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 10.99),
(327, 345, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 6.50),
(328, 346, 1, 'Burger', 1, 6.10, 0.10, 1.64, 6.10),
(329, 347, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 8.99),
(330, 348, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(332, 350, 12, 'Chocolate Cake', 3, 4.99, 0.00, 0.00, 14.97),
(333, 351, 9, 'Caesar Salad', 2, 6.50, 0.00, 0.00, 13.00),
(334, 352, 9, 'Caesar Salad', 2, 6.50, 0.00, 0.00, 13.00),
(335, 353, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(336, 354, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(337, 355, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(338, 356, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 6.50),
(339, 356, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(340, 356, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 8.99),
(341, 356, 11, 'Tiramisu', 1, 5.50, 0.00, 0.00, 5.50),
(342, 357, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(343, 357, 9, 'Caesar Salad', 1, 6.50, 0.00, 0.00, 6.50),
(344, 358, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(345, 359, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(346, 360, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(347, 361, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 4.99),
(348, 362, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(349, 363, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(350, 364, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(351, 365, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(352, 366, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(353, 367, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(354, 368, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 4.99),
(355, 369, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(356, 369, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(357, 370, 10, 'Garlic Bread', 2, 3.99, 0.00, 0.00, 7.98),
(358, 371, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(359, 372, 10, 'Garlic Bread', 2, 3.99, 0.00, 0.00, 7.98),
(360, 373, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(361, 374, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(362, 375, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 8.99),
(363, 376, 11, 'Tiramisu', 1, 5.50, 0.00, 0.00, 5.50),
(364, 377, 11, 'Tiramisu', 1, 5.50, 0.00, 0.00, 5.50),
(367, 380, 1, 'Product A', 2, 5.00, 1.00, 10.00, 10.00),
(368, 381, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(369, 382, 1, 'Product A', 2, 5.00, 1.00, 10.00, 10.00),
(370, 383, 13, 'Test Product', 2, 10.99, 0.00, 0.00, 21.98),
(371, 384, 13, 'Test Product', 2, 10.99, 0.00, 0.00, 21.98),
(372, 385, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 10.99),
(373, 386, 13, 'Test Product', 2, 10.99, 1.00, 4.55, 21.98),
(374, 387, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(375, 388, 13, 'Test Product', 2, 10.99, 1.00, 4.55, 21.98),
(376, 389, 1, 'Burger', 1, 6.10, 2.00, 32.79, 6.10),
(377, 390, 1, 'Burger', 1, 6.10, 1.00, 16.39, 6.10),
(378, 391, 2, 'Product 2', 1, 200.00, 0.00, 0.00, 200.00),
(379, 392, 1, 'Burger', 1, 6.10, 0.00, 0.00, 6.10),
(380, 393, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 10.99),
(381, 394, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(382, 395, 1, 'Burger', 3, 6.10, 1.00, 5.46, 18.30),
(383, 396, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(384, 398, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(385, 399, 10, 'Garlic Bread', 3, 3.99, 0.00, 0.00, 11.97),
(386, 400, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 10.99),
(387, 401, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(388, 402, 10, 'Garlic Bread', 5, 3.99, 0.00, 0.00, 19.95),
(389, 403, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(390, 404, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(391, 405, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 8.99),
(392, 406, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(393, 407, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(394, 408, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(395, 409, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(396, 410, 2, 'Product 2', 2, 200.00, 0.00, 0.00, 400.00),
(397, 411, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(398, 412, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 10.99),
(399, 413, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(400, 414, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(401, 415, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(402, 416, 11, 'Tiramisu', 1, 5.50, 0.00, 0.00, 5.50),
(403, 417, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(404, 418, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(405, 419, 7, 'Margherita Pizza', 1, 8.99, 0.00, 0.00, 8.99),
(406, 419, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 10.99),
(407, 420, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 4.99),
(408, 421, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 4.99),
(409, 422, 12, 'Chocolate Cake', 1, 4.99, 0.00, 0.00, 4.99),
(411, 424, 13, 'Test Product', 1, 10.99, 0.00, 0.00, 10.99),
(412, 425, 10, 'Garlic Bread', 1, 3.99, 0.00, 0.00, 3.99),
(413, 426, 1, 'Burger', 1, 6.18, 0.00, 0.00, 6.18);

-- --------------------------------------------------------

--
-- Table structure for table `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20250331-create-customers.js'),
('20250331-update-customers.js'),
('20250401054834-update-customers-name-not-null.js');

-- --------------------------------------------------------

--
-- Table structure for table `stock_adjustments`
--

CREATE TABLE `stock_adjustments` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `adjustment_type` enum('count','discarding') NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `adjustment_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact`, `address`, `createdAt`, `updatedAt`) VALUES
(1, 'Test Supplier', '123-456-7890', '123 Test St', '2025-04-10 00:37:32', '2025-04-10 00:37:32');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_dues`
--

CREATE TABLE `supplier_dues` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `amount_due` decimal(10,2) NOT NULL DEFAULT 0.00,
  `last_updated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier_dues`
--

INSERT INTO `supplier_dues` (`id`, `supplier_id`, `amount_due`, `last_updated`) VALUES
(3, 1, 269.46, '2025-06-11 05:33:00');

-- --------------------------------------------------------

--
-- Table structure for table `taxes`
--

CREATE TABLE `taxes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `rate` decimal(10,0) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
(35, 'adminuser', '$2b$10$zpAJjr52.JBP9yBYFPA.x.Wtwy/hE2UqpHglz7cpkfatSwkQhuW/6', 'admin', '2025-03-10 09:56:06', '2025-03-10 09:56:06'),
(36, 'manager1', '$2b$10$zpAJjr52.JBP9yBYFPA.x.Wtwy/hE2UqpHglz7cpkfatSwkQhuW/6', 'manager', '2025-05-15 16:01:28', '2025-05-15 16:01:28'),
(37, 'newuser1', '$2b$10$0ramx4raiLcRO/C0DEAkbOHlExql3WtxVNDXJAyJwMG9dIcy9BK/a', 'staff', '2025-05-15 10:41:24', '2025-05-15 10:41:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barcodes`
--
ALTER TABLE `barcodes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customerpayments`
--
ALTER TABLE `customerpayments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_customer_name` (`name`),
  ADD UNIQUE KEY `unique_customer_email` (`email`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`);

--
-- Indexes for table `customer_dues`
--
ALTER TABLE `customer_dues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `sale_id` (`sale_id`);

--
-- Indexes for table `customer_payments`
--
ALTER TABLE `customer_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `goods_returns`
--
ALTER TABLE `goods_returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_no` (`phone_no`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD UNIQUE KEY `order_number_2` (`order_number`),
  ADD UNIQUE KEY `order_number_3` (`order_number`),
  ADD UNIQUE KEY `order_number_4` (`order_number`),
  ADD UNIQUE KEY `order_number_5` (`order_number`),
  ADD UNIQUE KEY `order_number_6` (`order_number`),
  ADD UNIQUE KEY `order_number_7` (`order_number`),
  ADD UNIQUE KEY `order_number_8` (`order_number`),
  ADD UNIQUE KEY `order_number_9` (`order_number`),
  ADD UNIQUE KEY `order_number_10` (`order_number`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `sale_id` (`sale_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `paymenttypes`
--
ALTER TABLE `paymenttypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_types`
--
ALTER TABLE `payment_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `printers`
--
ALTER TABLE `printers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_purchases`
--
ALTER TABLE `product_purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `proforma_invoices`
--
ALTER TABLE `proforma_invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_2` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_3` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_4` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_5` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_6` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_7` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_8` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_9` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_10` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_11` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_12` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_13` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_14` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_15` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_16` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_17` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_18` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_19` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_20` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_21` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_22` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_23` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_24` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_25` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_26` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_27` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_28` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_29` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_30` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_31` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_32` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_33` (`invoice_no`),
  ADD UNIQUE KEY `invoice_no_34` (`invoice_no`),
  ADD KEY `idx_proforma_invoices_invoice_no` (`invoice_no`),
  ADD KEY `idx_proforma_invoices_guest_id` (`guest_id`);

--
-- Indexes for table `proforma_invoice_items`
--
ALTER TABLE `proforma_invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_proforma_invoice_items_proforma_invoice_id` (`proforma_invoice_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `grn_number` (`grn_number`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD UNIQUE KEY `grn_number_2` (`grn_number`),
  ADD UNIQUE KEY `invoice_no_2` (`invoice_no`),
  ADD UNIQUE KEY `grn_number_3` (`grn_number`),
  ADD UNIQUE KEY `invoice_no_3` (`invoice_no`),
  ADD UNIQUE KEY `grn_number_4` (`grn_number`),
  ADD UNIQUE KEY `invoice_no_4` (`invoice_no`),
  ADD UNIQUE KEY `grn_number_5` (`grn_number`),
  ADD UNIQUE KEY `invoice_no_5` (`invoice_no`),
  ADD UNIQUE KEY `grn_number_6` (`grn_number`),
  ADD UNIQUE KEY `invoice_no_6` (`invoice_no`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `purchase_id_2` (`purchase_id`),
  ADD KEY `product_id_2` (`product_id`);

--
-- Indexes for table `purchase_returns`
--
ALTER TABLE `purchase_returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`);

--
-- Indexes for table `purchase_return_items`
--
ALTER TABLE `purchase_return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_return_id` (`purchase_return_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_2` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_3` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_4` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_5` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_6` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_7` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_8` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_9` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_10` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_11` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_12` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_13` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_14` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_15` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_16` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_17` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_18` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_19` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_20` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_21` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_22` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_23` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_24` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_25` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_26` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_27` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_28` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_29` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_30` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_31` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_32` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_33` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_34` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_35` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_36` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_37` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_38` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_39` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_40` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_41` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_42` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_43` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_44` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_45` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_46` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_47` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_48` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_49` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_50` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_51` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_52` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_53` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_54` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_55` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_56` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_57` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_58` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_59` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_60` (`receipt_number`),
  ADD UNIQUE KEY `receipt_number_61` (`receipt_number`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `sale_payments`
--
ALTER TABLE `sale_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_payments_ibfk_1` (`sale_id`);

--
-- Indexes for table `sale_products`
--
ALTER TABLE `sale_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_products_ibfk_2` (`product_id`),
  ADD KEY `sale_products_ibfk_1` (`sale_id`);

--
-- Indexes for table `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `stock_adjustments`
--
ALTER TABLE `stock_adjustments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `supplier_dues`
--
ALTER TABLE `supplier_dues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `taxes`
--
ALTER TABLE `taxes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `username_13` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `barcodes`
--
ALTER TABLE `barcodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `customerpayments`
--
ALTER TABLE `customerpayments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `customer_dues`
--
ALTER TABLE `customer_dues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `customer_payments`
--
ALTER TABLE `customer_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goods_returns`
--
ALTER TABLE `goods_returns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guests`
--
ALTER TABLE `guests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `paymenttypes`
--
ALTER TABLE `paymenttypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_types`
--
ALTER TABLE `payment_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `printers`
--
ALTER TABLE `printers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `product_purchases`
--
ALTER TABLE `product_purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proforma_invoices`
--
ALTER TABLE `proforma_invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `proforma_invoice_items`
--
ALTER TABLE `proforma_invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `purchase_returns`
--
ALTER TABLE `purchase_returns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_return_items`
--
ALTER TABLE `purchase_return_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=427;

--
-- AUTO_INCREMENT for table `sale_payments`
--
ALTER TABLE `sale_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=388;

--
-- AUTO_INCREMENT for table `sale_products`
--
ALTER TABLE `sale_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=414;

--
-- AUTO_INCREMENT for table `stock_adjustments`
--
ALTER TABLE `stock_adjustments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `supplier_dues`
--
ALTER TABLE `supplier_dues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `taxes`
--
ALTER TABLE `taxes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `barcodes`
--
ALTER TABLE `barcodes`
  ADD CONSTRAINT `barcodes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_dues`
--
ALTER TABLE `customer_dues`
  ADD CONSTRAINT `customer_dues_ibfk_143` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_dues_ibfk_144` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `customer_payments`
--
ALTER TABLE `customer_payments`
  ADD CONSTRAINT `customer_payments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `discounts`
--
ALTER TABLE `discounts`
  ADD CONSTRAINT `discounts_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `discounts_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `goods_returns`
--
ALTER TABLE `goods_returns`
  ADD CONSTRAINT `goods_returns_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `goods_returns_ibfk_10` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_100` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_101` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_102` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_103` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_104` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_105` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_106` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_107` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_108` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_109` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_11` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_110` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_111` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_112` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_113` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_114` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_115` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_116` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_117` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_118` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_119` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_12` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_120` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_121` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_122` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_123` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_124` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_125` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_126` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_127` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_128` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_129` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_13` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_130` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_131` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_132` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_133` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_134` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_135` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_136` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_137` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_138` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_139` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_14` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_140` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_141` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_142` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_143` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_144` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_15` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_16` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_17` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_18` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_19` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `goods_returns_ibfk_20` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_21` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_22` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_23` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_24` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_25` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_26` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_27` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_28` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_29` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_3` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_30` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_31` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_32` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_33` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_34` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_35` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_36` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_37` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_38` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_39` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_4` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_40` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_41` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_42` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_43` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_44` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_45` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_46` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_47` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_48` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_49` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_5` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_50` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_51` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_52` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_53` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_54` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_55` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_56` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_57` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_58` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_59` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_60` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_61` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_62` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_63` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_64` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_65` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_66` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_67` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_68` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_69` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_7` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_70` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_71` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_72` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_73` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_74` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_75` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_76` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_77` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_78` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_79` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_8` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_80` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_81` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_82` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_83` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_84` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_85` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_86` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_87` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_88` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_89` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_9` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_90` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_91` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_92` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_93` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_94` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_95` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_96` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_97` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_98` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `goods_returns_ibfk_99` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`);

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_205` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_206` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_207` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_111` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_112` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_10` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_11` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_12` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_13` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_14` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_15` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_16` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_17` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_18` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_19` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_20` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_21` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_22` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_23` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_24` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_25` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_26` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_27` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_28` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_29` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_30` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_31` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_32` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_33` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_34` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_35` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_36` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_37` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_38` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_39` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_4` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_40` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_41` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_42` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_43` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_44` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_45` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_46` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_47` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_48` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_49` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_5` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_50` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_51` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_52` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_53` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_54` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_55` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_56` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_57` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_58` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_59` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_6` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_60` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_61` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_62` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_63` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_64` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_65` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_66` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_67` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_68` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_69` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_7` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_70` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_71` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_8` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_purchases`
--
ALTER TABLE `product_purchases`
  ADD CONSTRAINT `product_purchases_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `proforma_invoices`
--
ALTER TABLE `proforma_invoices`
  ADD CONSTRAINT `proforma_invoices_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `proforma_invoice_items`
--
ALTER TABLE `proforma_invoice_items`
  ADD CONSTRAINT `proforma_invoice_items_ibfk_10` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_12` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_14` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_16` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_18` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `proforma_invoice_items_ibfk_20` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_22` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_24` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_26` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_28` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_30` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_32` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_34` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_36` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_38` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_4` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_40` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_42` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_44` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_46` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_48` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_50` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_52` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_54` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_56` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_58` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_60` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_62` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_64` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_66` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_67` FOREIGN KEY (`proforma_invoice_id`) REFERENCES `proforma_invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_68` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `proforma_invoice_items_ibfk_8` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `fk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_10` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_11` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_12` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_13` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_14` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_15` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_16` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_17` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_18` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_19` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_20` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_21` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_22` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_23` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_24` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_25` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_26` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_27` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_28` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_29` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_3` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_30` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_31` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_32` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_33` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_34` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_35` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_36` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_37` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_38` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_39` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_4` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_40` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_41` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_42` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_43` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_44` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_45` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_46` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_47` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_48` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_49` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_5` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_50` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_51` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_52` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_53` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_54` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_55` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_56` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_57` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_58` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_59` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_6` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_60` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_61` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_62` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_63` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_64` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_65` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_7` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_8` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_9` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_ibfk_129` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_items_ibfk_130` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchase_returns`
--
ALTER TABLE `purchase_returns`
  ADD CONSTRAINT `purchase_returns_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `purchase_return_items`
--
ALTER TABLE `purchase_return_items`
  ADD CONSTRAINT `purchase_return_items_ibfk_129` FOREIGN KEY (`purchase_return_id`) REFERENCES `purchase_returns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_return_items_ibfk_130` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_ibfk_120` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `receipts_ibfk_121` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_184` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `sales_ibfk_185` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sale_payments`
--
ALTER TABLE `sale_payments`
  ADD CONSTRAINT `sale_payments_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sale_products`
--
ALTER TABLE `sale_products`
  ADD CONSTRAINT `sale_products_ibfk_119` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sale_products_ibfk_120` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_adjustments`
--
ALTER TABLE `stock_adjustments`
  ADD CONSTRAINT `stock_adjustments_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supplier_dues`
--
ALTER TABLE `supplier_dues`
  ADD CONSTRAINT `supplier_dues_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
