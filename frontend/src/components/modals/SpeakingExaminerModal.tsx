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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-4xl h-[90vh] flex flex-col shadow-md overflow-hidden">
        
        <div className="p-4 px-6 border-b border-mist-border flex justify-between items-center bg-chalk-canvas">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lilac-wash text-iris-bolt flex items-center justify-center shadow-xs">
              <Mic size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-charcoal flex items-center gap-2">
                Mündliche Prüfung Simulator
              </h3>
              <p className="text-xs text-slate-veil">
                {certificate} · Niveau {lessonInfo.level || 'B1'} · {topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {availableVoices.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-paper-white px-3 py-1.5 rounded-full border border-mist-border shadow-xs">
                <Volume2 size={14} className="text-iris-bolt shrink-0" />
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => setSelectedVoiceUri(e.target.value)}
                  className="bg-transparent text-[11px] font-semibold text-ink-charcoal focus:outline-none max-w-[150px] truncate cursor-pointer"
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
              className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {session && !session.isFinished && (
          <div className="bg-iris-bolt text-paper-white text-xs font-semibold px-6 py-2.5 flex items-center justify-between shadow-xs">
            <span>
              Phần thi hiện tại: <strong>Teil {session.currentPart}/{session.totalParts} ({session.currentPartTitle})</strong>
            </span>
            <span className="text-[11px] opacity-90">
              Lượt đối thoại: {session.turnsInCurrentPart + 1}/{session.maxTurnsPerPart}
            </span>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {session?.candidateCard && !session.isFinished && (
            <div className="w-72 sm:w-80 border-r border-mist-border bg-chalk-canvas p-5 overflow-y-auto space-y-4 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-ink-charcoal uppercase tracking-wider">
                <FileText size={16} className="text-iris-bolt" />
                <span>Kandidatenblatt (Đề bài)</span>
              </div>

              <div className="bg-paper-white border border-mist-border rounded-lg p-4 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-ink-charcoal leading-snug">
                  {session.candidateCard.title}
                </h4>
                <p className="text-xs text-slate-veil leading-relaxed bg-chalk-canvas p-3 rounded border border-mist-border">
                  {session.candidateCard.situation}
                </p>

                {session.candidateCard.leitpunkte && session.candidateCard.leitpunkte.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-veil uppercase tracking-wider block">
                      Gợi ý dẫn dắt (Leitpunkte):
                    </span>
                    <ul className="space-y-1">
                      {session.candidateCard.leitpunkte.map((lp, idx) => (
                        <li key={idx} className="text-xs text-ink-charcoal flex items-start gap-1.5">
                          <ChevronRight size={13} className="text-iris-bolt shrink-0 mt-0.5" />
                          <span>{lp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden bg-paper-white">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!session && !isAiThinking && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
                  <div className="w-16 h-16 bg-lilac-wash text-iris-bolt rounded-full flex items-center justify-center">
                    <UserCircle size={36} />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink-charcoal text-lg">Phòng thi Vấn đáp sẵn sàng</h4>
                    <p className="text-xs text-slate-veil mt-1 max-w-sm leading-relaxed">
                      Giám khảo AI sẽ giao đề bài cho từng phần, đặt câu hỏi đối thoại tự nhiên và chấm điểm CEFR chuẩn sau khi kết thúc.
                    </p>
                  </div>

                  <div className="w-full max-w-sm grid grid-cols-2 gap-3 text-left">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-veil mb-1">Chứng chỉ:</label>
                      <select
                        value={certificate}
                        onChange={(e) => setCertificate(e.target.value)}
                        className="w-full p-2.5 rounded bg-chalk-canvas border border-mist-border text-xs font-semibold text-ink-charcoal focus:outline-none cursor-pointer"
                      >
                        {CERTIFICATES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-veil mb-1">Chủ đề bài thi:</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Alltag, Reisen..."
                        className="w-full p-2.5 rounded bg-chalk-canvas border border-mist-border text-xs font-semibold text-ink-charcoal focus:outline-none focus:border-iris-bolt"
                      />
                    </div>
                  </div>

                  <button
                    onClick={startExam}
                    className="flex items-center gap-2 bg-iris-bolt hover:opacity-90 text-paper-white px-8 py-3 rounded-full font-semibold text-xs shadow-xs transition-opacity cursor-pointer"
                  >
                    <Mic size={16} /> Mündliche Prüfung starten
                  </button>
                </div>
              )}

              {session?.history.map((msg, idx) => {
                if (msg.role === 'ai') {
                  return (
                    <div key={idx} className="flex justify-start items-end gap-3">
                      <div className="w-8 h-8 rounded-full bg-lilac-wash text-iris-bolt flex items-center justify-center shrink-0">
                        <UserCircle size={18} />
                      </div>
                      <div className="max-w-[80%] p-4 rounded-lg bg-chalk-canvas border border-mist-border text-ink-charcoal text-xs leading-relaxed space-y-1 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-iris-bolt block">
                          Prüfer ({session.provider})
                        </span>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={idx} className="flex justify-end items-end gap-2">
                    <div className="max-w-[80%] p-4 rounded-lg bg-iris-bolt text-paper-white text-xs leading-relaxed shadow-xs">
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-slate-veil italic pl-11">
                  <Loader2 size={14} className="animate-spin text-iris-bolt" />
                  <span>Giám khảo đang lắng nghe và phân tích...</span>
                </div>
              )}

              {session?.isFinished && session.evaluation && (
                <div className="mt-6 border border-mist-border rounded-lg p-6 bg-chalk-canvas space-y-6">
                  <div className="flex items-center justify-between border-b border-mist-border pb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-iris-bolt block">
                        Offizielle Bewertung
                      </span>
                      <h4 className="text-base font-bold text-ink-charcoal">
                        Prüfungsergebnis (Kết quả thi nói CEFR)
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${session.evaluation.passed ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                        {session.evaluation.totalScore} / {session.evaluation.maxScore}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-veil">
                        {session.evaluation.passed ? '✓ Bestanden' : '✗ Nicht bestanden'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded bg-paper-white border border-mist-border space-y-1 shadow-xs">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-ink-charcoal">1. Aufgabenerfüllung</span>
                        <span className="text-iris-bolt font-bold">
                          {session.evaluation.criteria.taskCompletion.score}/{session.evaluation.criteria.taskCompletion.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-veil leading-relaxed">{session.evaluation.criteria.taskCompletion.feedback}</p>
                    </div>

                    <div className="p-3.5 rounded bg-paper-white border border-mist-border space-y-1 shadow-xs">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-ink-charcoal">2. Kohärenz & Interaktion</span>
                        <span className="text-iris-bolt font-bold">
                          {session.evaluation.criteria.coherenceInteraction.score}/{session.evaluation.criteria.coherenceInteraction.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-veil leading-relaxed">{session.evaluation.criteria.coherenceInteraction.feedback}</p>
                    </div>

                    <div className="p-3.5 rounded bg-paper-white border border-mist-border space-y-1 shadow-xs">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-ink-charcoal">3. Wortschatz & Ausdruck</span>
                        <span className="text-iris-bolt font-bold">
                          {session.evaluation.criteria.vocabulary.score}/{session.evaluation.criteria.vocabulary.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-veil leading-relaxed">{session.evaluation.criteria.vocabulary.feedback}</p>
                    </div>

                    <div className="p-3.5 rounded bg-paper-white border border-mist-border space-y-1 shadow-xs">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-ink-charcoal">4. Grammatik & Aussprache</span>
                        <span className="text-iris-bolt font-bold">
                          {session.evaluation.criteria.grammarPronunciation.score}/{session.evaluation.criteria.grammarPronunciation.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-veil leading-relaxed">{session.evaluation.criteria.grammarPronunciation.feedback}</p>
                    </div>
                  </div>

                  {session.evaluation.corrections && session.evaluation.corrections.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-ink-charcoal uppercase tracking-wider block">
                        Fehlerkorrektur (Chi tiết sửa lỗi ngữ pháp & diễn đạt):
                      </span>
                      <div className="space-y-1.5">
                        {session.evaluation.corrections.map((corr, cIdx) => (
                          <div key={cIdx} className="p-3 rounded bg-paper-white border border-mist-border text-xs space-y-1 shadow-xs">
                            <div className="text-[#dc2626] line-through">✗ {corr.spoken}</div>
                            <div className="text-[#16a34a] font-semibold">✓ {corr.corrected}</div>
                            {corr.explanation && <div className="text-[11px] text-slate-veil italic">{corr.explanation}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {session && !session.isFinished && (
              <div className="p-4 border-t border-mist-border bg-chalk-canvas space-y-3">
                {currentTranscript && (
                  <div className="p-3 rounded bg-paper-white border border-mist-border text-xs text-ink-charcoal max-h-24 overflow-y-auto leading-relaxed shadow-xs">
                    <span className="text-[10px] font-bold text-slate-veil uppercase tracking-wider block mb-1">
                      Live-Transkription:
                    </span>
                    {currentTranscript}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={toggleRecording}
                    disabled={isAiThinking}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-xs shadow-xs transition-all cursor-pointer ${
                      isListening
                        ? 'bg-[#dc2626] text-paper-white animate-pulse'
                        : 'bg-iris-bolt hover:opacity-90 text-paper-white'
                    }`}
                  >
                    {isListening ? <Square size={15} /> : <Mic size={15} />}
                    <span>{isListening ? 'Aufnahme stoppen' : 'Aufnahme starten'}</span>
                  </button>

                  <button
                    onClick={handleSendResponse}
                    disabled={isAiThinking || !currentTranscript.trim()}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full font-semibold text-xs bg-paper-white border border-mist-border text-ink-charcoal hover:bg-mist-border/50 disabled:opacity-40 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Antwort senden</span>
                    <ChevronRight size={14} />
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