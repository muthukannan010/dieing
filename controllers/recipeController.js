const { supabase } = require('../config/db');

exports.getAllRecipes = async (req, res) => {
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: recipes });
  } catch (error) {
    console.error('Fetch recipes error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dye recipes.' });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const { name, color_name, dye_percentage, formula_details, water_ratio, temperature, duration } = req.body;

    if (!name || !color_name) {
      return res.status(400).json({ success: false, message: 'Recipe name and color name are required.' });
    }

    const { error } = await supabase.from('recipes').insert({
      name,
      color_name,
      dye_percentage: parseFloat(dye_percentage) || 0,
      formula_details: formula_details || '',
      water_ratio: parseFloat(water_ratio) || 10,
      temperature: parseInt(temperature) || 95,
      duration: parseInt(duration) || 60,
      version: 1
    });

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Dye recipe created successfully.' });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to create recipe.' });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color_name, dye_percentage, formula_details, water_ratio, temperature, duration } = req.body;

    const { data: recipes } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const currentRecipe = recipes[0];
    const newVersion = (currentRecipe.version || 1) + 1;

    const { error } = await supabase
      .from('recipes')
      .update({
        name,
        color_name,
        dye_percentage: parseFloat(dye_percentage) || 0,
        formula_details: formula_details || '',
        water_ratio: parseFloat(water_ratio) || 10,
        temperature: parseInt(temperature) || 95,
        duration: parseInt(duration) || 60,
        version: newVersion
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: `Recipe updated to version ${newVersion}.` });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to update recipe.' });
  }
};

exports.cloneRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: recipes } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Source recipe not found.' });
    }

    const source = recipes[0];
    const clonedName = `${source.name} (Cloned - ${Date.now().toString().slice(-4)})`;

    const { error } = await supabase.from('recipes').insert({
      name: clonedName,
      color_name: source.color_name,
      dye_percentage: source.dye_percentage,
      formula_details: source.formula_details,
      water_ratio: source.water_ratio,
      temperature: source.temperature,
      duration: source.duration,
      version: 1,
      parent_recipe_id: source.id
    });

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Recipe cloned successfully as a new draft.' });
  } catch (error) {
    console.error('Clone recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to clone recipe.' });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Recipe deleted successfully.' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete recipe.' });
  }
};
