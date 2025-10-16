import React, { useState, useCallback } from 'react';
import { InputMode } from '../types';
import UploadIcon from './icons/UploadIcon';

// Declare global variables from CDN scripts
declare const mammoth: any;
declare const JSZip: any;

interface InputFormProps {
  onGenerate: (context: string, numQuestions: number) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [inputMode, setInputMode] = useState<InputMode>('topic');
  const [topic, setTopic] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setFileContent('');

    const extension = file.name.split('.').pop()?.toLowerCase();

    const resetStateOnError = () => {
      setFileName('');
      setFileContent('');
      if (event.target) {
        event.target.value = ''; // Allow re-uploading the same file after error
      }
    };

    try {
      switch (extension) {
        case 'txt': {
          const content = await file.text();
          setFileContent(content);
          break;
        }
        case 'docx': {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          setFileContent(result.value);
          if (!result.value.trim()) {
            setError('The document appears to be empty or contains only images.');
          }
          break;
        }
        case 'pptx': {
          const arrayBuffer = await file.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);
          const slidePromises = [];
          zip.forEach((relativePath, zipEntry) => {
            if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
              slidePromises.push(zipEntry.async('string'));
            }
          });

          const slideContents = await Promise.all(slidePromises);
          const fullText = slideContents.map(slideContent => {
            const textNodes = slideContent.match(/<a:t>.*?<\/a:t>/g) || [];
            return textNodes.map(node => node.replace(/<.*?>/g, '').trim()).join(' ');
          }).join('\n\n');

          if (!fullText.trim()) {
            setError('No text could be extracted. The PowerPoint might be image-based.');
          }
          setFileContent(fullText);
          break;
        }
        case 'doc':
        case 'ppt':
          setError(`Legacy .${extension} files are not supported. Please save it as a .${extension}x file and try again.`);
          resetStateOnError();
          break;
        default:
          setError(`File type ".${extension}" is not supported. Please upload a .txt, .docx, or .pptx file.`);
          resetStateOnError();
          break;
      }
    } catch (err) {
      console.error(`Error processing .${extension} file:`, err);
      setError(`Could not read the .${extension} file. It might be corrupted or password-protected.`);
      resetStateOnError();
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const context = inputMode === 'topic' ? topic : fileContent;
    if (!context.trim()) {
      setError(`Please enter a topic or upload a file with text content.`);
      return;
    }
    onGenerate(context, numQuestions);
  };

  const isSubmitDisabled = isLoading || (inputMode === 'topic' && !topic.trim()) || (inputMode === 'file' && !fileContent.trim());

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
      <h1 className="text-4xl font-bold text-center mb-2 text-indigo-400">AI MCQ Generator</h1>
      <p className="text-center text-slate-400 mb-8">Create quizzes instantly from any topic or text file.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button type="button" onClick={() => setInputMode('topic')} className={`w-1/2 p-2 rounded-md transition-colors duration-300 text-sm font-semibold ${inputMode === 'topic' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            Enter Topic
          </button>
          <button type="button" onClick={() => setInputMode('file')} className={`w-1/2 p-2 rounded-md transition-colors duration-300 text-sm font-semibold ${inputMode === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            Upload File
          </button>
        </div>

        {inputMode === 'topic' ? (
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">Topic / Context</label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The history of the Roman Empire, fundamentals of React, or paste any text here..."
              className="w-full h-32 p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-slate-300 mb-2">Upload Study Material (.txt, .docx, .pptx)</label>
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-900 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-slate-800">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-8 h-8 mb-3 text-slate-500" />
                {fileName ? (
                    <p className="text-sm text-green-400">{fileName}</p>
                ) : (
                    <>
                     <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                     <p className="text-xs text-slate-600">TXT, DOCX, or PPTX files</p>
                    </>
                )}
              </div>
              <input id="file-upload" type="file" className="hidden" accept=".txt,.docx,.pptx" onChange={handleFileChange} disabled={isLoading} />
            </label>
          </div>
        )}

        <div>
          <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
          <input
            type="number"
            id="numQuestions"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10)))}
            min="1"
            max="10"
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full py-3 px-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform disabled:scale-100 hover:scale-105"
        >
          {isLoading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;