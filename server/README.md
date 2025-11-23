# DNA Architect - Server

A Node.js/Express backend for the DNA Architect portfolio management system with support for multiple storage providers (Local, GCP, Cloudflare R2) and PostgreSQL database.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Storage Providers](#storage-providers)
- [Database Schema](#database-schema)

## Features

- 🗄️ **Multi-Storage Support**: Local filesystem, Google Cloud Platform, or Cloudflare R2
- 🗃️ **PostgreSQL Database**: Robust relational database with Prisma ORM
- 📸 **Image Management**: Thumbnail storage in DB, high-res images in cloud storage
- 🎬 **Video Support**: YouTube URL integration
- 🖼️ **Gallery System**: Support for 5-15 project images per project
- 📁 **File Upload**: Multer-based multipart form data handling

## Tech Stack

- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Storage**: 
  - Local filesystem
  - Google Cloud Storage
  - Cloudflare R2 (S3-compatible)
- **File Upload**: Multer
- **Language**: TypeScript

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── dev.db                 # SQLite file (if using SQLite)
├── src/
│   ├── index.ts               # Express app entry point
│   ├── routes/
│   │   └── projectRoutes.ts   # Project CRUD endpoints
│   └── utils/
│       └── storage.ts         # Storage provider abstraction
├── uploads/                   # Local storage directory
│   ├── images/
│   ├── models/
│   └── videos/
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js >= 20.11.0
- npm >= 10.2.4
- PostgreSQL >= 15 (running locally or remote)
- (Optional) Google Cloud account for GCP storage
- (Optional) Cloudflare account for R2 storage

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example below to .env
   cp .env.example .env
   ```

## Configuration

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3001

# Database Configuration
DATABASE_URL="postgresql://postgres:7894108708@King@localhost:5432/dna_architect?schema=public"

# Storage Provider: 'local', 'gcp', or 'r2'
STORAGE_PROVIDER=local

# Google Cloud Platform (Optional - for GCP storage)
GCP_PROJECT_ID=your-gcp-project-id
GCP_BUCKET_NAME=your-bucket-name
# Place gcp-key.json in server root

# Cloudflare R2 (Optional - for R2 storage)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-public-url.com
```

### Storage Provider Setup

#### Local Storage (Default)
No additional setup required. Files are stored in `server/uploads/`.

#### Google Cloud Platform
1. Create a GCP project and enable Cloud Storage API
2. Create a service account and download the JSON key
3. Save the key as `gcp-key.json` in the server root
4. Set `STORAGE_PROVIDER=gcp` in `.env`

#### Cloudflare R2
1. Create an R2 bucket in Cloudflare dashboard
2. Generate API tokens (Access Key ID and Secret)
3. Configure R2 variables in `.env`
4. Set `STORAGE_PROVIDER=r2` in `.env`

## Running the Server

### Initialize Database

```bash
# Generate Prisma client and push schema to database
npx prisma db push

# (Optional) Generate Prisma client
npx prisma generate

# (Optional) Open Prisma Studio to view data
npx prisma studio


# (Optional) Create initial migration
npx prisma migrate dev --name init_db

```

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### Production Build

```bash
npm run build
npm start
```

## API Documentation

Base URL: `http://localhost:3001/api`

### Endpoints

#### 1. Get All Projects

**GET** `/projects`

Returns a list of all projects with thumbnails (base64 encoded).

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Neo-Tokyo Residence",
    "location": "Tokyo, Japan",
    "thumbnail": "data:image/jpeg;base64,/9j/4AAQ..."
  }
]
```

**cURL Example:**
```bash
curl http://localhost:3001/api/projects
```

---

#### 2. Get Project by ID

**GET** `/projects/:id`

Returns detailed information about a specific project.

**Response:**
```json
{
  "id": "uuid",
  "title": "Neo-Tokyo Residence",
  "architectName": "Kengo T.",
  "areaSqFt": 4500,
  "location": "Tokyo, Japan",
  "description": "A futuristic residential complex...",
  "thumbnailBlob": "Buffer",
  "mainImageUrl": "/uploads/images/1234567890-main.jpg",
  "images": [
    "/uploads/images/1234567890-img1.jpg",
    "/uploads/images/1234567890-img2.jpg",
    "/uploads/images/1234567890-img3.jpg"
  ],
  "modelUrl": "/uploads/models/1234567890-model.glb",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "simulationVideoUrl": null,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl http://localhost:3001/api/projects/your-project-id
```

---

#### 3. Create New Project

**POST** `/projects`

Creates a new project with file uploads.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `title` (string, required): Project title
- `architectName` (string, required): Architect's name
- `areaSqFt` (number, required): Area in square feet
- `location` (string, required): Project location
- `description` (string, required): Project description
- `youtubeUrl` (string, optional): YouTube video URL
- `thumbnail` (file, required): Thumbnail image (max 500KB recommended)
- `mainImage` (file, optional): Main high-resolution image
- `images` (files, required): 5-15 project images
- `model` (file, optional): 3D model file (.glb)
- `video` (file, optional): Simulation video file

**Response:**
```json
{
  "id": "uuid",
  "title": "Neo-Tokyo Residence",
  "architectName": "Kengo T.",
  "areaSqFt": 4500,
  "location": "Tokyo, Japan",
  "description": "A futuristic residential complex...",
  "thumbnailBlob": "Buffer",
  "mainImageUrl": "/uploads/images/1234567890-main.jpg",
  "images": [...],
  "modelUrl": "/uploads/models/1234567890-model.glb",
  "youtubeUrl": "https://www.youtube.com/watch?v=...",
  "simulationVideoUrl": null,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/projects \
  -F "title=Modern Villa" \
  -F "architectName=John Doe" \
  -F "areaSqFt=3500" \
  -F "location=Los Angeles, CA" \
  -F "description=A stunning modern villa with ocean views" \
  -F "youtubeUrl=https://www.youtube.com/watch?v=example" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "mainImage=@/path/to/main-image.jpg" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg" \
  -F "images=@/path/to/image4.jpg" \
  -F "images=@/path/to/image5.jpg" \
  -F "model=@/path/to/model.glb"
```

**Validation Rules:**
- Thumbnail is required
- Must upload between 5 and 15 project images
- All text fields are required except `youtubeUrl`

**Error Responses:**
```json
// Missing thumbnail
{
  "error": "Thumbnail is required"
}

// Invalid image count
{
  "error": "Please upload between 5 and 15 project images."
}

// Server error
{
  "error": "Failed to create project"
}
```

---

#### 4. Delete Project

**DELETE** `/projects/:id`

Deletes a project by ID.

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3001/api/projects/your-project-id
```

---

### Static File Serving

Uploaded files are served statically from the `/uploads` endpoint:

```
GET /uploads/images/1234567890-image.jpg
GET /uploads/models/1234567890-model.glb
GET /uploads/videos/1234567890-video.mp4
```

**cURL Example:**
```bash
curl http://localhost:3001/uploads/images/1234567890-image.jpg --output image.jpg
```

## Storage Providers

### Local Storage
- **Location**: `server/uploads/`
- **URL Format**: `/uploads/{folder}/{filename}`
- **Pros**: No external dependencies, fast for development
- **Cons**: Not scalable for production

### Google Cloud Storage
- **Location**: GCP Bucket
- **URL Format**: `https://storage.googleapis.com/{bucket}/{folder}/{filename}`
- **Pros**: Scalable, reliable, CDN integration
- **Cons**: Requires GCP account and billing

### Cloudflare R2
- **Location**: R2 Bucket
- **URL Format**: Configurable via `R2_PUBLIC_URL`
- **Pros**: S3-compatible, no egress fees, fast CDN
- **Cons**: Requires Cloudflare account

## Database Schema

```prisma
model Project {
  id                  String   @id @default(uuid())
  title               String
  architectName       String
  areaSqFt            Float
  location            String
  description         String
  thumbnailBlob       Bytes    // Stored directly in DB
  mainImageUrl        String?  // Legacy/Primary image
  images              String[] // Array of image URLs (5-15)
  modelUrl            String?
  youtubeUrl          String?  // YouTube video link
  simulationVideoUrl  String?  // Legacy: kept for backward compatibility
  createdAt           DateTime @default(now())
}
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
# Windows:
sc query postgresql-x64-15

# Test connection
psql -U postgres -d dna_architect
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3002
```

### File Upload Issues
- Check file size limits in multer configuration
- Ensure `uploads/` directory has write permissions
- Verify storage provider credentials

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

## Development Tips

- Use Prisma Studio for database inspection: `npx prisma studio`
- Check server logs for detailed error messages
- Test API endpoints with Postman or Thunder Client
- Monitor file uploads in `uploads/` directory

## License

MIT
