'use client';

import React, { useState, useEffect } from 'react';


const NewChartComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Function to format numbers as K
  const formatAsK = (value) => {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`;
    }
    return value.toString();
  };

  // Function to hide 0 label on Y-axis and show whole numbers
  const hideZeroLabel = (value) => {
    if (value === 0) return '';
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`;
    }
    return value.toString();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/pacific_disaster_impact_cleaned.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        // Parse CSV data
        const rawData = lines.slice(1).map(line => {
          const values = line.split(';');
          return {
            year: parseInt(values[0]),
            country: values[1],
            affectedPeople: parseInt(values[2])
          };
        }).filter(item => !isNaN(item.year) && !isNaN(item.affectedPeople));
        
        
        // Sum affected people per year
        const yearTotals = {};
        rawData.forEach(item => {
          if (yearTotals[item.year]) {
            yearTotals[item.year] += item.affectedPeople;
          } else {
            yearTotals[item.year] = item.affectedPeople;
          }
        });
        
        
        // Convert to array format for chart
        const chartData = Object.keys(yearTotals)
          .map(year => ({
            year: parseInt(year),
            affectedPeople: yearTotals[year]
          }))
          .sort((a, b) => a.year - b.year);
        
        setData(chartData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Loading disaster data...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '450px', position: 'relative', paddingLeft: '26px' }}>
      <style>
        {`
          .recharts-bar-rectangle:hover {
            opacity: 0.8 !important;
            transition: opacity 0.2s ease !important;
          }
        `}
      </style>
      {/* Chart area with bars */}
      <div className="flex items-end justify-between h-[350px] relative" style={{ 
        transition: 'height 1.5s ease',
        marginLeft: '80px',
        marginRight: '20px'
      }}>
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((value, index) => (
          <div 
            key={index}
            className="absolute left-0 right-0 z-10" 
            style={{ 
              top: `${350 - (value * 280)}px`,
              height: '1px',
              background: '#e5e7eb'
            }}
          />
        ))}
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((value, index) => {
          const maxValue = data.length > 0 ? Math.max(...data.map(d => d.affectedPeople)) : 1;
          return (
            <div 
              key={index}
              className="absolute z-20" 
              style={{ 
                top: `${350 - (value * 280) - 8}px`,
                left: '-24px',
                fontSize: '12px',
                color: '#666666',
                fontFamily: 'Helvetica World, Arial, sans-serif'
              }}
            >
              {formatAsK(Math.round(value * maxValue))}
            </div>
          );
        })}
        
        {/* Zero line positioned directly under bars */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-black"></div>
       
        {data.map((item, index) => {
          // Use max value for scaling
          const maxValue = data.length > 0 ? Math.max(...data.map(d => d.affectedPeople)) : 1;
          
          // Simple linear scale
          const maxBarHeight = 280;
          const barHeight = (item.affectedPeople / maxValue) * maxBarHeight;
          const isHovered = hoveredIndex === index;
          const shouldReduceOpacity = hoveredIndex !== null && hoveredIndex !== index;
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                margin: '0 1px',
                transition: 'opacity 0.2s ease',
                opacity: shouldReduceOpacity ? 0.6 : 1,
                cursor: 'pointer',
                zIndex: isHovered ? 40 : 20,
              }}
            >

              
              {/* Bar */}
              <div className="relative flex justify-center" style={{ alignSelf: 'flex-end' }}>
                {/* Label above bar - only for blue bars */}
                {[2016, 2018, 2020].includes(item.year) && (
                  <div 
                    className="absolute z-30"
                    style={{ 
                      bottom: `${Math.max(barHeight, 1) + 10}px`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '11px',
                      color: '#000',
                      textAlign: 'center'
                    }}
                  >
                    {formatAsK(item.affectedPeople)}
                  </div>
                )}
                <div 
                  className="rounded-t-sm relative z-10"
                  style={{ 
                    height: `${Math.max(barHeight, 1)}px`,
                    width: 'calc(100% - 2px)',
                    // 19 bars at a 30px minimum overflowed the column on a
                    // phone and were silently clipped
                    minWidth: 'clamp(7px, 2.6vw, 30px)',
                    maxWidth: '120px',
                    minHeight: '1px',
                    transition: 'height 1.5s ease, background-color 0.2s ease, width 0.3s ease',
                    backgroundColor: isHovered ? 
                      ([2016, 2018, 2020].includes(item.year) ? 'rgba(29, 78, 216, 0.9)' : 'rgba(55, 65, 81, 0.9)') : 
                      ([2016, 2018, 2020].includes(item.year) ? 'rgba(59, 130, 246, 0.9)' : 'rgba(0, 0, 0, 0.9)')
                  }}
                />
              </div>
            </div>
          );
        })}
        
        {/* X-axis year labels */}
        {[2005, 2016, 2018, 2020, 2023].map((year, index) => {
          const yearIndex = data.findIndex(item => item.year === year);
          if (yearIndex === -1) return null; // Skip if year not in data
          
          return (
            <div 
              key={year}
              className="absolute z-20" 
              style={{ 
                bottom: '-30px',
                left: `${(yearIndex / (data.length - 1)) * 100}%`,
                transform: 'translateX(-50%)',
                fontSize: '12px',
                color: '#666666',
                fontFamily: 'Helvetica World, Arial, sans-serif',
                textAlign: 'center',
                width: 'clamp(16px, 3.5vw, 40px)'
              }}
            >
              {year}
            </div>
          );
        })}
          
      </div>
      
      {/* Y-axis label - positioned outside chart area */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        fontSize: 'clamp(9px, 1vw, 13px)',
        fontFamily: 'Helvetica World, Arial, sans-serif',
        color: '#666666',
        textAlign: 'right',
        pointerEvents: 'none',
        lineHeight: '1.2',
        maxWidth: '45%'
      }}>
        PEOPLE AFFECTED BY<br/>
        CLIMATE-RELATED HAZARDS
      </div>
      

      
    </div>
  );
};

export default NewChartComponent; 