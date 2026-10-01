import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { Category } from '../src/modules/menu/menu.model';
import { MenuItem } from '../src/modules/menu/menu.model';
import { TableModel } from '../src/modules/tables/tables.model';
import { TableSessionModel } from '../src/modules/tableSessions/tableSessions.model';
import { Cart } from '../src/modules/cart/cart.model';
import { OrdersService } from '../src/modules/orders/orders.service';
import { SessionStatus } from '../src/constants/statuses';

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to DB');

  try {
    const restaurantId = new mongoose.Types.ObjectId();
    const adminId = new mongoose.Types.ObjectId();

    // 2. Create a dummy table
    const table = await TableModel.create({
      restaurantId,
      tableNumber: 'T1',
      capacity: 4,
      status: 'AVAILABLE',
      qrCode: 'http://test.com/qr'
    });
    console.log('Created Table:', table._id);

    // 3. Create a menu category
    const category = await Category.create({
      restaurantId,
      name: 'Mains',
      description: 'Main dishes',
      displayOrder: 1,
      isActive: true,
      createdBy: adminId,
      updatedBy: adminId
    });
    console.log('Created Category:', category._id);

    // 4. Create a menu item
    const item = await MenuItem.create({
      restaurantId,
      categoryId: category._id,
      name: 'Test Burger',
      description: 'A delicious test burger',
      price: 15.99,
      isVeg: true,
      isAvailable: true,
      spiceLevel: 2,
      allergens: [],
      preparationTime: 15,
      createdBy: adminId,
      updatedBy: adminId
    });
    console.log('Created MenuItem:', item._id);

    // 5. Create a table session
    const session = await TableSessionModel.create({
      restaurantId,
      tableId: table._id,
      status: SessionStatus.ACTIVE,
      sessionStart: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours
      customerName: 'John Doe',
      mobile: '1234567890',
      sessionToken: 'test-token',
      lastActivityAt: new Date()
    });
    console.log('Created Session:', session._id);

    // 6. Create a Cart
    const cart = await Cart.create({
      restaurantId,
      sessionId: session._id,
      items: [
        {
          menuItem: item._id,
          quantity: 2,
          unitPrice: item.price,
          subtotal: item.price * 2,
          notes: 'No pickles'
        }
      ],
      subtotal: item.price * 2,
      tax: 0,
      discount: 0,
      grandTotal: item.price * 2
    });
    console.log('Created Cart:', cart._id);

    // 7. Place Order using OrdersService
    console.log('Placing Order...');
    const order = await OrdersService.placeOrder(
      restaurantId,
      session._id,
      table._id,
      session.customerName,
      { specialInstructions: 'Leave at the table edge' }
    );
    console.log('Order Placed Successfully!');
    console.log('Order Details:', JSON.stringify(order, null, 2));

    // 8. Verify Cart is cleared
    const updatedCart = await Cart.findById(cart._id);
    console.log('Cart Items Length after order:', updatedCart?.items.length);

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    // Cleanup so we don't leave mess
    await mongoose.connection.db?.dropDatabase(); // Drop for clean slate
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

run();
