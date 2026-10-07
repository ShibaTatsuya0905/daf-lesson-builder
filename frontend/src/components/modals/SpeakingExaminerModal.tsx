import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Square, Loader2, UserCircle, FileText, ChevronRight, Volume2 } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { apiRequest } from '../../services/apiClient';

const CERTIFICATES = ['Goethe-Zertifikat', 'TELC', 'ÖSD', 'TestDaF'];

interface CandidateCard {
  title: string;
  situation: string;
  leitpunkte: string[];
}

interface EvaluationResult {
  totalScore: number;
  maxScore: number;
  passed: boolean;
  criteria: {
    taskCompletion: { score: number; max: number; feedback: string };
    coherenceInteraction: { score: number; max: number; feedback: string };
    vocabulary: { score: number; max: number; feedback: string };
    grammarPronunciation: { score: number; max: number; feedback: string };
  };
  strengths: string[];
  corrections: Array<{ spoken: string; corrected: string; explanation: string }>;
  generalFeedback: string;
}

interface SpeakingExamSession {
  sessionId: string;
  provider: string;
  level: string;
  topic: string;
  caseDNA?: any;
  currentPart: number;
  totalParts: number;
  currentPartTitle: string;
  turnsInCurrentPart: number;
  maxTurnsPerPart: number;
  candidateCard: CandidateCard;
  isFinished: boolean;
  history: Array<{ role: 'ai' | 'user'; text: string }>;
  evaluation?: EvaluationResult;
}

export const SpeakingExaminerModal: React.FC = () => {
  const { isSpeakingModalOpen, closeSpeakingModal, lessonInfo } = useLessonStore();

  const [certificate, setCertificate] = useState('Goethe-Zertifikat');
  const [topic, setTopic] = useState('Alltag und Beruf');
  const [session, setSession] = useState<SpeakingExamSession | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'de-DE';

      recognition.onresult = (event: any) => {
        let accumulated = '';
        for (let i = 0; i < event.results.length; i++) {
          accumulated += event.results[i][0].transcript + ' ';
        }
        setCurrentTranscript(accumulated.trim());
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    const rankAndLoadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const deVoices = voices.filter(
        (v) => v.lang.startsWith('de') || v.lang === 'de_DE' || v.lang === 'de-DE'
      );

      deVoices.sort((a, b) => {
        const score = (v: SpeechSynthesisVoice) => {
          let pts = 0;
          const name = v.name.toLowerCase();
          if (name.includes('natural')) pts += 10;
          if (name.includes('online')) pts += 8;
          if (name.includes('enhanced') || name.includes('premium')) pts += 6;
          if (name.includes('neural')) pts += 5;
          if (name.includes('katja') || name.includes('conrad') || name.includes('anna')) pts += 4;
          if (name.includes('google')) pts += 2;
          return pts;
        };
        return score(b) - score(a);
      });

      setAvailableVoices(deVoices);
      if (deVoices.length > 0 && !selectedVoiceUri) {
        setSelectedVoiceUri(deVoices[0].voiceURI);
      }
    };

    rankAndLoadVoices();
    window.speechSynthesis.onvoiceschanged = rankAndLoadVoices;

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  if (!isSpeakingModalOpen) return null;

  const speakGerman = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';

      const voice = availableVoices.find((v) => v.voiceURI === selectedVoiceUri) || availableVoices[0];
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startExam = async () => {
    setSession(null);
    setCurrentTranscript('');
    setIsAiThinking(true);

    try {
      const res = await apiRequest('/ai/simulate-speaking', {
        method: 'POST',
        body: JSON.stringify({
          level: lessonInfo.level || 'B1',
          topic: topic || lessonInfo.topic || 'Alltag und Beruf',
          certificate,
          history: [],
          sessionState: null,
        }),
      });

      const data: SpeakingExamSession = await res.json();
      if (!res.ok) throw new Error((data as any).message || 'Lỗi khởi tạo phòng thi');

      setSession(data);
      const firstAiMsg = data.history.find((h) => h.role === 'ai');
      if (firstAiMsg) speakGerman(firstAiMsg.text);
    } catch (e: any) {
      alert(`Lỗi khởi tạo: ${e.message}`);
    } finally {
      setIsAiThinking(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt không hỗ trợ nhận diện giọng nói tiếng Đức.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      setCurrentTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSendResponse = async () => {
    if (!currentTranscript.trim() || !session) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const spokenText = currentTranscript.trim();
    setCurrentTranscript('');

    const updatedHistory = [...session.history, { role: 'user' as const, text: spokenText }];
    setSession({ ...session, history: updatedHistory });
    setIsAiThinking(true);

    try {
      const res = await apiRequest('/ai/simulate-speaking', {
        method: 'POST',
        body: JSON.stringify({
          level: session.level,
          topic: session.topic,
          certificate: session.provider,
          history: updatedHistory,
          sessionState: { ...session, history: updatedHistory },
        }),
      });

      const data: SpeakingExamSession = await res.json();
      if (!res.ok) throw new Error((data as any).message || 'Lỗi gửi câu trả lời');

      setSession(data);
      const lastAiMsg = [...data.history].reverse().find((h) => h.role === 'ai');
      if (lastAiMsg) speakGerman(lastAiMsg.text);
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Mic size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Mündliche Prüfung Simulator
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {certificate} · Niveau {lessonInfo.level || 'B1'} · {topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {availableVoices.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <Volume2 size={14} className="text-emerald-600 shrink-0" />
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => setSelectedVoiceUri(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none max-w-[150px] truncate"
                >
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name.replace(/Microsoft|Google|Apple|Desktop|Online/gi, '').trim() || v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.abort();
                  } catch {}
                }
                closeSpeakingModal();
              }}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {session && !session.isFinished && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-6 py-2 flex items-center justify-between shadow-xs">
            <span>
              Aktueller Teil: <strong>Teil {session.currentPart}/{session.totalParts} ({session.currentPartTitle})</strong>
            </span>
            <span className="text-[11px] opacity-90">
              Runde: {session.turnsInCurrentPart + 1}/{session.maxTurnsPerPart}
            </span>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {session?.candidateCard && !session.isFinished && (
            <div className="w-72 sm:w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 overflow-y-auto space-y-4 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <FileText size={16} className="text-emerald-600" />
                <span>Kandidatenblatt</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {session.candidateCard.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  {session.candidateCard.situation}
                </p>

                {session.candidateCard.leitpunkte && session.candidateCard.leitpunkte.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Leitpunkte:
                    </span>
                    <ul className="space-y-1">
                      {session.candidateCard.leitpunkte.map((lp, idx) => (
                        <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                          <ChevronRight size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{lp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!session && !isAiThinking && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-3xl flex items-center justify-center text-emerald-600">
                    <UserCircle size={44} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">Prüfungsraum bereit</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                      Giám khảo AI sẽ giao đề bài (Kandidatenblatt) cho từng phần, tương tác tự nhiên và chấm điểm CEFR chuẩn sau khi kết thúc.
                    </p>
                  </div>

                  <div className="w-full max-w-sm grid grid-cols-2 gap-3 text-left">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Chứng chỉ:</label>
                      <select
                        value={certificate}
                        onChange={(e) => setCertificate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        {CERTIFICATES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Chủ đề bài thi:</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Alltag, Reisen..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={startExam}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-md transition-all hover:scale-105"
                  >
                    <Mic size={17} /> Mündliche Prüfung starten
                  </button>
                </div>
              )}

              {session?.history.map((msg, idx) => {
                if (msg.role === 'ai') {
                  return (
                    <div key={idx} className="flex justify-start items-end gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <UserCircle size={20} />
                      </div>
                      <div className="max-w-[80%] p-4 rounded-2xl rounded-bl-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs leading-relaxed space-y-1.5 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                          Prüfer ({session.provider})
                        </span>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={idx} className="flex justify-end items-end gap-2">
                    <div className="max-w-[80%] p-4 rounded-2xl rounded-br-xs bg-emerald-600 text-white text-xs leading-relaxed shadow-xs">
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-11">
                  <Loader2 size={14} className="animate-spin text-emerald-600" />
                  <span>Prüfer analysiert und bewertet...</span>
                </div>
              )}

              {session?.isFinished && session.evaluation && (
                <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/80 dark:bg-slate-950/60 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                        Offizielle Bewertung
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Prüfungsergebnis (Kết quả thi nói CEFR)
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-black ${session.evaluation.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                        {session.evaluation.totalScore} / {session.evaluation.maxScore}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {session.evaluation.passed ? '✓ Bestanden' : '✗ Nicht bestanden'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>1. Aufgabenerfüllung</span>
                        <span className="text-emerald-600">
                          {session.evaluation.criteria.taskCompletion.score}/{session.evaluation.criteria.taskCompletion.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{session.evaluation.criteria.taskCompletion.feedback}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>2. Kohärenz & Interaktion</span>
                        <span className="text-emerald-600">
                          {session.evaluation.criteria.coherenceInteraction.score}/{session.evaluation.criteria.coherenceInteraction.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{session.evaluation.criteria.coherenceInteraction.feedback}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>3. Wortschatz & Ausdruck</span>
                        <span className="text-emerald-600">
                          {session.evaluation.criteria.vocabulary.score}/{session.evaluation.criteria.vocabulary.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{session.evaluation.criteria.vocabulary.feedback}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>4. Grammatik & Aussprache</span>
                        <span className="text-emerald-600">
                          {session.evaluation.criteria.grammarPronunciation.score}/{session.evaluation.criteria.grammarPronunciation.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{session.evaluation.criteria.grammarPronunciation.feedback}</p>
                    </div>
                  </div>

                  {session.evaluation.corrections && session.evaluation.corrections.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Fehlerkorrektur (Chi tiết sửa lỗi ngữ pháp & diễn đạt):
                      </span>
                      <div className="space-y-1.5">
                        {session.evaluation.corrections.map((corr, cIdx) => (
                          <div key={cIdx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                            <div className="text-red-500 line-through">✗ {corr.spoken}</div>
                            <div className="text-emerald-600 font-bold">✓ {corr.corrected}</div>
                            {corr.explanation && <div className="text-[11px] text-slate-400 italic">{corr.explanation}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {session && !session.isFinished && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                {currentTranscript && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 max-h-24 overflow-y-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Live-Transkription:
                    </span>
                    {currentTranscript}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={toggleRecording}
                    disabled={isAiThinking}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isListening ? <Square size={16} /> : <Mic size={16} />}
                    <span>{isListening ? 'Aufnahme stoppen' : 'Aufnahme starten'}</span>
                  </button>

                  <button
                    onClick={handleSendResponse}
                    disabled={isAiThinking || !currentTranscript.trim()}
                    className="flex items-center gap-1.5 px-6 py-3 rounded-2xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-40 shadow-md transition-all"
                  >
                    <span>Antwort senden</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};