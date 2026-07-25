exports.calculateFabricWeight = (req, res) => {
  try {
    const gsm = parseFloat(req.body.gsm);
    const width = parseFloat(req.body.width);
    const length = parseFloat(req.body.length);

    if (isNaN(gsm) || isNaN(width) || isNaN(length)) {
      return res.status(400).json({ success: false, message: 'Invalid inputs. GSM, Width, and Length must be numbers.' });
    }

    // Weight = (GSM * Width * Length) / 1000
    const weight = (gsm * width * length) / 1000;
    
    // Liquor ratio: 1:10 (1kg fabric needs 10L water)
    const waterRequirement = weight * 10;
    
    // Dye requirement: 2% average shade depth
    const dyeRequirement = weight * 0.02;

    // Processing Cost: $3.00 per KG
    const processingCost = weight * 3.00;

    res.json({
      success: true,
      data: {
        weight: Math.round(weight * 100) / 100,
        waterRequirement: Math.round(waterRequirement),
        dyeRequirement: Math.round(dyeRequirement * 1000) / 1000,
        processingCost: Math.round(processingCost * 100) / 100
      }
    });
  } catch (error) {
    console.error('Weight calculation error:', error);
    res.status(500).json({ success: false, message: 'Weight calculation failed.' });
  }
};

exports.calculateChemicalRequirement = (req, res) => {
  try {
    const weight = parseFloat(req.body.weight);
    const chemicalType = req.body.chemicalType; // Wetting Agent, Salt, Soda Ash, Acetic Acid, Hydrogen Peroxide

    if (isNaN(weight) || !chemicalType) {
      return res.status(400).json({ success: false, message: 'Invalid inputs. Weight and Chemical Type are required.' });
    }

    let ratio = 0.01; // default 1% wetting agent
    let costPerKg = 2.00;
    let instructions = 'Add slowly at room temperature before introducing dye pigments.';

    if (chemicalType === 'Acetic Acid') {
      ratio = 0.02;
      costPerKg = 1.65;
      instructions = 'Use in neutralizing wash bath after fixing dye to regulate final fabric pH to 5.5.';
    } else if (chemicalType === 'Reactive Dye') {
      ratio = 0.03;
      costPerKg = 12.80;
      instructions = 'Dissolve completely in warm water (50°C) before injecting into main dyeing chamber.';
    } else if (chemicalType === 'Salt') {
      ratio = 0.15;
      costPerKg = 0.45;
      instructions = 'Add in multiple stages to exhaust dye pigments evenly across cotton fibers.';
    } else if (chemicalType === 'Soda Ash') {
      ratio = 0.08;
      costPerKg = 0.85;
      instructions = 'Add gradually after exhausting dye to fix color pigment securely to fabric molecular chains.';
    } else if (chemicalType === 'Wetting Agent') {
      ratio = 0.01;
      costPerKg = 2.30;
      instructions = 'Add at the start of pretreatment cycle to ensure fabric molecular structures are evenly wet.';
    } else if (chemicalType === 'Hydrogen Peroxide') {
      ratio = 0.03;
      costPerKg = 3.20;
      instructions = 'Add during pre-bleaching phase at 90°C. CAUTION: Exothermic reaction, monitor pressure valves.';
    }

    const quantity = weight * ratio;
    const cost = quantity * costPerKg;

    res.json({
      success: true,
      data: {
        chemicalType,
        quantity: Math.round(quantity * 1000) / 1000,
        cost: Math.round(cost * 100) / 100,
        instructions
      }
    });
  } catch (error) {
    console.error('Chemical calculation error:', error);
    res.status(500).json({ success: false, message: 'Chemical calculation failed.' });
  }
};
