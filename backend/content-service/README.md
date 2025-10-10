# Content Service

A comprehensive microservice for managing Japanese character learning content including Hiragana, Katakana, Kanji, vocabulary, lessons, and media assets.

## 🚀 Features

### Core Functionality
- **Character Management**: Hiragana, Katakana, and Kanji characters with stroke orders, pronunciations, and examples
- **Vocabulary System**: Japanese words with translations, audio, and categorization
- **Lesson Content**: Structured learning paths with progression and prerequisites
- **Media Assets**: Image, audio, and video file management with thumbnails
- **Search & Filtering**: Advanced search capabilities across all content types
- **Caching**: Redis-based caching for improved performance
- **File Upload**: Secure media file upload with validation

### Character Management
- 46 Hiragana characters with stroke orders and pronunciations
- 46 Katakana characters with stroke orders and pronunciations
- Kanji characters organized by JLPT levels (N5-N1)
- Character relationships (radicals, compounds)
- Stroke order animations and reference images
- Character examples and usage contexts

### Vocabulary System
- Word entries with Japanese text and romanization
- English translations and definitions
- Audio file references for pronunciation
- Example sentences and usage contexts
- Vocabulary categorization (themes: food, travel, family, etc.)
- JLPT level classification
- Word frequency rankings
- Part of speech classification

### Lesson Content
- Structured learning paths for each character set
- Lesson metadata (title, description, prerequisites, estimated time)
- Practice exercises and challenges
- Cultural context and background information
- Lesson progression tracking
- Difficulty level classification

### Media Management
- Image, audio, video, and document file support
- Automatic thumbnail generation
- File type validation and size limits
- Secure file storage and retrieval
- Media asset categorization
- Search and filtering capabilities

## 🛠 Technology Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Cache**: Redis 7
- **File Upload**: Multer
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS
- **Rate Limiting**: express-rate-limit
- **Containerization**: Docker

## 📁 Project Structure

```
content-service/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # API controllers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   └── index.ts         # Application entry point
├── prisma/              # Database schema and migrations
├── uploads/             # Media file storage
├── logs/                # Application logs
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile          # Docker image definition
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd content-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

### Development Setup

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8002/api/v1
```

### Health Check
```http
GET /health
```

### Character Endpoints

#### Get Hiragana Characters
```http
GET /characters/hiragana
```

#### Get Katakana Characters
```http
GET /characters/katakana
```

#### Get Kanji by JLPT Level
```http
GET /characters/kanji/:level
```

#### Get Character by ID
```http
GET /characters/:id
```

#### Get Character Stroke Order
```http
GET /characters/:id/stroke-order
```

#### Search Characters
```http
GET /characters/search?q=query
```

### Vocabulary Endpoints

#### Get Vocabulary Words
```http
GET /vocabulary
```

#### Search Vocabulary
```http
GET /vocabulary/search?q=query
```

#### Get Vocabulary by Category
```http
GET /vocabulary/category/:category
```

#### Get Vocabulary by JLPT Level
```http
GET /vocabulary/jlpt/:level
```

### Lesson Endpoints

#### Get Lessons
```http
GET /lessons
```

#### Get Lessons by Level
```http
GET /lessons/level/:level
```

#### Get Lesson by ID
```http
GET /lessons/:lessonId
```

#### Get Lesson Steps
```http
GET /lessons/:lessonId/steps
```

### Media Endpoints

#### Get Media Assets
```http
GET /media
```

#### Upload Media Asset
```http
POST /media/upload
Content-Type: multipart/form-data
```

#### Get Media Asset File
```http
GET /media/:mediaId/file
```

#### Get Media Asset Thumbnail
```http
GET /media/:mediaId/thumbnail
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `8002` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `MEDIA_STORAGE_PATH` | Media file storage path | `./uploads` |
| `BASE_URL` | Base URL for the service | `http://localhost:8002` |

### Database Schema

The service uses Prisma ORM with the following main models:

- **Character**: Hiragana, Katakana, and Kanji characters
- **Vocabulary**: Japanese words with translations
- **Lesson**: Learning content and progression
- **MediaAsset**: File storage and metadata
- **KanjiRadical**: Kanji radical information
- **KanjiReading**: Kanji reading information
- **VocabularyExample**: Example sentences for vocabulary
- **LessonStep**: Individual lesson steps

## 🔒 Security

- **Input Validation**: Joi schemas for all endpoints
- **File Upload Security**: Type and size validation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Authentication**: JWT token validation (when integrated)

## 📊 Performance

- **Redis Caching**: Frequently accessed data cached
- **Database Indexing**: Optimized queries with proper indexes
- **File Compression**: Automatic image compression
- **Pagination**: Efficient data pagination
- **Connection Pooling**: Database connection optimization

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "Character Service"
```

## 📝 Logging

The service uses Winston for structured logging:

- **Request Logging**: All incoming requests logged
- **Error Logging**: Detailed error information
- **Performance Logging**: Response times and metrics
- **File Rotation**: Automatic log file rotation

## 🚀 Deployment

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t content-service .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Production Considerations

- Set `NODE_ENV=production`
- Configure proper database credentials
- Set up Redis cluster for high availability
- Configure file storage (S3, GCS, etc.)
- Set up monitoring and alerting
- Configure backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- Character management for Hiragana, Katakana, and Kanji
- Vocabulary system with search and categorization
- Lesson content with progression tracking
- Media asset management with file upload
- Redis caching and performance optimization
