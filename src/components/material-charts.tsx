'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { BarChart, LineChart, PieChart, XAxis, YAxis, CartesianGrid, Bar, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { BiWeeklyCategory, DailyStats } from '@/lib/eps-api'
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart'


interface MaterialChartsProps {
  biWeeklyData: BiWeeklyCategory[]
  dailyStats: DailyStats[]
}

// Simple CSS-based Gauge Component
const GaugeChart = ({ value, max = 100 }: { value: number; max?: number }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  // Determine color based on value
  const getColor = (val: number) => {
    if (val <= 30) return '#10B981' // Green
    if (val <= 70) return '#F59E0B' // Orange
    return '#EF4444' // Red
  }

  const strokeDasharray = `${percentage * 1.8} 180`

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-48 h-24">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Value display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="font-bold text-2xl" style={{ color: getColor(percentage) }}>
            {Math.round(value)}
          </div>
        </div>
      </div>
      
      {/* Title */}
      <div className="mt-2 text-center">
        <div className="font-bold text-black text-lg">Overall Risk Score</div>
      </div>
    </div>
  )
}

export function MaterialCharts({ biWeeklyData, dailyStats }: MaterialChartsProps) {
  // Process bi-weekly data for charts
  const processBiWeeklyCharts = () => {
    // Calculate monthly kilometres from daily stats
    const monthlyKilometres = dailyStats.reduce((acc, stat) => {
      const month = new Date(stat.date).toLocaleString('en-US', { month: 'long' }).toUpperCase()
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += stat.total_distance
      return acc
    }, {} as Record<string, number>)

    // Get current month and create array from current month to December
    const currentMonth = new Date().getMonth() // 0-11 (January = 0)
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                       'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
    
    // Get months from current month to December
    const monthsFromCurrent = monthNames.slice(currentMonth)
    
    const monthlyData = monthsFromCurrent.map(month => ({
      month,
      kilometres: monthlyKilometres[month] || 0
    }))

    console.log('📊 Monthly Kilometres Data:', monthlyData)

    // Calculate average performance percentage of all drivers for risk score
    const averagePerformance = biWeeklyData.length > 0 
      ? biWeeklyData.reduce((sum, driver) => {
          const performanceScore = ((driver.total_points - driver.total_violations) / driver.total_points) * 100
          return sum + Math.max(0, performanceScore)
        }, 0) / biWeeklyData.length
      : 0

    // Calculate risk score (inverse of performance - lower performance = higher risk)
    const riskScore = Math.max(0, 100 - averagePerformance)
    
    console.log('📊 Risk Score Calculation:', {
      averagePerformance: averagePerformance.toFixed(2),
      riskScore: riskScore.toFixed(2),
      totalDrivers: biWeeklyData.length
    })

    // Process monthly statistics data for the table
    const monthlyStats = dailyStats.reduce((acc, stat) => {
      const month = new Date(stat.date).toLocaleString('en-US', { month: 'long' })
      if (!acc[month]) {
        acc[month] = {
          speeding: 0,
          harshBraking: 0,
          harshAccel: 0,
          excessiveDay: 0,
          excessiveNight: 0,
          nightDriving: 0,
          overRPM: 0,
          idleOver10min: 0,
          kilometres: 0,
          fleetSize: 0,
          vehiclesReporting: 0,
          vehiclesNotReporting: 0
        }
      }
      
      // Aggregate data
      acc[month].speeding += stat.speed_violations || 0
      acc[month].harshBraking += 0 // Not available in current data
      acc[month].harshAccel += 0 // Not available in current data
      acc[month].excessiveDay += 0 // Not available in current data
      acc[month].excessiveNight += stat.night_driving_violations || 0
      acc[month].nightDriving += stat.night_driving_hours || 0
      acc[month].overRPM += 0 // Not available in current data
      acc[month].idleOver10min += 0 // Not available in current data
      acc[month].kilometres += stat.total_distance || 0
      acc[month].fleetSize += 1 // Count unique drivers
      acc[month].vehiclesReporting += 1
      acc[month].vehiclesNotReporting += 0
      
      return acc
    }, {} as Record<string, any>)

    // Get months in order
    const monthOrder = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']
    
    console.log('📊 Monthly Stats Data:', monthlyStats)

    // Calculate total kilometres travelled bi-weekly
    const kilometresData = biWeeklyData.map(driver => ({
      driver: driver.driver_name,
      kilometres: driver.bi_weekly_distance,
      haulCategory: driver.haul_category
    }))

    return { monthlyData, riskScore, kilometresData, monthlyStats, monthOrder }
  }

  const { monthlyData, riskScore, kilometresData, monthlyStats, monthOrder } = processBiWeeklyCharts()

  // Calculate total kilometres by haul category
  const kilometresByCategory = kilometresData.reduce((acc, driver) => {
    const category = driver.haulCategory
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += driver.kilometres
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.entries(kilometresByCategory).map(([category, kilometres]) => ({
    category,
    kilometres,
    color: category === 'Long Haul' ? '#3B82F6' : 
           category === 'Medium Haul' ? '#10B981' : '#F59E0B'
  }))

  const chartConfig = {
    kilometres: { label: 'Kilometres', color: '#D4A574' },
    risk: { label: 'Risk', color: '#F59E0B' },
    speeding: { label: 'Speeding', color: '#8B5CF6' },
  }

  return (
    <div className="space-y-6">
      <div className="gap-6 grid grid-cols-3 auto-rows-min">
      {/* Monthly Kilometres - Real monthly data */}
      <Card className="p-6 h-[520px]">
        <h3 className="mb-4 font-semibold text-purple-800 text-lg text-center">Monthly Kilometres</h3>
        <div className="h-[420px]">
          <ChartContainer config={{ kilometres: chartConfig.kilometres }}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="kilometres" fill="var(--color-kilometres)" />
            </BarChart>
          </ChartContainer>
        </div>
      </Card>

      {/* Overall Risk Score - Gauge Chart */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-lg text-center">Overall Risk Score</h3>
        <div className="relative flex justify-center items-center h-64">
          <GaugeChart value={riskScore} max={100} />
        </div>
      </Card>

  {/* Top Speeding Drivers - Using daily violations data */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-lg text-center">Top Speeding Drivers</h3>
        <div className="flex justify-center items-center h-64">
          <ChartContainer config={{ speeding: chartConfig.speeding }}>
            <PieChart>
              <Tooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={dailyStats
                  .filter((stat) => stat.speed_violations > 0)
                  .sort((a, b) => b.speed_violations - a.speed_violations)
                  .slice(0, 6)
                  .map((stat, index) => ({
                    name: stat.driver_name,
                    value: stat.speed_violations,
                    fill: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6B7280'][index],
                  }))}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={60}
              >
                {dailyStats
                  .filter((stat) => stat.speed_violations > 0)
                  .sort((a, b) => b.speed_violations - a.speed_violations)
                  .slice(0, 6)
                  .map((stat, index) => (
                    <Cell key={`cell-${index}`} fill={['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6B7280'][index]} />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </Card>
      </div>

      {/* Large detailed Monthly Kilometres chart - full width */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-purple-800 text-lg text-center">Monthly Kilometres</h3>
        <div className="w-full h-[540px]">
          <ChartContainer config={{ kilometres: chartConfig.kilometres }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 40, right: 20, left: 20, bottom: 40 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5E0B7" />
                    <stop offset="100%" stopColor="#C7A96B" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => Number(v).toLocaleString()} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="kilometres" fill="url(#goldGrad)" radius={[12,12,12,12]} barSize={56}>
                  <LabelList dataKey="kilometres" position="top" formatter={(v: any) => Number(v).toLocaleString()} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  )
}
