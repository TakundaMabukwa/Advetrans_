export const getVehicleTollClass = (vehicleType) => {
  const vehicleClassMap = {
    // Light vehicles
    'bakkie': 'class1',
    'car': 'class1',
    'suv': 'class1',
    'van': 'class1',
    
    // 2-Axle Heavy Vehicles
    'truck': 'class2',
    'delivery': 'class2',
    'rigid truck': 'class2',
    
    // 3-4 Axle Heavy Vehicles  
    'articulated truck': 'class3',
    'semi-trailer': 'class3',
    'horse and trailer': 'class3',
    'tipper truck': 'class3',
    
    // 5+ Axle Heavy Vehicles
    'super link': 'class4',
    'b-double': 'class4',
    'road train': 'class4',
    'interlink': 'class4'
  }
  
  const normalizedType = vehicleType?.toLowerCase() || ''
  
  // Check for exact matches first
  if (vehicleClassMap[normalizedType]) {
    return vehicleClassMap[normalizedType]
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(vehicleClassMap)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return value
    }
  }
  
  // Default to Class 2 for unknown heavy vehicles
  return 'class2'
}