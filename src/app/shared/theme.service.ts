import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = signal<'light' | 'dark'>('dark');

  constructor() {
    this.applyTheme('dark'); // Default to dark mode
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
  }

  getTheme() {
    return this.currentTheme();
  }

  private applyTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;
    
    // Set theme data attribute for CSS targeting
    root.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#121212');
      root.style.setProperty('--bg-secondary', '#1e1e1e');
      root.style.setProperty('--bg-tertiary', '#2d2d2d');
      root.style.setProperty('--text-primary', '#e0e0e0');
      root.style.setProperty('--text-secondary', '#b0b0b0');
      root.style.setProperty('--text-muted', '#888');
      root.style.setProperty('--border-color', '#404040');
      root.style.setProperty('--shadow', 'rgba(0,0,0,0.3)');
      root.style.setProperty('--hover-bg', '#404040');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--bg-tertiary', '#ffffff');
      root.style.setProperty('--text-primary', '#333333');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--text-muted', '#999999');
      root.style.setProperty('--border-color', '#dee2e6');
      root.style.setProperty('--shadow', 'rgba(0,0,0,0.1)');
      root.style.setProperty('--hover-bg', '#f8f9fa');
    }
  }
}