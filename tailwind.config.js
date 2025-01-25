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
		  background: '#F7F9F2', // Grey background
		//   foreground: '#181C14', // Red foreground
		  foreground: '#181C14', // Black foreground

		  card: {
			DEFAULT: '#F7F9F2', // Grey card background
			foreground: '#181C14', // Black card foreground
		  },
		  popover: {
			DEFAULT: '#F7F9F2', // Grey popover background
			foreground: '#181C14', // Black popover foreground
		  },
		  primary: {
			DEFAULT: '#181C14', // Black primary color
			foreground: '#fff', // Grey primary foreground
		  },
		  secondary: {
			DEFAULT: '#F7F9F2', // Grey secondary color
			foreground: '#181C14', // Red secondary foreground
		  },
		  muted: {
			DEFAULT: '#F7F9F2', // Grey muted color
			foreground: '#181C14', // Red muted foreground
		  },
		  accent: {
			DEFAULT: '#181C14', // Red accent color
			foreground: '#F7F9F2', // Grey accent foreground
		  },
		  destructive: {
			DEFAULT: '#181C14', // Red destructive color
			foreground: '#F7F9F2', // Grey destructive foreground
		  },
		  border: '#181C14', // Red border
		  input: '#F7F9F2', // Grey input
		  ring: '#181C14', // Red ring
		  chart: {
			'1': '#181C14', // Red chart color
			'2': '#F7F9F2', // Grey chart color
			'3': '#181C14', // Red chart color
			'4': '#F7F9F2', // Grey chart color
			'5': '#181C14', // Red chart color
		  },
		  sidebar: {
			DEFAULT: '#181C14', // Grey sidebar background
			foreground: '#fff', // Red sidebar foreground
			primary: '#181C14', // Red sidebar primary
			'primary-foreground': '#F7F9F2', // Grey sidebar primary foreground
			accent: '#fff', // Red sidebar accent
			'accent-foreground': '#181C14', // Grey sidebar accent foreground
			border: '#181C14', // Red sidebar border
			ring: '#181C14', // Red sidebar ring
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
  