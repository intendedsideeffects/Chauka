'use client';

import { useState, useEffect } from 'react';
import { CHART_DIMENSIONS, GLOBAL_SEA_LEVEL_RISE } from './SeaLevelRiseChartConstants';

/** A round parameter button (warming level / target year). */
function CircleButton({ label, selected, onClick, small = false, offset = false }) {
  const dim = small ? 'clamp(44px, 5.5vw, 66px)' : 'clamp(56px, 7vw, 86px)';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        width: dim,
        height: dim,
        borderRadius: '50%',
        border: `1px solid ${selected ? '#000000' : '#9ca3af'}`,
        background: selected ? 'rgba(0, 0, 0, 0.9)' : '#ffffff',
        color: selected ? '#ffffff' : '#000000',
        fontSize: small ? 'clamp(10px, 1.1vw, 12px)' : 'clamp(11px, 1.2vw, 14px)',
        fontWeight: 700,
        cursor: 'pointer',
        flexShrink: 0,
        transform: offset ? 'translateY(clamp(6px, 1.2vh, 14px))' : 'none',
        transition: 'background 0.2s ease, color 0.2s ease',
        fontFamily: 'Helvetica World, Arial, sans-serif',
      }}
    >
      {label}
    </button>
  );
}

const SeaLevelRiseChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDegree, setSelectedDegree] = useState('2');
  const [selectedYear, setSelectedYear] = useState('2050');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Coastal_Elevation_Exposure__Comma_Format_.csv');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        // Parse CSV with semicolon separator
        const lines = csvText.trim().split('\n');
        
        const parsedData = lines.slice(1).map(line => {
          const values = line.split(';');
          return {
            country: values[0],
            threshold: parseFloat(values[1].replace(',', '.')),
            seaLevelRise2Degree2050: parseFloat(values[2].replace(',', '.')),
            seaLevelRise2Degree2100: parseFloat(values[3].replace(',', '.')),
            seaLevelRise4Degree2050: parseFloat(values[4].replace(',', '.')),
            seaLevelRise4Degree2100: parseFloat(values[5].replace(',', '.'))
          };
        }).filter(item => !isNaN(item.seaLevelRise2Degree2050));
        
        setData(parsedData);
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading sea level rise data...</div>
      </div>
    );
  }

  // Get the selected data based on user choices
  const getSelectedData = () => {
    const columnName = `seaLevelRise${selectedDegree}Degree${selectedYear}`;
    return data.map(item => ({
      ...item,
      selectedValue: item[columnName]
    }));
  };

  const selectedData = getSelectedData();
  const currentGlobalRise = GLOBAL_SEA_LEVEL_RISE[selectedYear][selectedDegree];

                             return (
              <div className="w-full bg-transparent relative" style={{...CHART_DIMENSIONS.container, pointerEvents: 'auto', padding: '0 30px'}}>
                                                                                                                        {/* Parameter controls.

                      They used to be scattered with fixed pixel offsets outside
                      the chart box, which put them off-screen or on top of the
                      chart on anything but one specific window size. Now they
                      are a right-aligned cluster above the chart. */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 'clamp(8px, 1.6vw, 20px)',
                      marginBottom: 'clamp(12px, 3vh, 34px)',
                      pointerEvents: 'auto',
                    }}
                  >
                    <span
                      style={{
                        marginRight: 'auto',
                        fontSize: 'clamp(9px, 1vw, 12px)',
                        letterSpacing: '0.06em',
                        color: '#666666',
                        fontFamily: 'Helvetica World, Arial, sans-serif',
                      }}
                    >
                      SELECT WARMING AND YEAR
                      <span style={{ display: 'block', marginTop: '4px', letterSpacing: 0, color: '#000000' }}>
                        Global sea level rise: <strong>{currentGlobalRise.toFixed(2)}m</strong>
                      </span>
                    </span>
                    <CircleButton label="2°C" selected={selectedDegree === '2'} onClick={() => setSelectedDegree('2')} small />
                    <CircleButton label="4°C" selected={selectedDegree === '4'} onClick={() => setSelectedDegree('4')} small offset />
                    <CircleButton label="2050" selected={selectedYear === '2050'} onClick={() => setSelectedYear('2050')} />
                    <CircleButton label="2100" selected={selectedYear === '2100'} onClick={() => setSelectedYear('2100')} offset />
                  </div>

                                                           <div>

                             <div className="relative" style={{ width: '100%', height: '100%' }}>
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
                     SEA LEVEL RISE<br/>
                     IN METERS (M)
                   </div>
                   
                   {/* Extended line across the chart */}
                    <div className="absolute left-0 right-0 z-25" style={{ 
                       top: `${350 - (currentGlobalRise / 1.0) * 280}px`
                    }}>
                      <div className="border-t border-gray-400" style={{ height: '1px' }}></div>
                    </div>

                   {/* Horizontal gridlines */}
                   {[0, 0.5, 1.0].map((value, index) => (
                     <div 
                       key={index}
                       className="absolute left-0 right-0 z-15" 
                       style={{ 
                         top: `${350 - (value / 1.0) * 280}px`
                       }}
                     >
                       <div className="border-t border-gray-200" style={{ height: '1px' }}></div>
                     </div>
                   ))}

                   {/* Y-axis labels */}
                   {[0, 0.5, 1.0].map((value, index) => (
                     <div 
                       key={index}
                       className="absolute z-20" 
                       style={{ 
                         top: `${350 - (value / 1.0) * 280 - 8}px`,
                         left: '-25px',
                         fontSize: '12px',
                         color: '#666666',
                         fontFamily: 'Helvetica World, Arial, sans-serif'
                       }}
                     >
                       {value.toFixed(1)}
                     </div>
                   ))}

                   {/* Chart area with bars */}
      <div className="flex items-end justify-between h-[350px] relative" style={{ transition: 'height 1.5s ease' }}>
        {/* Dynamic blue gradient rectangle behind bars */}
        <div 
                                     className="absolute left-0 right-0 z-20"
          style={{
            top: `${350 - (currentGlobalRise / 1.0) * 280}px`,
            height: `${(currentGlobalRise / 1.0) * 280}px`,
            background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)',
            border: 'none'
          }}
        />
        {/* Zero line positioned directly under bars */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-black"></div>
       
        {selectedData.map((item, index) => {
          const barHeight = (item.selectedValue / 1.0) * 280;
          const globalLineHeight = (currentGlobalRise / 1.0) * 280;
          const isAboveGlobal = item.selectedValue > currentGlobalRise;
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
                {isAboveGlobal ? (
                  <div 
                    className="bg-blue-500 rounded-t-sm hover:bg-blue-600 relative z-10"
                    style={{ 
                      height: `${barHeight}px`,
                      minHeight: '30px',
                      width: 'clamp(18px, 4.5vw, 60px)',
                      transition: 'height 1.5s ease, background-color 0.2s ease',
                      backgroundColor: isHovered ? 'rgba(29, 78, 216, 0.9)' : 'rgba(59, 130, 246, 0.9)'
                    }}
                  />
                ) : (
                  <div 
                    className="bg-blue-500 rounded-t-sm hover:bg-blue-600 relative z-10"
                    style={{ 
                      height: `${barHeight}px`,
                      minHeight: '30px',
                      width: 'clamp(18px, 4.5vw, 60px)',
                      opacity: '0.5',
                      transition: 'height 1.5s ease, background-color 0.2s ease',
                      backgroundColor: isHovered ? 'rgba(29, 78, 216, 0.9)' : 'rgba(59, 130, 246, 0.9)'
                    }}
                  />
                )}
              </div>
              

            </div>
          );
        })}
      </div>
      
      {/* Labels positioned above bars */}
      {selectedData.map((item, index) => {
        const barHeight = (item.selectedValue / 1.0) * 280;
        const isHovered = hoveredIndex === index;
        const shouldReduceOpacity = hoveredIndex !== null && hoveredIndex !== index;
        
        return (
          <div 
            key={`label-${index}`}
            style={{
              position: 'absolute',
              top: `${350 - barHeight - 40}px`,
              left: `${(index / selectedData.length) * 100}%`,
              width: `${100 / selectedData.length}%`,
              textAlign: 'center',
              transition: 'opacity 0.2s ease',
              opacity: 1,
              zIndex: 200,
              pointerEvents: 'none'
            }}
          >
            <div className="bar-label" style={{ color: '#000', fontWeight: '500' }}>
              <div>{item.country}</div>
              <div style={{ marginTop: '2px' }}>{item.selectedValue.toFixed(2)}m</div>
            </div>
          </div>
        );
      })}
        
             </div>
      </div>
    </div>
  );
};

export default SeaLevelRiseChart; 