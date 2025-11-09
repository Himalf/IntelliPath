# Database Seeding with ML Training Datasets

This project uses ML-style training datasets to seed the database with realistic data for showcase and development purposes.

## ML Training Datasets

The following ML training datasets are located in `src/algorithms/datasets/ml-training/`:

1. **career-recommendations.json** - Career recommendation training data with user profiles, skill matching, and career paths
2. **user-profiles.json** - User profile training data with demographics, skills, and career goals
3. **resume-analysis-dataset.json** - Resume analysis training data with extracted features and ML analysis results
4. **job-recommendations-dataset.json** - Job matching training data with skill requirements and match scores
5. **chatbot-responses-dataset.json** - Chatbot response training data with question patterns and responses

## Seeding the Database

### Option 1: Using the API Endpoint

Make a POST request to seed the database:

```bash
POST http://localhost:3000/seed
```

This will:
- Create 10+ users from the ML training dataset
- Create courses
- Generate career suggestions for users
- Create resume analyses
- Add chatbot queries
- Add feedback entries

### Option 2: Using Dummy Data Mode

The AI service automatically uses ML training datasets when:
- `GEMINI_API_KEY` is not set in environment variables, OR
- `USE_DUMMY_DATA=true` is set in environment variables

This means all AI-powered features (career suggestions, resume analysis, chatbot) will use the ML training datasets instead of calling the Gemini API.

## Environment Variables

```env
# Use dummy data from ML datasets (set to 'true' to enable)
USE_DUMMY_DATA=true

# Gemini API Key (optional - if not set, dummy data will be used)
GEMINI_API_KEY=your_api_key_here
```

## Features Using ML Datasets

1. **Career Suggestions** - Uses `career-recommendations.json` to match user skills with career paths
2. **Resume Analysis** - Uses `resume-analysis-dataset.json` to provide strengths, weaknesses, and recommendations
3. **Job Recommendations** - Uses `resume-analysis-dataset.json` for job matching
4. **Chatbot** - Uses `chatbot-responses-dataset.json` for intelligent responses

## Dataset Structure

All datasets follow ML training data patterns with:
- Feature extraction
- Confidence scores
- Match algorithms
- Structured JSON format suitable for ML model training

This makes the datasets look like real ML training data for showcase purposes.

