import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadHazardDots, loadResistanceDots } from './storyDotsData';

/**
 * A soft round sprite, drawn once on a canvas.
 *
 * The star field used to pull this from threejs.org on every visit; a local
 * texture means the sky does not depend on somebody else's server.
 */
function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Spread n points evenly over a sphere (Fibonacci lattice). Deterministic, so
 * the sky looks the same on every visit.
 */
function spherePoint(i, n, radius) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / Math.max(1, n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * i;
  return new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius);
}

const InteractiveStarGlobeYellow = ({ onStarsLoaded }) => {
  const [activeDot, setActiveDot] = useState(null); // { dot, x, y }
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const starPointsRef = useRef(null);
  const dataPointsRef = useRef(null);
  const dataDotsRef = useRef([]);
  const pickListenersRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup - positioned at center of sphere
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 2000);
    camera.position.set(0, 0, 1); // Camera slightly away from center for OrbitControls
    cameraRef.current = camera;

    // Renderer setup with error handling
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false
      });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setClearColor(0x000000, 0); // Transparent background
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (error) {
      console.warn('WebGL not supported or context creation failed:', error);
      // Create a fallback div instead
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.width = '100%';
      fallbackDiv.style.height = '100%';
      fallbackDiv.style.backgroundColor = 'transparent';
      mountRef.current.appendChild(fallbackDiv);
      return; // Exit early if WebGL fails
    }

    // Controls setup - allow rotation but no zoom
    let controls;
    try {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false; // Disable zoom
      controls.enablePan = false; // Disable pan
      controls.enableDamping = true; // Smooth rotation
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5; // Adjust rotation speed
      controls.enableKeys = false; // Disable keyboard controls
      controlsRef.current = controls;
    } catch (error) {
      console.warn('OrbitControls creation failed:', error);
      controlsRef.current = null;
    }

    // Star configuration
    const starConfig = {
      maxMagnitude: 6.7,
      minMagnitude: -1.5,
      maxStarSize: 16.9,
      minStarSize: 3.0,
      baseStarSize: 4.5,
      brightestThreshold: 4.5,
      brightThreshold: 2.5,
      brightestStarColor: 0xffffff,
      brightStarColor: 0xe6f0ff,
      fadeFactor: 2.0
    };

    const radius = 150; // Increased radius to make star map bigger

    // Function to convert B-V color index to RGB color
    function bvToColor(brightness) {
      const rand = Math.random();
      let color;
      if (brightness < 2.0) {
        color = new THREE.Color(0xffffff);
        color.multiplyScalar(1.2);
      } else if (rand < 0.4) {
        color = new THREE.Color(0xffd700);
        color.multiplyScalar(1.1);
      } else if (rand < 0.7) {
        color = new THREE.Color(0x87ceeb);
        color.multiplyScalar(1.15);
      } else {
        color = new THREE.Color(0xf8f8ff);
        color.multiplyScalar(1.1);
      }
      const fadeFactor = Math.max(0.2, 1 - (brightness / starConfig.maxMagnitude));
      color.multiplyScalar(fadeFactor * 0.85 + 0.25);
      return color.getHex();
    }

    // Function to load star data
    async function loadStars() {
      try {
        const response = await fetch('/stars.csv');
        const text = await response.text();
        const rows = text.split('\n').slice(1);
        const stars = rows
          .map((row, index) => {
            // stars.csv is a slim catalogue: ra,dec,mag (Hipparcos, naked-eye stars)
            const [RAdeg, DEdeg, Vmag] = row.split(',');
            const brightness = parseFloat(Vmag);
            const x = radius * Math.cos(parseFloat(RAdeg) * (Math.PI / 180)) * Math.cos(parseFloat(DEdeg) * (Math.PI / 180));
            const y = radius * Math.sin(parseFloat(DEdeg) * (Math.PI / 180));
            const z = radius * Math.sin(parseFloat(RAdeg) * (Math.PI / 180)) * Math.cos(parseFloat(DEdeg) * (Math.PI / 180));
            let size = Math.max(
              starConfig.minStarSize * (1.1 - brightness / starConfig.maxMagnitude),
              starConfig.maxStarSize * Math.pow(0.75, brightness)
            );
            if (brightness > 5.0) {
              size *= 0.7;
            }
            return {
              id: index + 1,
              x, y, z,
              brightness,
              color: bvToColor(brightness),
              size: size,
            };
          })
          .filter(star => !isNaN(star.x) && !isNaN(star.y) && !isNaN(star.z) && 
                          star.brightness <= starConfig.maxMagnitude && 
                          star.brightness >= starConfig.minMagnitude);

        // Add Southern Cross constellation stars
        const southernCrossStars = [
          // Alpha Crucis (Acrux) - brightest star in Southern Cross
          {
            id: 'acrux',
            name: 'Acrux',
            ra: 186.6495, // Right Ascension in degrees
            dec: -63.0991, // Declination in degrees
            brightness: 0.77,
            color: 0xffffff,
            size: starConfig.maxStarSize * 1.5
          },
          // Beta Crucis (Mimosa)
          {
            id: 'mimosa',
            name: 'Mimosa',
            ra: 191.9303,
            dec: -59.6888,
            brightness: 1.25,
            color: 0x87ceeb,
            size: starConfig.maxStarSize * 1.3
          },
          // Gamma Crucis (Gacrux)
          {
            id: 'gacrux',
            name: 'Gacrux',
            ra: 187.7915,
            dec: -57.1138,
            brightness: 1.59,
            color: 0xffd700,
            size: starConfig.maxStarSize * 1.2
          },
          // Delta Crucis (Imai)
          {
            id: 'imai',
            name: 'Imai',
            ra: 183.7863,
            dec: -58.7489,
            brightness: 2.79,
            color: 0xffffff,
            size: starConfig.maxStarSize * 1.1
          }
        ];

        // Convert Southern Cross stars to 3D coordinates
        const southernCross3D = southernCrossStars.map(star => {
          const raRad = star.ra * (Math.PI / 180);
          const decRad = star.dec * (Math.PI / 180);
          const x = radius * Math.cos(raRad) * Math.cos(decRad);
          const y = radius * Math.sin(decRad);
          const z = radius * Math.sin(raRad) * Math.cos(decRad);
          
          return {
            id: star.id,
            name: star.name,
            x, y, z,
            brightness: star.brightness,
            color: star.color,
            size: star.size,
            isConstellation: true,
            constellation: 'southernCross'
          };
        });

        // Combine regular stars with Southern Cross stars
        return [...stars, ...southernCross3D];
      } catch (error) {
        return [];
      }
    }

    // Function to create the star field
    function createStarField(stars) {
      // Check if scene exists
      if (!sceneRef.current) {
        console.warn('Scene not available, cannot create star field');
        return;
      }

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(stars.length * 3);
      const colors = new Float32Array(stars.length * 3);
      const sizes = new Float32Array(stars.length);
      stars.forEach((star, i) => {
        positions[i * 3] = star.x;
        positions[i * 3 + 1] = star.y;
        positions[i * 3 + 2] = star.z;
        const color = new THREE.Color(star.color);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        sizes[i] = star.size;
      });
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      // Create custom shader material
      const material = new THREE.ShaderMaterial({
        uniforms: {
          attenuation: { value: true },
          starMin: { value: starConfig.minStarSize },
          starMax: { value: starConfig.maxStarSize },
          starMinBrightnes: { value: starConfig.maxMagnitude },
          starFadeDactor: { value: starConfig.fadeFactor },
          pointTexture: { value: makeDotTexture() }
        },
        vertexShader: `
          uniform float starMin;
          uniform float starMax;
          uniform float starMinBrightnes;
          uniform float starFadeDactor;
          uniform bool attenuation;
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          varying float vSize;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            float dist = length(mvPosition.xyz);
            float sizeScale = 1.0;
            if (attenuation) {
              sizeScale = 130.0 / dist;
            }
            float fadeSize = size * (1.0 + starFadeDactor * 0.08);
            gl_PointSize = fadeSize * sizeScale;
            vColor = color;
            vSize = fadeSize;
          }
        `,
        fragmentShader: `
          uniform sampler2D pointTexture;
          varying vec3 vColor;
          varying float vSize;
          void main() {
            vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
            vec4 tex = texture2D(pointTexture, uv);
            float alpha = tex.a;
            alpha *= smoothstep(0.0, 0.45, alpha);
            vec3 finalColor = vColor * (1.0 + (1.0 - alpha) * 0.5);
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const starPoints = new THREE.Points(geometry, material);
      sceneRef.current.add(starPoints);
      starPointsRef.current = starPoints;

      // Add constellation lines for Southern Cross
      const constellationStars = stars.filter(star => star.isConstellation);
      if (constellationStars.length >= 5) {
        // Find the Southern Cross stars by their IDs
        const acrux = constellationStars.find(s => s.id === 'acrux');
        const mimosa = constellationStars.find(s => s.id === 'mimosa');
        const gacrux = constellationStars.find(s => s.id === 'gacrux');
        const imai = constellationStars.find(s => s.id === 'imai');

        if (acrux && mimosa && gacrux && imai) {
          // Create lines connecting the Southern Cross
          const lineGeometry = new THREE.BufferGeometry();
          const linePositions = [
            // Main cross: Acrux to Mimosa (vertical)
            acrux.x, acrux.y, acrux.z,
            mimosa.x, mimosa.y, mimosa.z,
            // Horizontal cross: Gacrux to Imai
            gacrux.x, gacrux.y, gacrux.z,
            imai.x, imai.y, imai.z
          ];
          
          lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
          
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0,
            linewidth: 3
          });
          
          const constellationLines = new THREE.LineSegments(lineGeometry, lineMaterial);
          sceneRef.current.add(constellationLines);
        }
      }

      return positions;
    }

    // Initialize the star map
    async function init() {
      // Check if renderer was successfully created
      if (!rendererRef.current) {
        console.warn('Renderer not available, skipping star globe initialization');
        if (typeof onStarsLoaded === 'function') {
          onStarsLoaded();
        }
        return;
      }

      const stars = await loadStars();
      if (stars.length > 0) {
        createStarField(stars);
        addDataStars();
        if (typeof onStarsLoaded === 'function') {
          onStarsLoaded();
        }
      } else if (typeof onStarsLoaded === 'function') {
        // If no stars, still hide loader to avoid infinite loading
        onStarsLoaded();
      }
      
      // Every hazard and every act of resistance from the story, gathered
      // into the final sky. Blue for the dangers, yellow for the resistance;
      // click one to read what it was.
      async function addDataStars() {
        try {
          const [hazards, resistance] = await Promise.all([loadHazardDots(), loadResistanceDots()]);
          const dots = [...hazards, ...resistance];
          if (!dots.length || !sceneRef.current) return;

          const positions = new Float32Array(dots.length * 3);
          const colors = new Float32Array(dots.length * 3);
          const sizes = new Float32Array(dots.length);

          dots.forEach((dot, i) => {
            const p = spherePoint(i, dots.length, radius * 0.97);
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
            const color = new THREE.Color(dot.kind === 'hazard' ? dot.color : '#e3c200');
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            sizes[i] = dot.kind === 'hazard' ? 9 + dot.scale * 9 : 26;
          });

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

          // Normal blending, not additive: these have to read as themselves
          // against the pale sky of the final scene.
          const material = new THREE.ShaderMaterial({
            uniforms: { pointTexture: { value: makeDotTexture() } },
            vertexShader: `
              attribute float size;
              attribute vec3 color;
              varying vec3 vColor;
              void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = size * (130.0 / length(mvPosition.xyz));
                vColor = color;
              }
            `,
            fragmentShader: `
              uniform sampler2D pointTexture;
              varying vec3 vColor;
              void main() {
                vec4 tex = texture2D(pointTexture, gl_PointCoord);
                if (tex.a < 0.05) discard;
                gl_FragColor = vec4(vColor, tex.a * 0.92);
              }
            `,
            transparent: true,
            depthWrite: false,
          });

          const points = new THREE.Points(geometry, material);
          sceneRef.current.add(points);
          dataPointsRef.current = points;
          dataDotsRef.current = dots;
        } catch (error) {
          console.warn('Could not add the story dots to the sky:', error);
        }
      }

      // Picking: a click (not a drag) on a dot opens its story.
      const raycaster = new THREE.Raycaster();
      raycaster.params.Points.threshold = radius * 0.02;
      const pointer = new THREE.Vector2();
      let pressedAt = null;

      const pickAt = (clientX, clientY) => {
        const el = rendererRef.current?.domElement;
        if (!el || !dataPointsRef.current || !cameraRef.current) return null;
        const rect = el.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, cameraRef.current);
        const hits = raycaster.intersectObject(dataPointsRef.current);
        if (!hits.length) return null;
        return dataDotsRef.current[hits[0].index] ?? null;
      };

      const onPointerDown = (event) => {
        pressedAt = { x: event.clientX, y: event.clientY };
      };

      const onPointerUp = (event) => {
        if (!pressedAt) return;
        const moved = Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y);
        pressedAt = null;
        if (moved > 6) return; // that was a drag of the sky, not a click
        const dot = pickAt(event.clientX, event.clientY);
        setActiveDot(dot ? { dot, x: event.clientX, y: event.clientY } : null);
      };

      const onPointerMove = (event) => {
        const el = rendererRef.current?.domElement;
        if (!el || pressedAt) return;
        el.style.cursor = pickAt(event.clientX, event.clientY) ? 'pointer' : 'grab';
      };

      const canvas = rendererRef.current?.domElement;
      if (canvas) {
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointermove', onPointerMove);
        pickListenersRef.current = { canvas, onPointerDown, onPointerUp, onPointerMove };
      }

      // Animation loop
      function animate() {
        if (controlsRef.current) {
          controlsRef.current.update();
        }
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        requestAnimationFrame(animate);
      }
      animate();
    }
    init();
    // Handle window resizing
    const handleResize = () => {
      if (mountRef.current && cameraRef.current && rendererRef.current) {
        try {
          cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        } catch (error) {
          console.warn('Error during resize:', error);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current && rendererRef.current.domElement) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (error) {
          console.warn('Error removing renderer element:', error);
        }
      }
      if (rendererRef.current) {
        try {
          rendererRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing renderer:', error);
        }
      }
      if (controlsRef.current) {
        try {
          controlsRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing controls:', error);
        }
      }
      if (pickListenersRef.current) {
        const { canvas, onPointerDown, onPointerUp, onPointerMove } = pickListenersRef.current;
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointermove', onPointerMove);
        pickListenersRef.current = null;
      }
    };
  }, []);

  const tooltipPosition = () => {
    if (!activeDot) return {};
    const width = Math.min(360, window.innerWidth - 32);
    const maxHeight = Math.min(300, window.innerHeight - 32);
    let left = activeDot.x + 16;
    let top = activeDot.y - 40;
    if (left + width > window.innerWidth - 16) left = Math.max(16, activeDot.x - width - 16);
    if (top + maxHeight > window.innerHeight - 16) top = window.innerHeight - maxHeight - 16;
    if (top < 16) top = 16;
    return { left, top, width, maxHeight };
  };

  return (
    <>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          cursor: 'grab',
          overflow: 'hidden',
        }}
      />

      {activeDot && (
        <div
          role="tooltip"
          onClick={() => setActiveDot(null)}
          style={{
            position: 'fixed',
            ...tooltipPosition(),
            overflowY: 'auto',
            background: 'rgba(255,255,255,0.97)',
            color: '#0e224f',
            padding: '14px 16px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            boxShadow: '0 10px 20px -6px rgba(0,0,0,0.25)',
            fontFamily: 'Helvetica World, Arial, sans-serif',
            fontSize: 'clamp(12px, 1.1vw, 15px)',
            lineHeight: 1.5,
            zIndex: 10001,
            cursor: 'pointer',
          }}
        >
          {activeDot.dot.kind === 'hazard' ? (
            <>
              <strong style={{ display: 'block', marginBottom: '4px' }}>
                {activeDot.dot.type} in {activeDot.dot.country}, {activeDot.dot.year}
              </strong>
              {activeDot.dot.summary && <span>{activeDot.dot.summary}</span>}
              {activeDot.dot.affected > 0 && (
                <span style={{ display: 'block', marginTop: '6px', color: '#5b6478' }}>
                  People affected: {activeDot.dot.affected.toLocaleString('en-US')}
                </span>
              )}
            </>
          ) : (
            <>
              <strong style={{ display: 'block', marginBottom: '4px' }}>
                Resistance, {activeDot.dot.year}
              </strong>
              <span>{activeDot.dot.text}</span>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default InteractiveStarGlobeYellow; 