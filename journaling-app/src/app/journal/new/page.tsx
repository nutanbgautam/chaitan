'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mic, PenTool, Heart, Settings, Play, Pause, Square, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import TextEditor from '@/components/text/TextEditor';
import QuickCheckIn from '@/components/check-in/QuickCheckIn';

type EntryType = 'voice' | 'text' | 'check-in';
type ProcessingType = 'transcribe-only' | 'full-analysis';
type ProcessingStatus = 'idle' | 'transcribing' | 'analyzing' | 'completed' | 'error';

function JournalEntryContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entryType, setEntryType] = useState<EntryType>('text');
  const [processingType, setProcessingType] = useState<ProcessingType>('full-analysis');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [currentStep, setCurrentStep] = useState<'type' | 'content' | 'processing' | 'review'>('type');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [audioData, setAudioData] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Set entry type from URL params
    const mode = searchParams.get('mode') as EntryType;
    if (mode && ['voice', 'text', 'check-in'].includes(mode)) {
      setEntryType(mode);
      setCurrentStep('content');
    }
  }, [session, status, router, searchParams]);

  const entryTypes = [
    {
      type: 'voice' as const,
      icon: <Mic className="fs-1" />,
      title: 'Voice Entry',
      description: 'Speak your thoughts naturally',
      color: 'primary',
      bg: 'bg-primary',
      features: ['Real-time transcription', 'Voice emotion analysis', 'Natural speaking']
    },
    {
      type: 'text' as const,
      icon: <PenTool className="fs-1" />,
      title: 'Text Entry',
      description: 'Write your thoughts freely',
      color: 'success',
      bg: 'bg-success',
      features: ['Rich text editor', 'Auto-save', 'Formatting options']
    },
    {
      type: 'check-in' as const,
      icon: <Heart className="fs-1" />,
      title: 'Quick Check-In',
      description: 'Track your daily wellness',
      color: 'danger',
      bg: 'bg-danger',
      features: ['Mood tracking', 'Energy levels', 'Sleep patterns']
    }
  ];

  const processingOptions = [
    {
      type: 'transcribe-only' as const,
      title: 'Transcribe Only',
      description: entryType === 'voice' ? 'Just convert your voice to text, no AI analysis' : 'Just save your text, no AI analysis',
      cost: 'Free',
      time: entryType === 'voice' ? '~30 seconds' : '~10 seconds',
      features: entryType === 'voice' 
        ? ['Voice-to-text conversion', 'Basic transcription', 'No AI insights', 'Save audio recording']
        : ['Text storage', 'Basic formatting', 'No AI insights']
    },
    {
      type: 'full-analysis' as const,
      title: 'Full Analysis',
      description: 'Complete AI-powered insights and analysis',
      cost: '~$0.02',
      time: entryType === 'voice' ? '~2 minutes' : '~1 minute',
      features: entryType === 'voice'
        ? ['Voice-to-text conversion', 'Sentiment analysis', 'Entity extraction', 'Personal insights', 'Pattern recognition', 'Audio playback']
        : ['Text analysis', 'Sentiment analysis', 'Entity extraction', 'Personal insights', 'Pattern recognition']
    }
  ];

  const handleEntryTypeSelect = (type: EntryType) => {
    setEntryType(type);
    setCurrentStep('content');
  };

  const handleProcessingTypeSelect = (type: ProcessingType) => {
    setProcessingType(type);
    setCurrentStep('review');
  };

  const handleProcessEntry = async () => {
    setProcessingStatus('analyzing');
    setErrorMessage('');
    
    try {
      if (entryType === 'voice') {
        // Create journal entry with audio data
        const entryResponse = await fetch('/api/journal/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: transcription,
            audioUrl: audioData,
            transcription: transcription,
            processingType,
            processingStatus: processingType === 'transcribe-only' ? 'transcribed' : 'draft'
          }),
        });

        if (!entryResponse.ok) {
          throw new Error('Failed to create journal entry');
        }

        const entry = await entryResponse.json();

        // If full analysis is selected, trigger analysis
        if (processingType === 'full-analysis') {
          setProcessingStatus('analyzing');
          
          try {
            const analysisResponse = await fetch('/api/journal/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                entryId: entry.id,
                processingType: 'full-analysis'
              }),
            });
            
            if (analysisResponse.ok) {
              setProcessingStatus('completed');
              // Temporarily skip confirmation and go directly to journal detail
              setTimeout(() => {
                router.push(`/journal/${entry.id}`);
              }, 1000);
            } else {
              throw new Error('Analysis failed');
            }
          } catch (analysisError) {
            console.error('Analysis error:', analysisError);
            setErrorMessage('Analysis failed, but your entry was saved');
            setProcessingStatus('error');
          }
        } else {
          // Transcribe only - redirect to transcription confirmation
          router.push(`/journal/${entry.id}/confirm-transcription`);
        }
      } else if (entryType === 'text') {
        // Handle text entry processing
        handleTextSubmit(content);
      }
    } catch (error) {
      console.error('Error processing entry:', error);
      setErrorMessage('Failed to process entry. Please try again.');
      setProcessingStatus('error');
    }
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    setErrorMessage('');
    
    try {
      // Convert blob to base64 data URL
      const base64DataUrl = await blobToDataUrl(audioBlob);
      
      // Step 1: Transcribe the audio first
      setProcessingStatus('transcribing');
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: base64DataUrl
        }),
      });

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed');
      }

      const transcribeResult = await transcribeResponse.json();
      const transcribedText = transcribeResult.transcription;
      setTranscription(transcribedText);

      // Store the audio data for later use
      setAudioData(base64DataUrl);
      
      // Create journal entry with transcription
      const entryResponse = await fetch('/api/journal/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: transcribedText,
          audioUrl: base64DataUrl,
          transcription: transcribedText,
          processingType: 'transcribe-only',
          processingStatus: 'transcribed'
        }),
      });

      if (!entryResponse.ok) {
        throw new Error('Failed to create journal entry');
      }

      const entry = await entryResponse.json();
      
      // Temporarily skip transcription confirmation and go directly to journal detail
      router.push(`/journal/${entry.id}`);
      
    } catch (error) {
      console.error('Error transcribing voice entry:', error);
      setErrorMessage('Failed to transcribe voice entry. Please try again.');
      setProcessingStatus('error');
    }
  };

  const handleTextSubmit = async (textContent: string) => {
    setProcessingStatus('analyzing');
    setErrorMessage('');
    setContent(textContent);
    
    try {
      // Create journal entry
      const entryResponse = await fetch('/api/journal/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textContent,
          processingType,
          processingStatus: processingType === 'transcribe-only' ? 'transcribed' : 'draft'
        }),
      });

      if (!entryResponse.ok) {
        throw new Error('Failed to create journal entry');
      }

      const entry = await entryResponse.json();

      // If full analysis is selected, trigger analysis
      if (processingType === 'full-analysis') {
        try {
          const analysisResponse = await fetch('/api/journal/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entryId: entry.id,
              processingType: 'full-analysis'
            }),
          });
          
          if (analysisResponse.ok) {
            setProcessingStatus('completed');
            // Temporarily skip confirmation and go directly to journal detail
            setTimeout(() => {
              router.push(`/journal/${entry.id}`);
            }, 1000);
          } else {
            throw new Error('Analysis failed');
          }
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          setErrorMessage('Analysis failed, but your entry was saved');
          setProcessingStatus('error');
        }
      } else {
        // Transcribe only - redirect to journal entry view
        setProcessingStatus('completed');
        setTimeout(() => {
          router.push(`/journal/${entry.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting text entry:', error);
      setErrorMessage('Failed to save text entry. Please try again.');
      setProcessingStatus('error');
    }
  };

  const handleCheckInSubmit = async (data: any) => {
    setProcessingStatus('analyzing');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setProcessingStatus('completed');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        throw new Error('Failed to save check-in');
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
      setErrorMessage('Failed to save check-in. Please try again.');
      setProcessingStatus('error');
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Helper function to convert blob to data URL (base64)
  const blobToDataUrl = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-25 backdrop-blur">
        <div className="container-fluid">
          <button onClick={handleBackToDashboard} className="btn btn-outline-light btn-sm rounded-circle">
            <ArrowLeft className="fs-5" />
          </button>
          <div className="navbar-brand d-flex align-items-center mx-auto">
            <div className="position-relative me-3">
              <div className="rounded-circle bg-gradient d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' }}>
                <span className="text-white fw-bold small">C</span>
              </div>
              <div className="position-absolute top-0 end-0 bg-success rounded-circle border border-white" style={{ width: '10px', height: '10px' }}></div>
            </div>
            <span className="text-white fw-bold">chaitan.ai</span>
          </div>
          <div style={{ width: '40px' }}></div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Step Indicator */}
            <div className="card bg-dark bg-opacity-25 border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-center">
                  {['type', 'content', 'processing', 'review'].map((step, index) => (
                    <div key={step} className="d-flex align-items-center">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center fw-medium ${
                        currentStep === step 
                          ? 'bg-success text-white' 
                          : index < ['type', 'content', 'processing', 'review'].indexOf(currentStep)
                          ? 'bg-success bg-opacity-25 text-success'
                          : 'bg-light bg-opacity-25 text-white'
                      }`} style={{ width: '32px', height: '32px' }}>
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <div className={`mx-3`} style={{ 
                          width: '48px', 
                          height: '2px',
                          backgroundColor: index < ['type', 'content', 'processing', 'review'].indexOf(currentStep) ? '#198754' : 'rgba(255,255,255,0.3)'
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Processing Status */}
            {processingStatus !== 'idle' && (
              <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                <div className="card-body text-center">
                  {processingStatus === 'transcribing' && (
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="spinner-border text-light me-3" role="status">
                        <span className="visually-hidden">Transcribing...</span>
                      </div>
                      <div>
                        <h5 className="text-white mb-1">Transcribing Audio</h5>
                        <p className="text-white opacity-75 mb-0">Converting your voice to text...</p>
                      </div>
                    </div>
                  )}
                  
                  {processingStatus === 'analyzing' && (
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="spinner-border text-light me-3" role="status">
                        <span className="visually-hidden">Analyzing...</span>
                      </div>
                      <div>
                        <h5 className="text-white mb-1">Analyzing Content</h5>
                        <p className="text-white opacity-75 mb-0">Extracting insights and patterns...</p>
                      </div>
                    </div>
                  )}
                  
                  {processingStatus === 'completed' && (
                    <div className="d-flex align-items-center justify-content-center">
                      <CheckCircle className="text-success me-3" size={32} />
                      <div>
                        <h5 className="text-white mb-1">Entry Saved Successfully!</h5>
                        <p className="text-white opacity-75 mb-0">Redirecting to your journal...</p>
                      </div>
                    </div>
                  )}
                  
                  {processingStatus === 'error' && (
                    <div className="d-flex align-items-center justify-content-center">
                      <AlertCircle className="text-danger me-3" size={32} />
                      <div>
                        <h5 className="text-white mb-1">Processing Error</h5>
                        <p className="text-white opacity-75 mb-0">{errorMessage}</p>
                        <button 
                          className="btn btn-outline-light btn-sm mt-2"
                          onClick={() => setProcessingStatus('idle')}
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Entry Type Selection */}
            {currentStep === 'type' && processingStatus === 'idle' && (
              <div className="fade-in">
                <div className="text-center mb-4">
                  <div className="badge bg-light bg-opacity-25 text-white px-3 py-2 mb-3 rounded-pill">
                    <Sparkles className="me-2" />
                    New Entry
                  </div>
                  <h2 className="text-white display-6 fw-bold mb-3">Choose Entry Type</h2>
                  <p className="text-white opacity-75 fs-5">How would you like to share your thoughts today?</p>
                </div>

                <div className="row g-4">
                  {entryTypes.map((type) => (
                    <div key={type.type} className="col-md-4">
                      <div 
                        className={`card h-100 border-0 cursor-pointer transition-all ${
                          type.bg
                        } bg-opacity-10 hover-lift`}
                        onClick={() => handleEntryTypeSelect(type.type)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body text-center p-4">
                          <div className={`text-${type.color} mb-3`}>
                            {type.icon}
                          </div>
                          <h4 className="text-white fw-bold mb-2">{type.title}</h4>
                          <p className="text-white opacity-75 mb-4">{type.description}</p>
                          <ul className="list-unstyled text-white opacity-75 small">
                            {type.features.map((feature, index) => (
                              <li key={index} className="mb-1">• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Creation */}
            {currentStep === 'content' && processingStatus === 'idle' && (
              <div className="fade-in">
                <div className="text-center mb-4">
                  <h2 className="text-white display-6 fw-bold mb-3">
                    {entryType === 'voice' && 'Voice Entry'}
                    {entryType === 'text' && 'Text Entry'}
                    {entryType === 'check-in' && 'Quick Check-In'}
                  </h2>
                  <p className="text-white opacity-75 fs-5">
                    {entryType === 'voice' && 'Speak naturally and we\'ll transcribe your thoughts'}
                    {entryType === 'text' && 'Write your thoughts freely'}
                    {entryType === 'check-in' && 'Track your daily wellness metrics'}
                  </p>
                </div>

                {entryType === 'voice' && (
                  <VoiceRecorder
                    onRecordingComplete={handleVoiceRecordingComplete}
                    isProcessing={processingStatus !== 'idle'}
                  />
                )}

                {entryType === 'text' && (
                  <TextEditor
                    onContentChange={() => {}}
                    onSave={handleTextSubmit}
                    isProcessing={processingStatus !== 'idle'}
                  />
                )}

                {entryType === 'check-in' && (
                  <QuickCheckIn
                    onSave={handleCheckInSubmit}
                    isProcessing={processingStatus !== 'idle'}
                  />
                )}
              </div>
            )}

            {/* Processing Type Selection (for voice and text entries) */}
            {currentStep === 'processing' && processingStatus === 'idle' && entryType !== 'check-in' && (
              <div className="fade-in">
                <div className="text-center mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <button
                      onClick={() => setCurrentStep('content')}
                      className="btn btn-outline-light btn-sm"
                    >
                      ← Back
                    </button>
                    <div></div>
                  </div>
                  <h2 className="text-white display-6 fw-bold mb-3">Choose Processing Level</h2>
                  <p className="text-white opacity-75 fs-5">How would you like to process your entry?</p>
                </div>

                {/* Show transcription preview for voice entries */}
                {entryType === 'voice' && transcription && (
                  <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                    <div className="card-body">
                      <h5 className="text-white fw-bold mb-3">
                        <Mic className="me-2" />
                        Transcription Preview
                      </h5>
                      <div className="bg-light bg-opacity-10 rounded p-3">
                        <p className="text-white mb-0">{transcription}</p>
                      </div>
                      <div className="mt-3">
                        <button 
                          className="btn btn-outline-light btn-sm"
                          onClick={() => setCurrentStep('content')}
                        >
                          Re-record
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row g-4">
                  {processingOptions.map((option) => (
                    <div key={option.type} className="col-md-6">
                      <div 
                        className={`card h-100 border-0 cursor-pointer transition-all ${
                          option.type === 'full-analysis' ? 'bg-success' : 'bg-primary'
                        } bg-opacity-10 hover-lift`}
                        onClick={() => handleProcessingTypeSelect(option.type)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h4 className="text-white fw-bold mb-0">{option.title}</h4>
                            <div className="text-end">
                              <div className="text-white fw-bold">{option.cost}</div>
                              <div className="text-white opacity-75 small">{option.time}</div>
                            </div>
                          </div>
                          <p className="text-white opacity-75 mb-4">{option.description}</p>
                          <ul className="list-unstyled text-white opacity-75 small">
                            {option.features.map((feature, index) => (
                              <li key={index} className="mb-1">• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && processingStatus === 'idle' && (
              <div className="fade-in">
                <div className="text-center mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <button
                      onClick={() => setCurrentStep('processing')}
                      className="btn btn-outline-light btn-sm"
                    >
                      ← Back
                    </button>
                    <div></div>
                  </div>
                  <h2 className="text-white display-6 fw-bold mb-3">Review Your Entry</h2>
                  <p className="text-white opacity-75 fs-5">Ready to process with {processingType === 'full-analysis' ? 'full AI analysis' : 'transcription only'}?</p>
                </div>

                <div className="card bg-dark bg-opacity-25 border-0 mb-4">
                  <div className="card-body">
                    <h5 className="text-white fw-bold mb-3">Entry Preview</h5>
                    {entryType === 'voice' && transcription && (
                      <div className="bg-light bg-opacity-10 rounded p-3 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <Mic className="text-primary me-2" />
                          <span className="text-white opacity-75 small">Voice Entry</span>
                        </div>
                        <p className="text-white mb-0">{transcription}</p>
                      </div>
                    )}
                    {entryType === 'text' && content && (
                      <div className="bg-light bg-opacity-10 rounded p-3 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <PenTool className="text-success me-2" />
                          <span className="text-white opacity-75 small">Text Entry</span>
                        </div>
                        <p className="text-white mb-0">{content}</p>
                      </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-primary me-2">{entryType}</span>
                        <span className={`badge ${
                          processingType === 'full-analysis' ? 'bg-success' : 'bg-info'
                        }`}>
                          {processingType === 'full-analysis' ? 'Full Analysis' : 'Transcribe Only'}
                        </span>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={handleProcessEntry}
                      >
                        Process Entry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default function NewJournalEntryPage() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light mb-0">Loading...</p>
        </div>
      </div>
    }>
      <JournalEntryContent />
    </Suspense>
  );
} 