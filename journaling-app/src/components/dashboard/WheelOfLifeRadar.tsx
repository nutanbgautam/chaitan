import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Target, TrendingUp } from 'lucide-react';

interface LifeArea {
  id: string;
  name: string;
  value: number;
  priority: number;
  weightage: number;
  color: string;
  icon: string;
}

interface WheelOfLifeRadarProps {
  wheelData: LifeArea[];
  overallBalance: string;
}

const WheelOfLifeRadar: React.FC<WheelOfLifeRadarProps> = ({ wheelData, overallBalance }) => {
  const router = useRouter();
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSegmentClick = (areaId: string) => {
    setIsAnimating(true);
    setSelectedSegment(areaId);
    
    // Add a small delay for animation before navigation
    setTimeout(() => {
      router.push(`/wheel-of-life/${areaId}`);
    }, 300);
  };

  const handleSegmentHover = (areaId: string | null) => {
    setHoveredSegment(areaId);
  };

  // Calculate chart dimensions
  const centerX = 200;
  const centerY = 200;
  const maxRadius = 150;
  const innerRadius = 30;
  const numRings = 10; // 0-10 scale
  const ringSpacing = (maxRadius - innerRadius) / numRings;

  // Generate concentric rings
  const rings = Array.from({ length: numRings + 1 }, (_, i) => {
    const radius = innerRadius + (i * ringSpacing);
    return { radius, value: i };
  });

  // Calculate segment positions
  const segments = wheelData.map((item, index) => {
    const angle = (index * 360) / wheelData.length;
    const angleRad = (angle - 90) * Math.PI / 180;
    const segmentRadius = innerRadius + (item.value * ringSpacing);
    
    return {
      ...item,
      angle,
      angleRad,
      radius: segmentRadius,
      x: centerX + Math.cos(angleRad) * segmentRadius,
      y: centerY + Math.sin(angleRad) * segmentRadius,
      labelX: centerX + Math.cos(angleRad) * (maxRadius + 20),
      labelY: centerY + Math.sin(angleRad) * (maxRadius + 20),
    };
  });

  return (
    <div className="wheel-radar-container">
      <div className="wheel-radar-wrapper">
        <svg width="400" height="400" viewBox="0 0 400 400" className={`wheel-radar-chart ${isAnimating ? 'animating' : ''}`}>
          <defs>
            {/* Gradients for segments */}
            {segments.map((segment, index) => (
              <linearGradient key={segment.id} id={`gradient-${segment.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: segment.color, stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: segment.color, stopOpacity: 0.6 }} />
              </linearGradient>
            ))}
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <circle cx={centerX} cy={centerY} r={maxRadius + 10} fill="rgba(0,0,0,0.1)" />
          
          {/* Concentric rings */}
          {rings.map((ring, index) => (
            <circle
              key={index}
              cx={centerX}
              cy={centerY}
              r={ring.radius}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={index === 0 ? 2 : 1}
              strokeDasharray={index % 2 === 0 ? "5,5" : "none"}
            />
          ))}

          {/* Radial lines */}
          {segments.map((segment, index) => {
            const endX = centerX + Math.cos(segment.angleRad) * maxRadius;
            const endY = centerY + Math.sin(segment.angleRad) * maxRadius;
            
            return (
              <line
                key={`line-${segment.id}`}
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
            );
          })}

          {/* Segment areas */}
          {segments.map((segment, index) => {
            const nextSegment = segments[(index + 1) % segments.length];
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${segment.x} ${segment.y}`,
              `A ${segment.radius} ${segment.radius} 0 0 1 ${nextSegment.x} ${nextSegment.y}`,
              'Z'
            ].join(' ');

            return (
              <g key={segment.id}>
                <path
                  d={pathData}
                  fill={`url(#gradient-${segment.id})`}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2"
                  opacity={hoveredSegment === segment.id ? 0.9 : 0.7}
                  className="segment-area"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSegmentClick(segment.id)}
                  onMouseEnter={() => handleSegmentHover(segment.id)}
                  onMouseLeave={() => handleSegmentHover(null)}
                />
                
                {/* Segment border for better definition */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="1"
                  opacity={hoveredSegment === segment.id ? 1 : 0.6}
                />
              </g>
            );
          })}

          {/* Segment points */}
          {segments.map((segment) => (
            <g key={`point-${segment.id}`}>
              {/* Glow effect */}
              <circle
                cx={segment.x}
                cy={segment.y}
                r="8"
                fill={segment.color}
                opacity="0.6"
                filter="url(#glow)"
              />
              
              {/* Main point */}
              <circle
                cx={segment.x}
                cy={segment.y}
                r="6"
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                className="segment-point"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSegmentClick(segment.id)}
                onMouseEnter={() => handleSegmentHover(segment.id)}
                onMouseLeave={() => handleSegmentHover(null)}
              />
              
              {/* Value label */}
              <text
                x={segment.x}
                y={segment.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="segment-value"
                fontSize="12"
                fontWeight="bold"
                fill="white"
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  pointerEvents: 'none'
                }}
              >
                {segment.value}
              </text>
              
              {/* Priority indicator */}
              {segment.priority <= 3 && (
                <g>
                  <circle
                    cx={segment.x + 12}
                    cy={segment.y - 12}
                    r="8"
                    fill="#FFD700"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <text
                    x={segment.x + 12}
                    y={segment.y - 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#333"
                  >
                    {segment.priority}
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* Segment labels */}
          {segments.map((segment) => (
            <g key={`label-${segment.id}`}>
              {/* Label background */}
              <rect
                x={segment.labelX - 40}
                y={segment.labelY - 12}
                width="80"
                height="24"
                rx="12"
                fill="rgba(0,0,0,0.8)"
                opacity={hoveredSegment === segment.id ? 1 : 0.7}
                className="label-bg"
              />
              
              {/* Label text */}
              <text
                x={segment.labelX}
                y={segment.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="segment-label"
                fontSize="10"
                fontWeight="600"
                fill="white"
                style={{ pointerEvents: 'none' }}
              >
                {segment.name} {segment.value}
              </text>
              
              {/* Enhanced tooltip for hovered segment */}
              {hoveredSegment === segment.id && (
                <g>
                  {/* Tooltip background */}
                  <rect
                    x={segment.labelX - 60}
                    y={segment.labelY - 35}
                    width="120"
                    height="70"
                    rx="8"
                    fill="rgba(0,0,0,0.9)"
                    stroke={segment.color}
                    strokeWidth="2"
                  />
                  
                  {/* Tooltip content */}
                  <text
                    x={segment.labelX}
                    y={segment.labelY - 20}
                    textAnchor="middle"
                    className="tooltip-title"
                    fontSize="11"
                    fontWeight="bold"
                    fill="white"
                  >
                    {segment.name}
                  </text>
                  
                  <text
                    x={segment.labelX}
                    y={segment.labelY - 5}
                    textAnchor="middle"
                    className="tooltip-score"
                    fontSize="14"
                    fontWeight="bold"
                    fill={segment.color}
                  >
                    Score: {segment.value}/10
                  </text>
                  
                  <text
                    x={segment.labelX}
                    y={segment.labelY + 10}
                    textAnchor="middle"
                    className="tooltip-priority"
                    fontSize="9"
                    fill="#FFD700"
                  >
                    {segment.priority <= 3 ? `Priority #${segment.priority}` : 'Standard Priority'}
                  </text>
                  
                  <text
                    x={segment.labelX}
                    y={segment.labelY + 25}
                    textAnchor="middle"
                    className="tooltip-weight"
                    fontSize="9"
                    fill="#ccc"
                  >
                    Weight: {segment.weightage}%
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* Center hub */}
          <circle
            cx={centerX}
            cy={centerY}
            r="25"
            fill="radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="3"
            filter="url(#glow)"
          />
          
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            className="center-score"
            fontSize="16"
            fontWeight="bold"
            fill="#333"
          >
            {overallBalance}
          </text>
          
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="center-label"
            fontSize="10"
            fill="#666"
          >
            Balance
          </text>
        </svg>
      </div>

      <style jsx>{`
        .wheel-radar-container {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .wheel-radar-wrapper {
          position: relative;
          width: 400px;
          height: 400px;
        }
        
        .wheel-radar-chart {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.3));
          transition: all 0.3s ease;
        }
        
        .wheel-radar-chart.animating {
          transform: scale(1.05);
          filter: drop-shadow(0 15px 40px rgba(0,0,0,0.4));
        }
        
        .segment-area {
          transition: all 0.3s ease;
        }
        
        .segment-area:hover {
          opacity: 1 !important;
          filter: brightness(1.2);
          transform: scale(1.02);
        }
        
        .segment-point {
          transition: all 0.3s ease;
        }
        
        .segment-point:hover {
          r: 8;
          filter: brightness(1.3);
          transform: scale(1.1);
        }
        
        .segment-label {
          transition: opacity 0.3s ease;
        }
        
        .label-bg {
          transition: all 0.3s ease;
        }
        
        .label-bg:hover {
          transform: scale(1.05);
        }
        
        .tooltip-title {
          text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        }
        
        .tooltip-score {
          text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        }
        
        .center-score {
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .wheel-radar-wrapper {
            width: 300px;
            height: 300px;
          }
          
          .wheel-radar-chart {
            transform: scale(0.75);
            transform-origin: center;
          }
        }
      `}</style>
    </div>
  );
};

export default WheelOfLifeRadar; 