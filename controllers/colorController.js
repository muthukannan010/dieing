const { supabase } = require('../config/db');

exports.getColorList = async (req, res) => {
  try {
    const { data: list, error } = await supabase
      .from('colors')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Fetch color list error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve colors database.' });
  }
};

exports.getColorMatchingDetails = (req, res) => {
  try {
    const { hex } = req.query; // e.g. '#50C878'
    if (!hex || hex.length !== 7 || !hex.startsWith('#')) {
      return res.status(400).json({ success: false, message: 'Invalid Hex Code.' });
    }

    // Convert hex to HSL for mathematical offsets
    const { h, s, l } = hexToHsl(hex);

    // Complementary color is 180 degrees opposite on color wheel
    const compHue = (h + 180) % 360;
    const complementaryHex = hslToHex(compHue, s, l);

    // Analogous colors are 30 degrees adjacent on color wheel
    const analogous1Hex = hslToHex((h + 30) % 360, s, l);
    const analogous2Hex = hslToHex((h + 330) % 360, s, l);

    // Generate shades (lighten & darken)
    const shadeLight = hslToHex(h, s, Math.min(l + 20, 95));
    const shadeMedium = hex;
    const shadeDark = hslToHex(h, s, Math.max(l - 20, 5));

    res.json({
      success: true,
      data: {
        hex,
        hsl: `hsl(${h}, ${s}%, ${l}%)`,
        complementary: complementaryHex,
        analogous: [analogous1Hex, analogous2Hex],
        shades: {
          light: shadeLight,
          medium: shadeMedium,
          dark: shadeDark
        }
      }
    });
  } catch (error) {
    console.error('Color match error:', error);
    res.status(500).json({ success: false, message: 'Color matching calculation failed.' });
  }
};

// Helper converters
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = x => {
    const hex = Math.round((x + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
