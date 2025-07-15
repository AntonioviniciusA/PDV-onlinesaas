// Utility function to calculate comparative price based on unit
export function calculateComparativePrice(price, quantity, measureUnit) {
  if (!price || !quantity || !measureUnit) return null;

  const pricePerUnit = price / quantity;

  // Convert to common unit for comparison (kg for weight, L for volume, etc.)
  let convertedPrice;
  switch (measureUnit.toLowerCase()) {
    case "kg":
    case "kilo":
      convertedPrice = pricePerUnit;
      break;
    case "g":
    case "grama":
      convertedPrice = pricePerUnit * 1000;
      break;
    case "l":
    case "litro":
      convertedPrice = pricePerUnit;
      break;
    case "ml":
    case "mililitro":
      convertedPrice = pricePerUnit * 1000;
      break;
    case "un":
    case "unidade":
      convertedPrice = pricePerUnit;
      break;
    default:
      convertedPrice = pricePerUnit;
  }

  return convertedPrice;
}

// Format price for display
export function formatPrice(price) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

// Convert between units
export function convertUnit(value, fromUnit, toUnit) {
  const conversions = {
    // Weight conversions
    g: { kg: 0.001, g: 1 },
    kg: { g: 1000, kg: 1 },
    // Volume conversions
    ml: { l: 0.001, ml: 1 },
    l: { ml: 1000, l: 1 },
    // Default
    un: { un: 1 },
  };

  const conversion = conversions[fromUnit]?.[toUnit];
  return conversion ? value * conversion : value;
}
