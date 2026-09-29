'use client';

import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

const HistoricalSeaLevelRiseExtended = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationStep, setAnimationStep] = useState(0); // 0: historical, 1: satellite + projection
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  // Function to calculate moving average
  const calculateMovingAverage = (data, windowSize) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
      const window = data.slice(start, end);
      const average = window.reduce((sum, item) => sum + item.value, 0) / window.length;
      result.push({
        ...data[i],
        movingAverage: average
      });
    }
    return result;
  };

  // Function to generate projected data
  const generateProjection = (lastDataPoint, endYear = 2050) => {
    const projection = [];
    const lastYear = lastDataPoint.year;
    const lastValue = lastDataPoint.value;
    const targetValue = lastValue + 25; // Exactly 25cm higher by 2050
    
    // Calculate the rate needed to reach 25cm by 2050
    const yearsDiff = endYear - lastYear;
    const rateOfChange = 25 / yearsDiff; // cm per year
    
    
    // Generate projection points every 1 year for smooth line
    for (let year = lastYear + 1; year <= endYear; year++) {
      const yearsFromStart = year - lastYear;
      const projectedValue = lastValue + (rateOfChange * yearsFromStart);
      projection.push({
        year: year,
        value: projectedValue,
        isProjection: true
      });
    }
    
    
    return projection;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch consolidated data
        const response = await fetch('/compiled_sea_level_rise_data.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        // Parse CSV with semicolon separator
        const allData = lines.map(line => {
          // Skip empty lines
          if (!line || line.trim() === '') return null;
          
          const values = line.split(';');
          // Check if we have at least 2 values
          if (values.length < 2 || !values[0] || !values[1]) return null;
          
          try {
            const year = parseFloat(values[0].replace(',', '.')); // Year
            const value = parseFloat(values[1].replace(',', '.')) / 10;  // mm converted to cm
            
          return {
              year: year,
              value: value
          };
          } catch (error) {
            console.warn('Error parsing line:', line, error);
            return null;
          }
        }).filter(item => 
          item !== null &&
          !isNaN(item.year) && 
          !isNaN(item.value) && 
          item.year >= 1000
        ).sort((a, b) => a.year - b.year);

        // Separate data by type
        const historicalData = allData.filter(d => d.year < 1993);
        const satelliteData = allData.filter(d => d.year >= 1993 && d.year < 2024);
        
        // Generate projection data from the last satellite data point
        const lastSatellitePoint = satelliteData[satelliteData.length - 1];
        const projectionData = generateProjection(lastSatellitePoint, 2050);
        
        // Combine historical and satellite data
        const combinedData = [...historicalData, ...satelliteData];
        
        // Log the data range for debugging
        const values = combinedData.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        setData({ 
          combined: combinedData, 
          historical: historicalData, 
          satellite: satelliteData,
          projection: projectionData,
          allData: allData
        });
        setLoading(false);
        
        // Start animation sequence - show satellite and projection together
        setTimeout(() => setAnimationStep(1), 1500); // Show satellite and projection data after 1.5s
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-lg">Loading historical sea level data...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      // fluid height: the chart shrinks with the window instead of pushing
      // the caption out of the section
      height: 'clamp(340px, 46vh, 520px)', 
      boxSizing: 'border-box', 
      pointerEvents: 'auto', 
      position: 'relative', 
      overflow: 'visible',
      zIndex: 1002,
      outline: 'none'
    }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        border: 'none',
        outline: 'none'
      }}>
        {/* White box to cover top line */}
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '0px',
          right: '0px',
          height: '3px',
          backgroundColor: 'white',
          zIndex: 10
        }} />
        
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.allData} margin={{ left: 0, right: 0, top: 20, bottom: 20 }}>
                         <defs>
               <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="rgba(59, 130, 246, 0.7)" />
                 <stop offset="60%" stopColor="rgba(59, 130, 246, 0.2)" />
                 <stop offset="85%" stopColor="rgba(59, 130, 246, 0.05)" />
                 <stop offset="100%" stopColor="transparent" />
               </linearGradient>
             </defs>
            <CartesianGrid 
              stroke="#e5e7eb"
              horizontal={true} 
              vertical={false}
            />
            

            <XAxis 
              dataKey="year"
              type="number"
              domain={[1000, 2050]}
              ticks={[1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2024, 2050]}
              tick={{ fontSize: 12, fill: '#666666', fontFamily: 'Helvetica World, Arial, sans-serif' }}
              style={{ fontFamily: 'Helvetica World, Arial, sans-serif' }}
              allowDataOverflow={false}
              scale="linear"
            />
            <YAxis 
              dx={0} 
              width={40} 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#666666', fontFamily: 'Helvetica World, Arial, sans-serif' }}
              style={{ fontFamily: 'Helvetica World, Arial, sans-serif' }}
              domain={[-20, 35]}
              ticks={[-20, -10, 0, 10]}
              tickFormatter={(value) => {
                return Math.round(value);
              }}
              hide={false}
              allowDataOverflow={false}
              scale="linear"
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0];
                  const year = Math.round(label);
                  const value = dataPoint.value;
                  const isProjection = dataPoint.payload?.isProjection || year >= 2025;
                  
                  return (
                    <div style={{
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '8px',
                      fontSize: '12px',
                      fontFamily: 'Helvetica World, Arial, sans-serif'
                    }}>
                      <div><strong>Year:</strong> {year}</div>
                      <div><strong>Sea Level:</strong> {value.toFixed(1)} cm</div>
                      {isProjection && <div style={{color: '#0066cc'}}><strong>Projection</strong></div>}
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Single continuous line that builds chronologically */}
            <Line 
              type="monotone" 
              dataKey="value" 
              data={animationStep >= 1 ? data.allData.filter(d => d.year < 2025) : data.combined.filter(d => d.year < 1993)}
              stroke="#000000" 
              strokeWidth={1}
              dot={(props) => {
                // Only show dots for specific years
                const year = Math.round(props.payload.year);
                if (year === 1880 || year === 1993) {
                  const tooltipText = year === 1880 ? "1880: Beginning of industrial revolution" : "1993: Satellite data";
                  
                  return (
                    <g key={`dot-${year}-${Math.round(props.payload.value * 100)}-${Math.random().toFixed(6)}`}>
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={8}
                        fill="#000000"
                        stroke="none"
                        onMouseEnter={(e) => {
                          setTooltip({
                            show: true,
                            text: tooltipText,
                            x: props.cx,
                            y: props.cy
                          });
                        }}
                        onMouseLeave={() => {
                          setTooltip({ show: false, text: '', x: 0, y: 0 });
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </g>
                  );
                }
                return null;
              }}
              activeDot={false}
              connectNulls={true}
              name="seaLevel"
            />
            
            {/* Area fill that follows the line shape with gradient - stops at 2024 */}
            {animationStep >= 1 && (
              <Area
                type="monotone"
                dataKey="value"
                data={data.allData.filter(d => d.year <= 2024)}
                fill="url(#areaGradient)"
                stroke="none"
                connectNulls={true}
                fillOpacity={1}
                baseValue={-20}
              />
            )}
            
            {/* Black projection line overlay - dashed */}
            {animationStep >= 1 && (
            <Line 
              type="monotone" 
              dataKey="value" 
                data={data.projection}
              stroke="#000000" 
                strokeWidth={1}
                strokeDasharray="2,2"
              dot={false}
                activeDot={false}
              connectNulls={true}
                name="projection"
              />
            )}
            {/* Zero reference line removed - gridline at y=0 is sufficient */}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Custom tooltip */}
        {tooltip.show && (
          <div
            style={{ 
              position: 'absolute',
              left: tooltip.x + 20,
              top: tooltip.y - 60,
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'Helvetica World, Arial, sans-serif',
              zIndex: 10000,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {tooltip.text}
          </div>
        )}
        
        {/* Y-axis label - positioned outside chart area */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          fontSize: 'clamp(9px, 1vw, 13px)',
          fontFamily: 'Helvetica World, Arial, sans-serif',
          color: '#666666',
          textAlign: 'left',
          pointerEvents: 'none',
          lineHeight: '1.2',
          letterSpacing: '0.04em',
          maxWidth: '45%'
        }}>
          GLOBAL MEAN SEA<br/>
          LEVEL (CM)
        </div>
        
        {/* X-axis label - positioned outside chart area on the right */}
        <div style={{
          position: 'absolute',
          right: 0,
          bottom: '5px',
          fontSize: 'clamp(9px, 1vw, 12px)',
          fontFamily: 'Helvetica World, Arial, sans-serif',
          color: '#666666',
          textAlign: 'right',
          pointerEvents: 'none'
        }}>
          Year
        </div>



      </div>
    </div>
  );
};

export default HistoricalSeaLevelRiseExtended;