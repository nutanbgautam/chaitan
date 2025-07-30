'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  DollarSign, 
  Users,
  Settings,
  PieChart,
  Calendar
} from 'lucide-react';

interface NavigationProps {
  showBackButton?: boolean;
  backHref?: string;
  title?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
}

export default function Navigation({
  showBackButton = false,
  backHref = '/dashboard',
  title,
  showAddButton = false,
  addButtonText = 'Add',
  onAddClick
}: NavigationProps) {
  const pathname = usePathname();

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <Home className="fs-5" />, href: '/dashboard' },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="fs-5" />, href: '/journal' },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="fs-5" />, href: '/tasks' },
    { id: 'finance', label: 'Finance', icon: <DollarSign className="fs-5" />, href: '/finance' },
    { id: 'people', label: 'People', icon: <Users className="fs-5" />, href: '/people' },
    { id: 'recaps', label: 'Recaps', icon: <Calendar className="fs-5" />, href: '/recaps' },
  ];

  const getActiveItem = () => {
    if (pathname === '/dashboard') return 'home';
    
    // More precise matching to avoid multiple highlights
    for (const item of navigationItems) {
      if (item.href === '/dashboard') continue; // Skip home for other paths
      
      if (pathname === item.href || pathname.startsWith(item.href + '/')) {
        return item.id;
      }
    }
    
    return 'home';
  };

  const activeItem = getActiveItem();

  return (
    <>
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-25 backdrop-blur">
        <div className="container-fluid">
          {showBackButton ? (
            <Link href={backHref} className="btn btn-outline-light btn-sm rounded-circle">
              <Home className="fs-5" />
            </Link>
          ) : (
            <div className="navbar-brand d-flex align-items-center">
              <div className="position-relative me-3">
                <div className="rounded-circle bg-gradient d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' }}>
                  <span className="text-white fw-bold">C</span>
                </div>
                <div className="position-absolute top-0 end-0 bg-success rounded-circle border border-white" style={{ width: '12px', height: '12px' }}></div>
              </div>
              <span className="text-white fw-bold fs-5">chaitan.ai</span>
            </div>
          )}
          
          {title && (
            <div className="navbar-brand d-flex align-items-center mx-auto">
              <span className="text-white fw-bold">{title}</span>
            </div>
          )}
          
          <div className="d-flex align-items-center gap-2">
            {showAddButton && onAddClick && (
              <button
                onClick={onAddClick}
                className="btn btn-primary btn-sm"
              >
                {addButtonText}
              </button>
            )}
            <Link href="/profile" className="btn btn-outline-light btn-sm rounded-circle">
              <Settings className="fs-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <nav className="navbar navbar-expand fixed-bottom bg-dark bg-opacity-75 backdrop-blur border-top border-white border-opacity-25">
        <div className="container-fluid">
          <div className="navbar-nav w-100 justify-content-around">
            {navigationItems.map((item) => (
              <Link 
                key={item.id} 
                href={item.href} 
                className={`nav-link text-center ${activeItem === item.id ? 'active' : ''}`}
              >
                <div className="d-flex flex-column align-items-center">
                  <div className={`${activeItem === item.id ? 'text-primary' : 'text-white'}`}>
                    {item.icon}
                  </div>
                  <small className={`mt-1 ${activeItem === item.id ? 'text-primary' : 'text-white'}`}>
                    {item.label}
                  </small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </nav>



      <style jsx>{`
        .backdrop-blur {
          backdrop-filter: blur(10px);
        }
        .nav-link.active {
          background-color: rgba(13, 110, 253, 0.2);
          border-radius: 8px;
          border: 1px solid rgba(13, 110, 253, 0.3);
        }
        .nav-link:not(.active) {
          opacity: 0.8;
        }
        .nav-link:not(.active):hover {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
      `}</style>
    </>
  );
} 