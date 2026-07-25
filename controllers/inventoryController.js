const { supabase } = require('../config/db');

exports.getInventoryData = async (req, res) => {
  try {
    const { data: items, error } = await supabase
      .from('inventory')
      .select('*, suppliers(name)')
      .order('item_name', { ascending: true });

    if (error) throw error;

    // Flatten supplier name for template compatibility
    const flatItems = (items || []).map(i => ({
      ...i,
      supplier_name: i.suppliers?.name || null,
      suppliers: undefined
    }));

    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('id, name')
      .order('name', { ascending: true });

    res.json({ success: true, data: { items: flatItems, suppliers: suppliers || [] } });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve stock list.' });
  }
};

exports.addInventoryItem = async (req, res) => {
  try {
    const { item_type, item_name, quantity, unit, threshold, supplier_id } = req.body;

    if (!item_type || !item_name || isNaN(parseFloat(quantity))) {
      return res.status(400).json({ success: false, message: 'Please provide valid details.' });
    }

    const { error } = await supabase.from('inventory').insert({
      item_type,
      item_name,
      quantity: parseFloat(quantity),
      unit: unit || 'KG',
      threshold: parseFloat(threshold) || 0,
      supplier_id: supplier_id ? parseInt(supplier_id) : null
    });

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Stock item added successfully.' });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to stock.' });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment_type, quantity } = req.body; // adjustment_type: 'inward' or 'outward'

    const { data: items } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (!items || items.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    const item = items[0];
    const adjustQty = parseFloat(quantity);
    let newQty = item.quantity;

    if (adjustment_type === 'inward') {
      newQty += adjustQty;
    } else {
      newQty -= adjustQty;
      if (newQty < 0) newQty = 0;
    }

    const { error } = await supabase
      .from('inventory')
      .update({ quantity: newQty })
      .eq('id', id);

    if (error) throw error;

    // Check low stock threshold
    if (newQty <= item.threshold) {
      await supabase.from('notifications').insert({
        message: `CRITICAL: Low stock alert for ${item.item_name}. Current balance: ${newQty} ${item.unit}.`
      });
    }

    res.json({ success: true, message: 'Stock level adjusted successfully.', newQuantity: newQty });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust stock.' });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Item deleted from inventory.' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove inventory item.' });
  }
};

// Supplier methods
exports.getAllSuppliers = async (req, res) => {
  try {
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Fetch suppliers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve suppliers.' });
  }
};

exports.addSupplier = async (req, res) => {
  try {
    const { name, contact_person, phone, email } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required.' });
    }

    const { error } = await supabase.from('suppliers').insert({
      name,
      contact_person,
      phone,
      email
    });

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Supplier registered successfully.' });
  } catch (error) {
    console.error('Add supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to register supplier.' });
  }
};
