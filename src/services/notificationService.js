// Comprehensive notification service for web app notifications

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
    this.callbacks = {};
    this.activeNotifications = new Map();
    
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    // Check current permission
    this.permission = Notification.permission;
    
    // Request permission if needed
    if (this.permission === 'default') {
      await this.requestPermission();
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Show native browser notification
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Notifications not permitted or supported');
      return null;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      image: null,
      body: '',
      tag: 'beach-club-notification',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      data: {},
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Store reference
      const id = Date.now().toString();
      this.activeNotifications.set(id, notification);

      // Set up event handlers
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (options.onClick) {
          options.onClick(event);
        }
        notification.close();
      };

      notification.onclose = () => {
        this.activeNotifications.delete(id);
        if (options.onClose) {
          options.onClose();
        }
      };

      notification.onerror = (error) => {
        console.error('Notification error:', error);
        this.activeNotifications.delete(id);
      };

      // Auto close after timeout
      if (options.autoClose !== false) {
        setTimeout(() => {
          if (this.activeNotifications.has(id)) {
            notification.close();
          }
        }, options.timeout || 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Show in-app notification toast
  showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    
    // Style the toast
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: this.getToastColor(type),
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '10000',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '300px',
      wordWrap: 'break-word',
      transform: 'translateX(350px)',
      transition: 'transform 0.3s ease-in-out',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });

    // Add icon based on type
    const icon = this.getToastIcon(type);
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${icon}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: auto; padding: 0;">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.transform = 'translateX(350px)';
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }
    }, duration);

    return toast;
  }

  getToastColor(type) {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  getToastIcon(type) {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }

  // Specific notification types for the beach club app
  notifyNewMessage(sender, message, onClick) {
    return this.showNotification(`New message from ${sender}`, {
      body: message.length > 50 ? message.substring(0, 50) + '...' : message,
      icon: '💬',
      tag: 'new-message',
      onClick: onClick,
      vibrate: [100, 50, 100]
    });
  }

  notifyEvent(eventTitle, eventTime, onClick) {
    return this.showNotification(`Upcoming Event: ${eventTitle}`, {
      body: `Starting at ${eventTime}`,
      icon: '📅',
      tag: 'event-reminder',
      onClick: onClick,
      requireInteraction: true
    });
  }

  notifyBagsGame(gameInfo, onClick) {
    return this.showNotification('Bags Game Update', {
      body: gameInfo,
      icon: '🎯',
      tag: 'bags-game',
      onClick: onClick
    });
  }

  notifyTournament(tournamentInfo, onClick) {
    return this.showNotification('Tournament Update', {
      body: tournamentInfo,
      icon: '🏆',
      tag: 'tournament',
      onClick: onClick,
      requireInteraction: true
    });
  }

  notifyWaitlist(position, onClick) {
    return this.showNotification('Waitlist Update', {
      body: `You are now #${position} in the queue`,
      icon: '🕐',
      tag: 'waitlist',
      onClick: onClick
    });
  }

  // Clear all notifications
  clearAll() {
    this.activeNotifications.forEach(notification => {
      notification.close();
    });
    this.activeNotifications.clear();

    // Clear toast notifications
    const toasts = document.querySelectorAll('.notification-toast');
    toasts.forEach(toast => toast.remove());
  }

  // Check if notifications are enabled
  isEnabled() {
    return this.isSupported && this.permission === 'granted';
  }

  // Get notification status
  getStatus() {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.isEnabled(),
      activeCount: this.activeNotifications.size
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;