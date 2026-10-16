import React, { useState, useEffect } from 'react';
import { useLessonStore } from '../../store/useLessonStore';
import { Clock, BookOpen, GraduationCap, Printer, ArrowLeft, Edit2, Headphones, PlayCircle, Square, Award, PenLine, Sparkles } from 'lucide-react';
import { exportService } from '../../services/exportService';
import { ExtendedExamBlockData } from '../../types/examSchema';

const getSafeString = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    return val.text || val.question || val.statement || val.premise || val.content || val.value || JSON.stringify(val);
  }
  return String(val);
};

const formatTextWithParagraphs = (htmlOrText: string): string => {
  if (!htmlOrText) return '';
  let text = String(htmlOrText).trim();

  if (/<(p|br|div|h[1-6]|ul|ol|li)\b/i.test(text)) {
    return text;
  }

  text = text
    .replace(/(Text\s+[0-9A-Z]\s*[:\(])/gi, '\n\n$1')
    .replace(/(Anzeige\s+[a-z0-9]\s*[:\(])/gi, '\n\n$1')
    .replace(/(Abschnitt\s+[A-Z0-9]\s*[:\(])/gi, '\n\n$1')
    .replace(/(Person\s+[A-Z0-9]\s*[:\(])/gi, '\n\n$1')
    .replace(/([.!?])\s+(Text\s+[0-9A-Z])/gi, '$1\n\n$2')
    .replace(/\n{3,}/g, '\n\n');

  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs.map((p) => `<p class="mb-3 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`).join('');
  }

  return `<p class="leading-relaxed">${text.replace(/\n/g, '<br/>')}</p>`;
};

const getSafeOptionsArray = (options: any): string[] => {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return opt.text || opt.label || opt.value || opt.content || JSON.stringify(opt);
      }
      return String(opt ?? '');
    });
  }
  if (typeof options === 'object') {
    return Object.entries(options).map(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        const valStr = (v as any).text || (v as any).value || JSON.stringify(v);
        return `${k}) ${valStr}`;
      }
      return `${k}) ${v}`;
    });
  }
  return [];
};

const getRubricScore = (field: any): string | number => {
  if (field === null || field === undefined) return 0;
  if (typeof field === 'number' || typeof field === 'string') return field;
  if (typeof field === 'object') {
    return field.score ?? field.points ?? field.max ?? 0;
  }
  return 0;
};

export const DocumentPreview: React.FC = () => {
  const { lessonInfo, blocks, viewMode, setViewMode, audioSpeed, setActiveTab } = useLessonStore();
  const isStudentView = viewMode === 'student';
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const [playingBlockId, setPlayingBlockId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleQuickEditBlock = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.speechSynthesis.cancel();
    setPlayingBlockId(null);
    setViewMode('teacher');
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrintDocument = () => {
    exportService.exportToPdf(lessonInfo, safeBlocks, isStudentView);
  };

  const toggleAudio = (text: string, blockId: string) => {
    if (playingBlockId === blockId) {
      window.speechSynthesis.cancel();
      setPlayingBlockId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getSafeString(text));
    utterance.lang = 'de-DE';
    utterance.rate = audioSpeed || 0.9;

    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('de'));
    if (voices.length > 0) {
      const randomVoice = voices[Math.floor(Math.random() * voices.length)];
      utterance.voice = randomVoice;
    }

    utterance.onend = () => setPlayingBlockId(null);
    utterance.onerror = () => setPlayingBlockId(null);

    setPlayingBlockId(blockId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-3.5 mb-6 bg-paper-white border border-mist-border rounded-lg shadow-xs no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => handleQuickEditBlock(e)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-chalk-canvas hover:bg-mist-border text-ink-charcoal transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Quay lại Soạn thảo
          </button>
          <span className="text-mist-border">|</span>
          <span className="text-xs font-semibold text-ink-charcoal flex items-center gap-1.5">
            {isStudentView ? (
              <>
                <GraduationCap size={16} className="text-iris-bolt" />
                <span>Schüleransicht (Đã ẩn ghi chú giáo viên & đáp án)</span>
              </>
            ) : (
              <>
                <BookOpen size={16} className="text-iris-bolt" />
                <span>Unterrichtsentwurf (Bản giáo án hoàn chỉnh)</span>
              </>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePrintDocument}
          className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs transition-opacity cursor-pointer"
        >
          <Printer size={14} /> Drucken / PDF A4
        </button>
      </div>

      <div className="bg-paper-white border border-mist-border rounded-lg p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        <div className="border-b border-mist-border pb-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-iris-bolt bg-lilac-wash px-2.5 py-1 rounded">
                Niveau {lessonInfo.level} · {isStudentView ? 'Arbeitsblatt für Schüler' : 'Offizieller Prüfungsentwurf'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink-charcoal mt-3">
                {lessonInfo.title}
              </h1>
              <p className="text-xs text-slate-veil mt-1.5">Thema: <strong className="text-ink-charcoal">{lessonInfo.topic}</strong></p>
            </div>

            <div className="text-right shrink-0">
              {!isStudentView && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-chalk-canvas border border-mist-border text-ink-charcoal">
                  <Clock size={13} /> {lessonInfo.targetDuration} Minuten
                </span>
              )}
            </div>
          </div>

          {!isStudentView && lessonInfo.objectives && (
            <div className="mt-4 p-3.5 rounded bg-chalk-canvas border border-mist-border text-xs leading-relaxed">
              <strong className="text-ink-charcoal">Lernziel / Prüfungsziel: </strong>
              <span className="text-slate-veil">{lessonInfo.objectives}</span>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {safeBlocks.map((block, idx) => {
            const data = (block.data || {}) as (ExtendedExamBlockData & { sampleSolution?: string; gapText?: string });
            const isClozeTest = data.taskType === 'SPRACHBAUSTEINE_CLOZE' || data.answerType === 'CLOZE';
            const isFreeTextWriting = data.answerType === 'FREE_TEXT' || data.responseMode === 'LONG_TEXT';

            return (
              <section key={block.id || idx} className="space-y-3.5 relative group">
                <div className="flex items-center justify-between border-b border-mist-border pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-ink-charcoal flex items-center gap-2">
                      <span className="text-sm font-mono text-slate-veil">{String(idx + 1).padStart(2, '0')}.</span>
                      <span>{block.title}</span>
                    </h2>
                    {data.taskType && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-chalk-canvas text-slate-veil uppercase tracking-wider border border-mist-border">
                        {data.taskType}
                      </span>
                    )}
                    {data.maxPoints && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-lilac-wash text-iris-bolt">
                        {data.maxPoints} Punkte
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!isStudentView && (
                      <span className="text-xs text-slate-veil font-medium">{block.duration} Min</span>
                    )}
                    <button
                      onClick={handleQuickEditBlock}
                      className="no-print opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-semibold text-iris-bolt bg-lilac-wash hover:bg-iris-bolt hover:text-paper-white px-2.5 py-1 rounded transition-colors z-10 cursor-pointer"
                      title="Chỉnh sửa phần này"
                    >
                      <Edit2 size={12} />
                      <span>Sửa</span>
                    </button>
                  </div>
                </div>

                {(data.instructions || block.content) && (
                  <div
                    className="text-xs text-ink-charcoal prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatTextWithParagraphs(getSafeString(data.instructions || block.content)) }}
                  />
                )}

                {data.transcript && (
                  <div className="my-4 p-4 rounded-lg border border-mist-border bg-chalk-canvas shadow-xs no-print">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-iris-bolt flex items-center justify-center text-paper-white shadow-xs shrink-0">
                          <Headphones size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-ink-charcoal">Audio Track (Hörtext)</h4>
                          <p className="text-[11px] text-slate-veil truncate">Nghe đoạn băng mẫu phát âm tiếng Đức</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleAudio(data.transcript!, block.id)}
                        className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-semibold text-xs shadow-xs transition-all shrink-0 cursor-pointer ${
                          playingBlockId === block.id 
                            ? 'bg-[#dc2626] text-paper-white hover:opacity-90' 
                            : 'bg-iris-bolt text-paper-white hover:opacity-90'
                        }`}
                      >
                        {playingBlockId === block.id ? (
                          <>
                            <Square size={14} fill="currentColor" /> Dừng Audio
                          </>
                        ) : (
                          <>
                            <PlayCircle size={16} /> Nghe Audio
                          </>
                        )}
                      </button>
                    </div>

                    {!isStudentView && (
                      <div className="mt-4 pt-3 border-t border-mist-border">
                        <span className="text-[11px] font-bold text-slate-veil uppercase tracking-wider block mb-1">
                          Transkript (Chỉ giáo viên thấy)
                        </span>
                        <div
                          className="text-xs text-ink-charcoal/80 italic leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatTextWithParagraphs(getSafeString(data.transcript)) }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {data.readingText && !isClozeTest && (
                  <div
                    className="p-5 bg-chalk-canvas border border-mist-border rounded-lg text-xs leading-relaxed text-ink-charcoal"
                    dangerouslySetInnerHTML={{ __html: formatTextWithParagraphs(getSafeString(data.readingText)) }}
                  />
                )}

                {isClozeTest && (
                  <div className="space-y-4">
                    {(data.gapText || data.readingText) && (
                      <div
                        className="p-5 bg-chalk-canvas border border-mist-border rounded-lg text-xs leading-relaxed text-ink-charcoal"
                        dangerouslySetInnerHTML={{ __html: formatTextWithParagraphs(getSafeString(data.gapText || data.readingText)) }}
                      />
                    )}
                    
                    {data.quizQuestions && data.quizQuestions.length > 0 && (
                      <div className="mt-4 p-4 rounded-lg border border-mist-border bg-lilac-wash/50 space-y-2.5">
                        <span className="text-xs font-bold text-ink-charcoal block mb-2">
                          Antwortbogen: Sprachbausteine (Phiếu chọn đáp án đục lỗ):
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {data.quizQuestions.map((q: any, qIdx: number) => {
                            const questionLabel = getSafeString(q.question).replace(/Lücke\s*/i, '').trim() || `${qIdx + 1}`;
                            const safeOpts = getSafeOptionsArray(q.options);

                            return (
                              <div key={q.id || qIdx} className="p-2.5 rounded border border-mist-border bg-paper-white flex items-center justify-between text-xs shadow-xs">
                                <span className="font-semibold text-ink-charcoal min-w-[70px]">
                                  {q.question ? (q.question.includes('Lücke') ? q.question : `Lücke ${questionLabel}`) : `Lücke ${qIdx + 1}`}
                                </span>
                                <div className="flex items-center gap-1.5 flex-1 justify-end flex-wrap">
                                  {safeOpts.length > 0 ? (
                                    safeOpts.map((opt: string, optIdx: number) => {
                                      const isCorrect = !isStudentView && optIdx === q.correctAnswerIndex;
                                      return (
                                        <span
                                          key={optIdx}
                                          className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                            isCorrect
                                              ? 'bg-lilac-wash text-iris-bolt border border-iris-bolt font-bold'
                                              : 'bg-chalk-canvas border border-mist-border text-slate-veil'
                                          }`}
                                        >
                                          {opt}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="font-bold text-iris-bolt">
                                      {getSafeString(q.correctMatch || q.correctAnswer || q.answer)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isClozeTest && !isFreeTextWriting && data.quizQuestions && data.quizQuestions.length > 0 && (
                  <div className="space-y-3">
                    {data.quizQuestions.map((q: any, qIdx: number) => {
                      const isInputText = data.responseMode === 'INPUT_TEXT' || data.answerType === 'SHORT_ANSWER' || data.answerType === 'SHORT_TEXT';
                      const safeOpts = getSafeOptionsArray(q.options);
                      const isPureMatching = data.answerType === 'MATCHING' && safeOpts.length === 0;

                      return (
                        <div key={q.id || qIdx} className="p-4 border border-mist-border bg-paper-white rounded-lg text-xs space-y-2.5 mb-3 shadow-xs">
                          <p className="font-bold text-ink-charcoal leading-relaxed">
                            {qIdx + 1}. {getSafeString(q.question)}
                          </p>

                          {isInputText ? (
                            <div className="mt-2">
                              {isStudentView ? (
                                <div className="w-full h-9 border-b border-mist-border bg-chalk-canvas rounded-t"></div>
                              ) : (
                                <div className="w-full p-2.5 border border-iris-bolt bg-lilac-wash text-iris-bolt font-semibold rounded flex items-center">
                                  <span className="text-[10px] text-slate-veil mr-2 uppercase">Lösung:</span>
                                  <span>{getSafeString(q.correctAnswer || q.answer || q.solution || q.correctMatch || safeOpts[0]) || "Keine Lösung angegeben"}</span>
                                </div>
                              )}
                            </div>
                          ) : isPureMatching ? (
                            <div className="mt-2.5">
                              {isStudentView ? (
                                <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded border border-mist-border bg-chalk-canvas">
                                  <span className="text-[11px] text-slate-veil mr-2">Wähle passende Überschrift:</span>
                                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((letter) => (
                                    <button
                                      key={letter}
                                      type="button"
                                      className="w-7 h-7 rounded border border-mist-border bg-paper-white text-xs font-semibold text-ink-charcoal hover:border-iris-bolt transition-colors cursor-pointer"
                                    >
                                      {letter}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-2.5 rounded border border-iris-bolt bg-lilac-wash text-iris-bolt text-xs font-semibold flex items-center gap-2">
                                  <span className="text-[10px] text-slate-veil uppercase">Lösung:</span>
                                  <span>{getSafeString(q.correctMatch || q.correctAnswer || 'Keine Angabe')}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row flex-wrap gap-2 pl-1 mt-2">
                              {safeOpts.map((opt: string, optIdx: number) => {
                                let displayOpt = opt;
                                let prefix = '';

                                if (!displayOpt || displayOpt.trim() === '') {
                                  if (data.answerType === 'TRUE_FALSE') {
                                    displayOpt = optIdx === 0 ? 'Richtig' : 'Falsch';
                                  } else if (data.answerType === 'YES_NO') {
                                    displayOpt = optIdx === 0 ? 'Ja' : 'Nein';
                                  } else {
                                    displayOpt = `Option ${String.fromCharCode(65 + optIdx)}`;
                                  }
                                } else {
                                  if (data.answerType !== 'TRUE_FALSE' && data.answerType !== 'YES_NO' && !/^[a-zA-Z][\)\.]\s/.test(displayOpt)) {
                                    prefix = `${String.fromCharCode(97 + optIdx)}) `;
                                  }
                                }

                                const isMultiple = Array.isArray(q.correctAnswerIndices);
                                const targetKey = getSafeString(q.correctMatch || q.correctAnswer || q.answer).toLowerCase().trim().replace(/[\)\.]/g, '');
                                
                                let isMatchedByString = false;
                                if (targetKey) {
                                  const cleanOpt = displayOpt.toLowerCase().trim();
                                  if (cleanOpt.startsWith(`${targetKey})`)) isMatchedByString = true;
                                  else if (cleanOpt === targetKey) isMatchedByString = true;
                                  else if (targetKey === String.fromCharCode(97 + optIdx)) isMatchedByString = true;
                                  else if (targetKey.length > 2 && cleanOpt.includes(targetKey)) isMatchedByString = true;
                                }

                                const isCorrect = !isStudentView && (
                                  optIdx === q.correctAnswerIndex ||
                                  (isMultiple && q.correctAnswerIndices.includes(optIdx)) ||
                                  isMatchedByString
                                );

                                return (
                                  <div
                                    key={optIdx}
                                    className={`flex-1 min-w-[200px] p-2.5 rounded border transition-colors flex items-start ${
                                      isCorrect
                                        ? 'border-iris-bolt bg-lilac-wash text-ink-charcoal font-semibold shadow-xs'
                                        : 'border-mist-border bg-paper-white text-ink-charcoal'
                                    }`}
                                  >
                                    <span className={`shrink-0 inline-flex w-4 h-4 rounded-full border mr-2 items-center justify-center text-[10px] ${isCorrect ? 'border-iris-bolt bg-iris-bolt text-paper-white' : 'border-mist-border'}`}>
                                      {isCorrect ? '✓' : ''}
                                    </span>
                                    <span className="whitespace-pre-wrap"><strong className="mr-1 text-ink-charcoal">{prefix}</strong>{displayOpt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {!isStudentView && q.explanation && (
                            <div className="mt-2 pt-2 border-t border-mist-border text-[11px] text-slate-veil leading-relaxed">
                              <strong>💡 Giải thích:</strong> {getSafeString(q.explanation)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {isFreeTextWriting && (
                  <div className="space-y-4">
                    {!isStudentView && data.sampleSolution && (
                      <div className="p-4 rounded-lg border border-mist-border bg-chalk-canvas text-xs text-ink-charcoal space-y-2">
                        <span className="font-bold text-iris-bolt flex items-center gap-1.5">
                          <Sparkles size={14} /> Musterlösung (Bài viết mẫu đạt điểm tối đa):
                        </span>
                        <div
                          className="p-3 bg-paper-white rounded border border-mist-border italic leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: formatTextWithParagraphs(getSafeString(data.sampleSolution)) }}
                        />
                      </div>
                    )}

                    {isStudentView && (
                      <div className="my-4 p-4 rounded-lg border border-dashed border-mist-border bg-chalk-canvas space-y-3">
                        <span className="text-xs font-semibold text-slate-veil flex items-center gap-1.5">
                          <PenLine size={14} /> Phần làm bài viết của thí sinh (Antwortbogen):
                        </span>
                        <div className="h-44 border border-mist-border rounded bg-paper-white p-3 text-xs text-fog-mist">
                          (Thí sinh làm bài tự luận vào đây...)
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {data.rubric && !isStudentView && (
                  <div className="p-4 rounded-lg border border-mist-border bg-lilac-wash/40 space-y-2">
                    <span className="text-xs font-bold text-ink-charcoal flex items-center gap-1.5">
                      <Award size={14} className="text-iris-bolt" />
                      Tiêu chí chấm điểm CEFR chuẩn (Tổng {data.maxPoints || 15} điểm):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded bg-paper-white border border-mist-border">
                        <span className="block text-[10px] text-slate-veil">Nội dung (Inhalt)</span>
                        <strong className="text-iris-bolt">
                          {getRubricScore(data.rubric.taskCompletion)} điểm
                        </strong>
                      </div>
                      <div className="p-2.5 rounded bg-paper-white border border-mist-border">
                        <span className="block text-[10px] text-slate-veil">Mạch lạc (Kohärenz)</span>
                        <strong className="text-iris-bolt">
                          {getRubricScore(data.rubric.coherence)} điểm
                        </strong>
                      </div>
                      <div className="p-2.5 rounded bg-paper-white border border-mist-border">
                        <span className="block text-[10px] text-slate-veil">Từ vựng (Wortschatz)</span>
                        <strong className="text-iris-bolt">
                          {getRubricScore(data.rubric.vocabulary)} điểm
                        </strong>
                      </div>
                      <div className="p-2.5 rounded bg-paper-white border border-mist-border">
                        <span className="block text-[10px] text-slate-veil">Ngữ pháp (Grammatik)</span>
                        <strong className="text-iris-bolt">
                          {getRubricScore(data.rubric.grammar)} điểm
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};