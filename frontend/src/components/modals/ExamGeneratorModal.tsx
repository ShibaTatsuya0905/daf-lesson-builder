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
    'Sprechen': 15,
    'Full': 100,
  },
  'Goethe-Zertifikat': {
    'Schreiben': 60,
    'Leseverstehen': 65,
    'Hörverstehen': 40,
    'Sprechen': 15,
    'Full': 125,
  },
  'ÖSD': {
    'Schreiben': 60,
    'Leseverstehen': 65,
    'Hörverstehen': 40,
    'Sprechen': 20,
    'Full': 125,
  },
  'TestDaF': {
    'Schreiben': 60,
    'Leseverstehen': 60,
    'Hörverstehen': 40,
    'Sprechen': 35,
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
    } else if (skill === 'Sprechen') {
      setParts(['Sprechen']);
      setDuration(getExactDuration(certificate, 'Sprechen'));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-xl shadow-md overflow-hidden">
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-lilac-wash text-iris-bolt flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-charcoal">Thiết Kế Đề Thi Theo Kỹ Năng Chuẩn</h3>
              <p className="text-xs text-slate-veil">Tạo đề thi chuyên biệt cho từng kỹ năng (Viết, Đọc, Nghe, Nói, Ngữ pháp)</p>
            </div>
          </div>
          <button onClick={closeExamModal} className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border cursor-pointer"><X size={18} /></button>
        </div>

        <div className="flex border-b border-mist-border p-1 bg-chalk-canvas mx-6 mt-4 rounded-full">
          <button
            type="button"
            onClick={() => setInputMode('random')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${inputMode === 'random' ? 'bg-paper-white text-iris-bolt shadow-xs' : 'text-slate-veil hover:text-ink-charcoal'}`}
          >
            <GraduationCap size={14}/> Theo Chứng Chỉ Thi
          </button>
          <button
            type="button"
            onClick={() => setInputMode('prompt')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${inputMode === 'prompt' ? 'bg-paper-white text-ink-charcoal shadow-xs' : 'text-slate-veil hover:text-ink-charcoal'}`}
          >
            ✍️ Theo Chủ Đề Riêng
          </button>
          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${inputMode === 'file' ? 'bg-paper-white text-ink-charcoal shadow-xs' : 'text-slate-veil hover:text-ink-charcoal'}`}
          >
            📄 Dựa Trên File Sách
          </button>
        </div>

        <form onSubmit={handleGenerateExam} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-veil">
              Chọn Modul (Kỹ năng) bạn muốn tạo đề:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectSingleSkill('Leseverstehen')}
                className={`p-2.5 rounded border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                  parts.length === 1 && parts[0] === 'Leseverstehen'
                    ? 'border-iris-bolt bg-lilac-wash text-iris-bolt'
                    : 'border-mist-border bg-paper-white text-ink-charcoal hover:bg-chalk-canvas'
                }`}
              >
                <span>📖 Đọc hiểu (Lesen)</span>
                {parts.length === 1 && parts[0] === 'Leseverstehen' && <Check size={14} className="text-iris-bolt" />}
              </button>

              <button
                type="button"
                onClick={() => selectSingleSkill('Hörverstehen')}
                className={`p-2.5 rounded border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                  parts.length === 1 && parts[0] === 'Hörverstehen'
                    ? 'border-iris-bolt bg-lilac-wash text-iris-bolt'
                    : 'border-mist-border bg-paper-white text-ink-charcoal hover:bg-chalk-canvas'
                }`}
              >
                <span>🎧 Nghe hiểu (Hören)</span>
                {parts.length === 1 && parts[0] === 'Hörverstehen' && <Check size={14} className="text-iris-bolt" />}
              </button>

              <button
                type="button"
                onClick={() => selectSingleSkill('Schreiben')}
                className={`p-2.5 rounded border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                  parts.length === 1 && parts[0] === 'Schreiben'
                    ? 'border-iris-bolt bg-lilac-wash text-iris-bolt'
                    : 'border-mist-border bg-paper-white text-ink-charcoal hover:bg-chalk-canvas'
                }`}
              >
                <span>✍️ Viết (Schreiben)</span>
                {parts.length === 1 && parts[0] === 'Schreiben' && <Check size={14} className="text-iris-bolt" />}
              </button>

              <button
                type="button"
                onClick={() => selectSingleSkill('Sprechen')}
                className={`p-2.5 rounded border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                  parts.length === 1 && parts[0] === 'Sprechen'
                    ? 'border-iris-bolt bg-lilac-wash text-iris-bolt'
                    : 'border-mist-border bg-paper-white text-ink-charcoal hover:bg-chalk-canvas'
                }`}
              >
                <span>🗣 Nói (Sprechen)</span>
                {parts.length === 1 && parts[0] === 'Sprechen' && <Check size={14} className="text-iris-bolt" />}
              </button>

              <button
                type="button"
                disabled={!isTelc}
                onClick={() => selectSingleSkill('Sprachbausteine')}
                className={`p-2.5 rounded border text-xs font-semibold transition-all text-left flex items-center justify-between ${
                  !isTelc
                    ? 'opacity-40 cursor-not-allowed bg-chalk-canvas text-fog-mist border-mist-border'
                    : parts.length === 1 && parts[0] === 'Sprachbausteine'
                    ? 'border-iris-bolt bg-lilac-wash text-iris-bolt cursor-pointer'
                    : 'border-mist-border bg-paper-white text-ink-charcoal hover:bg-chalk-canvas cursor-pointer'
                }`}
              >
                <span>📐 Ngữ pháp (TELC)</span>
                {isTelc && parts.length === 1 && parts[0] === 'Sprachbausteine' && <Check size={14} className="text-iris-bolt" />}
              </button>

              <button
                type="button"
                onClick={() => selectSingleSkill('Full')}
                className={`p-2.5 rounded border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                  parts.length > 1
                    ? 'border-iris-bolt bg-lilac-wash text-iris-bolt'
                    : 'border-mist-border bg-paper-white text-ink-charcoal hover:bg-chalk-canvas'
                }`}
              >
                <span>📑 Đề Tổng hợp</span>
                {parts.length > 1 && <Check size={14} className="text-iris-bolt" />}
              </button>
            </div>
          </div>

          {inputMode === 'random' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-veil mb-1">Kỳ thi / Chứng chỉ</label>
                <select value={certificate} onChange={(e) => handleCertificateChange(e.target.value)} className="w-full text-xs p-2.5 rounded bg-chalk-canvas text-ink-charcoal border border-mist-border font-semibold focus:outline-none cursor-pointer">
                  {CERTIFICATES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-veil mb-1">Chủ đề đề thi</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Alltag, Beruf, Umwelt..." className="w-full text-xs p-2.5 rounded bg-chalk-canvas border border-mist-border font-semibold text-ink-charcoal focus:outline-none focus:border-iris-bolt" />
              </div>
            </div>
          )}

          {inputMode === 'prompt' && (
            <div>
              <label className="block text-xs font-semibold text-slate-veil mb-1">Chủ đề đề thi (Thema)</label>
              <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="z.B. Urlaub, Wohnen..." className="w-full text-xs p-2.5 rounded bg-chalk-canvas border border-mist-border font-semibold text-ink-charcoal focus:outline-none focus:border-iris-bolt" />
            </div>
          )}

          {inputMode === 'file' && (
            <div>
              <label className="block text-xs font-semibold text-slate-veil mb-1">Tài liệu nguồn (File PDF/Ảnh)</label>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-mist-border rounded-lg bg-chalk-canvas hover:border-iris-bolt cursor-pointer text-center transition-colors">
                <UploadCloud size={24} className="text-iris-bolt mb-1" />
                <span className="text-xs font-semibold text-ink-charcoal">{examFiles.length > 0 ? `Đã chọn: ${examFiles.map(f => f.name).join(', ')}` : 'Nhấp để chọn file PDF/Ảnh'}</span>
                <input type="file" multiple className="hidden" accept=".pdf,image/*" onChange={(e) => { if (e.target.files) setExamFiles(Array.from(e.target.files)); }} />
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-veil mb-1">
                {isTestDaF ? 'Bậc năng lực TestDaF' : 'Trình độ (Niveau)'}
              </label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full text-xs p-2.5 rounded bg-chalk-canvas border border-mist-border font-semibold text-ink-charcoal focus:outline-none cursor-pointer">
                {availableLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-veil mb-1">Thời gian thi chuẩn (Phút)</label>
              <input type="number" readOnly value={duration} className="w-full text-xs p-2.5 rounded bg-mist-border/40 border border-mist-border font-semibold text-slate-veil focus:outline-none cursor-not-allowed" />
            </div>
          </div>

          <div className="p-3 rounded bg-chalk-canvas border border-mist-border text-xs text-slate-veil flex items-center gap-2.5">
            <Layers size={16} className="text-iris-bolt shrink-0" />
            <span>Hệ thống biên soạn chuẩn CEFR <strong>100% đúng kỹ năng đã chọn</strong> theo đề thi {certificate} {level}.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeExamModal} disabled={isLoading} className="text-xs font-semibold px-4 py-2 text-slate-veil hover:text-ink-charcoal disabled:opacity-40 cursor-pointer">Hủy</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 text-xs font-semibold px-6 py-2.5 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs disabled:opacity-50 transition-opacity cursor-pointer">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{isLoading ? 'AI đang biên soạn đề thi...' : `Tạo Đề Thi Ngay (${duration} Phút)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};