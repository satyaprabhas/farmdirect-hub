import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, dataUrl: string) => void;
  title?: string;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title
}: CameraCaptureModalProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setIsInitializing(true);
    setCameraError(null);
    setCapturedImage(null);

    // Stop existing stream first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      // First attempt with facingMode preference
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err) {
        // Fallback to any video device
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errMsg = 'Camera access was denied or is unavailable on this device.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = language === 'te' 
          ? 'కెమెరా అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో కెమెరా యాక్సెస్ అనుమతించండి.' 
          : 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = language === 'te' 
          ? 'మీ పరికరంలో ఎటువంటి కెమెరా కనుగొనబడలేదు.' 
          : 'No camera hardware found on this device.';
      }
      setCameraError(errMsg);
    } finally {
      setIsInitializing(false);
    }
  }, [stream, language]);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setCameraError(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Switch between front/back camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture snapshot from video
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front camera for natural mirroring
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);

    // Pause video to freeze
    video.pause();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  // Confirm and use captured photo
  const handleConfirm = () => {
    if (!canvasRef.current || !capturedImage) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const fileName = `camera_capture_${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          onCapture(file, capturedImage);
          handleClose();
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleClose = () => {
    stopStream();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-gray-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-800 flex flex-col max-h-[92vh] animate-fade-in text-white">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gray-950 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">
              {title || (language === 'te' ? 'కెమెరాతో ఫోటో తీయండి' : 'Take Picture with Camera')}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Capture Canvas Container */}
        <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-xs sm:text-sm text-gray-300 max-w-xs mx-auto">{cameraError}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {language === 'te' ? 'మళ్లీ ప్రయత్నించండి' : 'Try Again'}
              </button>
            </div>
          ) : (
            <>
              {/* Live Video */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'} ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Frozen Snapshot Preview */}
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured snapshot"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Framing Guide Lines (Grid overlay) */}
              {!capturedImage && !isInitializing && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-r border-white/10" />
                  <div />
                </div>
              )}

              {/* Flip camera button */}
              {!capturedImage && !cameraError && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 p-2.5 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all cursor-pointer border border-white/10"
                  title="Switch Camera (Front/Back)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Hidden Canvas for Processing Image */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between gap-3">
          {!capturedImage ? (
            <div className="w-full flex items-center justify-center">
              <button
                type="button"
                disabled={Boolean(cameraError) || isInitializing}
                onClick={takeSnapshot}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="w-12 h-12 rounded-full bg-white group-hover:scale-90 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'te' ? 'మళ్లీ తీయండి' : 'Retake'}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-900/30"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{language === 'te' ? 'ఈ ఫోటోను ఉపయోగించండి' : 'Use Photo'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
