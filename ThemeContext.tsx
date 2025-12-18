
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'corporate' | 'elegant' | 'modern' | 'warm';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  font: string;
  colors: {
    base: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      850: string;
      900: string;
    };
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
    };
  };
}

export const THEMES: Record<ThemeId, Theme> = {
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional Slate & Blue. Clean and trustworthy.',
    font: 'Inter',
    colors: {
      base: {
        50: '248 250 252', // Slate
        100: '241 245 249',
        200: '226 232 240',
        300: '203 213 225',
        400: '148 163 184',
        500: '100 116 139',
        600: '71 85 105',
        700: '51 65 85',
        800: '30 41 59',
        850: '22 32 49',
        900: '15 23 42',
      },
      primary: {
        50: '239 246 255', // Blue
        100: '219 234 254',
        200: '191 219 254',
        300: '147 197 253',
        400: '96 165 250',
        500: '59 130 246',
        600: '37 99 235',
        700: '29 78 216',
      }
    }
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated Stone & Emerald. Warm and grounded.',
    font: 'Lato',
    colors: {
      base: {
        50: '250 250 249', // Stone
        100: '245 245 244',
        200: '231 229 228',
        300: '214 211 209',
        400: '168 162 158',
        500: '120 113 108',
        600: '87 83 78',
        700: '68 64 60',
        800: '41 37 36',
        850: '35 30 28',
        900: '28 25 23',
      },
      primary: {
        50: '236 253 245', // Emerald
        100: '209 250 229',
        200: '167 243 208',
        300: '110 231 183',
        400: '52 211 153',
        500: '16 185 129',
        600: '5 150 105',
        700: '4 120 87',
      }
    }
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Sleek Zinc & Violet. High contrast and tech-focused.',
    font: 'Roboto',
    colors: {
      base: {
        50: '250 250 250', // Zinc
        100: '244 244 245',
        200: '228 228 231',
        300: '212 212 216',
        400: '161 161 170',
        500: '113 113 122',
        600: '82 82 91',
        700: '63 63 70',
        800: '39 39 42',
        850: '32 32 35',
        900: '24 24 27',
      },
      primary: {
        50: '245 243 255', // Violet
        100: '237 233 254',
        200: '221 214 254',
        300: '196 181 253',
        400: '167 139 250',
        500: '139 92 246',
        600: '124 58 237',
        700: '109 40 217',
      }
    }
  },
  warm: {
    id: 'warm',
    name: 'Warm',
    description: 'Cozy Neutral & Amber. Inviting and friendly.',
    font: 'Quicksand',
    colors: {
      base: {
        50: '250 250 250', // Neutral
        100: '245 245 245',
        200: '229 229 229',
        300: '212 212 212',
        400: '163 163 163',
        500: '115 115 115',
        600: '82 82 82',
        700: '64 64 64',
        800: '38 38 38',
        850: '30 30 30',
        900: '23 23 23',
      },
      primary: {
        50: '255 251 235', // Amber
        100: '254 243 199',
        200: '253 230 138',
        300: '252 211 77',
        400: '251 191 36',
        500: '245 158 11',
        600: '217 119 6',
        700: '180 83 9',
      }
    }
  }
};

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (id: ThemeId) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'corporate',
  setTheme: () => { },
  isDarkMode: false,
  toggleDarkMode: () => { },
  availableThemes: Object.values(THEMES)
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('propfolio_theme') as ThemeId) || 'corporate';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('propfolio_dark_mode') === 'true';
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('propfolio_dark_mode', String(isDarkMode));
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('propfolio_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const theme = THEMES[currentTheme];
    const root = document.documentElement;
    const base = theme.colors.base;
    const primary = theme.colors.primary;

    root.style.setProperty('--font-main', theme.font);

    if (isDarkMode) {
      // SOPHISTICATED MUTED THEME logic:
      // Background: Muted Light-Dark (Slate 200 feel)
      // Cards: Off-white (Slate 50 / White)

      // Map "dark" tokens to "muted light" shades to achieve the look
      root.style.setProperty('--color-base-950', '226 232 240'); // Main App Background
      root.style.setProperty('--color-base-900', '241 245 249'); // Secondary Surfaces / Sidebar
      root.style.setProperty('--color-base-850', '248 250 252'); // Card Base
      root.style.setProperty('--color-base-800', '255 255 255'); // Premium Card Surface
      root.style.setProperty('--color-base-700', '203 213 225'); // Borders/Dividers (Slate 300)

      // Map "light" tokens to "dark" shades for text contrast
      root.style.setProperty('--color-base-50', '15 23 42');   // Primary Text
      root.style.setProperty('--color-base-100', '51 65 85');  // Secondary Text
      root.style.setProperty('--color-base-200', '71 85 105'); // Muted Text
      root.style.setProperty('--color-base-300', '100 116 139');

      // Primary colors refined for the muted theme
      root.style.setProperty('--color-primary-500', '37 99 235');
      root.style.setProperty('--color-primary-400', '59 130 246');
      root.style.setProperty('--color-primary-600', '29 78 216');
    } else {
      // Normal Base
      Object.entries(base).forEach(([shade, value]) => {
        root.style.setProperty(`--color-base-${shade}`, value as string);
      });
      // Normal Primary
      Object.entries(primary).forEach(([shade, value]) => {
        root.style.setProperty(`--color-primary-${shade}`, value as string);
      });
    }

  }, [currentTheme, isDarkMode]);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme: setCurrentTheme,
      isDarkMode,
      toggleDarkMode,
      availableThemes: Object.values(THEMES)
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
