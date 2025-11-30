export function parseCSV(csvText) {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

  const data = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const values = parseCSVLine(line)

    if (values.length !== headers.length) {
      console.warn(`Line ${i + 1} has ${values.length} values but expected ${headers.length}`)
      continue
    }

    try {
      let coordinates = null
      const locationStr = values[headers.indexOf("Location")]?.trim()

      if (locationStr && locationStr !== '""' && locationStr !== "") {
        try {
          const cleanLocationStr = locationStr.replace(/^"|"$/g, "")
          const locationObj = JSON.parse(cleanLocationStr)

          if (
            locationObj &&
            typeof locationObj === "object" &&
            locationObj.lon !== undefined &&
            locationObj.lat !== undefined
          ) {
            const lon = Number(locationObj.lon)
            const lat = Number(locationObj.lat)

            if (!isNaN(lon) && !isNaN(lat) && isFinite(lon) && isFinite(lat)) {
              if (lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
                coordinates = [lon, lat]
              } else {
                console.warn(`Coordinates out of range for line ${i + 1}:`, { lon, lat })
              }
            } else {
              console.warn(`Invalid coordinate numbers for line ${i + 1}:`, { lon, lat })
            }
          } else {
            console.warn(`Invalid location object structure for line ${i + 1}:`, locationObj)
          }
        } catch (e) {
          console.warn(`Failed to parse location JSON for line ${i + 1}:`, locationStr, e)
        }
      }

      const record = {
        branch: parseInt(values[headers.indexOf("Branch")] || "0") || 0,
        docNo: values[headers.indexOf("Doc No")] || "",
        locationName: values[headers.indexOf("Location Name")] || "",
        deliveryDate: values[headers.indexOf("Delivery Date")] || "",
        locationAddress: values[headers.indexOf("Location Address")] || "",
        coordinates,
        lineItems: parseInt(values[headers.indexOf("Line Items")] || "0") || 0,
        fixedRoute: values[headers.indexOf("Fixed Route")] || "",
        totalValue: parseInt(values[headers.indexOf("Total Value")] || "0") || 0,
        visitStart: values[headers.indexOf("Visit Start")] || "",
        visitEnd: values[headers.indexOf("Visit End")] || "",
        duration: parseInt(values[headers.indexOf("Duration (Mins)")] || "0") || 0,
        status: values[headers.indexOf("Status")] || "",
      }

      data.push(record)
    } catch (error) {
      console.warn(`Error parsing line ${i + 1}:`, error)
    }
  }

  console.log(`Parsed ${data.length} records, ${data.filter((d) => d.coordinates).length} with valid coordinates`)
  return data
}

function parseCSVLine(line) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result.map((val) => val.replace(/^"|"$/g, ""))
}
