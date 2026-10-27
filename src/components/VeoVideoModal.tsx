import React, { useState, useRef } from 'react';
import {
  X,
  Clapperboard,
  Upload,
  Image as ImageIcon,
  Play,
  Download,
  Loader2,
  Sparkles,
  AlertCircle,
  Film,
  RefreshCw,
} from 'lucide-react';

interface VeoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareToChat?: (videoUrl: string, prompt: string) => void;
}

export const VeoVideoModal: React.FC<VeoVideoModalProps> = ({
  isOpen,
  onClose,
  onShareToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('image');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/png');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleStartGeneration = async () => {
    if (activeTab === 'image' && !imagePreview) {
      alert('Kripya pehle animate karne ke liye ek photo upload karein!');
      return;
    }

    if (activeTab === 'text' && !prompt.trim()) {
      alert('Kripya video generate karne ke liye prompt likhein!');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedVideoUrl(null);
    setStatusMessage('Veo 3.1 video generation initialize ho raha hai...');

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || 'Animate this image with smooth cinematic movement and atmospheric depth',
          imageBase64: activeTab === 'image' ? imagePreview : undefined,
          mimeType: imageMime,
          aspectRatio,
          resolution,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPaidKey) {
          throw new Error(
            'Veo 3.1 video generation requires a billing-enabled Google AI Studio API key. (Settings > Secrets mein apna paid key set karein).'
          );
        }
        throw new Error(data.error || 'Failed to start video generation');
      }

      const operationName = data.operationName;
      setStatusMessage('Video frames render ho rahe hain (Veo 3.1 Fast engine)... 🎬');

      // Poll every 5 seconds until video is ready
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 36; // 3 minutes max

      while (!isDone && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();
        if (statusData.error) {
          throw new Error(statusData.error.message || 'Video generation error from Veo engine');
        }

        if (statusData.done) {
          isDone = true;
          setStatusMessage('Final video MP4 download aur decode ho raha hai...');
          break;
        } else {
          const messages = [
            'Cinematic motion trajectory calculate ho rahi hai...',
            'Lighting & depth simulation synthesize ho rahi hai...',
            'Temporal consistency & frame blending polish ho raha hai...',
            'Finalizing 60fps cinematic output...',
          ];
          setStatusMessage(messages[attempts % messages.length]);
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out. Please try a simpler prompt.');
      }

      // Download the video
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!downloadRes.ok) {
        throw new Error('Failed to retrieve finished video file.');
      }

      const blob = await downloadRes.blob();
      const videoBlobUrl = URL.createObjectURL(blob);
      setGeneratedVideoUrl(videoBlobUrl);
      setStatusMessage('Video generation completed! 🎉');
    } catch (err: any) {
      console.error('Video generation error:', err);
      setErrorMessage(err.message || 'Video generate karne mein takleef aayi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Clapperboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Veo 3.1 Video Studio</span>
                <span className="text-[11px] font-mono font-normal text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  veo-3.1-fast-generate-preview
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate cinematic videos from text prompts or animate your uploaded photos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('image');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'image'
                  ? 'bg-sky-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Animate Photo (Image to Video)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('text');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'text'
                  ? 'bg-sky-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              <span>Generate Video from Text</span>
            </button>
          </div>

          {/* Photo Upload Area (Image to Video) */}
          {activeTab === 'image' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                1. Upload Photo to Animate
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl border border-slate-700 bg-slate-950 p-2 overflow-hidden flex flex-col items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Upload Preview"
                    className="max-h-56 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-4 right-4 rounded-full bg-slate-900/90 p-1.5 text-slate-300 hover:text-rose-400 border border-slate-700 shadow"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 hover:border-sky-500 bg-slate-950/60 p-8 text-center cursor-pointer transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-sky-400 mb-2">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    Click to select photo or drag & drop here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP supported</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {activeTab === 'image'
                ? '2. Motion & Camera Action (How should it animate?)'
                : '1. Video Description & Scene Details'}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                activeTab === 'image'
                  ? 'e.g. Camera slowly zooms in with soft wind moving through hair, warm golden light rays shimmering...'
                  : 'e.g. A futuristic Cyberpunk Mumbai city in 2085 with flying rickshaws, neon rain reflections, cinematic slow tracking shot...'
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Aspect Ratio & Resolution Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Aspect Ratio (Veo Format)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    aspectRatio === '16:9'
                      ? 'border-sky-400 bg-sky-500/15 text-sky-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">16:9 Landscape</div>
                  <div className="text-[10px] text-slate-500">YouTube / Cinema</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    aspectRatio === '9:16'
                      ? 'border-sky-400 bg-sky-500/15 text-sky-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">9:16 Portrait</div>
                  <div className="text-[10px] text-slate-500">Reels / Shorts</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Resolution Quality
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResolution('720p')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    resolution === '720p'
                      ? 'border-sky-400 bg-sky-500/15 text-sky-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">720p HD</div>
                  <div className="text-[10px] text-slate-500">Fast Generation</div>
                </button>
                <button
                  type="button"
                  onClick={() => setResolution('1080p')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    resolution === '1080p'
                      ? 'border-sky-400 bg-sky-500/15 text-sky-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">1080p Full HD</div>
                  <div className="text-[10px] text-slate-500">Studio Grade</div>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-medium text-rose-200">Video Generation Notice</p>
                <p className="mt-0.5 text-slate-300 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Video Player Output */}
          {generatedVideoUrl && (
            <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  Veo Generated Video
                </span>
                <a
                  href={generatedVideoUrl}
                  download="veo-cinematic-video.mp4"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1 rounded-md transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download MP4
                </a>
              </div>

              <div className="overflow-hidden rounded-lg bg-black flex items-center justify-center">
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="max-h-72 w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isGenerating ? (
              <span className="flex items-center gap-2 text-sky-400 animate-pulse font-mono">
                <Loader2 className="h-4 w-4 animate-spin" />
                {statusMessage}
              </span>
            ) : (
              <span>Powered by Google DeepMind Veo 3.1</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStartGeneration}
              disabled={isGenerating || (activeTab === 'image' && !imagePreview)}
              className="flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2 text-xs font-bold transition-all shadow-md shadow-sky-500/20 disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {activeTab === 'image' ? 'Animate Photo into Video' : 'Generate Video (Veo 3.1)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
