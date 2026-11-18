// Atlassian Design System Dark Mode Tokens
export const colors = {
  // Text colors
  text: {
    primary: '#F1F2F4',
    secondary: '#9FADBC',
    subtle: '#8C9BAB',
    inverse: '#1D2125',
    brand: '#579DFF',
    danger: '#F87171',
    warning: '#FBBF24',
    success: '#4BCE97',
  },
  // Background colors
  bg: {
    surface: '#1D2125',
    elevated: '#22272B',
    sunken: '#161A1D',
    subtle: '#282E33',
    subtleHover: 'rgba(255, 255, 255, 0.08)',
    subtleActive: 'rgba(255, 255, 255, 0.16)',
    neutral: '#2C333A',
    brand: '#0C66E4',
    brandHover: '#0055CC',
    brandActive: '#09326C',
    brandSubtle: 'rgba(87, 157, 255, 0.15)',
    success: '#216E4E',
    successSubtle: 'rgba(33, 110, 78, 0.35)',
    warning: '#A54800',
    warningSubtle: 'rgba(165, 72, 0, 0.35)',
    danger: '#AE2E24',
    dangerSubtle: 'rgba(174, 46, 36, 0.35)',
    purple: '#6554C0',
    purpleSubtle: 'rgba(101, 84, 192, 0.35)',
    teal: '#206B83',
    tealSubtle: 'rgba(32, 107, 131, 0.35)',
  },
  // Border colors
  border: {
    default: '#333C48',
    subtle: '#2C333A',
    focused: '#579DFF',
    danger: '#F87171',
    success: '#4BCE97',
  },
  // Elevations / Shadows
  elevation: {
    e100: '0 1px 1px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(0, 0, 0, 0.3)',
    e200: '0 3px 5px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 0, 0, 0.4)',
    e300: '0 8px 16px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 0, 0, 0.4)',
    e400: '0 12px 24px -6px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.4)',
    modal: '0 20px 32px -8px rgba(0, 0, 0, 0.7), 0 0 1px rgba(0, 0, 0, 0.6)',
  },
  // Status colors
  status: {
    backlog: { text: '#9FADBC', bg: '#282E33', border: '#333C48' },
    todo: { text: '#DEE4EA', bg: '#282E33', border: '#333C48' },
    inProgress: { text: '#FFFFFF', bg: '#0055CC', border: '#0C66E4' },
    inReview: { text: '#FFFFFF', bg: '#5E4DB2', border: '#6554C0' },
    done: { text: '#FFFFFF', bg: '#216E4E', border: '#1F845A' },
    cancelled: { text: '#FFFFFF', bg: '#AE2E24', border: '#CA3521' },
  },
  // Issue Type colors
  issueType: {
    epic: '#904EE2',
    story: '#00875A',
    task: '#4BADE8',
    bug: '#E5493A',
    subtask: '#00A3BF',
  }
};
