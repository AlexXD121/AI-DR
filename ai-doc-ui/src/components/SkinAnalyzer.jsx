import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function SkinAnalyzer() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      // TODO: Handle upload to backend here
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // TODO: Handle upload to backend here
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Skin Disease Analyzer</h2>
          <p className="text-slate-500 text-sm mt-1">
            Upload a clear, well-lit image of the affected skin area for preliminary AI analysis.
          </p>
        </div>

        {/* Upload Zone */}
        <div 
          className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-200 ease-in-out
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
            ${selectedFile ? 'border-green-400 bg-green-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept="image/*"
            onChange={handleChange}
          />
          
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-center">
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <ImageIcon className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-slate-700 font-medium">{selectedFile.name}</p>
                <p className="text-slate-400 text-xs mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Analyze Image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <UploadCloud className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-slate-700 font-medium mb-1">
                  Drag and drop an image here
                </p>
                <p className="text-slate-500 text-sm">
                  or <span className="text-blue-600 hover:underline">click to browse</span> from your device
                </p>
                <p className="text-slate-400 text-xs mt-4">
                  Supports JPG, PNG (Max 5MB)
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Placeholder Results Area */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Analysis Results</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
            <AlertCircle className="w-8 h-8 text-slate-400 mb-3" />
            <p className="text-slate-500 text-sm">
              Upload an image above to see the AI analysis results here.
              <br />
              Results will include potential conditions, confidence scores, and recommendations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
