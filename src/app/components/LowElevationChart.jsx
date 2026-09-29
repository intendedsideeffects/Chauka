'use client';
import React, { useState, useEffect } from 'react';

const LowElevationChart = () => {
  const [lowElevationData, setLowElevationData] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/pop_low_el.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n');
        
        const data = lines.slice(1).filter(line => line.trim() !== '').map(line => {
          const values = line.split(';');
          return {
            country: values[0], // Pacific Island Countries and territories
            elevation: values[1], // ELEVATION
            elevationDesc: values[2], // Elevation
            timePeriod: values[3], // TIME_PERIOD
            obsValue: parseFloat(values[4]) || 0, // OBS_VALUE
            highestElevation: parseFloat(values[5]) || 0 // Island highest elevation
          };
        });

        // Filter for 0-5 meters elevation data and get top 9
        // Log raw data to check structure
        
        // Filter for 5M elevation, remove empty entries, and get top 9
        const lowElevation = data
          .filter(item => item.elevation === '5M' && item.country && item.obsValue)
          .map(item => ({
            "Pacific Island Countries and territories": item.country.replace(" (Federated States of)", ""),
            OBS_VALUE: parseFloat(item.obsValue)  // Make sure it's a number
          }))
          .sort((a, b) => b.OBS_VALUE - a.OBS_VALUE)
          .slice(0, 9);
        

        setLowElevationData(lowElevation);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, []);



    return (
    <div style={{ width: '100%', height: '450px', position: 'relative', paddingLeft: '26px' }}>
      {/* Y-axis annotation */}
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
        POPULATIONS LIVING 0-5M<br/>
        ABOVE SEA LEVEL (%)
      </div>
      
      {/* Chart area with bars */}
      <div className="flex items-end justify-between h-[350px] relative mx-4" style={{ transition: 'height 1.5s ease' }}>
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
              {Math.round(value * 100)}
            </div>
          );
        })}
        
        {/* Zero line positioned directly under bars */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-black"></div>
       
        {lowElevationData.map((item, index) => {
          // Use 100 as max value for scaling
          const maxValue = 100;
          
          // Simple linear scale with minimum height for very small values
          const minBarHeight = 10; // Minimum 10px height for visibility
          const maxBarHeight = 280;
          const linearHeight = (item.OBS_VALUE / maxValue) * maxBarHeight;
          const barHeight = Math.max(linearHeight, minBarHeight);
          const isHovered = hoveredIndex === index;
          const shouldReduceOpacity = hoveredIndex !== null && hoveredIndex !== index;
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1 mx-1"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transition: 'opacity 0.2s ease',
                opacity: shouldReduceOpacity ? 0.4 : 1,
                cursor: 'pointer',
                zIndex: isHovered ? 40 : 20
              }}
            >
              {/* Bar */}
              <div className="relative flex justify-center">
                <div 
                  className="rounded-t-sm relative z-10"
                  style={{ 
                    height: '280px',
                    width: 'clamp(18px, 4.5vw, 60px)',
                    transition: 'height 0.4s ease, background-color 0.05s ease',
                    background: 'rgba(0, 0, 0, 0.9)'
                  }}
                />
                {/* Blue percentage overlay */}
                <div 
                  className="absolute rounded-t-sm z-20"
                  style={{ 
                    height: `${(item.OBS_VALUE / 100) * 280}px`,
                    width: 'clamp(18px, 4.5vw, 60px)',
                    background: 'rgba(0, 102, 204, 0.9)',
                    bottom: '0'
                  }}
                />
                {/* Percentage label inside bar at bottom */}
                <div 
                  className="absolute z-30"
                  style={{ 
                    bottom: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '11px',
                    color: 'rgba(153, 204, 255, 0.9)',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}
                >
                  {Math.round(item.OBS_VALUE)}%
                </div>
              </div>
              

            </div>
          );
        })}
      </div>
      
      {/* Country names below x-axis */}
      <div className="flex items-end justify-between relative mx-4 mt-4">
        {lowElevationData.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center flex-1 mx-1 bar-label"
            style={{ 
              textAlign: 'center',
              color: '#000',
              width: 'clamp(18px, 4.5vw, 60px)'
            }}
          >
            {item["Pacific Island Countries and territories"]}
          </div>
        ))}
      </div>

    </div>
  );
};

export default LowElevationChart; 