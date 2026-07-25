const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.seedDatabase = async (req, res) => {
  try {
    console.log('--- STARTING DEMO DATABASE RESET & RE-SEED ---');

    // 1. Delete existing records in reverse dependency order
    const tablesToDelete = [
      'production_batches',
      'orders',
      'customers',
      'inventory',
      'suppliers',
      'recipes',
      'colors',
      'fabric_types',
      'chemicals',
      'machines',
      'reports',
      'notifications',
      'activity_logs',
      'users'
    ];

    for (const table of tablesToDelete) {
      const { error } = await supabase.from(table).delete().gt('id', 0);
      if (error) {
        console.warn(`Warning deleting from ${table}:`, error.message);
      } else {
        console.log(`Cleared table: ${table}`);
      }
    }

    // 2. Seed Users
    const usersToSeed = [
      { username: 'superadmin', email: 'admin@texcolor.com', role: 'Super Admin', password: 'superadmin123' },
      { username: 'factorymanager', email: 'manager@texcolor.com', role: 'Factory Manager', password: 'factorymanager123' },
      { username: 'productionsupervisor', email: 'supervisor@texcolor.com', role: 'Production Supervisor', password: 'productionsupervisor123' },
      { username: 'inventorymanager', email: 'inventory@texcolor.com', role: 'Inventory Manager', password: 'inventorymanager123' },
      { username: 'customer', email: 'customer@texcolor.com', role: 'Customer', password: 'customer123' }
    ];

    const seededUsers = [];
    for (const u of usersToSeed) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const { data, error } = await supabase.from('users').insert({
        username: u.username,
        email: u.email,
        password: hashedPassword,
        role: u.role
      }).select();
      if (error) throw new Error(`User seeding failed: ${error.message}`);
      seededUsers.push(data[0]);
    }
    console.log('Seeded Users.');

    // 3. Seed Customers
    const customersToSeed = [
      { name: 'TexStyle Solutions', contact_person: 'John Doe', email: 'john@texstyle.com', phone: '+123456789', address: 'New York, USA' },
      { name: 'Apex Apparel Group', contact_person: 'Sarah Smith', email: 'sarah@apexapparel.com', phone: '+198765432', address: 'London, UK' },
      { name: 'Zarah Textiles', contact_person: 'Amit Patel', email: 'amit@zarahtextiles.in', phone: '+9198765432', address: 'Mumbai, India' },
      { name: 'Vogue Dyeing Co', contact_person: 'Michelle Wong', email: 'michelle@voguedyeing.cn', phone: '+86138001380', address: 'Shanghai, China' },
      { name: 'Global Fashion Brands', contact_person: 'Carlos Gomez', email: 'carlos@globalfashion.es', phone: '+349123456', address: 'Madrid, Spain' }
    ];

    const { data: seededCustomers, error: custErr } = await supabase.from('customers').insert(customersToSeed).select();
    if (custErr) throw new Error(`Customer seeding failed: ${custErr.message}`);
    console.log('Seeded Customers.');

    // 4. Seed Fabric Types
    const fabricTypesToSeed = [
      { name: '100% Cotton Single Jersey', fabric_code: 'COT-01', gsm_range: '140-220', dye_compatibility: 'Reactive Dye, Direct Dye', notes: 'Highly absorbent, standard knit' },
      { name: 'Polyester Interlock', fabric_code: 'POLY-01', gsm_range: '120-180', dye_compatibility: 'Disperse Dye', notes: 'Athletic wear fabric, high temperature required' },
      { name: 'Pure Mulberry Silk', fabric_code: 'SILK-01', gsm_range: '50-100', dye_compatibility: 'Acid Dye, Reactive Dye', notes: 'Delicate material, low temp drying required' },
      { name: 'Linen Plain Weave', fabric_code: 'LIN-01', gsm_range: '180-280', dye_compatibility: 'Reactive Dye', notes: 'Coarse structural fiber, high crease potential' },
      { name: 'Viscose Rayon Spandex', fabric_code: 'RAY-01', gsm_range: '180-240', dye_compatibility: 'Reactive Dye', notes: 'Heavy drape, soft stretch knit' },
      { name: 'CVC Cotton/Poly Blend', fabric_code: 'CVC-01', gsm_range: '160-220', dye_compatibility: 'Reactive + Disperse Dye', notes: 'Double-bath dyeing required' }
    ];

    const { data: seededFabrics, error: fabErr } = await supabase.from('fabric_types').insert(fabricTypesToSeed).select();
    if (fabErr) throw new Error(`Fabric seeding failed: ${fabErr.message}`);
    console.log('Seeded Fabric Types.');

    // 5. Seed Chemicals
    const chemicalsToSeed = [
      { name: 'Acetic Acid', usage_purpose: 'pH Neutralization bath', quantity_per_kg: 0.02, cost: 1.65, safety_notes: 'Slightly corrosive. Handle with protective gloves.' },
      { name: 'Reactive Dye Green', usage_purpose: 'Cellulosic cotton color agent', quantity_per_kg: 0.04, cost: 12.80, safety_notes: 'Avoid inhalation. Wear respiratory dust masks.' },
      { name: 'Disperse Dye Blue', usage_purpose: 'Polyester coloring agent', quantity_per_kg: 0.05, cost: 15.20, safety_notes: 'Avoid inhalation. Keep ventilated.' },
      { name: 'Glauber Salt', usage_purpose: 'Exhausting dye booster', quantity_per_kg: 0.15, cost: 0.45, safety_notes: 'Store in a dry location.' },
      { name: 'Soda Ash', usage_purpose: 'Dye fixing alkaline agent', quantity_per_kg: 0.08, cost: 0.85, safety_notes: 'Causes irritation. Flush eyes immediately with water.' },
      { name: 'Wetting Agent', usage_purpose: 'Fibers swelling helper', quantity_per_kg: 0.01, cost: 2.30, safety_notes: 'Mild irritant. Store away from heat.' },
      { name: 'Hydrogen Peroxide', usage_purpose: 'Bleaching agent for base whitening', quantity_per_kg: 0.03, cost: 3.20, safety_notes: 'Strong oxidizer. Store in ventilated drums.' }
    ];

    const { error: chemErr } = await supabase.from('chemicals').insert(chemicalsToSeed);
    if (chemErr) throw new Error(`Chemical seeding failed: ${chemErr.message}`);
    console.log('Seeded Chemicals.');

    // 6. Seed Colors
    const colorsToSeed = [
      { name: 'Emerald Green', base_color: 'Green', matching_colors: 'Yellow, Blue, White', hex_code: '#10B981', recipe_details: 'Reactive Dye Green: 2.1%, Salt: 60g/L' },
      { name: 'Sapphire Blue', base_color: 'Blue', matching_colors: 'White, Purple', hex_code: '#0D9488', recipe_details: 'Disperse Dye Blue: 2.5%, Soda Ash: 15g/L' },
      { name: 'Ruby Red', base_color: 'Red', matching_colors: 'Yellow, White', hex_code: '#EF4444', recipe_details: 'Reactive Dye Red: 3.0%, Salt: 70g/L' },
      { name: 'Amber Gold', base_color: 'Yellow', matching_colors: 'Orange, White', hex_code: '#F59E0B', recipe_details: 'Reactive Dye Yellow: 1.5%, Soda Ash: 10g/L' },
      { name: 'Classic Navy', base_color: 'Blue', matching_colors: 'Grey, White', hex_code: '#1E3A8A', recipe_details: 'Reactive Dye Navy: 2.8%, Salt: 65g/L' },
      { name: 'Jet Black', base_color: 'Black', matching_colors: 'None', hex_code: '#111827', recipe_details: 'Reactive Dye Black: 4.2%, Salt: 80g/L' }
    ];

    const { error: colorErr } = await supabase.from('colors').insert(colorsToSeed);
    if (colorErr) throw new Error(`Color seeding failed: ${colorErr.message}`);
    console.log('Seeded Colors.');

    // 7. Seed Recipes
    const recipesToSeed = [
      { name: 'Formula COT-EMERALD', color_name: 'Emerald Green', dye_percentage: 2.1, formula_details: 'Glauber Salt: 55g/L, Soda Ash: 12g/L, Wetting Agent: 2g/L', water_ratio: 10, temperature: 95, duration: 60, version: 1 },
      { name: 'Formula POLY-SAPPHIRE', color_name: 'Sapphire Blue', dye_percentage: 2.5, formula_details: 'Dispersing Agent: 1.5g/L, Acetic Acid: 1.2g/L', water_ratio: 12, temperature: 130, duration: 90, version: 1 },
      { name: 'Formula COT-RUBY', color_name: 'Ruby Red', dye_percentage: 3.0, formula_details: 'Glauber Salt: 70g/L, Soda Ash: 15g/L, Wetting Agent: 2g/L', water_ratio: 10, temperature: 90, duration: 75, version: 1 },
      { name: 'Formula COT-NAVY', color_name: 'Classic Navy', dye_percentage: 2.8, formula_details: 'Glauber Salt: 65g/L, Soda Ash: 14g/L, Wetting Agent: 2g/L', water_ratio: 10, temperature: 95, duration: 80, version: 1 }
    ];

    const { data: seededRecipes, error: recErr } = await supabase.from('recipes').insert(recipesToSeed).select();
    if (recErr) throw new Error(`Recipe seeding failed: ${recErr.message}`);
    console.log('Seeded Recipes.');

    // 8. Seed Machines
    const machinesToSeed = [
      { name: 'Fong High Temp Vessel A', machine_code: 'MC-FONG-A', capacity: 1000.0, status: 'Running', maintenance_schedule: '2026-07-05' },
      { name: 'Fong High Temp Vessel B', machine_code: 'MC-FONG-B', capacity: 1000.0, status: 'Available', maintenance_schedule: '2026-07-10' },
      { name: 'Sclavos Jet Dye Machine', machine_code: 'MC-SCLAV-01', capacity: 500.0, status: 'Available', maintenance_schedule: '2026-06-25' },
      { name: 'Thies Soft-Flow Winch', machine_code: 'MC-THIES-01', capacity: 250.0, status: 'Maintenance', maintenance_schedule: '2026-06-18' },
      { name: 'Brazzoli Atmospheric Vessel', machine_code: 'MC-BRAZ-01', capacity: 750.0, status: 'Running', maintenance_schedule: '2026-07-15' },
      { name: 'Dilmenler HT Dyeing Machine', machine_code: 'MC-DILM-01', capacity: 1200.0, status: 'Offline', maintenance_schedule: '2026-08-01' }
    ];

    const { data: seededMachines, error: machErr } = await supabase.from('machines').insert(machinesToSeed).select();
    if (machErr) throw new Error(`Machine seeding failed: ${machErr.message}`);
    console.log('Seeded Machines.');

    // 9. Seed Suppliers
    const suppliersToSeed = [
      { name: 'Huntsman Textile Effects', contact_person: 'Clara Jenkins', phone: '+15550198', email: 'clara@huntsman.com' },
      { name: 'Dystar Colorants Corp', contact_person: 'Niels Bohr', phone: '+495551234', email: 'niels@dystar.de' },
      { name: 'Archroma Chemicals', contact_person: 'Alisha Patel', phone: '+91555789', email: 'alisha@archroma.in' }
    ];

    const { data: seededSuppliers, error: supErr } = await supabase.from('suppliers').insert(suppliersToSeed).select();
    if (supErr) throw new Error(`Supplier seeding failed: ${supErr.message}`);
    console.log('Seeded Suppliers.');

    // 10. Seed Inventory
    const archromaId = seededSuppliers.find(s => s.name === 'Archroma Chemicals')?.id || null;
    const huntsmanId = seededSuppliers.find(s => s.name === 'Huntsman Textile Effects')?.id || null;
    const dystarId = seededSuppliers.find(s => s.name === 'Dystar Colorants Corp')?.id || null;

    const inventoryToSeed = [
      { item_type: 'Chemical', item_name: 'Acetic Acid', quantity: 1200.0, unit: 'KG', threshold: 300.0, supplier_id: archromaId },
      { item_type: 'Chemical', item_name: 'Hydrogen Peroxide', quantity: 250.0, unit: 'KG', threshold: 500.0, supplier_id: archromaId }, // Low Stock!
      { item_type: 'Dye', item_name: 'Reactive Dye Green', quantity: 180.0, unit: 'KG', threshold: 50.0, supplier_id: huntsmanId },
      { item_type: 'Dye', item_name: 'Disperse Dye Blue', quantity: 30.0, unit: 'KG', threshold: 40.0, supplier_id: dystarId }, // Low Stock!
      { item_type: 'Fabric', item_name: 'Cotton Single Jersey Greige', quantity: 5000.0, unit: 'Meters', threshold: 1000.0, supplier_id: null },
      { item_type: 'Chemical', item_name: 'Soda Ash', quantity: 1500.0, unit: 'KG', threshold: 400.0, supplier_id: archromaId },
      { item_type: 'Chemical', item_name: 'Glauber Salt', quantity: 200.0, unit: 'KG', threshold: 500.0, supplier_id: archromaId }, // Low Stock!
      { item_type: 'Fabric', item_name: 'Polyester Interlock Greige', quantity: 800.0, unit: 'Meters', threshold: 1200.0, supplier_id: null } // Low Stock!
    ];

    const { error: invErr } = await supabase.from('inventory').insert(inventoryToSeed);
    if (invErr) throw new Error(`Inventory seeding failed: ${invErr.message}`);
    console.log('Seeded Inventory.');

    // 11. Seed Orders
    const cust1 = seededCustomers.find(c => c.name === 'TexStyle Solutions')?.id || null;
    const cust2 = seededCustomers.find(c => c.name === 'Apex Apparel Group')?.id || null;
    const cust3 = seededCustomers.find(c => c.name === 'Zarah Textiles')?.id || null;
    const cust4 = seededCustomers.find(c => c.name === 'Vogue Dyeing Co')?.id || null;
    const cust5 = seededCustomers.find(c => c.name === 'Global Fashion Brands')?.id || null;

    const fabCotton = seededFabrics.find(f => f.fabric_code === 'COT-01')?.id || null;
    const fabPoly = seededFabrics.find(f => f.fabric_code === 'POLY-01')?.id || null;
    const fabSilk = seededFabrics.find(f => f.fabric_code === 'SILK-01')?.id || null;
    const fabLinen = seededFabrics.find(f => f.fabric_code === 'LIN-01')?.id || null;
    const fabRayon = seededFabrics.find(f => f.fabric_code === 'RAY-01')?.id || null;

    const ordersToSeed = [
      { customer_id: cust1, order_no: 'ORD-2026-X101', fabric_type_id: fabCotton, color_name: 'Emerald Green', quantity_kg: 600, gsm: 180, width_inches: 1.8, length_meters: 2000, dye_type: 'Reactive Dye', status: 'Dyeing', delivery_date: '2026-06-20' },
      { customer_id: cust2, order_no: 'ORD-2026-X102', fabric_type_id: fabPoly, color_name: 'Sapphire Blue', quantity_kg: 800, gsm: 150, width_inches: 1.6, length_meters: 3500, dye_type: 'Disperse Dye', status: 'Washing', delivery_date: '2026-06-22' },
      { customer_id: cust3, order_no: 'ORD-2026-X103', fabric_type_id: fabSilk, color_name: 'Ruby Red', quantity_kg: 350, gsm: 80, width_inches: 1.2, length_meters: 1800, dye_type: 'Acid Dye', status: 'Quality Check', delivery_date: '2026-06-18' },
      { customer_id: cust4, order_no: 'ORD-2026-X104', fabric_type_id: fabLinen, color_name: 'Amber Gold', quantity_kg: 900, gsm: 240, width_inches: 2.0, length_meters: 4200, dye_type: 'Reactive Dye', status: 'Scheduled', delivery_date: '2026-06-25' },
      { customer_id: cust5, order_no: 'ORD-2026-X105', fabric_type_id: fabRayon, color_name: 'Classic Navy', quantity_kg: 1200, gsm: 200, width_inches: 1.8, length_meters: 5000, dye_type: 'Reactive Dye', status: 'Drying', delivery_date: '2026-06-28' },
      { customer_id: cust1, order_no: 'ORD-2026-X106', fabric_type_id: fabCotton, color_name: 'Jet Black', quantity_kg: 1500, gsm: 220, width_inches: 1.8, length_meters: 6500, dye_type: 'Reactive Dye', status: 'Pending', delivery_date: '2026-07-02' },
      { customer_id: cust2, order_no: 'ORD-2026-X107', fabric_type_id: fabPoly, color_name: 'Sapphire Blue', quantity_kg: 500, gsm: 140, width_inches: 1.6, length_meters: 2200, dye_type: 'Disperse Dye', status: 'Completed', delivery_date: '2026-06-12' },
      { customer_id: cust3, order_no: 'ORD-2026-X108', fabric_type_id: fabCotton, color_name: 'Emerald Green', quantity_kg: 700, gsm: 180, width_inches: 1.8, length_meters: 2500, dye_type: 'Reactive Dye', status: 'Completed', delivery_date: '2026-06-14' },
      { customer_id: cust4, order_no: 'ORD-2026-X109', fabric_type_id: fabSilk, color_name: 'Ruby Red', quantity_kg: 200, gsm: 70, width_inches: 1.2, length_meters: 1000, dye_type: 'Acid Dye', status: 'Delivered', delivery_date: '2026-06-05' },
      { customer_id: cust5, order_no: 'ORD-2026-X110', fabric_type_id: fabLinen, color_name: 'Classic Navy', quantity_kg: 400, gsm: 220, width_inches: 2.0, length_meters: 1500, dye_type: 'Reactive Dye', status: 'Delivered', delivery_date: '2026-06-08' }
    ];

    const { data: seededOrders, error: ordErr } = await supabase.from('orders').insert(ordersToSeed).select();
    if (ordErr) throw new Error(`Orders seeding failed: ${ordErr.message}`);
    console.log('Seeded Orders.');

    // 12. Seed Production Batches (matching active orders)
    const oGreen = seededOrders.find(o => o.order_no === 'ORD-2026-X101')?.id;
    const oBlue = seededOrders.find(o => o.order_no === 'ORD-2026-X102')?.id;
    const oRed = seededOrders.find(o => o.order_no === 'ORD-2026-X103')?.id;
    const oNavy = seededOrders.find(o => o.order_no === 'ORD-2026-X105')?.id;

    const mFongA = seededMachines.find(m => m.machine_code === 'MC-FONG-A')?.id;
    const mBraz = seededMachines.find(m => m.machine_code === 'MC-BRAZ-01')?.id;

    const rGreen = seededRecipes.find(r => r.name === 'Formula COT-EMERALD')?.id;
    const rBlue = seededRecipes.find(r => r.name === 'Formula POLY-SAPPHIRE')?.id;
    const rRed = seededRecipes.find(r => r.name === 'Formula COT-RUBY')?.id;
    const rNavy = seededRecipes.find(r => r.name === 'Formula COT-NAVY')?.id;

    const batchesToSeed = [
      { batch_no: 'BT-EMERALD-01', order_id: oGreen, machine_id: mFongA, operator_name: 'Robert Johnson', recipe_id: rGreen, status: 'Dyeing', started_at: '2026-06-17T08:00' },
      { batch_no: 'BT-SAPPHIRE-02', order_id: oBlue, machine_id: mBraz, operator_name: 'David Lee', recipe_id: rBlue, status: 'Washing', started_at: '2026-06-17T09:30' },
      { batch_no: 'BT-RUBY-03', order_id: oRed, machine_id: null, operator_name: 'Alice Cooper', recipe_id: rRed, status: 'Quality Check', started_at: '2026-06-17T07:15' },
      { batch_no: 'BT-NAVY-04', order_id: oNavy, machine_id: null, operator_name: 'Michael Chang', recipe_id: rNavy, status: 'Drying', started_at: '2026-06-17T06:30' }
    ];

    const { error: batchErr } = await supabase.from('production_batches').insert(batchesToSeed);
    if (batchErr) throw new Error(`Batch seeding failed: ${batchErr.message}`);
    console.log('Seeded Production Batches.');

    // 13. Seed Notifications & Activity Logs
    const notificationsToSeed = [
      { message: 'Vessel MC-FONG-A temperature reached critical stabilization point (95°C).', is_read: 0 },
      { message: 'Alert: GLAUBER SALT inventory level fell below safety threshold (200 KG remaining).', is_read: 0 },
      { message: 'New order ORD-2026-X106 submitted by customer TexStyle Solutions.', is_read: 0 }
    ];
    await supabase.from('notifications').insert(notificationsToSeed);

    const logsToSeed = [
      { action: 'Database re-seeded with factory demo values.' },
      { action: 'Production Scheduler initiated BATCH-EMERALD-01 on MC-FONG-A.' },
      { action: 'Inventory Manager adjusted Acetic Acid stock levels.' }
    ];
    await supabase.from('activity_logs').insert(logsToSeed);
    console.log('Seeded Notifications & Logs.');

    console.log('--- RE-SEED COMPLETED SUCCESSFULLY ---');
    return res.status(200).json({ success: true, message: 'Database has been cleared and seeded with fresh, high-fidelity textile production data.' });
  } catch (error) {
    console.error('Seeding error:', error);
    return res.status(500).json({ success: false, message: `Database seeding failed: ${error.message}` });
  }
};
