/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderWidth: {
        3: "3px",
      },
      backgroundImage: {
        "green-image": "url('/public/images/paul-weaver-unsplash.jpeg')",
      },
      backgroundColor: {
        "secondary-green": "#9cb380",
      },
      minWidth: {
        sm: "20rem",
        md: "24rem",
        lg: "28rem",
        xl: "32rem",
        "2xl": "36rem",
        "3xl": "40rem",
      },
      minHeight: {
        10: "10px",
        20: "20px",
        "20%": "20%",
        "25%": "25%",
        "30%": "30%",
        "40%": "40%",
        "50%": "50%",
        "60%": "60%",
        "75%": "75%",
      },
      maxHeight: {
        "70%": "70%",
        "80%": "80%",
        "90%": "90%",
      },
      boxShadow: {
        "solid-small": "3px 3px 0.5px #94a3b8",
      },
      cursor: {
        "custom-cursor": "url(/public/cursors/cursoredit.gif), pointer",
      },
      animation: {
        fade: "fade 5s ",
      },
      keyframes: {
        fade: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class", // Only generate classes for form elements, will not apply globally styles to input, textarea, etc.
      // strategy: "base", // default, will cause issues with custom components in exisiting input fields
    }),
    require("tailwind-scrollbar"),
  ],
};
