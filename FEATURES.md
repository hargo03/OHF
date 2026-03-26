# Rob's Outta Here Fiesta (OHF) - Feature Documentation

Welcome to **Rob's Outta Here Fiesta!** What started as a basic message board has evolved into a dynamic, interactive, and intelligent virtual corkboard for farewell parties. Here is a comprehensive list of the core features currently available in the application:

### 1. 📍 Infinite Virtual Corkboard
- **Absolute Drag-and-Drop:** Users can click and drag their message cards anywhere on the canvas. 
- **Infinite Vertical Expansion:** The Y-axis uses an intelligent pixel-tethering system. As users drag cards towards the bottom of the screen, the canvas dynamically extends downwards, offering an infinite runway for unlimited messages.
- **Responsive Layout:** The X-axis relies on percentage-based viewport tracking, ensuring that cards do not fall off the edge of smaller mobile screens.
- **Real-Time Persistence:** Drop coordinates are saved directly to the backend database so every user loading the wall sees the exact same collage arrangement.

### 2. 🪄 Generative AI Animations (Claude 4.6)
- **Custom Prompts:** Users can describe an absurd, funny, or heartfelt animation concept in the message form.
- **Anthropic API Integration:** The backend sends the prompt to the cutting-edge **Claude 3.5 Sonnet / 4.6** model to generate a strictly self-contained, 0-dependency HTML/CSS/Canvas animation.
- **Live Previews:** Users can securely preview the AI's generated animation inside a sandboxed iframe before finalizing and posting it to the wall.
- **Markdown Stripping:** The engine automatically sanitizes and extracts pure raw HTML from the LLM payload to prevent rendering failures.

### 3. 🖼️ Curated GIF Gallery with Pagination
- **Expanded Library:** For users who prefer classics over AI, the app includes a curated static array of 20+ going-away party GIFs fetched from Giphy.
- **Pagination Engine:** The modal cleanly slices the library, displaying 5 funny GIFs at a time, complete with seamless **◀ Prev** and **Next ▶** navigation controls.

### 4. 🪪 User-Owned Content Management
- **Local Identity Tracking:** The app generates and stores a unique UUID array in the browser's `localStorage` for every card created by that device.
- **Self-Moderation:** Users exclusively gain access to **Edit** and **Delete** action buttons on the specific cards they authored, ensuring no one can accidentally wipe someone else's heartfelt (or embarrassing) goodbye message.

### 5. 💾 Offline HTML Snapshot Export
- **Bundle Everything:** Users can hit the "Save Entire Wall" button to preserve the memories forever.
- **Standalone Document:** The engine bundles the current DOM, the base CSS, and converts all static external assets (like GIF URLs) into raw binary **Base64** strings. The entire corkboard is downloaded as a single `.html` file that can be opened on any computer, entirely offline.

### 6. 📱 Microsoft Teams-Style Navigation
- **Left Docked Sidebar:** The navigation menu features a sleek, fixed 250px left-side panel (similar to enterprise apps like MS Teams) keeping the main interaction area unobstructed.
- **Scrollable Canvas:** With the sidebar locked into place, the canvas remains free to serve as a massive drag-and-drop playground.
