import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  HelpCircle,
  Layers,
  ChevronDown,
  Settings,
  FolderKanban,
  Users,
} from 'lucide-react';
import { Button } from '../../design-system/components';
import { NotificationsMenu } from './NotificationsMenu';
import { ProfileMenu } from './ProfileMenu';
import { CreateIssueModal } from '../issue/CreateIssueModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { useProjects } from '../../services';

export const GlobalNavbar: React.FC = () => {
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);
  const projects = useProjects();
  const navigate = useNavigate();

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and 'c'
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      } else if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        style={{
          height: '56px',
          backgroundColor: '#1D2125',
          borderBottom: '1px solid #333C48',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 400,
          userSelect: 'none',
        }}
      >
        {/* Left Side: Brand Logo & Main Nav Menus */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* App Switcher (9-dot grid icon) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsAppSwitcherOpen(!isAppSwitcherOpen)}
              style={{
                background: isAppSwitcherOpen ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: 'none',
                borderRadius: '3px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9FADBC',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = isAppSwitcherOpen
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'transparent')
              }
              title="App Switcher"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="2.5" cy="2.5" r="1.5" />
                <circle cx="8" cy="2.5" r="1.5" />
                <circle cx="13.5" cy="2.5" r="1.5" />
                <circle cx="2.5" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="13.5" cy="8" r="1.5" />
                <circle cx="2.5" cy="13.5" r="1.5" />
                <circle cx="8" cy="13.5" r="1.5" />
                <circle cx="13.5" cy="13.5" r="1.5" />
              </svg>
            </button>
            {isAppSwitcherOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 490 }}
                  onClick={() => setIsAppSwitcherOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    width: '260px',
                    backgroundColor: '#22272B',
                    borderRadius: '3px',
                    border: '1px solid #333C48',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
                    zIndex: 500,
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#8C9BAB',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    SWITCH TO
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '3px',
                        backgroundColor: 'rgba(87, 157, 255, 0.15)',
                        color: '#579DFF',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px',
                      }}
                    >
                      <Layers size={18} /> Jira Software
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '3px',
                        color: '#F1F2F4',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#282E33')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <FolderKanban size={18} color="#579DFF" /> Confluence
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '3px',
                        color: '#F1F2F4',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#282E33')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <Users size={18} color="#4BCE97" /> Jira Service Management
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Brand Identity */}
          <NavLink
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              padding: '6px 8px',
              borderRadius: '4px',
              marginRight: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#0C66E4',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={18} strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#F1F2F4',
                letterSpacing: '-0.02em',
              }}
            >
              TaskFlow
            </span>
          </NavLink>

          {/* Nav Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                color: isActive ? '#579DFF' : '#9FADBC',
                backgroundColor: isActive ? 'rgba(87, 157, 255, 0.15)' : 'transparent',
                padding: '6px 10px',
                borderRadius: '3px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
              })}
            >
              Your Work
            </NavLink>

            {/* Projects Dropdown Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProjectsMenuOpen(!isProjectsMenuOpen)}
                style={{
                  background: isProjectsMenuOpen ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: 'none',
                  color: '#9FADBC',
                  padding: '6px 10px',
                  borderRadius: '3px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Projects</span>
                <ChevronDown size={13} />
              </button>

              {isProjectsMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 490 }}
                    onClick={() => setIsProjectsMenuOpen(false)}
                  />
                  <div
                    className="animate-slide-down"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      width: '260px',
                      backgroundColor: '#22272B',
                      borderRadius: '4px',
                      boxShadow:
                        '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 0, 0, 0.4)',
                      border: '1px solid #333C48',
                      zIndex: 500,
                      padding: '6px 0',
                    }}
                  >
                    <div
                      style={{
                        padding: '6px 14px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#8C9BAB',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Recent Projects
                    </div>
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          setIsProjectsMenuOpen(false);
                          navigate(`/projects/${proj.key}/board`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = '#282E33')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'transparent')
                        }
                      >
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '3px',
                            backgroundColor: proj.iconBgColor || '#0C66E4',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {proj.key.substring(0, 2)}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#F1F2F4',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {proj.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9FADBC' }}>
                            {proj.key}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #333C48', marginTop: '4px', paddingTop: '4px' }}>
                      <NavLink
                        to="/projects"
                        onClick={() => setIsProjectsMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '8px 14px',
                          fontSize: '13px',
                          color: '#579DFF',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = '#282E33')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'transparent')
                        }
                      >
                        View all projects →
                      </NavLink>
                    </div>
                  </div>
                </>
              )}
            </div>

            <NavLink
              to="/filters"
              style={({ isActive }) => ({
                color: isActive ? '#579DFF' : '#9FADBC',
                backgroundColor: isActive ? 'rgba(87, 157, 255, 0.15)' : 'transparent',
                padding: '6px 10px',
                borderRadius: '3px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              })}
            >
              <span>Filters</span>
              <ChevronDown size={13} />
            </NavLink>

            <NavLink
              to="/dashboard"
              style={{
                color: '#9FADBC',
                backgroundColor: 'transparent',
                padding: '6px 10px',
                borderRadius: '3px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Dashboards</span>
              <ChevronDown size={13} />
            </NavLink>

            <NavLink
              to="/teams"
              style={({ isActive }) => ({
                color: isActive ? '#579DFF' : '#9FADBC',
                backgroundColor: isActive ? 'rgba(87, 157, 255, 0.15)' : 'transparent',
                padding: '6px 10px',
                borderRadius: '3px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              })}
            >
              <span>Teams</span>
              <ChevronDown size={13} />
            </NavLink>

            <NavLink
              to="/settings"
              style={{
                color: '#9FADBC',
                backgroundColor: 'transparent',
                padding: '6px 10px',
                borderRadius: '3px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Apps</span>
              <ChevronDown size={13} />
            </NavLink>

            {/* "+ Create" Primary Action Button */}
            <div style={{ marginLeft: '8px' }}>
              <Button
                appearance="primary"
                iconBefore={<Plus size={16} />}
                onClick={() => setIsCreateModalOpen(true)}
                title="Create new issue (Press 'c')"
                style={{
                  borderRadius: '3px',
                  backgroundColor: '#0C66E4',
                  color: '#FFFFFF',
                  height: '32px',
                  padding: '0 12px',
                  fontWeight: 500,
                  fontSize: '14px',
                }}
              >
                Create
              </Button>
            </div>
          </nav>
        </div>

        {/* Right Side: Quick Search, Settings, Help, Notifications, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Spotlight Search Trigger */}
          <div
            onClick={() => setIsSearchModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '4px',
              padding: '0 10px',
              height: '32px',
              width: '200px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#282E33';
              e.currentTarget.style.borderColor = '#738496';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#22272B';
              e.currentTarget.style.borderColor = '#333C48';
            }}
          >
            <Search size={14} color="#8C9BAB" />
            <span style={{ fontSize: '13px', color: '#8C9BAB', flex: 1 }}>
              Search...
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#8C9BAB',
                backgroundColor: '#1D2125',
                padding: '1px 4px',
                borderRadius: '3px',
                border: '1px solid #333C48',
              }}
            >
              Ctrl+K
            </span>
          </div>

          {/* Settings button */}
          <button
            onClick={() => navigate('/settings')}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9FADBC',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Notifications Dropdown */}
          <NotificationsMenu />

          {/* Help button */}
          <button
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9FADBC',
              cursor: 'pointer',
            }}
            title="Help & Documentation"
          >
            <HelpCircle size={18} />
          </button>

          {/* Profile Menu & Role Switcher */}
          <ProfileMenu />
        </div>
      </header>

      {/* Global Modals */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};
