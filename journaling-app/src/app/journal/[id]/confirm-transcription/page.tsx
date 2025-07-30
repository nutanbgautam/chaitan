'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Mic, 
  CheckCircle, 
  X, 
  Edit3, 
  Save,
  AlertCircle,
  Play,
  Pause,
  Volume2
} from 'lucide-react';

interface TranscriptionData {
  id: string;
  content: string;
  transcription: string;
  audioUrl: string;
  processingType: 'transcribe-only' | 'full-analysis';
  processingStatus: 'draft' | 'transcribed' | 'analyzed' | 'completed';
  createdAt: string;
}

export default function ConfirmTranscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [entry, setEntry] = useState<TranscriptionData | null>(null);
  const [editedTranscription, setEditedTranscription] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    loadEntry();
  }, [session, status, router]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/journal/entries/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load journal entry');
      }
      
      const data = await response.json();
      setEntry(data.entry);
      setEditedTranscription(data.entry.transcription || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    const audio = document.getElementById('audio-player') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    const audio = document.getElementById('audio-player') as HTMLAudioElement;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = document.getElementById('audio-player') as HTMLAudioElement;
    if (audio) {
      setAudioDuration(audio.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById('audio-player') as HTMLAudioElement;
    if (audio) {
      const newTime = parseFloat(e.target.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSaveTranscription = async () => {
    if (!entry) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/journal/entries/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: editedTranscription,
          content: editedTranscription
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update transcription');
      }

      // Update local state
      setEntry(prev => prev ? { ...prev, transcription: editedTranscription, content: editedTranscription } : null);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transcription');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProceedToAnalysis = async () => {
    if (!entry) return;
    
    setIsSaving(true);
    try {
      // Update the entry with the final transcription
      await handleSaveTranscription();
      
      // Trigger analysis
      const analysisResponse = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: entry.id,
          processingType: 'full-analysis'
        }),
      });
      
      if (analysisResponse.ok) {
        // Redirect to analysis confirmation page
        router.push(`/journal/${entry.id}/confirm-analysis`);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to proceed to analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipAnalysis = () => {
    if (!entry) return;
    router.push(`/journal/${entry.id}`);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading transcription...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center text-white">
          <AlertCircle className="fs-1 mb-3" />
          <h4>Error</h4>
          <p>{error || 'Failed to load entry'}</p>
          <button onClick={() => router.push('/journal')} className="btn btn-light">
            <ArrowLeft className="me-2" />
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-25 backdrop-blur">
        <div className="container-fluid">
          <button
            onClick={() => router.push('/journal')}
            className="btn btn-outline-light btn-sm rounded-circle me-3"
          >
            <ArrowLeft />
          </button>
          <span className="navbar-brand mb-0 h1">
            <Mic className="me-2" />
            Confirm Transcription
          </span>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* Audio Player */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <h3 className="text-white mb-3">
                  <Volume2 className="me-2" />
                  Audio Recording
                </h3>
                <div className="bg-light bg-opacity-10 rounded p-4">
                  <div className="d-flex align-items-center mb-3">
                    <button
                      onClick={handlePlayPause}
                      className="btn btn-primary rounded-circle me-3"
                      style={{ width: '48px', height: '48px' }}
                    >
                      {isPlaying ? <Pause /> : <Play />}
                    </button>
                    <div className="flex-grow-1 me-3">
                      <div className="progress" style={{ height: '8px' }}>
                        <input
                          type="range"
                          min="0"
                          max={audioDuration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="form-range"
                          style={{ height: '8px' }}
                        />
                      </div>
                    </div>
                    <span className="text-white opacity-75 small">
                      {formatTime(currentTime)} / {formatTime(audioDuration)}
                    </span>
                  </div>
                  <audio
                    id="audio-player"
                    src={entry.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    className="d-none"
                  />
                </div>
              </div>
            </div>

            {/* Transcription */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h3 className="text-white mb-0">
                    <Mic className="me-2" />
                    Transcription
                  </h3>
                  <div className="d-flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveTranscription}
                          disabled={isSaving}
                          className="btn btn-success btn-sm"
                        >
                          {isSaving ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="me-1" />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedTranscription(entry.transcription || '');
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <X className="me-1" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-outline-light btn-sm"
                      >
                        <Edit3 className="me-1" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                
                {isEditing ? (
                  <textarea
                    value={editedTranscription}
                    onChange={(e) => setEditedTranscription(e.target.value)}
                    className="form-control bg-light bg-opacity-10 text-white border-0"
                    rows={10}
                    placeholder="Edit your transcription here..."
                    style={{ resize: 'vertical' }}
                  />
                ) : (
                  <div className="bg-light bg-opacity-10 rounded p-4">
                    <p className="text-white opacity-90 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {editedTranscription || 'No transcription available'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <button
                      onClick={handleProceedToAnalysis}
                      disabled={isSaving || !editedTranscription.trim()}
                      className="btn btn-primary w-100"
                    >
                      {isSaving ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="me-2" />
                          Proceed to Analysis
                        </>
                      )}
                    </button>
                    <small className="text-white opacity-75 d-block mt-2">
                      AI will analyze your transcription and extract insights
                    </small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <button
                      onClick={handleSkipAnalysis}
                      className="btn btn-outline-light w-100"
                    >
                      Skip Analysis
                    </button>
                    <small className="text-white opacity-75 d-block mt-2">
                      Save transcription without AI analysis
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 