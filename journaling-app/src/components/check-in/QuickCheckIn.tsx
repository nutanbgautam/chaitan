'use client';

import { useState } from 'react';
import { Heart, Zap, Activity, Moon, Save, RotateCcw } from 'lucide-react';

interface QuickCheckInProps {
  onSave: (checkIn: {
    mood: string;
    energy: number;
    movement: number;
    sleep: { hours: number; minutes: number };
    note?: string;
  }) => void;
  isProcessing?: boolean;
}

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Happy', value: '😊' },
  { emoji: '😐', label: 'Neutral', value: '😐' },
  { emoji: '😞', label: 'Sad', value: '😞' },
  { emoji: '😡', label: 'Angry', value: '😡' },
  { emoji: '😴', label: 'Tired', value: '😴' },
  { emoji: '🤔', label: 'Thoughtful', value: '🤔' },
  { emoji: '😌', label: 'Calm', value: '😌' },
  { emoji: '😤', label: 'Stressed', value: '😤' },
];

export default function QuickCheckIn({ onSave, isProcessing = false }: QuickCheckInProps) {
  const [mood, setMood] = useState<string>('');
  const [energy, setEnergy] = useState<number>(5);
  const [movement, setMovement] = useState<number>(5);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepMinutes, setSleepMinutes] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  const handleSave = () => {
    if (mood) {
      onSave({
        mood,
        energy,
        movement,
        sleep: { hours: sleepHours, minutes: sleepMinutes },
        note: note.trim() || undefined,
      });
    }
  };

  const handleReset = () => {
    setMood('');
    setEnergy(5);
    setMovement(5);
    setSleepHours(7);
    setSleepMinutes(0);
    setNote('');
  };

  const getEnergyLabel = (value: number) => {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'High';
    return 'Very High';
  };

  const getMovementLabel = (value: number) => {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'High';
    return 'Very High';
  };

  return (
    <div className="card bg-dark bg-opacity-75 border border-white border-opacity-25" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <h3 className="text-dark fw-bold mb-2">Quick Check-In</h3>
          <p className="text-dark opacity-75">
            Take a moment to check in with yourself. Track your mood, energy, and wellness.
          </p>
        </div>

        {/* Mood Selection */}
        <div className="mb-4">
          <h5 className="text-dark fw-bold mb-3 d-flex align-items-center">
            <Heart className="w-5 h-5 me-2 text-danger" />
            How are you feeling today?
          </h5>
          <div className="row g-2">
            {MOOD_OPTIONS.map((moodOption) => (
              <div key={moodOption.value} className="col-3">
                <button
                  onClick={() => setMood(moodOption.value)}
                  className={`btn w-100 p-3 rounded border-2 transition-all ${
                    mood === moodOption.value
                      ? 'border-success bg-success bg-opacity-25'
                      : 'border-white border-opacity-25 bg-light bg-opacity-75 text-dark hover:border-white'
                  }`}
                >
                  <div className="fs-3 mb-1">{moodOption.emoji}</div>
                  <div className="small">{moodOption.label}</div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Level */}
        <div className="mb-4">
          <h5 className="text-dark fw-bold mb-3 d-flex align-items-center">
            <Zap className="w-5 h-5 me-2 text-warning" />
            Energy Level: {getEnergyLabel(energy)}
          </h5>
          <div className="d-flex align-items-center gap-3">
            <span className="text-dark opacity-75 small">Low</span>
            <input
              type="range"
              className="form-range flex-grow-1"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              style={{ accentColor: '#ffc107' }}
            />
            <span className="text-dark opacity-75 small">High</span>
          </div>
          <div className="text-center mt-2">
            <span className="badge bg-warning text-dark">{energy}/10</span>
          </div>
        </div>

        {/* Movement Level */}
        <div className="mb-4">
          <h5 className="text-dark fw-bold mb-3 d-flex align-items-center">
            <Activity className="w-5 h-5 me-2 text-info" />
            Movement Level: {getMovementLabel(movement)}
          </h5>
          <div className="d-flex align-items-center gap-3">
            <span className="text-dark opacity-75 small">Low</span>
            <input
              type="range"
              className="form-range flex-grow-1"
              min="1"
              max="10"
              value={movement}
              onChange={(e) => setMovement(Number(e.target.value))}
              style={{ accentColor: '#0dcaf0' }}
            />
            <span className="text-dark opacity-75 small">High</span>
          </div>
          <div className="text-center mt-2">
            <span className="badge bg-info text-dark">{movement}/10</span>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="mb-4">
          <h5 className="text-dark fw-bold mb-3 d-flex align-items-center">
            <Moon className="w-5 h-5 me-2 text-primary" />
            Sleep Last Night
          </h5>
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label text-dark opacity-75 small">Hours</label>
              <select
                className="form-select bg-light bg-opacity-75 border border-white border-opacity-25 text-dark"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
              >
                {Array.from({ length: 13 }, (_, i) => i).map((hour) => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label text-dark opacity-75 small">Minutes</label>
              <select
                className="form-select bg-light bg-opacity-75 border border-white border-opacity-25 text-dark"
                value={sleepMinutes}
                onChange={(e) => setSleepMinutes(Number(e.target.value))}
              >
                {[0, 15, 30, 45].map((minute) => (
                  <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="badge bg-primary">
              {sleepHours}h {sleepMinutes}m
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="form-label text-dark fw-bold">Additional Notes (Optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any additional thoughts, feelings, or observations..."
            className="form-control bg-light bg-opacity-75 border border-white border-opacity-25 text-dark"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-between align-items-center">
          <button
            onClick={handleReset}
            disabled={isProcessing}
            className="btn btn-outline-light d-flex align-items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={!mood || isProcessing}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Check-In
          </button>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-4 mt-4">
            <div className="spinner-border text-light mb-3" role="status">
              <span className="visually-hidden">Processing...</span>
            </div>
            <p className="text-dark opacity-75">Saving your check-in...</p>
          </div>
        )}

        {/* Wellness Tips */}
        <div className="bg-light bg-opacity-10 rounded p-3 mt-4">
          <h6 className="text-dark fw-bold mb-2">Wellness Tips:</h6>
          <ul className="text-dark opacity-75 small mb-0">
            <li>Regular check-ins help track patterns in your mood and energy</li>
            <li>Notice how sleep quality affects your daily energy</li>
            <li>Movement and energy levels often go hand in hand</li>
            <li>Be honest with yourself - this data is for your benefit</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 