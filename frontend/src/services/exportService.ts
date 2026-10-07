import { Block, LessonInfo } from '../types/lesson';

const generateCleanHtml = (
  lessonInfo: LessonInfo,
  blocks: Block[],
  isStudentView: boolean = false
): string => {
  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; max-width: 820px; margin: 0 auto; line-height: 1.6; font-size: 14px;">
      
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 6px; border: 1px solid #bfdbfe; text-transform: uppercase;">
            Niveau ${lessonInfo.level || 'A1'} · ${isStudentView ? 'Arbeitsblatt (Tài liệu học viên)' : 'Unterrichtsentwurf (Giáo án giáo viên)'}
          </span>
          ${
            !isStudentView
              ? `<span style="font-size: 12px; color: #64748b; font-weight: 600;">⏱ Dauer: ${lessonInfo.targetDuration || 45} Minuten</span>`
              : ''
          }
        </div>

        <h1 style="color: #0f172a; margin: 8px 0; font-size: 26px; font-weight: 800; line-height: 1.2;">
          ${lessonInfo.title || 'Unterrichtsplan'}
        </h1>

        <p style="margin: 0; font-size: 13px; color: #64748b;">
          <strong>Thema:</strong> ${lessonInfo.topic || 'Allgemeines Thema'}
        </p>
      </div>
  `;

  if (lessonInfo.objectives && !isStudentView) {
    html += `
      <div style="background-color: #f0fdf4; padding: 12px 16px; border-left: 4px solid #16a34a; border-radius: 4px; margin-bottom: 24px;">
        <strong style="color: #166534; font-size: 13px;">🎯 Lernziel (Mục tiêu bài học):</strong>
        <div style="color: #1e293b; margin-top: 4px; font-size: 13px;">${lessonInfo.objectives}</div>
      </div>
    `;
  }

  blocks.forEach((block, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const data = block.data || {};

    html += `
      <div style="margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px dashed #e2e8f0; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
          <h2 style="color: #1e40af; margin: 0; font-size: 16px; font-weight: 700;">
            <span style="color: #94a3b8; font-family: monospace; margin-right: 6px;">${num}.</span>
            ${block.title}
          </h2>
          ${
            !isStudentView
              ? `<span style="color: #64748b; font-size: 12px; font-weight: 500;">${block.duration} Min</span>`
              : ''
          }
        </div>
    `;

    if (!isStudentView) {
      if (data.socialForm || data.materials || data.goal) {
        html += `<div style="font-size: 12px; color: #475569; margin-bottom: 10px; background-color: #f8fafc; padding: 8px 12px; border-radius: 6px;">`;
        if (data.socialForm) {
          html += `<span style="margin-right: 15px;"><strong>Sozialform:</strong> ${data.socialForm}</span>`;
        }
        if (data.materials) {
          html += `<span style="margin-right: 15px;"><strong>Materialien:</strong> ${data.materials}</span>`;
        }
        if (data.goal) {
          html += `<span><strong>Ziel:</strong> ${data.goal}</span>`;
        }
        html += `</div>`;
      }

      if (data.teacherNotes) {
        html += `
          <div style="background-color: #fffbeb; padding: 10px 14px; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 12px; color: #92400e; margin: 10px 0;">
            <strong>💡 Lehrkraft-Hinweis:</strong> ${data.teacherNotes}
          </div>
        `;
      }
    }

    if (data.instructions || block.content) {
      html += `
        <div style="margin: 10px 0; font-size: 13px; line-height: 1.6;">
          ${data.instructions || block.content}
        </div>
      `;
    }

    if (data.readingText) {
      html += `
        <div style="background-color: #f8fafc; padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px; margin: 14px 0; font-size: 13px; line-height: 1.7; color: #0f172a;">
          ${data.readingText}
        </div>
      `;
    }

    if (data.vocabulary && data.vocabulary.length > 0) {
      html += `
        <div style="margin: 14px 0; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #e2e8f0; text-align: left;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #334155; font-weight: 700;">
                <th style="border: 1px solid #cbd5e1; padding: 8px 10px; width: 30%;">Wort / Wendung</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px 10px; width: 25%;">Bedeutung</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px 10px; width: 15%;">Plural</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px 10px; width: 30%;">Beispielsatz</th>
              </tr>
            </thead>
            <tbody>
      `;

      data.vocabulary.forEach((v: any) => {
        let articleColor = '#64748b';
        if (v.article === 'der') articleColor = '#2563eb';
        if (v.article === 'die') articleColor = '#dc2626';
        if (v.article === 'das') articleColor = '#16a34a';

        const articleHtml =
          v.article && v.article !== '-'
            ? `<span style="color: ${articleColor}; font-weight: 800; margin-right: 4px;">${v.article}</span>`
            : '';

        html += `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-weight: 600;">${articleHtml}${v.german}</td>
            <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${v.translation || '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 7px 10px; color: #475569;">${v.plural || '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-style: italic; color: #475569;">${v.example || '-'}</td>
          </tr>
        `;
      });

      html += `</tbody></table></div>`;
    }

    if (data.sentenceStarters && data.sentenceStarters.length > 0) {
      html += `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px; margin: 12px 0;">
          <p style="font-weight: 700; font-size: 12px; color: #166534; margin: 0 0 6px 0;">💬 Redemittel & Satzbausteine:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #166534;">
      `;
      data.sentenceStarters.forEach((s: string) => {
        html += `<li style="margin-bottom: 4px;">${s}</li>`;
      });
      html += `</ul></div>`;
    }

    if (data.wordBank && data.wordBank.length > 0) {
      html += `
        <div style="margin: 10px 0; font-size: 12px; color: #475569;">
          <strong>Hilfswörter:</strong> <span style="background-color: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-family: monospace;">${data.wordBank.join(' · ')}</span>
        </div>
      `;
    }

    if (data.questions && data.questions.length > 0) {
      html += `
        <div style="margin: 12px 0;">
          <p style="font-weight: 700; font-size: 12px; color: #334155; margin-bottom: 6px;">Fragen:</p>
          <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155;">
      `;
      data.questions.forEach((q: string) => {
        html += `<li style="margin-bottom: 4px;">${q}</li>`;
      });
      html += `</ol></div>`;
    }

    if (!isStudentView && (data.audioUrl || data.transcript)) {
      html += `<div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 12px;">`;
      if (data.audioUrl) {
        html += `<p style="margin: 0 0 4px 0;"><strong>Audio:</strong> ${data.audioUrl}</p>`;
      }
      if (data.transcript) {
        html += `<p style="margin: 0; color: #7c2d12;"><strong>Transkript:</strong> <em>${data.transcript}</em></p>`;
      }
      html += `</div>`;
    }

    if (data.quizQuestions && data.quizQuestions.length > 0) {
      html += `<div style="margin-top: 14px;">`;
      data.quizQuestions.forEach((q: any, qIdx: number) => {
        html += `
          <div style="margin-bottom: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 6px;">
            <p style="font-size: 13px; font-weight: 700; margin: 0 0 8px 0; color: #0f172a;">${qIdx + 1}. ${q.question}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        `;
        q.options.forEach((opt: string, optIdx: number) => {
          const isCorrect = !isStudentView && optIdx === q.correctAnswerIndex;
          html += `
            <div style="font-size: 13px; padding: 6px 10px; border-radius: 4px; border: 1px solid ${isCorrect ? '#22c55e' : '#cbd5e1'}; background-color: ${isCorrect ? '#f0fdf4' : '#ffffff'}; color: ${isCorrect ? '#15803d' : '#334155'}; font-weight: ${isCorrect ? 'bold' : 'normal'};">
              <span style="display:inline-block; width:15px; height:15px; border:1px solid #94a3b8; border-radius:50%; vertical-align:middle; margin-right:6px; background-color: ${isCorrect ? '#22c55e' : 'transparent'};"></span>
              ${opt}
            </div>
          `;
        });
        html += `</div>`;

        if (!isStudentView && q.explanation) {
          html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #0369a1;"><strong>💡 Erklärung:</strong> ${q.explanation}</div>`;
        }
        
        html += `</div>`;
      });
      html += `</div>`;
    }

    if (data.flashcards && data.flashcards.length > 0) {
      html += `
        <div style="margin: 12px 0;">
          <p style="font-weight: 700; font-size: 12px; color: #4338ca; margin-bottom: 6px;">Karteikarten (${data.flashcards.length} Karten):</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
      `;
      data.flashcards.forEach((card: any) => {
        html += `
          <div style="border: 1px solid #c7d2fe; background-color: #eef2ff; padding: 8px; border-radius: 6px; font-size: 12px;">
            <div style="font-weight: bold; color: #3730a3;">${card.front}</div>
            <div style="color: #1e293b; margin-top: 2px;">${card.back}</div>
            ${card.hint ? `<div style="color: #6366f1; font-size: 11px; margin-top: 2px; font-style: italic;">(${card.hint})</div>` : ''}
          </div>
        `;
      });
      html += `</div></div>`;
    }

    html += `</div>`;
  });

  html += `</div>`;
  return html;
};

export const exportService = {
  printLesson(): void {
    window.print();
  },

  exportToPdf(
    lessonInfo: LessonInfo,
    blocks: Block[],
    isStudentView: boolean = false
  ): void {
    const htmlContent = generateCleanHtml(lessonInfo, blocks, isStudentView);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cấp quyền mở Pop-up trên trình duyệt để xuất tệp PDF/In ấn!');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="de">
        <head>
          <meta charset="utf-8">
          <title>${lessonInfo.title || 'Unterrichtsplan'}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm 15mm 20mm 15mm;
            }
            body {
              margin: 0;
              padding: 24px;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              overflow-y: auto !important;
            }
            .floating-print-bar {
              position: fixed;
              top: 15px;
              right: 20px;
              background: #0f172a;
              color: white;
              padding: 10px 18px;
              border-radius: 12px;
              cursor: pointer;
              font-family: sans-serif;
              font-size: 13px;
              font-weight: bold;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
              z-index: 9999;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            @media print {
              body {
                padding: 0;
              }
              .floating-print-bar,
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <button class="floating-print-bar no-print" onclick="window.print()">
            🖨️ In ra giấy / Lưu PDF
          </button>
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  },

  exportToWord(
    lessonInfo: LessonInfo,
    blocks: Block[],
    isStudentView: boolean = false
  ): void {
    const htmlContent = generateCleanHtml(lessonInfo, blocks, isStudentView);

    const wordDocument = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${lessonInfo.title || 'Unterrichtsplan'}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              font-size: 11pt; 
              line-height: 1.5; 
              color: #000;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-top: 10px;
              margin-bottom: 10px;
            }
            th, td { 
              border: 1px solid #999999; 
              padding: 6px 8px; 
              text-align: left;
              vertical-align: top;
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            h1 { font-size: 18pt; color: #1e3a8a; }
            h2 { font-size: 13pt; color: #1e40af; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordDocument], {
      type: 'application/msword;charset=utf-8;',
    });

    const safeTitle = (lessonInfo.title || 'Unterrichtsplan')
      .trim()
      .replace(/[^\w\d\s-_]/gi, '')
      .replace(/\s+/g, '_');

    const fileName = `${safeTitle}_${isStudentView ? 'Schueler' : 'Lehrer'}.doc`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};