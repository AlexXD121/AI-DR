import { Image as ImageIcon, AlertCircle, Clock, Heart } from 'lucide-react';
import { useState } from 'react';

export default function SkinAnalyzer() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      applyFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      applyFile(e.target.files[0]);
    }
  };

  const applyFile = (file) => {
    setSelectedFile(file);
    setShowComingSoon(false);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowComingSoon(true);
  };

  const handleReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowComingSoon(false);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-8 md:p-10">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-teal-500" />
              Skin Check-up
            </h2>
            <p className="text-stone-600 text-base mt-2">
              Upload a clear photo of your skin concern, and we'll help you figure out what it might be.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-sm font-medium whitespace-nowrap">
            <Clock className="w-4 h-4" />
            Coming Soon
          </span>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all duration-300 ease-in-out
            ${dragActive ? 'border-teal-400 bg-teal-50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100'}
            ${selectedFile ? 'border-teal-300 bg-teal-50/50' : ''}
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
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Selected skin area preview"
                    className="w-48 h-48 object-cover rounded-3xl mb-5 border-4 border-white shadow-md"
                  />
                )}
                <p className="text-stone-800 font-medium text-lg">{selectedFile.name}</p>
                <p className="text-stone-500 text-sm mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="px-6 py-3 bg-teal-600 text-white text-base font-medium rounded-full hover:bg-teal-700 transition-colors shadow-sm"
                  >
                    Check this photo
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 bg-white border border-stone-200 text-stone-600 text-base font-medium rounded-full hover:bg-stone-50 transition-colors"
                  >
                    Choose different
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-white p-5 rounded-full shadow-sm mb-5 border border-stone-100">
                  <ImageIcon className="w-10 h-10 text-teal-400" />
                </div>
                <p className="text-stone-800 font-medium text-lg mb-1">Tap to select a photo</p>
                <p className="text-stone-500 text-base">
                  or just drag and drop it here
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Coming Soon Banner */}
        {showComingSoon && (
          <div className="mt-6 flex items-start gap-4 p-5 bg-teal-50 border border-teal-100 rounded-3xl text-teal-800 text-base shadow-sm">
            <Clock className="w-6 h-6 flex-shrink-0 text-teal-500 mt-0.5" />
            <div className="flex-1">
              <strong className="block mb-1 text-teal-900">Skin checks are coming soon!</strong>
              We are carefully building this feature to be as helpful as possible. 
              In the meantime, feel free to use the <strong>Chat</strong> to describe what you're noticing.
            </div>
            <button
              onClick={() => setShowComingSoon(false)}
              className="text-teal-400 hover:text-teal-600 transition-colors p-1"
              aria-label="Close message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Results Placeholder */}
        <div className="mt-10 pt-8 border-t border-stone-100">
          <div className="bg-stone-50 border border-stone-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center min-h-[160px]">
            <AlertCircle className="w-10 h-10 text-stone-300 mb-4" />
            <p className="text-stone-500 text-base max-w-sm">
              When you upload a photo, we'll gently guide you through some possibilities and next steps.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
