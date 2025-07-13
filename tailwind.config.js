/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'f1': ['Orbitron', 'sans-serif'],
        'racing': ['Rajdhani', 'sans-serif'],
      },
      colors: {
        // Mercedes AMG F1 Color Scheme
        'mercedes-silver': '#C0C0C0',
        'mercedes-dark-silver': '#8E8E93',
        'mercedes-black': '#000000',
        'mercedes-petronas': '#00D2BE',
        'mercedes-cyan': '#00F5FF',
        'mercedes-dark-cyan': '#00CED1',
        'mercedes-green': '#00FF7F',
        'mercedes-charcoal': '#1C1C1E',
        'mercedes-platinum': '#E5E5EA',
        'mercedes-gunmetal': '#2C2C2E',

        // Legacy colors for compatibility
        'f1-red': '#E10600',
        'f1-dark-red': '#C50000',
        'f1-black': '#15151E',
        'f1-carbon': '#2A2A2A',
        'f1-gold': '#FFD700',
        'f1-silver': '#C0C0C0',
        'f1-bronze': '#CD7F32',
        'electric-blue': '#00D4FF',
        'neon-green': '#39FF14',
        'racing-orange': '#FF8C00',
      },
      boxShadow: {
        'mercedes-glow': '0 0 20px rgba(0, 210, 190, 0.5)',
        'mercedes-silver-glow': '0 0 15px rgba(192, 192, 192, 0.4)',
        'mercedes-neon': '0 0 30px rgba(0, 245, 255, 0.6)',
        'dashboard': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 10px 25px -5px rgba(0, 210, 190, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'speed-lines': 'speedLines 3s ease-in-out infinite',
        'dashboard-glow': 'dashboardGlow 3s ease-in-out infinite alternate',
        'mercedes-scan': 'mercedesScan 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 210, 190, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 210, 190, 0.8), 0 0 30px rgba(0, 210, 190, 0.4)' },
        },
        speedLines: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        dashboardGlow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 210, 190, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 210, 190, 0.6)' },
        },
        mercedesScan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
        'carbon-fiber': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'mercedes-gradient': 'linear-gradient(135deg, #000000 0%, #1C1C1E 25%, #00D2BE 50%, #C0C0C0 75%, #000000 100%)',
      },
    },
  },
  plugins: [],
}
