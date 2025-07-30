'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Download, CheckCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing?: boolean;
}

export default function VoiceRecorder({ 
  onRecordingComplete, 
  isProcessing = false 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isRecording, isPaused]);

  const resetRecording = useCallback(() => {
    stopRecording();
    setAudioUrl(null);
    setRecordingTime(0);
  }, [stopRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <h3 className="text-white fw-bold mb-2">Voice Entry</h3>
          <p className="text-white opacity-75">
            Record your thoughts and get them transcribed automatically.
          </p>
        </div>

        {/* Recording Controls */}
        <div className="text-center mb-4">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="btn btn-danger btn-lg rounded-circle p-4"
              style={{ width: '80px', height: '80px' }}
            >
              <Mic className="w-8 h-8" />
            </button>
          )}

          {isRecording && (
            <div className="d-flex justify-content-center align-items-center gap-3">
              <button
                onClick={pauseRecording}
                className="btn btn-warning btn-lg rounded-circle"
                style={{ width: '60px', height: '60px' }}
              >
                {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </button>
              
              <div className="text-center">
                <div className="text-white fw-bold fs-4">{formatTime(recordingTime)}</div>
                <div className="text-white opacity-75 small">Recording...</div>
              </div>
              
              <button
                onClick={stopRecording}
                className="btn btn-danger btn-lg rounded-circle"
                style={{ width: '60px', height: '60px' }}
              >
                <Square className="w-6 h-6" />
              </button>
            </div>
          )}

          {audioUrl && !isRecording && (
            <div className="d-flex justify-content-center align-items-center gap-3">
              <button
                onClick={resetRecording}
                className="btn btn-outline-light btn-sm"
              >
                <RotateCcw className="w-4 h-4 me-2" />
                Record Again
              </button>
              
              <div className="text-success d-flex align-items-center">
                <CheckCircle className="w-4 h-4 me-2" />
                Recording Complete
              </div>
            </div>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="mb-4">
            <audio controls className="w-100">
              <source src={audioUrl} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-4">
            <div className="spinner-border text-light mb-3" role="status">
              <span className="visually-hidden">Processing...</span>
            </div>
            <p className="text-white opacity-75">Processing your voice entry...</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-light bg-opacity-10 rounded p-3">
          <h6 className="text-white fw-bold mb-2">Tips for better recording:</h6>
          <ul className="text-white opacity-75 small mb-0">
            <li>Find a quiet environment</li>
            <li>Speak clearly and at a normal pace</li>
            <li>Keep the microphone close to your mouth</li>
            <li>Take pauses between thoughts</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 