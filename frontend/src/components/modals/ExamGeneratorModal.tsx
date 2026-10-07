import React, { useState, useEffect } from 'react';
import { X, FileText, UploadCloud, Sparkles, Loader2, Check, GraduationCap, Layers } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { aiService } from '../../services/aiService';
import { CEFRLevel, Block } from '../../types/lesson';

const STANDARD_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TESTDAF_LEVELS = ['TDN 3', 'TDN 4', 'TDN 5'];
const CERTIFICATES = ['TELC', 'Goethe-Zertifikat', 'ÖSD', 'TestDaF'];

const BLUEPRINT_DURATIONS: Record<string, Record<string, number>> = {
  'TELC': {
    'Schreiben': 30,
    'Leseverstehen': 50,
    'Sprachbausteine': 20,
    'Hörverstehen': 30,
    'Full': 100,
  },
  'Goethe-Zertifikat': {
    'Schreiben': 60,
    'Leseverstehen': 65,
    'Hörverstehen': 40,
    'Full': 125,
  },
  'ÖSD': {
    'Schreiben': 60,
    'Leseverstehen': 65,
    'Hörverstehen': 40,
    'Full': 125,
  },
  'TestDaF': {
    'Schreiben': 60,
    'Leseverstehen': 60,
    'Hörverstehen': 40,
    'Full': 120,
  },
};

export const ExamGeneratorModal: React.FC = () => {
  const { isExamModalOpen, closeExamModal, lessonInfo, updateLessonInfo, setViewMode } = useLessonStore();

  const [inputMode, setInputMode] = useState<'random' | 'prompt' | 'file'>('random');
  const [topic, setTopic] = useState('Alltag und Beruf');
  const [certificate, setCertificate] = useState('TELC');
  const [level, setLevel] = useState<string>('B1');
  const [duration, setDuration] = useState(30);
  const [parts, setParts] = useState<string[]>(['Schreiben']);
  const [examFiles, setExamFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isExamModalOpen) {
      if (lessonInfo.topic) {
        setTopic(lessonInfo.topic);
      }
      if (lessonInfo.level) {
        setLevel(lessonInfo.level);
      }
    }
  }, [isExamModalOpen, lessonInfo.topic, lessonInfo.level]);

  if (!isExamModalOpen) return null;

  const isTestDaF = certificate === 'TestDaF';
  const isTelc = certificate === 'TELC';
  const availableLevels = isTestDaF ? TESTDAF_LEVELS : STANDARD_LEVELS;

  const getExactDuration = (cert: string, skillKey: string) => {
    const certDurations = BLUEPRINT_DURATIONS[cert] || BLUEPRINT_DURATIONS['TELC'];
    return certDurations[skillKey] || 60;
  };

  const selectSingleSkill = (skill: string) => {
    if (skill === 'Schreiben') {
      setParts(['Schreiben']);
      setDuration(getExactDuration(certificate, 'Schreiben'));
    } else if (skill === 'Leseverstehen') {
      setParts(['Leseverstehen']);
      setDuration(getExactDuration(certificate, 'Leseverstehen'));
    } else if (skill === 'Sprachbausteine') {
      if (!isTelc) return;
      setParts(['Sprachbausteine']);
      setDuration(getExactDuration(certificate, 'Sprachbausteine'));
    } else if (skill === 'Hörverstehen') {
      setParts(['Hörverstehen']);
      setDuration(getExactDuration(certificate, 'Hörverstehen'));
    } else if (skill === 'Full') {
      if (isTelc) {
        setParts(['Leseverstehen', 'Sprachbausteine', 'Schreiben']);
      } else {
        setParts(['Leseverstehen', 'Schreiben']);
      }
      setDuration(getExactDuration(certificate, 'Full'));
    }
  };

  const handleCertificateChange = (newCert: string) => {
    setCertificate(newCert);
    if (newCert === 'TestDaF') {
      setLevel('TDN 4');
      setTopic('Universitätsleben und Wissenschaft');
    }

    if (newCert !== 'TELC' && parts.includes('Sprachbausteine')) {
      if (parts.length === 1 && parts[0] === 'Sprachbausteine') {
        setParts(['Leseverstehen']);
        setDuration(getExactDuration(newCert, 'Leseverstehen'));
        return;
      } else {
        const filteredParts = parts.filter(p => p !== 'Sprachbausteine');
        setParts(filteredParts);
        setDuration(getExactDuration(newCert, 'Full'));
        return;
      }
    }

    const currentSkillKey = parts.length > 1 ? 'Full' : parts[0] || 'Schreiben';
    setDuration(getExactDuration(newCert, currentSkillKey));
  };

  const handleGenerateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parts.length === 0) {
      alert('Vui lòng chọn ít nhất 1 kỹ năng để tạo đề!');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('level', level);
      formData.append('duration', String(duration));
      formData.append('parts', JSON.stringify(parts));
      formData.append('certificate', certificate);

      if (inputMode === 'file' && examFiles.length > 0) {
        examFiles.forEach((file) => formData.append('files', file));
      }

      const examData = await aiService.generateExam(formData);

      const generatedBlocks: Block[] = examData.blocks.map((b: any, idx: number) => ({
        ...b,
        id: `block-${Date.now()}-${idx}`,
      }));

      updateLessonInfo({
        title: examData.title || `${certificate} ${level}: ${topic}`,
        topic: examData.topic || topic,
        level: (isTestDaF ? 'B2' : examData.level) as CEFRLevel,
        targetDuration: Number(examData.targetDuration || duration),
        objectives: examData.objectives || 'Đề thi đánh giá năng lực tiếng Đức chuẩn.',
      });

      useLessonStore.setState({ blocks: generatedBlocks });
      closeExamModal();
      setViewMode('student');
    } catch (err: any) {
      alert(`Lỗi tạo đề thi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Thiết Kế Đề Thi Theo Kỹ Năng Chuẩn</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tạo đề thi chuyên biệt cho từng kỹ năng (Viết, Đọc, Nghe, Ngữ pháp)</p>
            </div>
          </div>
          <button onClick={closeExamModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-800 p-1.5 bg-slate-100 dark:bg-slate-800/80 mx-6 mt-4 rounded-2xl">
          <button
            type="button"
            onClick={() => setInputMode('random')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${inputMode === 'random' ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            <GraduationCap size={14}/> Theo Chứng Chỉ Thi
          </button>
          <button
            type="button"
            onClick={() => setInputMode('prompt')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${inputMode === 'prompt' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            ✍️ Theo Chủ Đề Riêng
          </button>
          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${inputMode === 'file' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            📄 Dựa Trên File Sách
          </button>
        </div>

        <form onSubmit={handleGenerateExam} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Chọn Modul (Kỹ năng) bạn muốn tạo đề:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => selectSingleSkill('Schreiben')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  parts.length === 1 && parts[0] === 'Schreiben'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>✍️ Chỉ thi Viết</span>
                {parts.length === 1 && parts[0] === 'Schreiben' && <Check size={14} className="text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => selectSingleSkill('Leseverstehen')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  parts.length === 1 && parts[0] === 'Leseverstehen'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>📖 Chỉ thi Đọc</span>
                {parts.length === 1 && parts[0] === 'Leseverstehen' && <Check size={14} className="text-blue-600" />}
              </button>

              <button
                type="button"
                disabled={!isTelc}
                onClick={() => selectSingleSkill('Sprachbausteine')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  !isTelc
                    ? 'opacity-35 cursor-not-allowed bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                    : parts.length === 1 && parts[0] === 'Sprachbausteine'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                }`}
                title={!isTelc ? 'Chỉ có chứng chỉ TELC mới có phần thi Ngữ pháp riêng' : ''}
              >
                <div className="flex flex-col">
                  <span>📐 Chỉ thi Ngữ pháp</span>
                  {!isTelc && <span className="text-[9px] font-normal text-slate-400">(Chỉ có ở TELC)</span>}
                </div>
                {isTelc && parts.length === 1 && parts[0] === 'Sprachbausteine' && <Check size={14} className="text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => selectSingleSkill('Hörverstehen')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  parts.length === 1 && parts[0] === 'Hörverstehen'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>🎧 Chỉ thi Nghe</span>
                {parts.length === 1 && parts[0] === 'Hörverstehen' && <Check size={14} className="text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => selectSingleSkill('Full')}
                className={`col-span-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  parts.length > 1
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{isTelc ? '📑 Đề thi Tổng hợp (Đọc + Ngữ pháp + Viết)' : '📑 Đề thi Tổng hợp (Đọc + Viết)'}</span>
                {parts.length > 1 && <Check size={14} className="text-blue-600" />}
              </button>
            </div>
          </div>

          {inputMode === 'random' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Kỳ thi / Chứng chỉ</label>
                <select value={certificate} onChange={(e) => handleCertificateChange(e.target.value)} className="w-full text-xs p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold focus:outline-none">
                  {CERTIFICATES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Chủ đề đề thi</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Alltag, Beruf, Umwelt..." className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none" />
              </div>
            </div>
          )}

          {inputMode === 'prompt' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Chủ đề đề thi (Thema)</label>
              <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="z.B. Urlaub, Wohnen..." className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold" />
            </div>
          )}

          {inputMode === 'file' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tài liệu nguồn (File PDF/Ảnh)</label>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/70 cursor-pointer text-center">
                <UploadCloud size={28} className="text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{examFiles.length > 0 ? `Đã chọn: ${examFiles.map(f => f.name).join(', ')}` : 'Nhấp để chọn file PDF/Ảnh'}</span>
                <input type="file" multiple className="hidden" accept=".pdf,image/*" onChange={(e) => { if (e.target.files) setExamFiles(Array.from(e.target.files)); }} />
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {isTestDaF ? 'Bậc năng lực TestDaF' : 'Trình độ (Niveau)'}
              </label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none">
                {availableLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Thời gian thi chuẩn (Phút)</label>
              <input type="number" readOnly value={duration} className="w-full text-xs p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-bold text-slate-500 focus:outline-none cursor-not-allowed" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
            <Layers size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Hệ thống sẽ biên soạn chính xác <strong>100% đúng kỹ năng đã chọn</strong> theo đề thi {certificate} {level} (không bị lẫn lộn các phần khác).</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeExamModal} disabled={isLoading} className="text-xs font-semibold px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">Hủy</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-all">
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              <span>{isLoading ? 'AI đang biên soạn đề thi...' : `Tạo Đề Thi Ngay (${duration} Phút)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};