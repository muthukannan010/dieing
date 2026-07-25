const { supabase } = require('../config/db');

exports.getAllBatches = async (req, res) => {
  try {
    const { data: batches, error } = await supabase
      .from('production_batches')
      .select('*, orders(order_no), machines(name, machine_code), recipes(name)')
      .order('id', { ascending: false });

    if (error) throw error;

    // Flatten nested joins for template compatibility
    const flatBatches = (batches || []).map(b => ({
      ...b,
      order_no: b.orders?.order_no || null,
      machine_name: b.machines?.name || null,
      machine_code: b.machines?.machine_code || null,
      recipe_name: b.recipes?.name || null,
      orders: undefined,
      machines: undefined,
      recipes: undefined
    }));

    // Available orders (not completed/delivered)
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_no, quantity_kg')
      .not('status', 'in', '("Completed","Delivered")')
      .order('id', { ascending: false });

    // Available machines
    const { data: machines } = await supabase
      .from('machines')
      .select('id, name, capacity')
      .eq('status', 'Available')
      .order('name', { ascending: true });

    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, name')
      .order('name', { ascending: true });

    res.json({ success: true, data: { batches: flatBatches, orders: orders || [], machines: machines || [], recipes: recipes || [] } });
  } catch (error) {
    console.error('Fetch batches error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve production batches.' });
  }
};

exports.createBatch = async (req, res) => {
  try {
    const { order_id, machine_id, operator_name, recipe_id } = req.body;

    if (!order_id || !machine_id || !operator_name || !recipe_id) {
      return res.status(400).json({ success: false, message: 'Please provide all details.' });
    }

    // Verify order exists
    const { data: orderCheck } = await supabase
      .from('orders')
      .select('id')
      .eq('id', order_id)
      .limit(1);

    if (!orderCheck || orderCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const rand = Math.floor(100 + Math.random() * 900);
    const batch_no = `BATCH-TEX-${rand}`;
    const started_at = new Date().toISOString().slice(0, 16);

    const { error } = await supabase.from('production_batches').insert({
      batch_no,
      order_id: parseInt(order_id),
      machine_id: parseInt(machine_id),
      operator_name,
      recipe_id: parseInt(recipe_id),
      status: 'In Process',
      started_at
    });

    if (error) throw error;

    // Update machine status to Running
    await supabase.from('machines').update({ status: 'Running' }).eq('id', machine_id);

    // Update order status to Scheduled
    await supabase.from('orders').update({ status: 'Scheduled' }).eq('id', order_id);

    res.status(201).json({ success: true, message: 'Production batch initiated and machine scheduled.' });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ success: false, message: 'Failed to create production batch.' });
  }
};

exports.updateBatchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // In Process, Dyeing, Completed

    const { data: batchData } = await supabase
      .from('production_batches')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (!batchData || batchData.length === 0) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }
    const batch = batchData[0];

    let completed_at = batch.completed_at;
    if (status === 'Completed') {
      completed_at = new Date().toISOString().slice(0, 16);

      // Update machine to Available
      await supabase.from('machines').update({ status: 'Available' }).eq('id', batch.machine_id);

      // Update parent order to Quality Check
      await supabase.from('orders').update({ status: 'Quality Check' }).eq('id', batch.order_id);
    } else if (status === 'Dyeing') {
      await supabase.from('orders').update({ status: 'Dyeing' }).eq('id', batch.order_id);
    }

    const { error } = await supabase
      .from('production_batches')
      .update({ status, completed_at })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Batch status updated successfully.' });
  } catch (error) {
    console.error('Update batch status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update batch status.' });
  }
};

exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: batchData } = await supabase
      .from('production_batches')
      .select('machine_id')
      .eq('id', id)
      .limit(1);

    if (batchData && batchData.length > 0) {
      // Restore machine status
      await supabase.from('machines').update({ status: 'Available' }).eq('id', batchData[0].machine_id);
    }

    const { error } = await supabase.from('production_batches').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Batch tracking log deleted.' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete batch.' });
  }
};
