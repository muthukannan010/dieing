const { supabase } = require('../config/db');

exports.getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabase
      .from('orders')
      .select('*, customers(name), fabric_types(name)');

    // Filter by customer if user role is Customer
    if (req.user && req.user.role === 'Customer') {
      // Need to filter by customer email — get customer ID first
      const { data: custData } = await supabase
        .from('customers')
        .select('id')
        .eq('email', req.user.email)
        .limit(1);
      if (custData && custData.length > 0) {
        query = query.eq('customer_id', custData[0].id);
      }
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_no.ilike.%${search}%,color_name.ilike.%${search}%`);
    }

    query = query.order('id', { ascending: false });

    const { data: orders, error } = await query;
    if (error) throw error;

    // Flatten nested foreign key data for template compatibility
    const flatOrders = (orders || []).map(o => ({
      ...o,
      customer_name: o.customers?.name || null,
      fabric_type_name: o.fabric_types?.name || null,
      customers: undefined,
      fabric_types: undefined
    }));

    // Get customers and fabric types for dropdowns
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name')
      .order('name', { ascending: true });

    const { data: fabricTypes } = await supabase
      .from('fabric_types')
      .select('id, name')
      .order('name', { ascending: true });

    res.json({ success: true, data: { orders: flatOrders, customers: customers || [], fabricTypes: fabricTypes || [] } });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customer_id, fabric_type_id, color_name, quantity_kg, gsm, width_inches, length_meters, dye_type, delivery_date } = req.body;

    if (!customer_id || !fabric_type_id || !color_name || !quantity_kg || !gsm || !width_inches || !length_meters || !dye_type) {
      return res.status(400).json({ success: false, message: 'All parameters are required.' });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const order_no = `ORD-${dateStr}-${rand}`;

    const { data: result, error } = await supabase
      .from('orders')
      .insert({
        customer_id: parseInt(customer_id),
        order_no,
        fabric_type_id: parseInt(fabric_type_id),
        color_name,
        quantity_kg: parseFloat(quantity_kg),
        gsm: parseInt(gsm),
        width_inches: parseFloat(width_inches),
        length_meters: parseFloat(length_meters),
        dye_type,
        status: 'Pending',
        delivery_date
      })
      .select('id')
      .single();

    if (error) throw error;

    // Audit trail logging
    await supabase.from('activity_logs').insert({
      user_id: req.user ? req.user.id : null,
      action: `Created new order: ${order_no}`
    });

    res.status(201).json({ success: true, message: 'Order created successfully.', orderId: result?.id });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, fabric_type_id, color_name, quantity_kg, gsm, width_inches, length_meters, dye_type, status, delivery_date } = req.body;

    const { error } = await supabase
      .from('orders')
      .update({
        customer_id: parseInt(customer_id),
        fabric_type_id: parseInt(fabric_type_id),
        color_name,
        quantity_kg: parseFloat(quantity_kg),
        gsm: parseInt(gsm),
        width_inches: parseFloat(width_inches),
        length_meters: parseFloat(length_meters),
        dye_type,
        status,
        delivery_date
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Order details updated successfully.' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order details.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Order status updated successfully.' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete order.' });
  }
};
