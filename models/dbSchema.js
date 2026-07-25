const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');

async function setupSchema() {
  console.log('Setting up DyeTech Pro database with Supabase...');
  console.log('NOTE: Tables must be created first via supabase_migration.sql in the Supabase SQL Editor.');

  // Seed data only if tables are empty

  // 1. Users
  const { data: existingUsers } = await supabase.from('users').select('id').limit(1);
  if (!existingUsers || existingUsers.length === 0) {
    const roles = ['Super Admin', 'Factory Manager', 'Production Supervisor', 'Machine Operator', 'Inventory Manager', 'Customer'];
    const userRecords = [];
    for (const r of roles) {
      const uName = r.toLowerCase().replace(' ', '');
      const hashed = await bcrypt.hash(uName + '123', 10);
      userRecords.push({
        username: uName,
        email: `${uName}@texcolor.com`,
        password: hashed,
        role: r
      });
    }
    const { error } = await supabase.from('users').insert(userRecords);
    if (error) console.error('Seed users error:', error.message);
    else console.log('Seeded 6 default user roles.');
  }

  // 2. Fabric Types
  const { data: existingFabrics } = await supabase.from('fabric_types').select('id').limit(1);
  if (!existingFabrics || existingFabrics.length === 0) {
    const { error } = await supabase.from('fabric_types').insert([
      { name: '100% Cotton Single Jersey', fabric_code: 'COT-01', gsm_range: '140-220', dye_compatibility: 'Reactive Dye, Direct Dye', notes: 'Highly absorbent, standard knit' },
      { name: 'Polyester Interlock', fabric_code: 'POLY-01', gsm_range: '120-180', dye_compatibility: 'Disperse Dye', notes: 'Athletic wear fabric, high temperature required' },
      { name: 'Pure Mulberry Silk', fabric_code: 'SILK-01', gsm_range: '50-100', dye_compatibility: 'Acid Dye, Reactive Dye', notes: 'Delicate material, low temp drying required' },
      { name: 'Linen Plain Weave', fabric_code: 'LIN-01', gsm_range: '180-280', dye_compatibility: 'Reactive Dye', notes: 'Coarse structural fiber, high crease potential' },
      { name: 'Viscose Rayon Spandex', fabric_code: 'RAY-01', gsm_range: '180-240', dye_compatibility: 'Reactive Dye', notes: 'Heavy drape, soft stretch knit' },
      { name: 'CVC Cotton/Poly Blend', fabric_code: 'CVC-01', gsm_range: '160-220', dye_compatibility: 'Reactive + Disperse Dye', notes: 'Double-bath dyeing required' }
    ]);
    if (error) console.error('Seed fabric types error:', error.message);
  }

  // 3. Chemicals
  const { data: existingChemicals } = await supabase.from('chemicals').select('id').limit(1);
  if (!existingChemicals || existingChemicals.length === 0) {
    const { error } = await supabase.from('chemicals').insert([
      { name: 'Acetic Acid', usage_purpose: 'pH Neutralization bath', quantity_per_kg: 0.02, cost: 1.65, safety_notes: 'Slightly corrosive. Handle with protective gloves.' },
      { name: 'Reactive Dye', usage_purpose: 'Cellulosic cotton color agent', quantity_per_kg: 0.04, cost: 12.80, safety_notes: 'Avoid inhalation. Wear respiratory dust masks.' },
      { name: 'Salt', usage_purpose: 'Exhausting dye booster', quantity_per_kg: 0.15, cost: 0.45, safety_notes: 'Store in a dry location.' },
      { name: 'Soda Ash', usage_purpose: 'Dye fixing alkaline agent', quantity_per_kg: 0.08, cost: 0.85, safety_notes: 'Causes irritation. Flush eyes immediately with water.' },
      { name: 'Wetting Agent', usage_purpose: 'Fibers swelling helper', quantity_per_kg: 0.01, cost: 2.30, safety_notes: 'Mild irritant. Store away from heat.' },
      { name: 'Hydrogen Peroxide', usage_purpose: 'Bleaching agent for base whitening', quantity_per_kg: 0.03, cost: 3.20, safety_notes: 'Strong oxidizer. Store in ventilated drums.' }
    ]);
    if (error) console.error('Seed chemicals error:', error.message);
  }

  // 4. Colors
  const { data: existingColors } = await supabase.from('colors').select('id').limit(1);
  if (!existingColors || existingColors.length === 0) {
    const { error } = await supabase.from('colors').insert([
      { name: 'Emerald Green', base_color: 'Green', matching_colors: 'Yellow, Blue, White', hex_code: '#50C878', recipe_details: 'Reactive Dye Green: 2.1%, Salt: 60g/L' },
      { name: 'Sapphire Blue', base_color: 'Blue', matching_colors: 'White, Purple', hex_code: '#0F52BA', recipe_details: 'Reactive Dye Blue: 2.5%, Soda Ash: 15g/L' },
      { name: 'Ruby Red', base_color: 'Red', matching_colors: 'Yellow, White', hex_code: '#E0115F', recipe_details: 'Reactive Dye Red: 3.0%, Salt: 70g/L' },
      { name: 'Amber Gold', base_color: 'Yellow', matching_colors: 'Orange, White', hex_code: '#FFBF00', recipe_details: 'Reactive Dye Yellow: 1.5%, Soda Ash: 10g/L' }
    ]);
    if (error) console.error('Seed colors error:', error.message);
  }

  // 5. Recipes
  const { data: existingRecipes } = await supabase.from('recipes').select('id').limit(1);
  if (!existingRecipes || existingRecipes.length === 0) {
    const { error } = await supabase.from('recipes').insert([
      { name: 'Formula COT-EMERALD', color_name: 'Emerald Green', dye_percentage: 2.1, formula_details: 'Salt: 55g/L, Soda Ash: 12g/L, Wetting Agent: 2g/L', water_ratio: 10, temperature: 95, duration: 60, version: 1 },
      { name: 'Formula POLY-SAPPHIRE', color_name: 'Sapphire Blue', dye_percentage: 2.5, formula_details: 'Dispersing Agent: 1.5g/L, Acetic Acid: 1.2g/L', water_ratio: 12, temperature: 130, duration: 90, version: 1 }
    ]);
    if (error) console.error('Seed recipes error:', error.message);
  }

  // 6. Machines
  const { data: existingMachines } = await supabase.from('machines').select('id').limit(1);
  if (!existingMachines || existingMachines.length === 0) {
    const { error } = await supabase.from('machines').insert([
      { name: 'Fong High Temp Vessel A', machine_code: 'MC-FONG-A', capacity: 1000.0, status: 'Available', maintenance_schedule: '2026-07-01' },
      { name: 'Fong High Temp Vessel B', machine_code: 'MC-FONG-B', capacity: 1000.0, status: 'Running', maintenance_schedule: '2026-07-05' },
      { name: 'Sclavos Jet Dye Machine', machine_code: 'MC-SCLAV-01', capacity: 500.0, status: 'Maintenance', maintenance_schedule: '2026-06-15' },
      { name: 'Thies Soft-Flow Winch', machine_code: 'MC-THIES-01', capacity: 250.0, status: 'Offline', maintenance_schedule: '2026-08-01' }
    ]);
    if (error) console.error('Seed machines error:', error.message);
  }

  // 7. Suppliers
  const { data: existingSuppliers } = await supabase.from('suppliers').select('id').limit(1);
  if (!existingSuppliers || existingSuppliers.length === 0) {
    const { error } = await supabase.from('suppliers').insert([
      { name: 'Huntsman Textile Effects', contact_person: 'Clara Jenkins', phone: '+15550198', email: 'clara@huntsman.com' },
      { name: 'Dystar Colorants Corp', contact_person: 'Niels Bohr', phone: '+495551234', email: 'niels@dystar.de' },
      { name: 'Archroma Chemicals', contact_person: 'Alisha Patel', phone: '+91555789', email: 'alisha@archroma.in' }
    ]);
    if (error) console.error('Seed suppliers error:', error.message);
  }

  // 8. Inventory
  const { data: existingInventory } = await supabase.from('inventory').select('id').limit(1);
  if (!existingInventory || existingInventory.length === 0) {
    // Get supplier IDs for linking
    const { data: suppliers } = await supabase.from('suppliers').select('id, name');
    const archromaId = suppliers?.find(s => s.name === 'Archroma Chemicals')?.id || null;
    const huntsmanId = suppliers?.find(s => s.name === 'Huntsman Textile Effects')?.id || null;
    const dystarId = suppliers?.find(s => s.name === 'Dystar Colorants Corp')?.id || null;

    const { error } = await supabase.from('inventory').insert([
      { item_type: 'Chemical', item_name: 'Acetic Acid', quantity: 1200.0, unit: 'KG', threshold: 300.0, supplier_id: archromaId },
      { item_type: 'Chemical', item_name: 'Hydrogen Peroxide', quantity: 2500.0, unit: 'KG', threshold: 500.0, supplier_id: archromaId },
      { item_type: 'Dye', item_name: 'Reactive Dye Green', quantity: 150.0, unit: 'KG', threshold: 50.0, supplier_id: huntsmanId },
      { item_type: 'Dye', item_name: 'Disperse Dye Blue', quantity: 95.0, unit: 'KG', threshold: 40.0, supplier_id: dystarId },
      { item_type: 'Fabric', item_name: 'Cotton Single Jersey Greige', quantity: 5000.0, unit: 'Meters', threshold: 1000.0, supplier_id: null }
    ]);
    if (error) console.error('Seed inventory error:', error.message);
  }

  // 9. Customers
  const { data: existingCustomers } = await supabase.from('customers').select('id').limit(1);
  if (!existingCustomers || existingCustomers.length === 0) {
    const { error } = await supabase.from('customers').insert([
      { name: 'TexStyle Solutions', contact_person: 'John Doe', email: 'john@texstyle.com', phone: '+123456789', address: 'New York, USA' },
      { name: 'Apex Apparel Group', contact_person: 'Sarah Smith', email: 'sarah@apexapparel.com', phone: '+198765432', address: 'London, UK' }
    ]);
    if (error) console.error('Seed customers error:', error.message);
  }

  // 10. Orders
  const { data: existingOrders } = await supabase.from('orders').select('id').limit(1);
  if (!existingOrders || existingOrders.length === 0) {
    // Get customer and fabric type IDs
    const { data: custs } = await supabase.from('customers').select('id, name');
    const { data: fabrics } = await supabase.from('fabric_types').select('id, fabric_code');
    
    const cust1 = custs?.find(c => c.name === 'TexStyle Solutions')?.id || 1;
    const cust2 = custs?.find(c => c.name === 'Apex Apparel Group')?.id || 2;
    const fab1 = fabrics?.find(f => f.fabric_code === 'COT-01')?.id || 1;
    const fab2 = fabrics?.find(f => f.fabric_code === 'POLY-01')?.id || 2;

    const { error } = await supabase.from('orders').insert([
      { customer_id: cust1, order_no: 'ORD-2026-X101', fabric_type_id: fab1, color_name: 'Emerald Green', quantity_kg: 600, gsm: 180, width_inches: 1.8, length_meters: 2000, dye_type: 'Reactive Dye', status: 'Dyeing', delivery_date: '2026-06-15' },
      { customer_id: cust2, order_no: 'ORD-2026-X102', fabric_type_id: fab2, color_name: 'Sapphire Blue', quantity_kg: 800, gsm: 150, width_inches: 1.6, length_meters: 3500, dye_type: 'Disperse Dye', status: 'Pending', delivery_date: '2026-06-22' }
    ]);
    if (error) console.error('Seed orders error:', error.message);
  }

  // 11. Production Batches
  const { data: existingBatches } = await supabase.from('production_batches').select('id').limit(1);
  if (!existingBatches || existingBatches.length === 0) {
    const { data: ordList } = await supabase.from('orders').select('id').limit(1);
    const { data: machList } = await supabase.from('machines').select('id').limit(1);
    const { data: recList } = await supabase.from('recipes').select('id').limit(1);

    const orderId = ordList?.[0]?.id || 1;
    const machineId = machList?.[1]?.id || machList?.[0]?.id || 2;
    const recipeId = recList?.[0]?.id || 1;

    const { error } = await supabase.from('production_batches').insert([
      { batch_no: 'BATCH-X101', order_id: orderId, machine_id: machineId, operator_name: 'Robert Johnson', recipe_id: recipeId, status: 'Dyeing', started_at: '2026-06-09T08:00' }
    ]);
    if (error) console.error('Seed production batches error:', error.message);
  }

  console.log('Database seeding complete.');
}

module.exports = {
  setupSchema
};
