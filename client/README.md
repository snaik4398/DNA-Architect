# DNA Architect - Client

A modern React-based frontend for the DNA Architect portfolio management system, featuring a public portfolio view and an admin panel for project management.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Client](#running-the-client)
- [Application Routes](#application-routes)
- [API Integration](#api-integration)
- [Theme System](#theme-system)
- [Component Overview](#component-overview)
- [Build & Deployment](#build--deployment)

## Features

- 🎨 **Multi-Theme Support**: Light, Dark, Blueprint, and Sandstone themes
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🖼️ **Image Gallery**: Dynamic project image galleries
- 🎬 **YouTube Integration**: Embedded video player for project simulations
- 🔐 **Admin Panel**: Secure project management interface
- 🎭 **3D Viewer**: Interactive Three.js model viewer
- ⚡ **Fast & Modern**: Built with Vite for optimal performance
- 🎯 **Type-Safe**: Full TypeScript support

## Tech Stack

- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6.21
- **3D Graphics**: Three.js 0.160 + React Three Fiber
- **HTTP Client**: Axios 1.6
- **Animations**: Framer Motion 10.16
- **Icons**: Lucide React 0.294

## Project Structure

```
client/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   └── Navbar.tsx        # Navigation with theme switcher
│   ├── context/
│   │   └── ThemeContext.tsx  # Theme management context
│   ├── pages/
│   │   ├── Home.tsx          # Portfolio landing page
│   │   ├── AdminPanel.tsx    # Project management interface
│   │   └── ProjectDetails.tsx # Individual project view
│   ├── App.tsx               # Root component with routing
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles & theme variables
├── .env                       # Environment variables (optional)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Prerequisites

- Node.js >= 20.11.0
- npm >= 10.2.4
- Running backend server (see server README)

## Installation

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Configuration

### Environment Variables (Optional)

Create a `.env` file in the `client` directory if you need to customize the API URL:

```env
VITE_API_URL=http://localhost:3001
```

By default, the client connects to `http://localhost:3001` for API calls.

## Running the Client

### Development Mode

```bash
npm run dev
```

Application will start on `http://localhost:5173`

### Production Build

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Application Routes

### Public Routes

#### `/` - Home Page
- **Purpose**: Portfolio landing page
- **Features**:
  - Hero section with branding
  - Grid of project thumbnails
  - Click to view project details
- **API Calls**: `GET /api/projects`

#### `/project/:id` - Project Details
- **Purpose**: Detailed view of a single project
- **Features**:
  - Hero image
  - Project description
  - Image gallery (5-15 images)
  - Interactive 3D model viewer
  - Embedded YouTube video (if available)
  - Project specifications sidebar
- **API Calls**: `GET /api/projects/:id`

### Admin Routes

#### `/admin` - Admin Panel
- **Purpose**: Project management interface
- **Features**:
  - Create new projects
  - Upload multiple images (5-15 required)
  - Add YouTube video links
  - View all projects in table format
  - Delete projects
- **API Calls**: 
  - `GET /api/projects` (list)
  - `POST /api/projects` (create)
  - `DELETE /api/projects/:id` (delete)

## API Integration

### Outgoing API Calls

All API calls are made to the backend server at `http://localhost:3001/api`.

#### 1. Fetch All Projects (Home Page)

```typescript
// Location: src/pages/Home.tsx
const response = await fetch('http://localhost:3001/api/projects');
const data = await response.json();
```

**Response Format:**
```json
[
  {
    "id": "uuid",
    "title": "Project Name",
    "location": "City, Country",
    "thumbnail": "data:image/jpeg;base64,..."
  }
]
```

---

#### 2. Fetch Single Project (Project Details)

```typescript
// Location: src/pages/ProjectDetails.tsx
const response = await fetch(`http://localhost:3001/api/projects/${id}`);
const data = await response.json();
```

**Response Format:**
```json
{
  "id": "uuid",
  "title": "Project Name",
  "architectName": "Architect Name",
  "areaSqFt": 4500,
  "location": "City, Country",
  "description": "Full description...",
  "mainImageUrl": "/uploads/images/main.jpg",
  "images": [
    "/uploads/images/img1.jpg",
    "/uploads/images/img2.jpg"
  ],
  "modelUrl": "/uploads/models/model.glb",
  "youtubeUrl": "https://www.youtube.com/watch?v=...",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### 3. Create Project (Admin Panel)

```typescript
// Location: src/pages/AdminPanel.tsx
const formData = new FormData();
formData.append('title', 'Project Name');
formData.append('architectName', 'Architect Name');
formData.append('areaSqFt', '4500');
formData.append('location', 'City, Country');
formData.append('description', 'Description...');
formData.append('youtubeUrl', 'https://youtube.com/...');
formData.append('thumbnail', thumbnailFile);
formData.append('mainImage', mainImageFile);
projectImages.forEach(file => formData.append('images', file));

const response = await fetch('http://localhost:3001/api/projects', {
  method: 'POST',
  body: formData,
});
```

**Request Format:** `multipart/form-data`

**Required Fields:**
- `title`, `architectName`, `areaSqFt`, `location`, `description`
- `thumbnail` (file)
- `images` (5-15 files)

**Optional Fields:**
- `youtubeUrl`, `mainImage`, `model`, `video`

---

#### 4. Delete Project (Admin Panel)

```typescript
// Location: src/pages/AdminPanel.tsx (future implementation)
const response = await fetch(`http://localhost:3001/api/projects/${id}`, {
  method: 'DELETE',
});
```

---

### External Resources

#### Static Files from Server
```
http://localhost:3001/uploads/images/{filename}
http://localhost:3001/uploads/models/{filename}
http://localhost:3001/uploads/videos/{filename}
```

#### YouTube Embeds
```
https://www.youtube.com/embed/{videoId}
```

Extracted from URLs like:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`

## Theme System

### Available Themes

1. **Light** - Clean, bright interface
2. **Dark** - Modern dark mode
3. **Blueprint** - Technical blueprint aesthetic
4. **Sandstone** - Warm, earthy tones

### Theme Switching

Themes are managed via React Context (`ThemeContext.tsx`) and applied through CSS custom properties.

```typescript
// Usage in components
import { useTheme } from '../context/ThemeContext';

const { theme, setTheme } = useTheme();
setTheme('dark'); // Switch to dark theme
```

### Theme Variables

Defined in `src/index.css`:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #1a1a1a;
  --text-secondary: #6b7280;
  --accent: #3b82f6;
  --border: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --text-primary: #f5f5f5;
  --text-secondary: #9ca3af;
  --accent: #60a5fa;
  --border: #2d2d2d;
}
```

## Component Overview

### Core Components

#### `Navbar.tsx`
- **Purpose**: Main navigation and theme switcher
- **Features**:
  - Responsive mobile menu
  - Theme dropdown selector
  - Active route highlighting
  - Sticky positioning

#### `Home.tsx`
- **Purpose**: Portfolio landing page
- **Features**:
  - Hero section with branding
  - Project grid with hover effects
  - Loading states
  - Responsive layout

#### `AdminPanel.tsx`
- **Purpose**: Project management interface
- **Features**:
  - Multi-file upload with preview
  - Form validation (5-15 images required)
  - Image removal functionality
  - Project table view
  - Create/Delete operations

#### `ProjectDetails.tsx`
- **Purpose**: Individual project showcase
- **Features**:
  - Hero image display
  - Responsive image gallery
  - YouTube video embed
  - Interactive 3D model viewer
  - Project specifications sidebar

### Context Providers

#### `ThemeContext.tsx`
- Manages global theme state
- Persists theme to localStorage
- Provides `useTheme` hook

## Build & Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Output: `dist/` directory

### Build Configuration

The build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

**Note**: The build may show a warning about chunk size (>500 kB). This is due to Three.js. Consider code splitting for production:

```typescript
// Example: Lazy load ProjectDetails
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
```

### Deployment Options

#### Static Hosting (Recommended)
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Configure in repository settings

#### Server Deployment
```bash
# Build the app
npm run build

# Serve with a static server
npx serve -s dist -l 3000
```

### Environment Variables for Production

Update API URL for production:

```env
VITE_API_URL=https://your-api-domain.com
```

Then update all fetch calls to use:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
fetch(`${API_URL}/api/projects`);
```

## Troubleshooting

### Port Already in Use
```bash
# Vite will automatically try the next available port
# Or specify a different port in vite.config.ts
```

### API Connection Issues
- Ensure backend server is running on port 3001
- Check CORS configuration in server
- Verify API URL in fetch calls

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Theme Not Persisting
- Check browser localStorage
- Ensure ThemeProvider wraps the app
- Verify theme class is applied to `<html>` element

## Development Tips

- Use React DevTools for component inspection
- Check Network tab for API call debugging
- Use Tailwind CSS IntelliSense extension
- Enable TypeScript strict mode for better type safety

## Performance Optimization

- Images are lazy-loaded
- Routes use code splitting
- Thumbnails are base64 for instant display
- High-res images load from CDN/storage

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
