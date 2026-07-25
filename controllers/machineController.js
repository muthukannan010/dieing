const { supabase } = require('../config/db');

exports.getMachines = async (req, res) => {
  try {
    const { data: list, error } = await supabase
      .from('machines')
      .select('*')
      .order('machine_code', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Fetch machines error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve machine list.' });
  }
};

exports.addMachine = async (req, res) => {
  try {
    const { name, machine_code, capacity, status, maintenance_schedule } = req.body;

    if (!name || !machine_code) {
      return res.status(400).json({ success: false, message: 'Machine name and code are required.' });
    }

    const { error } = await supabase.from('machines').insert({
      name,
      machine_code,
      capacity: parseFloat(capacity) || 0,
      status: status || 'Available',
      maintenance_schedule
    });

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Machine registered successfully.' });
  } catch (error) {
    console.error('Add machine error:', error);
    res.status(500).json({ success: false, message: 'Failed to add machine.' });
  }
};

exports.updateMachineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabase
      .from('machines')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Machine status updated.' });
  } catch (error) {
    console.error('Update machine status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update machine status.' });
  }
};

exports.deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('machines').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Machine removed from the system.' });
  } catch (error) {
    console.error('Delete machine error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete machine.' });
  }
};
