import path from "path";

export default {
  plugins: {
    "@tailwindcss/postcss": {
      // eslint-disable-next-line no-undef
      base: path.resolve(process.cwd(), "../../"),
      content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "../../packages/registry/**/*.{js,ts,jsx,tsx,mdx}",
      ],
    },
  },
};
