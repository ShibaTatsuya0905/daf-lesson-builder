import { Block, CEFRLevel, VocabularyWord } from '../types/lesson';
import { apiRequest } from './apiClient';

export interface AIGenerateLessonParams {
  topic: string;
  level: CEFRLevel;
  duration: number;
  focusAreas: string[];
}

export const aiService = {
  async scanDocument(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const token = localStorage.getItem('daf_access_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('http://localhost:3000/api/ai/scan-document', {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi quét tài liệu');
    return data;
  },

  async generateExam(formData: FormData) {
    const token = localStorage.getItem('daf_access_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('http://localhost:3000/api/ai/generate-exam', {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi khi tạo đề thi AI');
    return data;
  },

  async generateLesson(params: AIGenerateLessonParams): Promise<Omit<Block, 'id'>[]> {
    const res = await apiRequest('/ai/generate-lesson', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Lỗi khi tạo giáo án');
    return res.json();
  },

  async enrichVocabulary(topic: string): Promise<VocabularyWord[]> {
    const res = await apiRequest('/ai/enrich-vocabulary', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });
    if (!res.ok) throw new Error('Lỗi khi sinh từ vựng');
    return res.json();
  },
};