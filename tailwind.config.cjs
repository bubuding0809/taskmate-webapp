/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderWidth: {
        3: "3px",
      },
      backgroundImage: {
        "green-image": "url('/images/paul-weaver-unsplash.jpeg')",
        "nature-image":
          "url('https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2600&q=80')",
        "autumn-image":
          "url('https://images.unsplash.com/photo-1549556289-9706946b9c56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80')",
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
        "solid-medium": "5px 5px 0.5px #94a3b8",
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
      // strategy: "class", // Only generate classes for form elements, will not apply globally styles to input, textarea, etc.
      strategy: "base", // default, will cause issues with custom components in exisiting input fields
    }),
  ],
};
