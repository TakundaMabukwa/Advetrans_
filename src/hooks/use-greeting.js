export const getGreeting = (name) => {
  const now = new Date()
  const hour = now.getHours()

  if (hour >= 5 && hour < 12) {
    return `Good morning, ${name}`
  } else if (hour >= 12 && hour < 17) {
    return `Good afternoon, ${name}`
  } else if (hour >= 17 && hour < 21) {
    return `Good evening, ${name}`
  } else {
    return `Good day, ${name}`
  }
}
