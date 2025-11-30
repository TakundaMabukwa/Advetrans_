export const TOLL_RATES = {
  // N1 Route
  'N1 Huguenot': { class2: 126.96, class3: 260.00, class4: 322.61 },
  'N1 Verkeerdevlei': { class2: 132.17, class3: 199.13, class4: 279.13 },
  'N1 Vaal': { class2: 145.22, class3: 173.91, class4: 232.17 },
  'N1 Grasmere': { class2: 69.57, class3: 80.00, class4: 106.09 },
  'N1 Carousel': { class2: 170.43, class3: 187.83, class4: 216.52 },
  'N1 Kranskop': { class2: 132.17, class3: 176.52, class4: 216.52 },
  'N1 Nyl': { class2: 125.22, class3: 151.30, class4: 202.61 },
  'N1 Capricorn': { class2: 147.83, class3: 172.17, class4: 215.65 },
  'N1 Baobab': { class2: 141.74, class3: 194.78, class4: 233.91 },
  
  // N2 Route
  'N2 Tsitsikamma': { class2: 154.78, class3: 368.70, class4: 521.74 },
  'N2 Oribi': { class2: 60.87, class3: 83.48, class4: 136.52 },
  'N2 Mtunzini': { class2: 102.61, class3: 122.61, class4: 182.61 },
  
  // N3 Route
  'N3 Mooi': { class2: 143.48, class3: 200.87, class4: 272.17 },
  'N3 Tugela': { class2: 138.26, class3: 218.26, class4: 301.74 },
  'N3 Wilge': { class2: 134.78, class3: 180.00, class4: 255.65 },
  'N3 De Hoek': { class2: 87.83, class3: 133.91, class4: 193.04 },
  
  // N4 Route
  'N4 Swartruggens': { class2: 216.52, class3: 262.61, class4: 308.70 },
  'N4 Diamond Hill': { class2: 59.13, class3: 111.30, class4: 185.22 },
  'N4 Middelburg': { class2: 153.04, class3: 233.04, class4: 306.09 },
  'N4 Machado': { class2: 293.91, class3: 428.70, class4: 612.17 },
  'N4 Nkomazi': { class2: 162.61, class3: 235.65, class4: 340.00 },
  
  // N17 Route
  'N17 Leandra': { class2: 106.96, class3: 160.00, class4: 212.17 },
  'N17 Ermelo': { class2: 95.65, class3: 142.61, class4: 190.43 }
}

export const getTollCost = (tollName, vehicleClass = 'class2') => {
  const rates = TOLL_RATES[tollName]
  if (!rates) {
    // Default costs by class if toll not found
    const defaults = { class1: 15, class2: 50, class3: 80, class4: 120 }
    return defaults[vehicleClass] || 50
  }
  
  return rates[vehicleClass] || rates.class2
}