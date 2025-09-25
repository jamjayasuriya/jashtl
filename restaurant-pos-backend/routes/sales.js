const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Import Op for Sequelize operators

// POST /api/sales - Create a new sale with SaleProduct and payment records
router.post('/', async (req, res) => {
  const transaction = await global.sequelize.transaction();
  try {
    const { items, customer_id, cart_discount, tax_amount, payments } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Items are required and must be a non-empty array' });
    }

    // Validate payments
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Payments are required and must be a non-empty array' });
    }

    // Validate product existence
    const productIds = items.map(item => item.id);
    const products = await global.models.Product.findAll({ where: { id: productIds }, transaction });
    if (products.length !== productIds.length) {
      await transaction.rollback();
      const foundIds = new Set(products.map(p => p.id));
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({ message: `Products with IDs ${missingIds.join(', ')} not found` });
    }

    // Debug: Log the user information
    console.log('Sales API - req.user:', req.user);
    console.log('Sales API - req.user.id:', req.user?.id);
    
    // Fetch authenticated user's username
    const user = await global.models.User.findByPk(req.user.id, {
      attributes: ['username'],
      transaction,
    });
    if (!user) {
      await transaction.rollback();
      console.log('Sales API - User not found with ID:', req.user.id);
      return res.status(401).json({ message: 'Authenticated user not found' });
    }
    console.log('Sales API - User found:', user.username);

    // Calculate totals for sale
    let totalAmount = 0;
    let totalItemDiscount = 0;
    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      const price = parseFloat(item.price);
      const itemDiscountValue = parseFloat(item.item_discount || 0);
      const itemDiscountType = item.item_discount_type || 'percentage';

      if (isNaN(quantity) || isNaN(price) || isNaN(itemDiscountValue)) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Invalid item data: quantity, price, or item_discount must be valid numbers' });
      }
      if (itemDiscountValue < 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Item discount cannot be negative' });
      }
      if (!['percentage', 'amount'].includes(itemDiscountType)) {
        await transaction.rollback();
        return res.status(400).json({ message: `Invalid item_discount_type: ${itemDiscountType}. Must be 'percentage' or 'amount'` });
      }

      const itemTotal = quantity * price;
      const itemDiscount = itemDiscountType === 'percentage'
        ? (itemTotal * itemDiscountValue) / 100
        : itemDiscountValue;

      totalAmount += itemTotal;
      totalItemDiscount += itemDiscount;
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));
    totalItemDiscount = parseFloat(totalItemDiscount.toFixed(2));
    const cartDiscount = parseFloat(cart_discount || 0);
    if (isNaN(cartDiscount) || cartDiscount < 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid cart_discount: must be a valid non-negative number' });
    }

    const taxAmount = parseFloat(tax_amount || 0);
    if (isNaN(taxAmount)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid tax_amount: must be a valid number' });
    }

    // Process payments
    let paidByCash = 0, paidByCheque = 0, paidByCard = 0, paidByVoucher = 0, onCredit = 0;
    for (const payment of payments) {
      const amount = parseFloat(payment.amount);
      if (isNaN(amount) || amount <= 0) {
        await transaction.rollback();
        return res.status(400).json({ message: `Invalid payment amount: ${payment.amount}` });
      }
      const method = payment.method ? payment.method.toLowerCase() : 'undefined';
      let details;
      try {
        details = payment.details ? (typeof payment.details === 'string' ? JSON.parse(payment.details) : payment.details) : {};
      } catch (e) {
        await transaction.rollback();
        return res.status(400).json({ message: `Invalid payment details format for ${method}: ${e.message}` });
      }

      switch (method) {
        case 'cash':
          paidByCash += amount;
          break;
        case 'cheque':
          paidByCheque += amount;
          break;
        case 'card':
          paidByCard += amount;
          break;
        case 'credit':
          onCredit += amount;
          break;
        case 'gift_voucher':
          if (!details.gift_voucher_number) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Gift voucher number is required' });
          }
          paidByVoucher += amount;
          break;
        case 'online':
          if (details.cheque_number || details.bank_name) {
            paidByCheque += amount;
          } else if (details.gift_voucher_number || details.gift_voucher_balance) {
            paidByVoucher += amount;
          } else {
            await transaction.rollback();
            return res.status(400).json({ message: 'Invalid online payment: Missing cheque or gift voucher details' });
          }
          break;
        default:
          await transaction.rollback();
          return res.status(400).json({ message: `Invalid payment method: ${method}` });
      }
    }

    const totalAfterDiscount = totalAmount - totalItemDiscount - cartDiscount + taxAmount;
    const totalExceptCredit = parseFloat((totalAfterDiscount - onCredit).toFixed(2));

    // Handle customer_id - convert "no-detail-customer" to null
    console.log('Sales API - Original customer_id:', customer_id);
    let processedCustomerId = customer_id;
    if (customer_id === 'no-detail-customer' || customer_id === '') {
      processedCustomerId = null;
    } else if (customer_id && !isNaN(customer_id)) {
      processedCustomerId = parseInt(customer_id, 10);
    }
    console.log('Sales API - Processed customer_id:', processedCustomerId);

    const saleData = {
      user_id: req.user.id,
      customer_id: processedCustomerId,
      total_amount: totalAmount,
      total: totalAfterDiscount,
      item_discount: totalItemDiscount,
      cart_discount: cartDiscount,
      tax_amount: taxAmount,
      total_except_credit: totalExceptCredit,
      paid_bycash: paidByCash,
      paid_bycheque: paidByCheque,
      paid_bycard: paidByCard,
      paid_byvoucher: paidByVoucher,
      on_credit: onCredit,
      cart_discount_type: cartDiscount > 0 ? 'percentage' : 'fixed',
      tax_rate: taxAmount > 0 ? 0 : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const sale = await global.models.Sale.create(saleData, { transaction });

    // Save to sale_products table with item_total
    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      const price = parseFloat(item.price);
      const itemDiscountValue = parseFloat(item.item_discount || 0);
      const itemDiscountType = item.item_discount_type || 'percentage';
      const itemTotal = quantity * price;
      const monetaryDiscount = itemDiscountType === 'percentage'
        ? (itemTotal * itemDiscountValue) / 100
        : itemDiscountValue;
      const percentageDiscount = itemDiscountType === 'percentage'
        ? itemDiscountValue
        : itemTotal > 0 ? (itemDiscountValue / itemTotal) * 100 : 0;

      const saleProductData = {
        sale_id: sale.id,
        product_id: item.id,
        name: item.name,
        quantity: quantity,
        price: price,
        item_discount: parseFloat(monetaryDiscount.toFixed(2)),
        item_discount_percentage: parseFloat(percentageDiscount.toFixed(2)),
        item_total: parseFloat(itemTotal.toFixed(2)),
      };
      await global.models.SaleProduct.create(saleProductData, { transaction });

      // Update product stock
      const product = await global.models.Product.findByPk(item.id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product with ID ${item.id} not found` });
      }
      if (product.stock < quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for product ${item.name}`,
          details: { currentStock: product.stock, requestedQuantity: quantity }
        });
      }
      product.stock -= quantity;
      await product.save({ transaction });
    }

    // Save sale payments with enhanced payment handling
    for (const payment of payments) {
      let mappedMethod = payment.method ? payment.method.toLowerCase() : 'cash';
      
      // Extract reference number and additional details from payment
      let referenceNumber = null;
      let additionalDetails = null;
      
      // Generate automatic reference number for no-detail customer payments
      if (processedCustomerId === null) {
        const now = new Date();
        const timestamp = now.getTime();
        const dateStr = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
        referenceNumber = `CASH_${dateStr}_${timestamp}`;
        console.log('Sales API - Generated reference number for no-detail customer:', referenceNumber);
      } else if (payment.details) {
        try {
          const details = typeof payment.details === 'string' ? JSON.parse(payment.details) : payment.details;
          
          // Extract reference number from various possible fields
          referenceNumber = details.reference_number || 
                          details.transaction_id || 
                          details.cheque_number || 
                          details.card_last_four || 
                          details.payment_reference ||
                          null;
          
          // Store additional payment details for card payments
          if (mappedMethod === 'card' || mappedMethod === 'credit_card') {
            additionalDetails = {
              card_type: details.card_type || null,
              last_four: details.card_last_four || null,
              expiry_month: details.expiry_month || null,
              expiry_year: details.expiry_year || null,
              auth_code: details.auth_code || null,
              transaction_id: details.transaction_id || null
            };
          } else if (mappedMethod === 'cheque') {
            additionalDetails = {
              cheque_number: details.cheque_number || null,
              bank_name: details.bank_name || null,
              branch: details.branch || null,
              cheque_date: details.cheque_date || null
            };
          } else if (mappedMethod === 'gift_voucher' || mappedMethod === 'voucher') {
            additionalDetails = {
              voucher_number: details.voucher_number || null,
              voucher_code: details.voucher_code || null,
              remaining_balance: details.remaining_balance || null
            };
          }
          
        } catch (e) {
          // If details is not JSON, treat it as reference number
          referenceNumber = payment.details;
        }
      }

      // Map payment methods to standard values
      if (mappedMethod === 'online') {
        if (referenceNumber && (referenceNumber.includes('CHEQUE') || referenceNumber.includes('CHQ'))) {
          mappedMethod = 'cheque';
        } else if (referenceNumber && (referenceNumber.includes('VOUCHER') || referenceNumber.includes('GIFT'))) {
          mappedMethod = 'gift_voucher';
        } else {
          mappedMethod = 'card'; // Default online payment to card
        }
      } else if (mappedMethod === 'credit_card') {
        mappedMethod = 'card';
      } else if (mappedMethod === 'gift_voucher') {
        mappedMethod = 'gift_voucher';
      } else if (mappedMethod === 'voucher') {
        mappedMethod = 'gift_voucher';
      }

      const salePaymentData = {
        sale_id: sale.id,
        payment_method: mappedMethod,
        amount: parseFloat(payment.amount).toFixed(2),
        reference_number: referenceNumber,
        details: additionalDetails ? JSON.stringify(additionalDetails) : null,
      };
      await global.models.SalePayment.create(salePaymentData, { transaction });

      // Note: NoDetailCustomer creation removed to avoid foreign key constraint issues
      // The sale is already properly linked to customer_id (null for no-detail customers)
    }

    // Handle customer dues for credit
    if (onCredit > 0 && processedCustomerId) {
      const customer = await global.models.Customer.findByPk(processedCustomerId, { transaction });
      if (!customer) {
        await transaction.rollback();
        return res.status(404).json({ message: `Customer with ID ${processedCustomerId} not found` });
      }
      customer.dues = (parseFloat(customer.dues || 0) + onCredit).toFixed(2);
      await customer.save({ transaction });

      await global.models.CustomerDues.create({
        customer_id: processedCustomerId,
        sale_id: sale.id,
        amount: onCredit.toFixed(2),
      }, { transaction });
    }

    // Create Receipt record
    const receiptNumber = `REC-${sale.id}-${Date.now()}`;
    const totalPaid = paidByCash + paidByCheque + paidByCard + paidByVoucher;
    await global.models.Receipt.create({
      sale_id: sale.id,
      receipt_number: receiptNumber,
      type: 'receipt',
      customer_id: processedCustomerId, // Use processedCustomerId instead of customer_id
      user_name: user.username || 'System',
      subtotal: totalAmount - totalItemDiscount,
      cart_discount: cartDiscount,
      cart_discount_type: saleData.cart_discount_type,
      tax_rate: 0,
      tax_amount: taxAmount,
      total: totalAfterDiscount,
      total_paid: totalPaid,
      dues: onCredit,
      presented_amount: totalPaid,
      created_at: new Date(),
    }, { transaction });

    // Create Bill record
    const billNumber = `BILL-${sale.id}-${Date.now()}`;
    const primaryPaymentMethod = payments.length > 0 ? payments[0].method : 'cash';
    const primaryPaymentReference = payments.length > 0 ? payments[0].details : null;
    
    // Get customer details if available
    let customerName = null;
    let customerPhone = null;
    if (processedCustomerId && processedCustomerId !== 1) {
      const customer = await global.models.Customer.findByPk(processedCustomerId, { transaction });
      if (customer) {
        customerName = customer.name;
        customerPhone = customer.phone;
      }
    } else if (processedCustomerId === 1) {
      customerName = 'No Detail Customer';
    }

    // Bill creation commented out - Bill model doesn't exist
    // await global.models.Bill.create({
    //   bill_number: billNumber,
    //   sale_id: sale.id,
    //   customer_id: processedCustomerId, // Use processedCustomerId instead of customer_id
    //   customer_name: customerName,
    //   customer_phone: customerPhone,
    //   subtotal: totalAmount - totalItemDiscount,
    //   discount_amount: cartDiscount,
    //   discount_type: saleData.cart_discount_type || 'percentage',
    //   tax_amount: taxAmount,
    //   tax_rate: 0,
    //   total_amount: totalAfterDiscount,
    //   payment_method: primaryPaymentMethod,
    //   payment_reference: primaryPaymentReference,
    //   bill_date: new Date(),
    //   cashier_name: user.username || 'System',
    //   notes: `Bill for sale #${sale.id}`,
    //   is_printed: false,
    // }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Sale created successfully',
      sale: {
        id: sale.id,
        user_id: sale.user_id,
        customer_id: sale.customer_id,
        total_amount: sale.total_amount,
        total: sale.total,
        item_discount: sale.item_discount,
        cart_discount: sale.cart_discount,
        tax_amount: sale.tax_amount,
        total_except_credit: sale.total_except_credit,
        paid_bycash: sale.paid_bycash,
        paid_bycheque: sale.paid_bycheque,
        paid_bycard: sale.paid_bycard,
        paid_byvoucher: sale.paid_byvoucher,
        on_credit: sale.on_credit,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
      },
      receipt: {
        receipt_number: receiptNumber,
        type: 'receipt',
      },
    });
  } catch (error) {
    console.error('Error in POST /api/sales:', error.stack);
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// PUT /api/sales/:id - Update an existing sale
router.put('/:id', async (req, res) => {
  const transaction = await global.sequelize.transaction();
  try {
    const saleId = req.params.id;
    if (!saleId || isNaN(saleId)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid sale ID' });
    }

    const sale = await global.models.Sale.findByPk(saleId, { transaction });
    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Sale not found' });
    }

    const { items, customer_id, cart_discount, tax_amount, payments } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Items are required and must be a non-empty array' });
    }

    // Validate payments
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Payments are required and must be a non-empty array' });
    }

    // Validate product existence
    const productIds = items.map(item => item.id);
    const products = await global.models.Product.findAll({ where: { id: productIds }, transaction });
    if (products.length !== productIds.length) {
      await transaction.rollback();
      const foundIds = new Set(products.map(p => p.id));
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({ message: `Products with IDs ${missingIds.join(', ')} not found` });
    }

    // Fetch authenticated user's username
    const user = await global.models.User.findByPk(req.user.id, {
      attributes: ['username'],
      transaction,
    });
    if (!user) {
      await transaction.rollback();
      return res.status(401).json({ message: 'Authenticated user not found' });
    }

    // Calculate totals
    let totalAmount = 0;
    let totalItemDiscount = 0;
    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      const price = parseFloat(item.price);
      const itemDiscountValue = parseFloat(item.item_discount || 0);
      const itemDiscountType = item.item_discount_type || 'percentage';

      if (isNaN(quantity) || isNaN(price) || isNaN(itemDiscountValue)) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Invalid item data: quantity, price, or item_discount must be valid numbers' });
      }
      if (itemDiscountValue < 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Item discount cannot be negative' });
      }
      if (!['percentage', 'amount'].includes(itemDiscountType)) {
        await transaction.rollback();
        return res.status(400).json({ message: `Invalid item_discount_type: ${itemDiscountType}. Must be 'percentage' or 'amount'` });
      }

      const itemTotal = quantity * price;
      const itemDiscount = itemDiscountType === 'percentage'
        ? (itemTotal * itemDiscountValue) / 100
        : itemDiscountValue;

      totalAmount += itemTotal;
      totalItemDiscount += itemDiscount;
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));
    totalItemDiscount = parseFloat(totalItemDiscount.toFixed(2));
    const cartDiscount = parseFloat(cart_discount || 0);
    if (isNaN(cartDiscount) || cartDiscount < 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid cart_discount: must be a valid non-negative number' });
    }

    const taxAmount = parseFloat(tax_amount || 0);
    if (isNaN(taxAmount)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid tax_amount: must be a valid number' });
    }

    // Process payments
    let paidByCash = 0, paidByCheque = 0, paidByCard = 0, paidByVoucher = 0, onCredit = 0;
    for (const payment of payments) {
      const amount = parseFloat(payment.amount);
      if (isNaN(amount) || amount <= 0) {
        await transaction.rollback();
        return res.status(400).json({ message: `Invalid payment amount: ${payment.amount}` });
      }
      const method = payment.method ? payment.method.toLowerCase() : 'undefined';
      switch (method) {
        case 'cash':
          paidByCash += amount;
          break;
        case 'cheque':
          paidByCheque += amount;
          break;
        case 'card':
          paidByCard += amount;
          break;
        case 'credit':
          onCredit += amount;
          break;
        case 'gift_voucher':
          const details = payment.details ? JSON.parse(payment.details) : {};
          if (!details.gift_voucher_number) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Gift voucher number is required' });
          }
          paidByVoucher += amount;
          break;
        case 'online':
          const onlineDetails = payment.details ? JSON.parse(payment.details) : {};
          if (onlineDetails.cheque_number || onlineDetails.bank_name) {
            paidByCheque += amount;
          } else if (onlineDetails.gift_voucher_number || onlineDetails.gift_voucher_balance) {
            paidByVoucher += amount;
          } else {
            await transaction.rollback();
            return res.status(400).json({ message: 'Invalid online payment: Missing cheque or gift voucher details' });
          }
          break;
        default:
          await transaction.rollback();
          return res.status(400).json({ message: `Invalid payment method: ${payment.method}` });
      }
    }

    // Update sale
    const totalAfterDiscount = totalAmount - totalItemDiscount - cartDiscount + taxAmount;
    const totalExceptCredit = parseFloat((totalAfterDiscount - onCredit).toFixed(2));

    await sale.update({
      customer_id: customer_id || null,
      total_amount: totalAmount,
      total: totalAfterDiscount,
      item_discount: totalItemDiscount,
      cart_discount: cartDiscount,
      tax_amount: taxAmount,
      total_except_credit: totalExceptCredit,
      paid_bycash: paidByCash,
      paid_bycheque: paidByCheque,
      paid_bycard: paidByCard,
      paid_byvoucher: paidByVoucher,
      on_credit: onCredit,
      cart_discount_type: cart_discount ? 'percentage' : 'fixed',
      tax_rate: tax_amount ? 0 : 0,
      updatedAt: new Date(),
    }, { transaction });

    // Reverse stock for existing sale products
    const existingSaleProducts = await global.models.SaleProduct.findAll({ where: { sale_id: saleId }, transaction });
    for (const item of existingSaleProducts) {
      const product = await global.models.Product.findByPk(item.product_id, { transaction });
      if (product) {
        product.stock += parseInt(item.quantity, 10);
        await product.save({ transaction });
      }
    }

    // Delete existing sale products and payments
    await global.models.SaleProduct.destroy({ where: { sale_id: saleId }, transaction });
    await global.models.SalePayment.destroy({ where: { sale_id: saleId }, transaction });

    // Create new sale products
    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      const price = parseFloat(item.price);
      const itemDiscountValue = parseFloat(item.item_discount || 0);
      const itemDiscountType = item.item_discount_type || 'percentage';
      const itemTotal = quantity * price;
      const monetaryDiscount = itemDiscountType === 'percentage'
        ? (itemTotal * itemDiscountValue) / 100
        : itemDiscountValue;
      const percentageDiscount = itemDiscountType === 'percentage'
        ? itemDiscountValue
        : itemTotal > 0 ? (itemDiscountValue / itemTotal) * 100 : 0;

      const saleProductData = {
        sale_id: sale.id,
        product_id: item.id,
        name: item.name,
        quantity: quantity,
        price: price,
        item_discount: parseFloat(monetaryDiscount.toFixed(2)),
        item_discount_percentage: parseFloat(percentageDiscount.toFixed(2)),
        item_total: parseFloat(itemTotal.toFixed(2)),
      };
      await global.models.SaleProduct.create(saleProductData, { transaction });

      // Update product stock
      const product = await global.models.Product.findByPk(item.id, { transaction });
      console.log(`Product ${item.name} (ID: ${item.id}) - Current stock: ${product.stock}, Requested quantity: ${quantity}`);
      if (product.stock < quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for product ${item.name}`,
          details: { currentStock: product.stock, requestedQuantity: quantity }
        });
      }
      product.stock -= quantity;
      await product.save({ transaction });
    }

    // Create new sale payments
    for (const payment of payments) {
      let mappedMethod = payment.method ? payment.method.toLowerCase() : 'undefined';
      if (mappedMethod === 'online') {
        const details = payment.details ? JSON.parse(payment.details) : {};
        if (details.cheque_number || details.bank_name) {
          mappedMethod = 'cheque';
        } else if (details.gift_voucher_number || details.gift_voucher_balance) {
          mappedMethod = 'gift_voucher';
        }
      } else if (mappedMethod === 'gift_voucher') {
        mappedMethod = 'gift_voucher';
      }
      const salePaymentData = {
        sale_id: sale.id,
        payment_method: mappedMethod,
        amount: parseFloat(payment.amount).toFixed(2),
        details: payment.details || null,
      };
      await global.models.SalePayment.create(salePaymentData, { transaction });
    }

    // Update customer dues
    const previousCredit = parseFloat(sale.on_credit || 0);
    if (previousCredit > 0 && sale.customer_id) {
      const customer = await global.models.Customer.findByPk(sale.customer_id, { transaction });
      if (customer) {
        customer.dues = Math.max(0, parseFloat(customer.dues || 0) - previousCredit).toFixed(2);
        await customer.save({ transaction });
        await global.models.CustomerDues.update(
          { status: 'reversed' },
          { where: { sale_id: sale.id }, transaction }
        );
      }
    }
    if (onCredit > 0 && customer_id) {
      const customer = await global.models.Customer.findByPk(customer_id, { transaction });
      if (!customer) {
        await transaction.rollback();
        return res.status(404).json({ message: `Customer with ID ${customer_id} not found` });
      }
      customer.dues = (parseFloat(customer.dues || 0) + onCredit).toFixed(2);
      await customer.save({ transaction });
      await global.models.CustomerDues.create({
        customer_id,
        sale_id: sale.id,
        amount: onCredit.toFixed(2),
      }, { transaction });
    }

    // Update receipt
    const receipt = await global.models.Receipt.findOne({ where: { sale_id: sale.id }, transaction });
    const receiptNumber = receipt ? receipt.receipt_number : `REC-${sale.id}-${Date.now()}`;
    const totalPaid = paidByCash + paidByCheque + paidByCard + paidByVoucher;
    if (receipt) {
      await receipt.update({
        customer_id: customer_id || null,
        user_name: user.username || 'System',
        subtotal: totalAmount - totalItemDiscount,
        cart_discount: cartDiscount,
        cart_discount_type: cart_discount ? 'percentage' : 'fixed',
        tax_rate: 0,
        tax_amount: taxAmount,
        total: totalAfterDiscount,
        total_paid: totalPaid,
        dues: onCredit,
        presented_amount: totalPaid,
      }, { transaction });
    } else {
      await global.models.Receipt.create({
        sale_id: sale.id,
        receipt_number: receiptNumber,
        type: 'receipt',
        customer_id: customer_id || null,
        user_name: user.username || 'System',
        subtotal: totalAmount - totalItemDiscount,
        cart_discount: cartDiscount,
        cart_discount_type: cart_discount ? 'percentage' : 'fixed',
        tax_rate: 0,
        tax_amount: taxAmount,
        total: totalAfterDiscount,
        total_paid: totalPaid,
        dues: onCredit,
        presented_amount: totalPaid,
        created_at: new Date(),
      }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      message: 'Sale updated successfully',
      sale: {
        id: sale.id,
        user_id: sale.user_id,
        customer_id: sale.customer_id,
        total_amount: sale.total_amount,
        total: sale.total,
        item_discount: sale.item_discount,
        cart_discount: sale.cart_discount,
        tax_amount: sale.tax_amount,
        total_except_credit: sale.total_except_credit,
        paid_bycash: sale.paid_bycash,
        paid_bycheque: sale.paid_bycheque,
        paid_bycard: sale.paid_bycard,
        paid_byvoucher: sale.paid_byvoucher,
        on_credit: sale.on_credit,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
      },
      receipt: {
        receipt_number: receiptNumber,
        type: 'receipt',
      },
    });
  } catch (error) {
    console.error('Error in PUT /api/sales/:id:', error.stack);
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/sales/:id - Fetch a specific sale by ID optimized for ReceiptPopup
router.get('/:id', async (req, res) => {
  try {
    const saleId = req.params.id;
    if (!saleId || isNaN(saleId)) {
      return res.status(400).json({ message: 'Invalid sale ID' });
    }

    const sale = await global.models.Sale.findOne({
      where: { id: saleId },
      attributes: [
        'id',
        'customer_id',
        'total_amount',
        'total',
        'item_discount',
        'cart_discount',
        'tax_amount',
        'paid_bycash',
        'paid_bycard',
        'paid_bycheque',
        'paid_byvoucher',
        'on_credit',
        'cart_discount_type',
        'tax_rate',
        'createdAt',
      ],
      include: [
        {
          model: global.models.Receipt,
          as: 'receipts',
          attributes: [
            'id',
            'receipt_number',
            'type',
            'subtotal',
            'cart_discount',
            'cart_discount_type',
            'tax_rate',
            'tax_amount',
            'total',
            'total_paid',
            'dues',
            'presented_amount',
            'user_name',
            'created_at',
          ],
        },
        {
          model: global.models.SaleProduct,
          as: 'saleProducts',
          attributes: ['id', 'product_id', 'name', 'quantity', 'price', 'item_discount', 'item_discount_percentage', 'item_total'],
        },
        {
          model: global.models.SalePayment,
          as: 'salePayments',
          attributes: ['payment_method', 'amount', 'details'],
        },
        {
          model: global.models.Customer,
          as: 'customer',
          attributes: ['name'],
        },
        {
          model: global.models.User,
          as: 'user',
          attributes: ['username'],
        },
      ],
    });

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.status(200).json({
      sale_id: sale.id,
      customer_id: sale.customer_id,
      total_amount: Number(sale.total_amount).toFixed(2),
      total: Number(sale.total).toFixed(2),
      item_discount: Number(sale.item_discount).toFixed(2),
      cart_discount: Number(sale.cart_discount).toFixed(2),
      tax_amount: Number(sale.tax_amount).toFixed(2),
      paid_bycash: Number(sale.paid_bycash).toFixed(2),
      paid_bycard: Number(sale.paid_bycard).toFixed(2),
      paid_bycheque: Number(sale.paid_bycheque).toFixed(2),
      paid_byvoucher: Number(sale.paid_byvoucher).toFixed(2),
      on_credit: Number(sale.on_credit).toFixed(2),
      cart_discount_type: sale.cart_discount_type,
      tax_rate: Number(sale.tax_rate).toFixed(2),
      createdAt: sale.createdAt,
      receipt: sale.receipts[0] || null,
      saleProducts: sale.saleProducts,
      salePayments: sale.salePayments,
      customer: sale.customer ? { name: sale.customer.name } : null,
      user: sale.user ? { username: sale.user.username } : null,
    });
  } catch (error) {
    console.error('Error in GET /api/sales/:id:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/sales/count - Get total sales count for debugging
router.get('/count', async (req, res) => {
  try {
    const totalCount = await global.models.Sale.count();
    const todayCount = await global.models.Sale.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    
    res.json({
      totalSales: totalCount,
      todaySales: todayCount,
      message: `Total sales: ${totalCount}, Today's sales: ${todayCount}`
    });
  } catch (error) {
    console.error('Error getting sales count:', error);
    res.status(500).json({ message: 'Error getting sales count', error: error.message });
  }
});

// GET /api/sales - Fetch all sales
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, timezone, status, paymentMethod } = req.query;
    
    // Build where clause for filtering
    let whereClause = {};
    
    // Date filtering with timezone support
    if (startDate && endDate) {
      // Convert to proper date objects and add some buffer for timezone issues
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Add buffer to handle timezone differences
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      whereClause.createdAt = {
        [Op.between]: [start, end]
      };
      console.log(`Filtering sales by date range: ${start.toISOString()} to ${end.toISOString()} (timezone: ${timezone || 'UTC'})`);
    } else {
      console.log('No date range provided, fetching all sales');
    }
    
    // Status filtering
    if (status) {
      whereClause.status = status;
    }
    
    // Payment method filtering (through SalePayment)
    let paymentInclude = {
      model: global.models.SalePayment,
      as: 'salePayments'
    };
    
    if (paymentMethod) {
      paymentInclude.where = { payment_method: paymentMethod };
    }

    const sales = await global.models.Sale.findAll({
      where: whereClause,
      include: [
        {
          model: global.models.SaleProduct,
          as: 'saleProducts',
          attributes: ['id', 'product_id', 'name', 'quantity', 'price', 'item_discount', 'item_discount_percentage', 'item_total'],
        },
        paymentInclude,
        { model: global.models.Customer, as: 'customer' },
        { model: global.models.User, as: 'user' },
        { model: global.models.Receipt, as: 'receipts' },
      ],
      order: [['createdAt', 'DESC']],
    });
    
    console.log(`Found ${sales.length} sales matching criteria`);
    console.log('Where clause used:', JSON.stringify(whereClause, null, 2));
    console.log('Sample sales data:', sales.slice(0, 2).map(sale => ({
      id: sale.id,
      total_amount: sale.total_amount,
      createdAt: sale.createdAt,
      customer: sale.customer?.name || 'No customer'
    })));
    
    // If no sales found with filters, try without date filter to debug
    if (sales.length === 0 && startDate && endDate) {
      console.log('No sales found with date filter, checking all sales...');
      const allSales = await global.models.Sale.findAll({
        include: [
          {
            model: global.models.SaleProduct,
            as: 'saleProducts',
            attributes: ['id', 'product_id', 'name', 'quantity', 'price', 'item_discount', 'item_discount_percentage', 'item_total'],
          },
          paymentInclude,
          { model: global.models.Customer, as: 'customer' },
          { model: global.models.User, as: 'user' },
          { model: global.models.Receipt, as: 'receipts' },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      });
      console.log(`Total sales in database: ${allSales.length}`);
      console.log('Recent sales dates:', allSales.map(sale => ({
        id: sale.id,
        createdAt: sale.createdAt,
        total_amount: sale.total_amount
      })));
    }
    
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error in GET /api/sales:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/sales/history - Fetch sales history
router.get('/history', async (req, res) => {
  try {
    const sales = await global.models.Sale.findAll({
      include: [
        {
          model: global.models.SaleProduct,
          as: 'saleProducts',
          attributes: ['id', 'product_id', 'name', 'quantity', 'price', 'item_discount', 'item_discount_percentage', 'item_total'],
        },
        { model: global.models.SalePayment, as: 'salePayments' },
        { model: global.models.Customer, as: 'customer' },
        { model: global.models.User, as: 'user' },
        { model: global.models.Receipt, as: 'receipts' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error in GET /api/sales/history:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/sales/:id - Delete a sale and reverse all actions
router.delete('/:id', async (req, res) => {
  const transaction = await global.sequelize.transaction();
  try {
    const saleId = req.params.id;

    if (!saleId || isNaN(saleId)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid sale ID' });
    }

    const sale = await global.models.Sale.findOne({
      where: { id: saleId },
      include: [
        { model: global.models.SaleProduct, as: 'saleProducts' },
        { model: global.models.SalePayment, as: 'salePayments' },
        { model: global.models.Customer, as: 'customer' },
        { model: global.models.Receipt, as: 'receipts' },
      ],
      transaction,
    });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Reverse stock for sale products
    for (const item of sale.saleProducts) {
      if (!item.product_id || !item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Invalid sale product data' });
      }

      const product = await global.models.Product.findByPk(item.product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
      }

      product.stock = parseInt(product.stock || 0, 10) + parseInt(item.quantity, 10);
      await product.save({ transaction });
    }

    // Reverse customer dues
    if (sale.on_credit > 0 && sale.customer_id) {
      const customer = await global.models.Customer.findByPk(sale.customer_id, { transaction });
      if (!customer) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Customer not found' });
      }

      const currentDues = parseFloat(customer.dues || 0);
      const creditAmount = parseFloat(sale.on_credit || 0);
      customer.dues = Math.max(0, currentDues - creditAmount).toFixed(2);
      await customer.save({ transaction });

      const updatedDues = await global.models.CustomerDues.update(
        { status: 'reversed' },
        { where: { sale_id: sale.id }, transaction },
      );

      if (updatedDues[0] === 0) {
        console.warn(`No customer dues found for sale ID ${sale.id}`);
      }
    }

    // Delete related records
    await global.models.SalePayment.destroy({ where: { sale_id: sale_id }, transaction });
    await global.models.SaleProduct.destroy({ where: { sale_id: sale_id }, transaction });
    await global.models.CustomerDues.destroy({ where: { sale_id: sale_id }, transaction });
    await global.models.Receipt.destroy({ where: { sale_id: sale_id }, transaction });

    await sale.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Sale deleted successfully with all reversals' });
  } catch (error) {
    console.error('Error in DELETE /api/sales/:id:', error.stack);
    await transaction.rollback();
    res.status(500).json({ message: 'Failed to delete sale', error: error.message });
  }
});

module.exports = router;