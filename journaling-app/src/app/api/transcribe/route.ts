import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getWhisperService } from '@/lib/whisper';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { audioUrl } = await request.json();

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    let audioBlob: Blob;

    // Handle different audio URL formats
    if (audioUrl.startsWith('data:')) {
      // Handle base64 data URL
      const response = await fetch(audioUrl);
      audioBlob = await response.blob();
    } else if (audioUrl.startsWith('blob:')) {
      // Handle blob URL (this won't work server-side, so we need to handle it differently)
      return NextResponse.json(
        { error: 'Blob URLs are not supported server-side. Please convert to base64 first.' },
        { status: 400 }
      );
    } else {
      // Handle regular URL
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch audio data');
      }
      audioBlob = await response.blob();
    }

    // Transcribe using Whisper
    const whisperService = getWhisperService();
    const transcription = await whisperService.transcribeAudio(audioBlob);

    return NextResponse.json({
      transcription,
      success: true
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 