import React from 'react';
import { useLessonStore } from '../../store/useLessonStore';
import { Clock, BookOpen, GraduationCap, Printer, ArrowLeft, Edit2, Headphones, PlayCircle, Award, PenLine, Sparkles } from 'lucide-react';
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
  const { lessonInfo, blocks, viewMode, setViewMode, audioSpeed } = useLessonStore();
  const isStudentView = viewMode === 'student';
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const handleQuickEditBlock = (blockId: string) => {
    setViewMode('teacher');
  };

  const handlePrintDocument = () => {
    exportService.exportToPdf(lessonInfo, safeBlocks, isStudentView);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      <div className="flex items-center justify-between p-3.5 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm no-print">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('teacher')}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} /> Quay lại Soạn thảo
          </button>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            {isStudentView ? (
              <>
                <GraduationCap size={15} className="text-blue-600 dark:text-blue-400" />
                <span>Schüleransicht (Đã ẩn ghi chú giáo viên & đáp án)</span>
              </>
            ) : (
              <>
                <BookOpen size={15} className="text-purple-600 dark:text-purple-400" />
                <span>Unterrichtsentwurf (Bản giáo án hoàn chỉnh)</span>
              </>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePrintDocument}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
        >
          <Printer size={14} /> Drucken / PDF A4
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-md">
                Niveau {lessonInfo.level} · {isStudentView ? 'Arbeitsblatt für Schüler' : 'Offizieller Prüfungsentwurf'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {lessonInfo.title}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Thema: <strong>{lessonInfo.topic}</strong></p>
            </div>

            <div className="text-right shrink-0 space-y-1">
              {!isStudentView && (
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Clock size={13} /> {lessonInfo.targetDuration} Minuten
                  </span>
                </div>
              )}
            </div>
          </div>

          {!isStudentView && lessonInfo.objectives && (
            <div className="mt-4 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs">
              <span className="font-bold text-blue-800 dark:text-blue-300">Lernziel / Prüfungsziel: </span>
              <span className="text-slate-700 dark:text-slate-300">{lessonInfo.objectives}</span>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {safeBlocks.map((block, idx) => {
            const data = (block.data || {}) as (ExtendedExamBlockData & { sampleSolution?: string });
            const isClozeTest = data.taskType === 'SPRACHBAUSTEINE_CLOZE' || data.answerType === 'CLOZE';
            const isFreeTextWriting = data.answerType === 'FREE_TEXT' || data.responseMode === 'LONG_TEXT';

            return (
              <section key={block.id || idx} className="space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-sm font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}.</span>
                      <span>{block.title}</span>
                    </h2>
                    {data.taskType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {data.taskType}
                      </span>
                    )}
                    {data.maxPoints && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        {data.maxPoints} Punkte
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isStudentView && (
                      <span className="text-xs text-slate-400 font-medium">{block.duration} Min</span>
                    )}
                    <button
                      onClick={() => handleQuickEditBlock(block.id)}
                      className="no-print opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all"
                      title="Chỉnh sửa nội dung của phần này"
                    >
                      <Edit2 size={12} />
                      <span>Sửa phần này</span>
                    </button>
                  </div>
                </div>

                {(data.instructions || block.content) && (
                  <div
                    className="text-xs text-slate-700 dark:text-slate-300 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: getSafeString(data.instructions || block.content) }}
                  />
                )}

                {data.transcript && (
                  <div className="my-4 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 shadow-xs no-print">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                          <Headphones size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Audio Track (Hörtext)</h4>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400">Bấm Play để nghe đoạn hội thoại bằng tiếng Đức</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          window.speechSynthesis.cancel();
                          const utterance = new SpeechSynthesisUtterance(getSafeString(data.transcript));
                          utterance.lang = 'de-DE';
                          utterance.rate = audioSpeed || 0.9;
                          window.speechSynthesis.speak(utterance);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold shadow-xs transition-transform hover:scale-105"
                      >
                        <PlayCircle size={18} /> Nghe Audio
                      </button>
                    </div>

                    {!isStudentView && (
                      <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800/80">
                        <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block mb-1">
                          Transkript (Chỉ giáo viên thấy)
                        </span>
                        <p className="text-xs text-blue-900/80 dark:text-blue-200/80 italic leading-relaxed">
                          "{getSafeString(data.transcript)}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {data.readingText && (
                  <div
                    className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs leading-relaxed text-slate-800 dark:text-slate-200"
                    dangerouslySetInnerHTML={{ __html: getSafeString(data.readingText) }}
                  />
                )}

                {isClozeTest && data.quizQuestions && data.quizQuestions.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">
                      Antwortbogen: Sprachbausteine (Phiếu chọn đáp án đục lỗ):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {data.quizQuestions.map((q: any, qIdx: number) => {
                        const questionLabel = getSafeString(q.question).replace(/Lücke\s*/i, '').trim() || `Lücke ${qIdx + 1}`;
                        const safeOpts = getSafeOptionsArray(q.options);

                        return (
                          <div key={q.id || qIdx} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200 min-w-[70px]">
                              {questionLabel}
                            </span>
                            <div className="flex items-center gap-1.5 flex-1 justify-end flex-wrap">
                              {safeOpts.map((opt: string, optIdx: number) => {
                                const isCorrect = !isStudentView && optIdx === q.correctAnswerIndex;
                                return (
                                  <span
                                    key={optIdx}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                      isCorrect
                                        ? 'bg-green-100 text-green-800 dark:bg-green-950/80 dark:text-green-300 border-green-500 font-bold'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {opt}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isClozeTest && !isFreeTextWriting && data.quizQuestions && data.quizQuestions.length > 0 && (
                  <div className="space-y-3">
                    {data.quizQuestions.map((q: any, qIdx: number) => {
                      const isInputText = data.responseMode === 'INPUT_TEXT';
                      const safeOpts = getSafeOptionsArray(q.options);
                      const isPureMatching = data.answerType === 'MATCHING' && safeOpts.length === 0 && (q.correctMatch || q.match);

                      return (
                        <div key={q.id || qIdx} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl text-xs space-y-2.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {qIdx + 1}. {getSafeString(q.question)}
                          </p>

                          {isInputText || isPureMatching ? (
                            <div className="mt-2">
                              {isStudentView ? (
                                <div className="w-full h-10 border-b-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-t-md"></div>
                              ) : (
                                <div className="w-full p-2.5 border border-green-500 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 font-bold rounded-xl flex items-center">
                                  <span className="text-[10px] text-slate-500 mr-2 font-normal uppercase tracking-wider">Lösung (Đáp án):</span>
                                  <span>{getSafeString(q.correctAnswer || q.answer || q.solution || q.correctMatch || safeOpts[0]) || "Keine Lösung angegeben"}</span>
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
                                  if (data.answerType !== 'TRUE_FALSE' && data.answerType !== 'YES_NO' && !/^[A-Z][\)\.]\s/.test(displayOpt)) {
                                    prefix = `${String.fromCharCode(65 + optIdx)}) `;
                                  }
                                }

                                const isCorrect = !isStudentView && optIdx === q.correctAnswerIndex;

                                return (
                                  <div
                                    key={optIdx}
                                    className={`flex-1 min-w-[200px] p-2.5 rounded-xl border transition-colors flex items-start ${
                                      isCorrect
                                        ? 'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 font-bold'
                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    <span className={`shrink-0 inline-block w-4 h-4 rounded-full border mr-2 align-middle text-center text-[10px] flex items-center justify-center ${isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-slate-400'}`}>
                                      {isCorrect ? '✓' : ''}
                                    </span>
                                    <span><strong className="mr-1 text-slate-900 dark:text-slate-100">{prefix}</strong>{displayOpt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {!isStudentView && q.explanation && (
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-700 dark:text-blue-300">
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
                      <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs text-emerald-950 dark:text-emerald-200 space-y-2">
                        <span className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Sparkles size={15} /> Musterlösung (Bài viết mẫu đạt điểm tối đa của giáo viên):
                        </span>
                        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 italic leading-relaxed" dangerouslySetInnerHTML={{ __html: getSafeString(data.sampleSolution) }} />
                      </div>
                    )}

                    {isStudentView && (
                      <div className="my-4 p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/40 space-y-3">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <PenLine size={14} /> Phần làm bài viết của thí sinh (Antwortbogen):
                        </span>
                        <div className="h-48 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 text-xs text-slate-400">
                          (Thí sinh làm bài tự luận vào đây...)
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {data.rubric && !isStudentView && (
                  <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <Award size={14} className="text-purple-600" />
                      Tiêu chí chấm điểm CEFR chuẩn (Bewertungskriterien - Tổng {data.maxPoints || 15} điểm):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
                        <span className="block text-[10px] text-slate-500">Nội dung (Inhalt)</span>
                        <strong className="text-purple-700 dark:text-purple-300">
                          {getRubricScore(data.rubric.taskCompletion)} điểm
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
                        <span className="block text-[10px] text-slate-500">Mạch lạc (Kohärenz)</span>
                        <strong className="text-purple-700 dark:text-purple-300">
                          {getRubricScore(data.rubric.coherence)} điểm
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
                        <span className="block text-[10px] text-slate-500">Từ vựng (Wortschatz)</span>
                        <strong className="text-purple-700 dark:text-purple-300">
                          {getRubricScore(data.rubric.vocabulary)} điểm
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
                        <span className="block text-[10px] text-slate-500">Ngữ pháp (Grammatik)</span>
                        <strong className="text-purple-700 dark:text-purple-300">
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