const { supabase } = require('../config/db');

exports.getReportsData = async (req, res) => {
  try {
    const { type } = req.query; // daily, weekly, monthly, chemical, revenue, production, inventory

    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Completed orders
    const { data: completedData } = await supabase
      .from('orders')
      .select('id')
      .or('status.eq.Completed,status.eq.Delivered');
    const completedOrders = completedData ? completedData.length : 0;

    // Total quantity
    const { data: allOrders } = await supabase
      .from('orders')
      .select('quantity_kg');
    const totalQty = allOrders ? allOrders.reduce((sum, o) => sum + (o.quantity_kg || 0), 0) : 0;

    let reportTitle = 'Standard Operations Report';
    let summaryText = 'Overview of all operations.';
    let tableData = [];

    if (type === 'chemical') {
      reportTitle = 'Chemical Usage & Budget Report';
      summaryText = 'Analysis of chemical stock consumption and estimated expenses based on fabric dyeing throughput.';
      
      const { data: chemicals } = await supabase
        .from('chemicals')
        .select('name, quantity_per_kg, cost, usage_purpose');

      tableData = (chemicals || []).map(chem => {
        const totalUsed = totalQty * chem.quantity_per_kg;
        const totalCost = totalUsed * chem.cost;
        return {
          metric: chem.name,
          details: chem.usage_purpose,
          volume: Math.round(totalUsed * 10) / 10 + ' KG',
          financial: '$' + Math.round(totalCost * 100) / 100
        };
      });
    } else if (type === 'revenue') {
      reportTitle = 'Revenue & Financial Performance Report';
      summaryText = 'Overview of accounts receivable and processing profit estimations based on dyeing metrics.';
      
      // Use the aggregate view
      const { data: fabricRevenue } = await supabase
        .from('fabric_order_stats')
        .select('*');

      tableData = (fabricRevenue || []).map(item => {
        const name = item.label || 'Generic Blend';
        const revenue = item.value * 5.20;
        const chemicalCost = item.value * 1.10;
        const netProfit = revenue - chemicalCost;
        return {
          metric: name,
          details: `${Math.round(item.value)} KG processed`,
          volume: '$' + Math.round(revenue * 100) / 100,
          financial: '$' + Math.round(netProfit * 100) / 100
        };
      });
    } else if (type === 'production') {
      reportTitle = 'Production Efficiency & Machine Utility Report';
      summaryText = 'Analysis of dyeing machines capacity allocation, active operations, and cycles.';
      
      const { data: machines } = await supabase
        .from('machines')
        .select('name, machine_code, capacity, status');

      tableData = (machines || []).map(m => ({
        metric: m.machine_code,
        details: m.name,
        volume: m.capacity + ' KG Max',
        financial: m.status
      }));
    } else if (type === 'inventory') {
      reportTitle = 'Inventory Level & Threshold Alert Report';
      summaryText = 'Current balance of chemicals, dyestuffs, and fabric items in warehouses.';
      
      const { data: items } = await supabase
        .from('inventory')
        .select('item_name, item_type, quantity, unit, threshold');

      tableData = (items || []).map(i => {
        const status = i.quantity <= i.threshold ? 'LOW STOCK ALERT' : 'Normal';
        return {
          metric: i.item_name,
          details: i.item_type,
          volume: i.quantity + ' ' + i.unit,
          financial: status
        };
      });
    } else {
      const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'General';
      reportTitle = `${typeLabel} Operations Performance Report`;
      summaryText = `Detailed summary of dyeing factory logs. Total active workload: ${totalQty} KG.`;

      // Use the aggregate view
      const { data: statusCounts } = await supabase
        .from('order_status_breakdown')
        .select('*');

      tableData = (statusCounts || []).map(item => ({
        metric: item.status,
        details: `${item.count} orders registered`,
        volume: Math.round(item.qty || 0) + ' KG',
        financial: 'Active Track'
      }));
    }

    res.json({
      success: true,
      data: {
        title: reportTitle,
        summary: summaryText,
        totalOrders: totalOrders || 0,
        completedOrders,
        totalFabricWeight: totalQty,
        tableData
      }
    });
  } catch (error) {
    console.error('Reports endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report data.' });
  }
};
