import React, { useState } from 'react';
import { Bell, CheckCheck, MessageSquare, UserCheck, ArrowRight, Activity } from 'lucide-react';
import { useNotifications, notificationService } from '../../services';
import { Notification } from '../../types';

export const NotificationsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const notifications = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredList =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'COMMENT':
        return <MessageSquare size={14} className="text-blue-400" />;
      case 'ASSIGN':
        return <UserCheck size={14} className="text-green-400" />;
      case 'STATUS_CHANGE':
        return <ArrowRight size={14} className="text-purple-400" />;
      default:
        return <Activity size={14} className="text-amber-400" />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: isOpen ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#9FADBC',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: '#F87171',
              color: '#161A1D',
              borderRadius: '50%',
              fontSize: '10px',
              fontWeight: 700,
              width: '15px',
              height: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 2px #1D2125',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 590 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="animate-slide-down"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '360px',
              backgroundColor: '#22272B',
              borderRadius: '6px',
              border: '1px solid #333C48',
              boxShadow:
                '0 12px 24px -6px rgba(0, 0, 0, 0.6), 0 0 0 1px #333C48',
              zIndex: 600,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #333C48',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F1F2F4' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => notificationService.markAllAsRead()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#579DFF',
                    fontSize: '12px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#1D2125',
                borderBottom: '1px solid #333C48',
              }}
            >
              <button
                onClick={() => setFilter('all')}
                style={{
                  background: filter === 'all' ? '#282E33' : 'transparent',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  fontWeight: filter === 'all' ? 600 : 400,
                  color: filter === 'all' ? '#579DFF' : '#9FADBC',
                  boxShadow: filter === 'all' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                style={{
                  background: filter === 'unread' ? '#282E33' : 'transparent',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  fontWeight: filter === 'unread' ? 600 : 400,
                  color: filter === 'unread' ? '#579DFF' : '#9FADBC',
                  boxShadow: filter === 'unread' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification items */}
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {filteredList.length === 0 ? (
                <div
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: '#8C9BAB',
                    fontSize: '13px',
                  }}
                >
                  No {filter === 'unread' ? 'unread ' : ''}notifications
                </div>
              ) : (
                filteredList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      notificationService.markAsRead(item.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px 16px',
                      backgroundColor: item.read ? '#22272B' : 'rgba(87, 157, 255, 0.08)',
                      borderBottom: '1px solid #282E33',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = item.read
                        ? '#282E33'
                        : 'rgba(87, 157, 255, 0.16)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = item.read
                        ? '#22272B'
                        : 'rgba(87, 157, 255, 0.08)';
                    }}
                  >
                    <div
                      style={{
                        padding: '6px',
                        backgroundColor: '#1D2125',
                        borderRadius: '50%',
                        border: '1px solid #333C48',
                        marginTop: '2px',
                      }}
                    >
                      {getIcon(item.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: item.read ? 500 : 600,
                          color: '#F1F2F4',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#9FADBC',
                          marginTop: '2px',
                        }}
                      >
                        {item.message}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#738496',
                          marginTop: '4px',
                        }}
                      >
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    {!item.read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#579DFF',
                          marginTop: '6px',
                        }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
