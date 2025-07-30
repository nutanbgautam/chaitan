// OpenAI Whisper API Service for Voice Transcription
class WhisperService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Convert blob to FormData
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Whisper transcription failed:', error);
      throw error;
    }
  }

  async transcribeAudioWithTimestamps(audioBlob: Blob): Promise<{
    text: string;
    segments: Array<{
      id: number;
      start: number;
      end: number;
      text: string;
    }>;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities', 'segment');

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.text,
        segments: data.segments || [],
      };
    } catch (error) {
      console.error('Whisper transcription with timestamps failed:', error);
      throw error;
    }
  }

  // Retry mechanism for failed transcriptions
  async transcribeWithRetry(audioBlob: Blob, maxRetries: number = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.transcribeAudio(audioBlob);
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(`Transcription failed after ${maxRetries} attempts: ${error}`);
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('Transcription failed');
  }
}

// Create singleton instance
let whisperInstance: WhisperService | null = null;

export function getWhisperService(): WhisperService {
  if (!whisperInstance) {
    whisperInstance = new WhisperService();
  }
  return whisperInstance;
}

export default getWhisperService; 