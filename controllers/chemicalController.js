const { supabase } = require('../config/db');

exports.getAllChemicals = async (req, res) => {
  try {
    const { data: chemicals, error } = await supabase
      .from('chemicals')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: chemicals });
  } catch (error) {
    console.error('Fetch chemicals error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve chemicals.' });
  }
};

exports.addChemical = async (req, res) => {
  try {
    const { name, usage_purpose, quantity_per_kg, cost, safety_notes } = req.body;

    if (!name || isNaN(parseFloat(quantity_per_kg)) || isNaN(parseFloat(cost))) {
      return res.status(400).json({ success: false, message: 'Invalid input parameters.' });
    }

    const { data: existing } = await supabase
      .from('chemicals')
      .select('id')
      .eq('name', name)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Chemical already exists in inventory.' });
    }

    const { error } = await supabase.from('chemicals').insert({
      name,
      usage_purpose,
      quantity_per_kg: parseFloat(quantity_per_kg),
      cost: parseFloat(cost),
      safety_notes
    });

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Chemical added successfully.' });
  } catch (error) {
    console.error('Add chemical error:', error);
    res.status(500).json({ success: false, message: 'Failed to add chemical.' });
  }
};

exports.updateChemical = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, usage_purpose, quantity_per_kg, cost, safety_notes } = req.body;

    if (isNaN(id) || !name || isNaN(parseFloat(quantity_per_kg)) || isNaN(parseFloat(cost))) {
      return res.status(400).json({ success: false, message: 'Invalid input parameters.' });
    }

    const { data: existing } = await supabase
      .from('chemicals')
      .select('id')
      .eq('id', id)
      .limit(1);

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Chemical not found.' });
    }

    const { error } = await supabase
      .from('chemicals')
      .update({
        name,
        usage_purpose,
        quantity_per_kg: parseFloat(quantity_per_kg),
        cost: parseFloat(cost),
        safety_notes
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Chemical updated successfully.' });
  } catch (error) {
    console.error('Update chemical error:', error);
    res.status(500).json({ success: false, message: 'Failed to update chemical.' });
  }
};

exports.deleteChemical = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid chemical ID.' });
    }

    const { error } = await supabase.from('chemicals').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Chemical deleted successfully from inventory.' });
  } catch (error) {
    console.error('Delete chemical error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete chemical.' });
  }
};
