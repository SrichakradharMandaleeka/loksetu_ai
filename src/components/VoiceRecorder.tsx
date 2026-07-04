import React, { useState, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause, Check } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (voiceUrl: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setHasRecorded(false);
    setVoiceUrl(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
    const mockUrl = `https://aistudio.google.com/voice_grievances/rec_${Math.floor(Math.random() * 100000)}.wav`;
    setVoiceUrl(mockUrl);
    onRecordingComplete(mockUrl);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDelete = () => {
    setHasRecorded(false);
    setIsPlaying(false);
    setVoiceUrl(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm">
            Voice Grievance Recorder (Hindi/English)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record in Hindi, Awadhi, Urdu, or English. Gemini automatically detects, translates, and logs the details.
          </p>
        </div>
      </div>

      {!isRecording && !hasRecorded && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl border border-dashed border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400 bg-white dark:bg-slate-800 transition-all font-medium text-xs shadow-sm hover:shadow"
        >
          <Mic className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
          Click to Speak (Record Audio Report)
        </button>
      )}

      {isRecording && (
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400">
              RECORDING LIVE — {formatTime(seconds)}
            </span>
          </div>

          {/* Animated visualizer */}
          <div className="flex items-end justify-center space-x-1.5 h-10 w-full px-12">
            {[...Array(12)].map((_, i) => {
              const delay = (i * 0.1).toFixed(1);
              return (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-full waveform-bar"
                  style={{
                    animationDelay: `${delay}s`,
                    height: `${4 + Math.random() * 24}px`
                  }}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 shadow"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Finish & Process Voice
          </button>
        </div>
      )}

      {hasRecorded && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current pl-0.5" />}
            </button>
            <div>
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> RecordedGrievance_0407.wav
              </span>
              <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 font-medium font-mono">
                Duration: 0:24 • Ready for AI Translation & Analysis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
