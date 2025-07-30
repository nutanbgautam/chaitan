import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Target } from 'lucide-react';

interface LifeArea {
  id: string;
  name: string;
  value: number;
  priority: number;
  weightage: number;
  color: string;
  icon: string;
}

interface WheelOfLife3DProps {
  wheelData: LifeArea[];
  overallBalance: string;
}

const WheelOfLife3D: React.FC<WheelOfLife3DProps> = ({ wheelData, overallBalance }) => {
  const router = useRouter();
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  // Calculate total weightage for proper segment sizing
  const totalWeightage = wheelData.reduce((sum, area) => sum + (area.weightage || 0), 0);

  const handleSegmentClick = (areaId: string) => {
    router.push(`/wheel-of-life/${areaId}`);
  };

  const handleSegmentHover = (areaId: string | null) => {
    setHoveredSegment(areaId);
  };

  return (
    <div className="wheel-3d-container">
      <div className="wheel-3d-wrapper">
        <div className={`wheel-3d ${isRotating ? 'rotating' : ''}`}>
          {/* 3D Background Ring */}
          <div className="wheel-background-ring"></div>
          
          {/* Life Area Segments */}
          {wheelData.map((item, index) => {
            const weightageRatio = (item.weightage || 0) / totalWeightage;
            const segmentAngle = weightageRatio * 360;
            const previousWeightages = wheelData.slice(0, index).reduce((sum, area) => sum + (area.weightage || 0), 0);
            const startAngle = (previousWeightages / totalWeightage) * 360;
            const centerAngle = startAngle + segmentAngle / 2;
            
            // Calculate 3D position with proper spacing
            const radius = 140;
            const depth = 30;
            const segmentDepth = (item.value / 10) * depth;
            
            // Calculate position on the circle
            const angleRad = (centerAngle - 90) * Math.PI / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            
            return (
              <div
                key={item.id}
                className={`wheel-segment-3d ${hoveredSegment === item.id ? 'hovered' : ''}`}
                style={{
                  transform: `translate(${x}px, ${y}px) translateZ(${segmentDepth}px)`,
                  '--segment-color': item.color,
                  '--segment-hue': (index * 60) % 360,
                  '--segment-saturation': 75,
                  '--segment-lightness': 40 + (item.value / 10) * 25,
                  '--priority': item.priority,
                  '--center-angle': centerAngle,
                } as React.CSSProperties}
                onClick={() => handleSegmentClick(item.id)}
                onMouseEnter={() => handleSegmentHover(item.id)}
                onMouseLeave={() => handleSegmentHover(null)}
              >
                <div className="segment-face">
                  <div className="segment-content">
                    <div className="segment-icon">{item.icon}</div>
                    <div className="segment-value">{item.value}</div>
                    {item.priority <= 3 && (
                      <div className="priority-indicator">
                        <Star className="priority-star" />
                        <span className="priority-number">{item.priority}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="segment-side segment-side-1"></div>
                <div className="segment-side segment-side-2"></div>
                <div className="segment-side segment-side-3"></div>
                <div className="segment-side segment-side-4"></div>
              </div>
            );
          })}
          
          {/* Center Hub */}
          <div className="wheel-center">
            <div className="center-content">
              <div className="balance-score">{overallBalance}</div>
              <div className="balance-label">Balance</div>
              <div className="center-glow"></div>
            </div>
          </div>
        </div>
        
        {/* Floating Labels */}
        <div className="wheel-labels">
          {wheelData.map((item, index) => (
            <div
              key={item.id}
              className={`floating-label ${hoveredSegment === item.id ? 'active' : ''}`}
              style={{
                '--label-color': item.color,
                '--label-hue': (index * 60) % 360,
              } as React.CSSProperties}
            >
              <div className="label-content">
                <span className="label-name">{item.name}</span>
                <span className="label-score">{item.value}/10</span>
                {item.priority <= 3 && (
                  <span className="label-priority">#{item.priority}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .wheel-3d-container {
          position: relative;
          width: 100%;
          height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 1000px;
        }
        
        .wheel-3d-wrapper {
          position: relative;
          width: 300px;
          height: 300px;
        }
        
        .wheel-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: float 6s ease-in-out infinite;
          transform: rotateX(15deg) rotateY(-10deg);
        }
        
        .wheel-3d.rotating {
          animation: rotate 20s linear infinite;
        }
        
        .wheel-background-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 260px;
          height: 260px;
          margin: -130px 0 0 -130px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
          box-shadow: 
            0 0 50px rgba(102, 126, 234, 0.3),
            inset 0 0 50px rgba(118, 75, 162, 0.2);
        }
        
        .wheel-segment-3d {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 70px;
          height: 70px;
          margin: -35px 0 0 -35px;
          transform-style: preserve-3d;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.3));
        }
        
        .wheel-segment-3d:hover {
          transform: translate(var(--x), var(--y)) translateZ(50px) scale(1.15) rotateY(10deg);
          filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4));
        }
        
        .wheel-segment-3d.hovered {
          transform: translate(var(--x), var(--y)) translateZ(60px) scale(1.25) rotateY(15deg);
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5));
        }
        
        .segment-face {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, hsl(var(--segment-hue), var(--segment-saturation), var(--segment-lightness)), hsl(var(--segment-hue), var(--segment-saturation), calc(var(--segment-lightness) - 15%)));
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.9);
          box-shadow: 
            0 8px 25px rgba(0, 0, 0, 0.4),
            inset 0 3px 8px rgba(255, 255, 255, 0.4),
            0 0 20px rgba(var(--segment-hue), var(--segment-saturation), var(--segment-lightness), 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateZ(25px);
          backdrop-filter: blur(5px);
        }
        
        .segment-content {
          text-align: center;
          color: white;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .segment-icon {
          font-size: 16px;
          margin-bottom: 2px;
        }
        
        .segment-value {
          font-size: 12px;
          font-weight: 900;
        }
        
        .priority-indicator {
          position: absolute;
          top: -5px;
          right: -5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .priority-star {
          width: 12px;
          height: 12px;
          color: #FFD700;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
        }
        
        .priority-number {
          position: absolute;
          font-size: 8px;
          font-weight: 900;
          color: #333;
        }
        
        .segment-side {
          position: absolute;
          width: 100%;
          height: 20px;
          background: linear-gradient(90deg, hsl(var(--segment-hue), var(--segment-saturation), calc(var(--segment-lightness) - 20%)), hsl(var(--segment-hue), var(--segment-saturation), calc(var(--segment-lightness) - 30%)));
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .segment-side-1 { transform: rotateY(0deg) translateZ(10px); }
        .segment-side-2 { transform: rotateY(90deg) translateZ(10px); }
        .segment-side-3 { transform: rotateY(180deg) translateZ(10px); }
        .segment-side-4 { transform: rotateY(270deg) translateZ(10px); }
        
        .wheel-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80px;
          height: 80px;
          margin: -40px 0 0 -40px;
          transform-style: preserve-3d;
        }
        
        .center-content {
          position: relative;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 0.9) 100%);
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.9);
          box-shadow: 
            0 12px 35px rgba(0, 0, 0, 0.4),
            inset 0 4px 12px rgba(255, 255, 255, 0.6),
            0 0 30px rgba(102, 126, 234, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #333;
          font-weight: bold;
          backdrop-filter: blur(10px);
          animation: glow 3s ease-in-out infinite;
        }
        
        .balance-score {
          font-size: 18px;
          font-weight: 900;
          line-height: 1;
        }
        
        .balance-label {
          font-size: 10px;
          opacity: 0.7;
          margin-top: 2px;
        }
        
        .center-glow {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .wheel-labels {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .floating-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: all 0.3s ease;
          pointer-events: none;
        }
        
        .floating-label.active {
          opacity: 1;
        }
        
        .label-content {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .label-name {
          display: block;
          font-weight: 600;
        }
        
        .label-score {
          display: block;
          font-size: 10px;
          opacity: 0.8;
        }
        
        .label-priority {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #FFD700;
          color: #333;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 900;
        }
        
        @keyframes float {
          0%, 100% { transform: rotateX(15deg) rotateY(-10deg) translateY(0px); }
          50% { transform: rotateX(20deg) rotateY(-5deg) translateY(-8px); }
        }
        
        @keyframes rotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
          50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.5), 0 0 40px rgba(118, 75, 162, 0.3); }
        }
        
        @media (max-width: 768px) {
          .wheel-3d-container {
            height: 300px;
          }
          
          .wheel-3d-wrapper {
            width: 250px;
            height: 250px;
          }
          
          .wheel-background-ring {
            width: 220px;
            height: 220px;
            margin: -110px 0 0 -110px;
          }
          
          .wheel-segment-3d {
            width: 50px;
            height: 50px;
            margin: -25px 0 0 -25px;
          }
          
          .wheel-center {
            width: 60px;
            height: 60px;
            margin: -30px 0 0 -30px;
          }
          
          .balance-score {
            font-size: 14px;
          }
          
          .balance-label {
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default WheelOfLife3D; 