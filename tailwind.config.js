/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        gridTemplateColumns:{
            "scalable-grid":"repeat(auto-fill,minmax(400px,1fr))"
        },
        keyframes:{
            border_run : {
                
            }
        }
    },
  },
  plugins: [],
}
