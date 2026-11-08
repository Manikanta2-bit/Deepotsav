# DEEPOTSAV — Festival of Lights

An advanced, responsive Diwali experience built with React, Vite, Three.js, React Three Fiber, Drei and Framer Motion.

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- npm

## Run locally
1. Extract the ZIP.
2. Open the `deepotsav` folder in VS Code.
3. Open the integrated terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

The production-ready files are generated in `dist/`.

## Project structure

```text
deepotsav/
├── index.html
├── package.json
├── README.md
└── src/
    ├── App.jsx       # Page, 3D scene, interactions and sections
    ├── index.css     # Responsive styling and animations
    └── main.jsx      # React entry point
```

## Interactions
- Click the 3D diyas or the diya cards to toggle their flames.
- Click empty areas of the page to trigger a fireworks burst.
- Enter a name to generate a personal Diwali greeting.
- Use Share to send the greeting (or copy it where Web Share is unavailable).
- Toggle the sound control for a subtle generated ambient tone.

## Notes
- The 3D scene uses procedural geometry; no external 3D model files are required.
- Google Fonts are loaded online. The site still works if they are unavailable, using fallback fonts.
- Audio starts only after the user presses the sound control, in line with browser autoplay restrictions.
