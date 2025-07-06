// Utilitário para conversão de unidades e cálculo de preços comparativos

export interface UnitConversion {
  from: string
  to: string
  factor: number
}

export const UNIT_CONVERSIONS: UnitConversion[] = [
  // Volume
  { from: "ml", to: "l", factor: 0.001 },
  { from: "l", to: "ml", factor: 1000 },
  { from: "cl", to: "l", factor: 0.01 },
  { from: "dl", to: "l", factor: 0.1 },

  // Peso
  { from: "g", to: "kg", factor: 0.001 },
  { from: "kg", to: "g", factor: 1000 },
  { from: "mg", to: "kg", factor: 0.000001 },

  // Área
  { from: "cm2", to: "m2", factor: 0.0001 },
  { from: "m2", to: "cm2", factor: 10000 },
]

export const STANDARD_UNITS = {
  volume: "l",
  weight: "kg",
  area: "m2",
  length: "m",
  unit: "un",
}

export const UNIT_CATEGORIES = {
  volume: ["ml", "cl", "dl", "l"],
  weight: ["mg", "g", "kg"],
  area: ["cm2", "m2"],
  length: ["mm", "cm", "m"],
  unit: ["un", "pct", "cx"],
}

export function getUnitCategory(unit: string): string {
  for (const [category, units] of Object.entries(UNIT_CATEGORIES)) {
    if (units.includes(unit)) {
      return category
    }
  }
  return "unit"
}

export function getStandardUnit(unit: string): string {
  const category = getUnitCategory(unit)
  return STANDARD_UNITS[category as keyof typeof STANDARD_UNITS] || "un"
}

export function convertToStandardUnit(value: number, fromUnit: string): number {
  const standardUnit = getStandardUnit(fromUnit)

  if (fromUnit === standardUnit) {
    return value
  }

  const conversion = UNIT_CONVERSIONS.find((c) => c.from === fromUnit && c.to === standardUnit)

  if (conversion) {
    return value * conversion.factor
  }

  return value
}

export function calculateComparativePrice(
  price: number,
  quantity: number,
  unit: string,
): { standardPrice: number; standardUnit: string; comparison: string } {
  const standardUnit = getStandardUnit(unit)
  const standardQuantity = convertToStandardUnit(quantity, unit)

  if (standardQuantity === 0) {
    return {
      standardPrice: 0,
      standardUnit,
      comparison: "",
    }
  }

  const standardPrice = price / standardQuantity

  let comparison = ""
  if (standardUnit !== unit && standardQuantity !== quantity) {
    comparison = `R$ ${standardPrice.toFixed(2)}/${standardUnit}`
  }

  return {
    standardPrice,
    standardUnit,
    comparison,
  }
}

export function formatComparison(price: number, quantity: number, unit: string, productName: string): string {
  const { comparison } = calculateComparativePrice(price, quantity, unit)

  if (!comparison) return ""

  // Exemplos de comparação
  const category = getUnitCategory(unit)

  if (category === "volume") {
    return `${comparison} • Comparativo por litro`
  } else if (category === "weight") {
    return `${comparison} • Comparativo por kg`
  }

  return comparison
}
