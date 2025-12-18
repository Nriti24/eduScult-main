import jsPDF from 'jspdf';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

const cleanText = (text: string): string => {
  return text
    .replace(/[^\w\s\-.,!?():]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const downloadAsPDF = (content: any, contentType: string, topic: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 20;

  const addText = (text: string, fontSize: number, isBold: boolean, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    
    const cleanedText = cleanText(text);
    const lines = doc.splitTextToSize(cleanedText, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5;
  };

  if (contentType === 'notes' || contentType === 'handout') {
    const text = content.text || content;
    const lines = text.split('\n').filter((line: string) => line.trim());
    
    addText(lines[0] || topic, 20, true, [30, 64, 175]); // Blue heading
    if (lines[1]) {
      addText(lines[1], 14, true, [88, 28, 135]); // Purple subheading
    }
    
    lines.slice(2).forEach((line: string) => {
      if (line.trim()) {
        const isHeading = line.length < 50 && !line.includes('.');
        addText(line, isHeading ? 12 : 10, isHeading);
      }
    });
  } else if (contentType === 'quiz') {
    addText('Quiz: ' + topic, 20, true, [30, 64, 175]);
    yPosition += 5;
    
    content.questions?.forEach((q: any, idx: number) => {
      addText(`${idx + 1}. ${cleanText(q.question)}`, 12, true);
      q.options?.forEach((option: string, optIdx: number) => {
        const prefix = String.fromCharCode(65 + optIdx);
        const isCorrect = optIdx === q.correctAnswer;
        addText(`${prefix}. ${cleanText(option)}`, 10, isCorrect, isCorrect ? [34, 197, 94] : [0, 0, 0]);
      });
      if (q.explanation) {
        addText(`Explanation: ${cleanText(q.explanation)}`, 9, false, [107, 114, 128]);
      }
      yPosition += 5;
    });
  } else if (contentType === 'mindmap') {
    addText(content.central || topic, 20, true, [30, 64, 175]);
    yPosition += 5;
    
    content.branches?.forEach((branch: any) => {
      addText(branch.title, 14, true, [88, 28, 135]);
      branch.items?.forEach((item: string) => {
        addText(`- ${cleanText(item)}`, 10, false);
      });
      yPosition += 3;
    });
  }

  doc.save(`${cleanText(topic)}.pdf`);
};

export const downloadAsDOCX = async (content: any, contentType: string, topic: string) => {
  const children: Paragraph[] = [];

  const addHeading = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel], color: string) => {
    children.push(
      new Paragraph({
        text: cleanText(text),
        heading: level,
        spacing: { after: 200 },
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: cleanText(text),
            bold: true,
            size: level === HeadingLevel.HEADING_1 ? 32 : 28,
            color: color,
          }),
        ],
      })
    );
  };

  const addParagraph = (text: string, bold: boolean = false, color: string = '000000') => {
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: cleanText(text),
            bold: bold,
            size: 22,
            color: color,
          }),
        ],
      })
    );
  };

  if (contentType === 'notes' || contentType === 'handout') {
    const text = content.text || content;
    const lines = text.split('\n').filter((line: string) => line.trim());
    
    addHeading(lines[0] || topic, HeadingLevel.HEADING_1, '1E40AF');
    if (lines[1]) {
      addHeading(lines[1], HeadingLevel.HEADING_2, '581C87');
    }
    
    lines.slice(2).forEach((line: string) => {
      if (line.trim()) {
        const isHeading = line.length < 50 && !line.includes('.');
        if (isHeading) {
          addParagraph(line, true, '1E40AF');
        } else {
          addParagraph(line);
        }
      }
    });
  } else if (contentType === 'quiz') {
    addHeading('Quiz: ' + topic, HeadingLevel.HEADING_1, '1E40AF');
    
    content.questions?.forEach((q: any, idx: number) => {
      addParagraph(`${idx + 1}. ${cleanText(q.question)}`, true);
      q.options?.forEach((option: string, optIdx: number) => {
        const prefix = String.fromCharCode(65 + optIdx);
        const isCorrect = optIdx === q.correctAnswer;
        addParagraph(`${prefix}. ${cleanText(option)}`, isCorrect, isCorrect ? '22C55E' : '000000');
      });
      if (q.explanation) {
        addParagraph(`Explanation: ${cleanText(q.explanation)}`, false, '6B7280');
      }
    });
  } else if (contentType === 'mindmap') {
    addHeading(content.central || topic, HeadingLevel.HEADING_1, '1E40AF');
    
    content.branches?.forEach((branch: any) => {
      addHeading(branch.title, HeadingLevel.HEADING_2, '581C87');
      branch.items?.forEach((item: string) => {
        addParagraph(`- ${cleanText(item)}`);
      });
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${cleanText(topic)}.docx`);
};
