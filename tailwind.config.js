/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		colors: {
		  background: '#dbd9db', // Grey background
		  foreground: '#c41e3a', // Red foreground
		  card: {
			DEFAULT: '#dbd9db', // Grey card background
			foreground: '#c41e3a', // Red card foreground
		  },
		  popover: {
			DEFAULT: '#dbd9db', // Grey popover background
			foreground: '#c41e3a', // Red popover foreground
		  },
		  primary: {
			DEFAULT: '#c41e3a', // Red primary color
			foreground: '#dbd9db', // Grey primary foreground
		  },
		  secondary: {
			DEFAULT: '#dbd9db', // Grey secondary color
			foreground: '#c41e3a', // Red secondary foreground
		  },
		  muted: {
			DEFAULT: '#dbd9db', // Grey muted color
			foreground: '#c41e3a', // Red muted foreground
		  },
		  accent: {
			DEFAULT: '#c41e3a', // Red accent color
			foreground: '#dbd9db', // Grey accent foreground
		  },
		  destructive: {
			DEFAULT: '#c41e3a', // Red destructive color
			foreground: '#dbd9db', // Grey destructive foreground
		  },
		  border: '#c41e3a', // Red border
		  input: '#dbd9db', // Grey input
		  ring: '#c41e3a', // Red ring
		  chart: {
			'1': '#c41e3a', // Red chart color
			'2': '#dbd9db', // Grey chart color
			'3': '#c41e3a', // Red chart color
			'4': '#dbd9db', // Grey chart color
			'5': '#c41e3a', // Red chart color
		  },
		  sidebar: {
			DEFAULT: '#dbd9db', // Grey sidebar background
			foreground: '#c41e3a', // Red sidebar foreground
			primary: '#c41e3a', // Red sidebar primary
			'primary-foreground': '#dbd9db', // Grey sidebar primary foreground
			accent: '#c41e3a', // Red sidebar accent
			'accent-foreground': '#dbd9db', // Grey sidebar accent foreground
			border: '#c41e3a', // Red sidebar border
			ring: '#c41e3a', // Red sidebar ring
		  },
		},
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)',
		},
		keyframes: {
		  'accordion-down': {
			from: { height: '0' },
			to: { height: 'var(--radix-accordion-content-height)' },
		  },
		  'accordion-up': {
			from: { height: 'var(--radix-accordion-content-height)' },
			to: { height: '0' },
		  },
		},
		animation: {
		  'accordion-down': 'accordion-down 0.2s ease-out',
		  'accordion-up': 'accordion-up 0.2s ease-out',
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  };
  