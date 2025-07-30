'use client';

import { useState, useRef, useEffect } from 'react';
import { PenTool, Save, RotateCcw, Download } from 'lucide-react';

interface TextEditorProps {
  onContentChange: (content: string) => void;
  onSave: (content: string) => void;
  initialContent?: string;
  isProcessing?: boolean;
}

export default function TextEditor({ 
  onContentChange, 
  onSave, 
  initialContent = '',
  isProcessing = false 
}: TextEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (content.trim() && content !== initialContent) {
        setIsAutoSaving(true);
        onSave(content);
        setLastSaved(new Date());
        setTimeout(() => setIsAutoSaving(false), 1000);
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, initialContent, onSave]);

  // Update word and character count
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
    onContentChange(content);
  }, [content, onContentChange]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
      setLastSaved(new Date());
    }
  };

  const handleReset = () => {
    setContent('');
    setLastSaved(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    // Save on Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <h3 className="text-white fw-bold mb-2">Text Entry</h3>
          <p className="text-white opacity-75">
            Write your thoughts freely. Your entry will be automatically saved and analyzed.
          </p>
        </div>

        {/* Editor Stats */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-light bg-opacity-10 rounded">
          <div className="d-flex gap-4 text-white opacity-75 small">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>{getReadingTime()} min read</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            {isAutoSaving && (
              <div className="d-flex align-items-center text-success small">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Saving...</span>
                </div>
                Saving...
              </div>
            )}
            {lastSaved && !isAutoSaving && (
              <small className="text-white opacity-75">
                Saved {lastSaved.toLocaleTimeString()}
              </small>
            )}
          </div>
        </div>

        {/* Text Editor */}
        <div className="mb-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your thoughts here... Share your experiences, feelings, goals, or anything that's on your mind. Don't worry about perfect grammar or structure - just let your thoughts flow naturally."
            className="form-control bg-light bg-opacity-25 border border-white border-opacity-25 text-white"
            style={{ 
              minHeight: '300px', 
              resize: 'vertical',
              fontSize: '16px',
              lineHeight: '1.6'
            }}
            disabled={isProcessing}
          />
          <div className="form-text text-white opacity-75">
            Press Ctrl+S (or Cmd+S on Mac) to save manually
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <button
              onClick={handleSave}
              disabled={!content.trim() || isProcessing}
              className="btn btn-primary d-flex align-items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Entry
            </button>
            
            <button
              onClick={handleReset}
              disabled={!content.trim() || isProcessing}
              className="btn btn-outline-light d-flex align-items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          </div>

          <div className="text-white opacity-75 small">
            {content.trim() ? `${Math.round((content.trim().length / 1000) * 100) / 100}k characters` : 'Start typing...'}
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-4 mt-4">
            <div className="spinner-border text-light mb-3" role="status">
              <span className="visually-hidden">Processing...</span>
            </div>
            <p className="text-white opacity-75">Processing your text entry...</p>
          </div>
        )}

        {/* Writing Tips */}
        <div className="bg-light bg-opacity-10 rounded p-3 mt-4">
          <h6 className="text-white fw-bold mb-2">Writing prompts to get started:</h6>
          <ul className="text-white opacity-75 small mb-0">
            <li>What's the highlight of your day?</li>
            <li>What's challenging you right now?</li>
            <li>What are you grateful for today?</li>
            <li>What goals are you working towards?</li>
            <li>How are you feeling emotionally?</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 