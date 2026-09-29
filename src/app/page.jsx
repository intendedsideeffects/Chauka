'use client';

import React, { useState, useRef, useEffect } from 'react';
import InteractiveStarGlobe from './components/InteractiveStarGlobe';
import InteractiveStarGlobeYellow from './components/InteractiveStarGlobeYellow';
import TitleSection from '../components/sections/TitleSection';
import SegmentTemplate from '../components/sections/SegmentTemplate';
import SeaLevelRiseChart from './components/SeaLevelRiseChart';
import HistoricalSeaLevelRiseExtended from './components/HistoricalSeaLevelRiseExtended';
import NewChartComponent from './components/NewChartComponent';
import HighestElevationChart from './components/HighestElevationChart';
import LowElevationChart from './components/LowElevationChart';
import StoryDots from './components/StoryDots';

export default function ChaukaStory() {
  const [showLepeyamTooltip, setShowLepeyamTooltip] = useState(false);
  const [showChaukaTooltip, setShowChaukaTooltip] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicAudioLoaded, setMusicAudioLoaded] = useState(false);
  const [musicAudioError, setMusicAudioError] = useState(false);
  const [musicAudioElement, setMusicAudioElement] = useState(null);
  const oceanVideoRef = useRef();

  // Ensure ocean video is always muted
  useEffect(() => {
    if (oceanVideoRef.current) {
      oceanVideoRef.current.muted = true;
      oceanVideoRef.current.volume = 0;
    }
  }, []);

  // Music button functions
  const handleMusicToggle = () => {
    if (!musicAudioElement) {
      return;
    }
    
    if (musicAudioElement) {
      if (musicPlaying) {
        musicAudioElement.pause();
      } else {
        musicAudioElement.play().catch(error => {
        });
      }
    }
  };

  const handleMusicStateChange = ({ playing: newPlaying, audioLoaded: newAudioLoaded, audioError: newAudioError }) => {
    setMusicPlaying(newPlaying);
    setMusicAudioLoaded(newAudioLoaded);
    setMusicAudioError(newAudioError);
  };

  const handleMusicAudioRef = (audio) => {
    setMusicAudioElement(audio);
  };

  return (
    <div className="scroll-root" style={{ scrollSnapType: 'y mandatory', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
      {/* Video Section */}
      <section className="full-section" style={{ 
        position: 'relative', 
        width: '100%', 
        background: '#000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        scrollSnapAlign: 'start'
      }}>
        {/* Segment Number */}

        {/* Star Globe as background */}
        <InteractiveStarGlobe />
        {/* Ocean video + scene artwork share one box (see .scene-stage in globals.css),
            so the hotspots below can be positioned in % of the artwork. */}
        <div className="scene-stage" style={{ zIndex: 2 }}>
          <div className="scene-box">
            <video
              ref={oceanVideoRef}
              src="/ocean.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={(e) => console.error('Ocean video error:', e)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 59.7%, black 60.7%, black 100%)',
                maskImage: 'linear-gradient(to bottom, transparent 59.7%, black 60.7%, black 100%)',
              }}
            />
            <img
              src="/scene.png"
              alt="A Chauka bird on a branch above traditional Manus canoes on the ocean"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                pointerEvents: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            />

            {/* Speech bubble - sits just above the canoes, in % of the artwork */}
            <div
              className="scene-hotspot"
              style={{
                left: '42%',
                top: '48%',
                width: 'clamp(92px, 13%, 260px)',
                containerType: 'inline-size',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            >
              <img
                src="/speechbubble.svg"
                alt=""
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#333',
                  fontSize: 'clamp(6.5px, 8cqw, 13px)',
                  fontWeight: 500,
                  textAlign: 'center',
                  fontFamily: 'Helvetica World, Arial, sans-serif',
                  width: '86%',
                  lineHeight: 1.15,
                }}
              >
                Can you find<br />
                the Southern Cross?<br />
                Drag sky to explore.
              </div>
            </div>

            {/* Bird audio hotspot - stays on the bird at every screen size.
                20.5% / 30.5% is where the Chauka sits inside scene.png. */}
            <div
              className="scene-hotspot"
              style={{ left: '20.5%', top: '30.5%', zIndex: 6 }}
            >
              <BirdAudioPlayer />
            </div>
          </div>
        </div>

        {/* Story button, top right */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(16px, 8vh, 120px)',
            right: 'clamp(16px, 8vw, 120px)',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          <button
            style={{
              width: 'clamp(150px, 22vw, 300px)',
              height: 'clamp(150px, 22vw, 300px)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            onClick={() => setShowChaukaTooltip(true)}
            aria-label="Click for story"
          >
            <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
              <defs>
                <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="40" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <path id="circlePath" d="M150,75 A75,75 0 1,1 149.99,75" />
              </defs>
              <circle cx="150" cy="150" r="40" fill="#cad6fa" style={{ filter: 'url(#glow)' }} />
              <circle cx="150" cy="150" r="50" fill="transparent" style={{ filter: 'url(#glow)', animation: 'pulse 2s ease-in-out infinite', opacity: 0.2 }} />
              <text fill="#94a0c4" fontSize="18" fontWeight="normal" letterSpacing="0.08em">
                <textPath xlinkHref="#circlePath" startOffset="0%" textAnchor="start" dominantBaseline="middle">
                  Click for story!
                </textPath>
              </text>
            </svg>
          </button>
        </div>

        {/* Ocean sound button, bottom left */}
        <div style={{ position: 'absolute', left: 'clamp(8px, 3vw, 40px)', bottom: 'clamp(44px, 7vh, 60px)', zIndex: 1000, pointerEvents: 'auto' }}>
          <BlueCircleAudioPlayer />
        </div>

        {/* Project attribution on video */}
        <div style={{ 
          position: 'absolute', 
          bottom: 'clamp(10px, 2vh, 20px)', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 1000, 
          pointerEvents: 'auto',
          width: '100%',
          padding: '0 1rem',
        }}>
          <div style={{
            fontSize: 'clamp(0.7rem, 1.6vw, 1rem)',
            color: '#676b8b',
            fontWeight: 400,
            textAlign: 'center'
          }}>
            Storytelling by Bertha <a href="https://www.linkedin.com/in/bertha-ngahan-a9b405145/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#676b8b', fontWeight: 'bold' }}>Ngahan</a> | Visualization by Janina <a href="https://www.linkedin.com/in/j-grauel/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#676b8b', fontWeight: 'bold' }}>Grauel</a>
          </div>
        </div>
      </section>

      {/* Chauka Story Tooltip */}
      {showChaukaTooltip && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          color: '#000',
          padding: 'clamp(20px, 5vw, 40px)',
          borderRadius: '12px',
          width: 'min(600px, calc(100vw - 2rem))',
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex: 10000,
          fontFamily: 'Helvetica World, Arial, sans-serif',
          fontSize: 'clamp(14px, 1.2vw, 16px)',
          lineHeight: '1.6',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            This video collage is inspired by the Chauka, a bird found only on Manus Island in Papua New Guinea. It plays a role in daily life and is deeply respected, appearing often in local stories. People say its calls help mark the passage of time, acting as a kind of timekeeper. But in many legends, the Chauka also appears as a warning.
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            The story behind this visualization is about a man who brings home his newly wed wife. But soon the Chauka begins calling again and again. The villagers are alert, they sense something is wrong. The woman is not who she says she is. She is a spirit in disguise. The villagers listen to the bird and decide to leave the island by boat.
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            Stories like this are still told on Manus. The Chauka is seen as a bird that notices things before people do. It speaks up when something is off, when something is coming.
          </div>
          
          <div style={{ 
            fontStyle: 'italic', 
            fontSize: '14px', 
            opacity: 0.8,
            borderTop: '1px solid rgba(0,0,0,0.2)',
            paddingTop: '15px',
            marginTop: '20px'
          }}>
            Note: We worked with local knowledge through Bertha, who is from Manus. While we couldn't capture the full version of the story in time for this release, we hope to return to it and share more when the moment is right.
          </div>
          
          <button 
            onClick={() => setShowChaukaTooltip(false)}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              color: '#333',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>
      )}

      {/* Title Section */}
      <div style={{position: 'relative'}}>
        <TitleSection />
      </div>

      {/* Story sections 1-6.

          The dot layer is a child of this wrapper rather than a box placed at
          a fixed pixel offset, so it covers exactly these six sections and
          ends where section 7 (the star sky) starts - on every screen size. */}
      <div style={{ position: 'relative' }}>
        <StoryDots />

      <div style={{position: 'relative'}}>
        <SegmentNumber n={1} />
        <SegmentTemplate 
          header="Sea levels held steady for a millennium,"
          headerSecondLine="until now."
          text="For most of the past millennium, sea levels remained relatively stable. But since the late 19th century, they have <strong>risen sharply</strong> due to climate-driven ocean warming and ice melt. Flooding worsens, drinking water is affected, and <strong>coastal communities are under threat</strong>."
          chartComponent={<HistoricalSeaLevelRiseExtended />}
          caption="<strong>Fig 1:</strong> Global mean sea level from the year 1000 to present, shown relative to the approximate year 2000 baseline (0 cm). The projection to 2050 assumes 1.5°C to 2.0°C of global warming. Data: Kopp <a href='https://www.pnas.org/doi/10.1073/pnas.1517056113' target='_blank' style='color: #9ca3af; text-decoration: underline;'>(link)</a> and NASA <a href='http://podaac.jpl.nasa.gov/dataset/MERGED_TP_J1_OSTM_OST_ALL_V52' target='_blank' style='color: #9ca3af; text-decoration: underline;'>(link)</a>"
          styles={{
            header: {
              fontWeight: 'normal',
              fontFamily: 'Helvetica World, Arial, sans-serif'
            },
            headerSecondLine: {
              fontWeight: 'bold',
              fontFamily: 'Times New Roman, serif',
              fontStyle: 'italic'
            }
          }}
        />
        
        {/* Projection note, anchored to the section rather than to the
            viewport, so it does not wander off at other window sizes. */}
        <div className="hide-on-narrow" style={{
          position: 'absolute',
          top: '18%',
          right: 'clamp(1rem, 3vw, 3rem)',
          zIndex: 1500,
          pointerEvents: 'none',
          fontSize: 'clamp(11px, 1vw, 14px)',
          fontFamily: 'Helvetica World, Arial, sans-serif',
          color: '#000000',
          fontWeight: 'normal',
          lineHeight: '1.4',
          maxWidth: 'min(300px, 26vw)'
        }}>
          <strong>Projection</strong><br/>
          Under 1.5°C to 2.0°C of global warming,<br/>
          sea level rise is expected to increase by<br/>
          <strong>~25 cm in 2050.</strong>
        </div>
        

      </div>

      {/* Another test segment */}
      <div style={{position: 'relative'}}>
        <SegmentNumber n={2} />
        <SegmentTemplate 
          header="Sea level is rising,"
          headerSecondLine="but not at the same rate."
          text="Sea level rise is <strong>uneven</strong>. The Pacific is a <strong>hotspot</strong>. Driven by ocean patterns, melting ice, and land movement, some islands are seeing <strong>faster-than-average</strong> increases. For nations with limited land and elevation, these trends bring real and immediate threats."
          chartComponent={<SeaLevelRiseChart />}
          caption="<strong>Fig 2:</strong> Projected sea level rise scenarios, across selected Pacific Island nations. Data: Pacific Flooding Analysis Tool <a href='https://sealevel.nasa.gov/flooding-analysis-tool-pacific-islands/sea-level-rise?station-id=018&units=meters' target='_blank' style='color: #9ca3af; text-decoration: underline;'>(link)</a>"
          styles={{
            header: {
              fontWeight: 'normal',
              fontFamily: 'Helvetica World, Arial, sans-serif'
            },
            headerSecondLine: {
              fontWeight: 'bold',
              fontFamily: 'Times New Roman, serif',
              fontStyle: 'italic'
            }
          }}
        />
      </div>

      {/* Test segment with two-line title */}
      <div style={{position: 'relative'}}>
        <SegmentNumber n={3} />
                         <SegmentTemplate 
          header="Impact varies across Pacific islands"
          headerSecondLine="low-laying islands are exposed more."
          text="Low elevation makes many Pacific islands especially vulnerable to sea level rise. When land sits just a few meters above the ocean, even small increases can <strong>overwhelm coastlines</strong>. With nowhere higher to go, communities face growing challenges to stay safe, maintain clean water, and protect their homes."
          chartComponent={<HighestElevationChart />}
          caption="<strong>Fig 3:</strong> Average elevation of selected Pacific Island nations and territories. Data: Wikipedia <a href='https://en.wikipedia.org/wiki/List_of_elevation_extremes_by_country?utm_source=chatgpt.com' target='_blank' style='color: #9ca3af; text-decoration: underline;'>(link)</a>"
          styles={{
            header: {
              fontWeight: 'normal',
              fontFamily: 'Helvetica World, Arial, sans-serif'
            },
            headerSecondLine: {
              fontWeight: 'bold',
              fontFamily: 'Times New Roman, serif',
              fontStyle: 'italic'
            }
          }}
        />
      </div>

      {/* New Segment 6 */}
      <div style={{position: 'relative'}}>
        <SegmentNumber n={4} />
        <SegmentTemplate 
          header="Many islanders live just above sea level,"
          headerSecondLine="where sea rise is already felt."
          text="Many Pacific Island nations have significant <strong>populations living in low-lying coastal areas</strong>. These communities are <strong>particularly vulnerable</strong> to sea level rise and coastal flooding, as even small increases in sea level can have dramatic impacts on their daily lives and infrastructure."
          chartComponent={<LowElevationChart />}
          caption="<strong>Fig 4:</strong> Percentage of national populations living between 0–5 meters above sea level in selected Pacific Island nations. Data: Pacific Data Hub <a href='https://pacificdata.org/data/dataset/population-living-in-low-elevation-coastal-zones-0-10m-and-0-20m-above-sea-level-df-pop-lecz' target='_blank' style='color: #9ca3af; text-decoration: underline;'>(link)</a>"
          styles={{
            header: {
              fontWeight: 'normal',
              fontFamily: 'Helvetica World, Arial, sans-serif'
            },
            headerSecondLine: {
              fontWeight: 'bold',
              fontFamily: 'Times New Roman, serif',
              fontStyle: 'italic'
            }
          }}
        />


      </div>

            {/* Segment 7 */}
      <div style={{position: 'relative'}}>
        <SegmentNumber n={5} />
                 <SegmentTemplate 
           header="Climate risks are rising in the Pacific."
           headerSecondLine="So is human impact."
                     text="Flooding is not the only threat. Cyclones, droughts, and heat extremes are also affecting more people across the Pacific. While impacts vary by island and year, some nations have seen sharp spikes in those affected. The trend points to growing vulnerability as the climate continues to change."
          chartComponent={<NewChartComponent />}
          caption="<strong>Fig 5:</strong> Number of people affected by climate-related hazards in the Pacific, 2005–2023. Data: Pacific Data Hub <a href='https://blue-pacific-2050.pacificdata.org/climate-change-and-disasters/indicators?outcome=1.0' target='_blank' style='color: #9ca3af; text-decoration: underline;'>(link)</a> and EM-DAT <a href='https://public.emdat.be/data' target='_blank' style='color: #9ca3af; text-decoration: underline;'>(link)</a>"
           styles={{
             header: {
               fontWeight: 'normal',
               fontFamily: 'Helvetica World, Arial, sans-serif'
             },
             headerSecondLine: {
               fontWeight: 'bold',
               fontFamily: 'Times New Roman, serif',
               fontStyle: 'italic'
             }
           }}
         />
      </div>



             {/* New Segment */}
      {/* Placeholder Segment 9 */}
      <div style={{position: 'relative'}}>
        <SegmentNumber n={6} />
        <SegmentTemplate
          header="Conclusion"
          text="The Pacific is on the front lines of the climate crisis. While sea levels are rising globally, their impacts are not evenly distributed. Low-lying island nations such as <strong>Tuvalu</strong>, <strong>Kiribati</strong>, and the <strong>Marshall Islands</strong>, with an average elevation of just 2 meters, face an existential threat from even modest increases in sea level. These islands have little elevation to buffer rising tides and no higher ground for retreat.

<br/><br/>

But elevation alone does not tell the full story. <strong>Ocean currents</strong>, <strong>land movement</strong>, and <strong>storm exposure</strong> all contribute to risk, making some regions more vulnerable than others. Climate hazards that were once rare are becoming more frequent and disruptive.

<br/><br/>

In recent years, hundreds of thousands of people in the Pacific have been affected by floods, cyclones, and droughts, showing a sharp rise in human impact.

<br/><br/>

The data points to a clear trend: as the climate warms, the risks for Pacific communities are increasing. What is happening in these islands is not just a warning, but a preview of what coastal regions around the world may face if emissions and sea level rise are not brought under control.

<br/><br/>

And yet, these islands are not only sites of risk. They are also places of <strong>resilience</strong>. Across the region, communities are responding with <strong>deep-rooted knowledge</strong>, <strong>creative adaptation</strong>, and <strong>collective action</strong>. From youth-led campaigns to cultural expression and traditional practices, Pacific peoples are drawing on both <strong>heritage</strong> and <strong>innovation</strong> to protect what matters.

<br/><br/>

The rising sea threatens homes and homelands, but it cannot erase <strong>identity</strong>, <strong>memory</strong>, or the <strong>will to adapt</strong>.

<br/><br/>

This is not only a story of loss. It is also one of <strong>resilience</strong>."
          chartComponent={null}
                      styles={{
              header: {
                fontWeight: 'normal',
                fontFamily: 'Helvetica World, Arial, sans-serif'
              },
              placeholderChart: {
                display: 'none'
              }
            }}
            caption=""
        />
      </div>





      </div>

       {/* Final Section - Custom styled without chart */}
       <div style={{position: 'relative'}}>
        <SegmentNumber n={7} />
                   <section className="full-section" style={{
            width: '100%',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            scrollSnapAlign: 'start',
            borderBottom: '3px solid #9ca3af',
          }}>


           {/* Star Globe in front of sunrise */}
             <div style={{
             position: 'absolute', 
             top: 0, 
             left: 0, 
               width: '100%',
             height: '100%', 
             zIndex: 20, 
             pointerEvents: 'auto'
           }}>
             <InteractiveStarGlobeYellow />
             </div>

             {/* Click for Story Button */}
             <button
               style={{
                 position: 'absolute',
                 bottom: 'clamp(12px, 5vh, 50px)',
                 right: 'clamp(12px, 4vw, 50px)',
                 width: 'clamp(150px, 22vw, 300px)',
                 height: 'clamp(150px, 22vw, 300px)',
                 border: 'none',
                 background: 'none',
                 cursor: 'pointer',
                 zIndex: 30,
               }}
               onClick={() => setShowLepeyamTooltip(true)}
               aria-label="Click for story"
             >
               <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
                 <defs>
                   <radialGradient id="pulse-section7" cx="50%" cy="50%" r="50%">
                     <stop offset="0%" stopColor="#cad6fa" stopOpacity="1" />
                     <stop offset="100%" stopColor="#cad6fa" stopOpacity="0.8" />
                   </radialGradient>
                   <filter id="glow-section7" x="-200%" y="-200%" width="500%" height="500%">
                     <feGaussianBlur stdDeviation="40" result="coloredBlur" />
                     <feMerge>
                       <feMergeNode in="coloredBlur" />
                       <feMergeNode in="SourceGraphic" />
                     </feMerge>
                   </filter>
                   <path id="circlePath-section7" d="M150,75 A75,75 0 1,1 149.99,75" />
                 </defs>
                 <circle cx="150" cy="150" r="40" fill="#cad6fa" style={{ filter: 'url(#glow-section7)' }} />
                 <circle cx="150" cy="150" r="50" fill="transparent" style={{ filter: 'url(#glow-section7)', animation: 'pulse 2s ease-in-out infinite', opacity: 0.2 }} />
                 <text fill="#94a0c4" fontSize="18" fontWeight="normal" letterSpacing="0.08em">
                   <textPath xlinkHref="#circlePath-section7" startOffset="0%" textAnchor="start" dominantBaseline="middle">
                     Click for story!
                   </textPath>
                 </text>
               </svg>
             </button>

             {/* Click for Music Button */}
             <div
               style={{
                 position: 'absolute',
                 bottom: 'clamp(12px, 5vh, 50px)',
                 left: 'clamp(12px, 4vw, 50px)',
                 width: 'clamp(120px, 18vw, 240px)',
                 height: 'clamp(120px, 18vw, 240px)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 pointerEvents: 'auto',
                 background: 'none',
                 cursor: 'pointer',
                 zIndex: 30,
               }}
               onClick={handleMusicToggle}
               aria-label="Play or pause music"
             >
               <AudioPlayer
                 id="music-audio"
                 src="/Leve Yam.mp3"
                 volume={0.3}
                 loop={true}
                 onEnded={() => setMusicPlaying(false)}
                 onStateChange={handleMusicStateChange}
                 onRef={handleMusicAudioRef}
               />
               <svg viewBox="0 0 240 240" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
                 <defs>
                   <radialGradient id="pulseMusic" cx="50%" cy="50%" r="50%">
                     <stop offset="0%" stopColor="#3d557a" stopOpacity="1" />
                     <stop offset="100%" stopColor="#3d557a" stopOpacity="0" />
                   </radialGradient>
                   <filter id="glowMusic" x="-200%" y="-200%" width="500%" height="500%">
                     <feGaussianBlur stdDeviation="40" result="coloredBlur" />
                     <feMerge>
                       <feMergeNode in="coloredBlur" />
                       <feMergeNode in="SourceGraphic" />
                     </feMerge>
                   </filter>
                   <path id="circlePathMusicText" d="M60,130 A60,60 0 1,1 180,130" />
                 </defs>
                 <text fill="#3d557a" fontSize="15" fontWeight="normal" letterSpacing="0.08em">
                   <textPath xlinkHref="#circlePathMusicText" startOffset="0%" textAnchor="start" dominantBaseline="middle">
                     Click for music!
                   </textPath>
                 </text>
                 <circle cx="120" cy="120" r="48" fill="url(#pulseMusic)" style={{ animation: 'pulse 1.5s infinite', filter: 'url(#glowMusic)' }} />
                 <circle cx="120" cy="120" r="30" fill="#3d557a" style={{ filter: 'url(#glowMusic)' }} />
                 {!musicPlaying && (
                   <polygon points="115,112 131,120 115,128" fill="#b8c6e6" style={{ opacity: 1 }} />
                 )}
                 {musicPlaying && (
                   <g>
                     <rect x="112.5" y="113.5" width="5" height="12" rx="1.5" fill="#b8c6e6" style={{ opacity: 1 }} />
                     <rect x="120.5" y="113.5" width="5" height="12" rx="1.5" fill="#b8c6e6" style={{ opacity: 1 }} />
                   </g>
                 )}
               </svg>
               {musicAudioError && (
                 <div style={{ position: 'absolute', top: 10, left: 10, color: 'red', background: 'rgba(0,0,0,0.7)', padding: '8px 16px', borderRadius: 8, zIndex: 20 }}>
                   Audio failed to load.
                 </div>
               )}
             </div>

             {/* Lepeyam Story Tooltip */}
             {showLepeyamTooltip && (
               <div style={{
                 position: 'fixed',
                 top: '50%',
                 left: '50%',
                 transform: 'translate(-50%, -50%)',
                 backgroundColor: 'rgba(255, 255, 255, 0.8)',
                 color: '#222',
                 padding: 'clamp(20px, 5vw, 40px)',
                 borderRadius: '12px',
                 width: 'min(600px, calc(100vw - 2rem))',
                 maxHeight: '80vh',
                 overflowY: 'auto',
                 zIndex: 10000,
                 fontFamily: 'Helvetica World, Arial, sans-serif',
                 fontSize: 'clamp(14px, 1.2vw, 16px)',
                 lineHeight: '1.6',
                 boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(0,0,0,0.1)'
               }}>
                 <h2 style={{ 
                   marginBottom: '20px', 
                   fontSize: '24px', 
                   fontWeight: 'bold',
                   color: '#333'
                 }}>
                   Lepeyam
                 </h2>
                 
                 <div style={{ 
                   fontStyle: 'italic', 
                   fontSize: '14px', 
                   opacity: 0.8,
                   marginBottom: '20px',
                   color: '#666'
                 }}>
                   Translated from Tok Pisin
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   Lepeyam was a woman from Htopolonu who lived with her children in the village. One day, people were preparing for a big cultural celebration with dancing, singing, and traditional food. Many women were fetching water from a tap at the park using plastic containers.
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   Lepeyam told one of them, "You and your children should fetch water too." But when they got to the tap, a strange woman was already there. She was not from the village. She was a masalai meri, a spirit woman. She blocked Lepeyam and her children from collecting water. Then, without speaking, she filled their containers for them and disappeared.
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   That night, the masalai came to Lepeyam in her sleep. She sang a chant in a language Lepeyam could not understand. In the chant, she mentioned the Chauka bird. In Manus, the Chauka is known as a signal bird, used to mark time or warn of changes. The dream left Lepeyam confused and unsettled.
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   The next morning, she left the house without saying anything. She walked out of the village as if in a trance, following a voice that only she could hear. She was gone for days.
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   While she was missing, a kind couple took in her children. They brought them home, gave them food, and looked after them. One of the grandmothers told the children not to worry. She cooked food from the garden and sat with them. When they were ready to eat, she asked gently, "Do you know how to eat properly with your hands like we do here?" Then she showed them how.
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   Days later, Lepeyam returned. She was dirty and tired. People saw her drinking from puddles and chewing betelnut. Her body looked thin, and her behavior was strange. The masalai had taken her into the bush and taught her strange ways.
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   When she came back to the village, people gathered and called her children. "Here is your mother," they said. But the children did not recognize her.
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   Lepeyam sat quietly. Sometimes she took food from other people's plates. Her voice and movements were not her own. At one point, the real masalai woman appeared again, dancing and talking in riddles. She took food and spoke as if through Lepeyam.
                 </div>
                 
                 <div style={{ marginBottom: '20px' }}>
                   Eventually, the villagers brought Lepeyam back to her house. She sat down with her children and said softly, "I am still your mother, but I am not the same."
                 </div>
                 
                 <div style={{ 
                   fontStyle: 'italic', 
                   fontSize: '14px', 
                   opacity: 0.8,
                   borderTop: '1px solid rgba(0,0,0,0.2)',
                   paddingTop: '15px',
                   marginTop: '20px'
                 }}>
                   This story was later turned into a traditional song and dance performance.
                 </div>
                 
                 <button 
                   onClick={() => setShowLepeyamTooltip(false)}
                   style={{
                     position: 'absolute',
                     top: '15px',
                     right: '15px',
                     background: 'none',
                     border: 'none',
                     color: '#333',
                     fontSize: '24px',
                     cursor: 'pointer',
                     padding: '5px',
                     borderRadius: '50%',
                     width: '30px',
                     height: '30px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     transition: 'background-color 0.2s'
                   }}
                   onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                   onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                 >
                   ×
                 </button>
               </div>
             )}


             

         </section>
      </div>

      {/* Section 11 - Material and Method */}
      <div style={{position: 'relative'}}>
        <SegmentNumber n={8} />
        <SegmentTemplate 
          header="Material and Method"
          text="This project is built with <strong>Next.js</strong>, <strong>React</strong>, and <strong>Three.js</strong>, combining interactive 3D mapping and data visualization. Charts are rendered using <strong>Recharts</strong>, while styling is handled with <strong>Tailwind CSS</strong> and <strong>PostCSS</strong>. The source code is available on <a href='https://github.com/intendedsideeffects/Chauka' target='_blank' style='color: #000; text-decoration: underline;'><strong>GitHub</strong></a>.<br/><br/>The 3D star globe is based on data from the <strong>Hipparcos and Tycho Catalogues</strong>. Additional charts use data from the <strong>Pacific Data Hub</strong> and the <strong>EM-DAT public disaster database</strong>. Exact datasets are linked in the captions of each visualization.<br/><br/>The narrative is rooted in a story from <strong>Manus Island</strong>. It is woven into the experience alongside <strong>sound</strong> to create a layered, sensory way of engaging with the data.<br/><br/>Music: <a href='https://www.youtube.com/watch?v=9naA6Ji3QS0' target='_blank' style='color: #000; text-decoration: underline;'><strong>Leve Yam - Keni Lucas Ponyalou</strong></a><br/><br/>This project is a collaboration between <a href='https://www.linkedin.com/in/bertha-ngahan-a9b405145/' target='_blank' style='color: #000; text-decoration: underline;'><strong>Bertha Ngahan</strong></a> (Storytelling) and <a href='https://www.linkedin.com/in/j-grauel/' target='_blank' style='color: #000; text-decoration: underline;'><strong>Janina Grauel</strong></a> (Visualization) for the <a href='https://pacificdatavizchallenge.org/' target='_blank' style='color: #000; text-decoration: underline;'><strong>Pacific Data Challenge</strong></a>."
          caption=""
          styles={{}}
        />
      </div>

    </div>
  );
}

// Add a robust, reusable AudioPlayer component
// The big faint number in the top-left corner of every story section.
function SegmentNumber({ n }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'clamp(10px, 2vh, 20px)',
        left: 'clamp(10px, 2vw, 20px)',
        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
        color: 'rgba(0,0,0,0.10)',
        fontWeight: 900,
        zIndex: 2000,
        pointerEvents: 'none',
        lineHeight: 1,
      }}
    >
      {n}
    </div>
  );
}

function AudioPlayer({ src, volume = 1, loop = false, onEnded, onStateChange, onRef, ...rest }) {
  const audioRef = React.useRef();
  const [playing, setPlaying] = React.useState(false);
  const [audioLoaded, setAudioLoaded] = React.useState(false);
  const [audioError, setAudioError] = React.useState(false);

  React.useEffect(() => {
    // Temporarily removed muting to debug audio issues
  }, []);

  // Expose audio ref to parent
  React.useEffect(() => {
    if (onRef && audioRef.current) {
      onRef(audioRef.current);
    }
  }, [onRef]);

  // Debug logging
  React.useEffect(() => {
  }, [src]);

  // Notify parent of state changes
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange({ playing, audioLoaded, audioError });
    }
  }, [playing, audioLoaded, audioError, onStateChange]);

  return (
    <audio
      ref={audioRef}
      src={src}
      onEnded={() => { setPlaying(false); if (onEnded) onEnded(); }}
      onCanPlayThrough={() => { 
        setAudioLoaded(true); 
        setAudioError(false); 
      }}
      onPlay={() => {
        setPlaying(true);
        if (audioRef.current) {
          audioRef.current.volume = volume;
          audioRef.current.muted = false;
        }
        // Force state update to parent
        if (onStateChange) {
          onStateChange({ playing: true, audioLoaded, audioError });
        }
      }}
      onPause={() => {
        setPlaying(false);
        // Force state update to parent
        if (onStateChange) {
          onStateChange({ playing: false, audioLoaded, audioError });
        }
      }}
      onError={e => { 
        setAudioError(true); 
      }}
      preload="auto"
      loop={loop}
      {...rest}
    />
  );
}

// Blue Circle Audio Player Component
function BlueCircleAudioPlayer() {
  const [playing, setPlaying] = React.useState(false);
  const [showButtons, setShowButtons] = React.useState(true);
  const [audioElement, setAudioElement] = React.useState(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowButtons(true); // Always show at bottom
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const audio = new Audio('/oceansound.m4a');
    audio.volume = 0.20;
    audio.loop = true;
    audio.preload = 'auto';
    setAudioElement(audio);
  }, []);

  const handleToggle = () => {
    if (!audioElement) return;
    
      if (playing) {
        audioElement.pause();
      setPlaying(false);
      } else {
        audioElement.play().catch(error => {
      });
      setPlaying(true);
    }
  };

  return (
    <div
      style={{
        width: 'clamp(120px, 18vw, 240px)',
        height: 'clamp(120px, 18vw, 240px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: showButtons ? 'auto' : 'none',
        background: 'none',
        cursor: 'pointer',
        opacity: showButtons ? 1 : 0,
        transition: 'opacity 0.4s',
      }}
      onClick={handleToggle}
      aria-label="Play or pause ocean sound"
    >
      {/* AudioPlayer removed to eliminate missing file error */}
      <svg viewBox="0 0 240 240" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        <defs>
          <radialGradient id="pulseBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3d557a" stopOpacity="1" />
            <stop offset="100%" stopColor="#3d557a" stopOpacity="0" />
          </radialGradient>
          <filter id="glowBlue" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="40" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Arc path for text wrapping around the top half of the dot */}
          <path id="circlePathBlueText" d="M60,120 A60,60 0 1,1 180,120" />
        </defs>
        {/* Wrapped text above the dot */}
        <text fill="#3d557a" fontSize="15" fontWeight="normal" letterSpacing="0.08em">
          <textPath xlinkHref="#circlePathBlueText" startOffset="0%" textAnchor="start" dominantBaseline="middle">
            Click for ocean sound!
          </textPath>
        </text>
        <circle cx="120" cy="120" r="48" fill="url(#pulseBlue)" style={{ animation: 'pulse 1.5s infinite', filter: 'url(#glowBlue)' }} />
        <circle cx="120" cy="120" r="30" fill="#3d557a" style={{ filter: 'url(#glowBlue)' }} />
        {!playing && (
          <polygon points="115,112 131,120 115,128" fill="#b8c6e6" style={{ opacity: 1 }} />
        )}
        {playing && (
          <g>
            <rect x="112.5" y="113.5" width="5" height="12" rx="1.5" fill="#b8c6e6" style={{ opacity: 1 }} />
            <rect x="120.5" y="113.5" width="5" height="12" rx="1.5" fill="#b8c6e6" style={{ opacity: 1 }} />
          </g>
        )}
      </svg>
    </div>
  );
}

// Bird Audio Player Component
function BirdAudioPlayer() {
  const [playing, setPlaying] = React.useState(false);
  const [audioElement, setAudioElement] = React.useState(null);
  const [audioLoaded, setAudioLoaded] = React.useState(false);

  React.useEffect(() => {
    const audio = new Audio();
    audio.src = '/chaukasound.mp3';
    audio.volume = 0.3;
    audio.preload = 'metadata';
    
    audio.addEventListener('canplaythrough', () => {
      setAudioLoaded(true);
    });
    
    audio.addEventListener('ended', () => {
      setPlaying(false);
    });
    
    audio.addEventListener('error', (e) => {
    });
    
    setAudioElement(audio);
  }, []);

  const handleToggle = async () => {
    if (!audioElement) return;
    
    try {
      if (playing) {
        audioElement.pause();
        setPlaying(false);
      } else {
        // Ensure audio is loaded before playing
        if (audioElement.readyState < 2) {
          await audioElement.load();
        }
        await audioElement.play();
        setPlaying(true);
      }
    } catch (error) {
    }
  };

  return (
    <div
      style={{
        width: 'clamp(44px, 6vw, 80px)',
        height: 'clamp(44px, 6vw, 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={handleToggle}
      aria-label="Play or pause Chauka call"
    >
      <svg viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        {!playing && (
          <polygon points="35,30 50,40 35,50" fill="#676b8b" style={{ opacity: 0.8 }} />
        )}
        {playing && (
          <g>
            <rect x="32.5" y="31.5" width="4" height="16" rx="1" fill="#676b8b" style={{ opacity: 0.8 }} />
            <rect x="40.5" y="31.5" width="4" height="16" rx="1" fill="#676b8b" style={{ opacity: 0.8 }} />
          </g>
        )}
      </svg>
        </div>
  );
}

