# Recaps System

The Chaitan.ai journaling app includes a comprehensive recap system that automatically generates weekly and monthly summaries of your journal entries, check-ins, goals, and overall life patterns.

## Features

### 📊 **AI-Powered Analysis**
- **Mood Trends**: Analyzes emotional patterns over time
- **Writing Patterns**: Identifies reflection depth and consistency
- **Goal Progress**: Tracks achievement rates and progress
- **Theme Detection**: Identifies recurring topics in journal entries
- **Wellness Metrics**: Sleep, energy, and mood correlations

### 📖 **Multiple Story Formats**
- **Narrative Stories**: Flowing prose about the period
- **Timeline Stories**: Day-by-day breakdown
- **Character Stories**: Personal growth analysis
- **Journey Stories**: Progress milestones and lessons
- **Reflection Stories**: Guided self-reflection questions

### 💡 **Actionable Insights**
- **Highlights**: Key moments and achievements
- **Recommendations**: Personalized suggestions for improvement
- **Pattern Recognition**: Identifies behavioral trends
- **Growth Areas**: Suggests areas for development

## Accessing Recaps

### 1. **Navigation**
Recaps are accessible through the main navigation bar with a calendar icon.

### 2. **Dashboard Widget**
A recap widget is integrated into the dashboard showing recent insights and allowing quick access to generate new recaps.

### 3. **Dedicated Page**
Visit `/recaps` for a full recap management interface with filtering and detailed views.

## Manual Recap Generation

### Via Web Interface
1. Navigate to the Recaps page
2. Click "Generate Recap"
3. Select type (weekly/monthly)
4. View and save your recap

### Via API
```bash
# Generate weekly recap
curl -X POST http://localhost:3001/api/recaps \
  -H "Content-Type: application/json" \
  -d '{"type": "weekly"}'

# Generate monthly recap
curl -X POST http://localhost:3001/api/recaps \
  -H "Content-Type: application/json" \
  -d '{"type": "monthly"}'
```

## Automatic Recap Generation

### Setup

The app includes an automatic recap generation system that can be scheduled using cron jobs.

#### 1. **Script Location**
```
scripts/generate-recaps.js
```

#### 2. **Environment Variables**
Set the following environment variable:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

#### 3. **Cron Job Examples**

**Weekly Recaps (Every Sunday at 9 AM)**
```bash
0 9 * * 0 cd /path/to/journaling-app && node scripts/generate-recaps.js weekly
```

**Monthly Recaps (1st of each month at 9 AM)**
```bash
0 9 1 * * cd /path/to/journaling-app && node scripts/generate-recaps.js monthly
```

**Both Weekly and Monthly**
```bash
0 9 * * 0 cd /path/to/journaling-app && node scripts/generate-recaps.js
```

### Manual Execution

```bash
# Generate weekly recaps for all users
node scripts/generate-recaps.js weekly

# Generate monthly recaps for all users
node scripts/generate-recaps.js monthly

# Generate both weekly and monthly recaps
node scripts/generate-recaps.js

# Show help
node scripts/generate-recaps.js --help
```

## API Endpoints

### Generate Recap
```
POST /api/recaps/generate
```

**Request Body:**
```json
{
  "userId": "user-id",
  "type": "weekly" | "monthly"
}
```

### Get Recaps
```
GET /api/recaps?period=weekly&limit=50
```

### Get All Users (for automatic generation)
```
GET /api/users
```

## Recap Data Structure

Each recap includes:

```typescript
interface Recap {
  id: string;
  type: 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  content: string;
  insights?: string;
  recommendations?: string;
  lifeAreaImprovements?: string;
  metrics?: string;
  createdAt: string;
}
```

### Content Breakdown
- **Title**: Period summary (e.g., "Week of Jan 1 - Jan 7")
- **Summary**: Overview of activities and metrics
- **Highlights**: Key moments and achievements
- **Insights**: AI-generated observations about patterns
- **Goals**: Progress summary and completion rates
- **Wellness**: Mood, energy, and sleep analysis
- **Themes**: Recurring topics and focus areas
- **Recommendations**: Actionable suggestions
- **Story**: Multiple narrative formats

## Customization

### Adding New Analysis Types
1. Extend the `generateRecap` function in `/api/recaps/route.ts`
2. Add new analysis functions
3. Update the recap data structure

### Modifying Story Formats
1. Edit the story generation functions
2. Add new narrative styles
3. Customize reflection questions

### Adjusting Frequency
- Modify cron job schedules
- Add custom time periods
- Implement user preferences

## Troubleshooting

### Common Issues

**Script Permission Denied**
```bash
chmod +x scripts/generate-recaps.js
```

**Database Connection Issues**
- Ensure the app is running
- Check database file permissions
- Verify environment variables

**No Users Found**
- Check if users exist in the database
- Verify the `/api/users` endpoint is accessible
- Ensure proper authentication

**Recap Generation Fails**
- Check server logs for errors
- Verify journal entries exist for the period
- Ensure all required data is available

### Logs
The script provides detailed logging:
- ✅ Successful generations
- ❌ Failed attempts with error details
- 📊 Summary statistics

## Security Considerations

- The `/api/users` endpoint should be protected in production
- Consider rate limiting for recap generation
- Implement user-specific recap access controls
- Secure the automatic generation script

## Performance

- Recaps are generated asynchronously
- Large datasets are processed efficiently
- Results are cached in the database
- Automatic cleanup of old recaps can be implemented

## Future Enhancements

- **Email Notifications**: Send recaps via email
- **Export Options**: PDF, CSV, or other formats
- **Custom Periods**: User-defined time ranges
- **Collaborative Recaps**: Share with trusted contacts
- **Advanced Analytics**: Machine learning insights
- **Integration**: Connect with external wellness apps 