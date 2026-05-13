import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FaceAuth = ({ onCapture, mode = 'login' }) => {
  const videoRef = useRef(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle', 'scanning', 'success', 'error'

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error("Error loading face models:", err);
        toast.error("Failed to load face detection models.");
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setScanStatus('scanning');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        setScanStatus('error');
        toast.error("Webcam access denied or unavailable.");
      });
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const handleVideoPlay = async () => {
    if (isScanning || scanStatus !== 'scanning') return;
    setIsScanning(true);

    try {
      // Allow the video to stabilize
      setTimeout(async () => {
        if (!videoRef.current) return;
        
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detections) {
          setScanStatus('success');
          stopVideo();
          // Convert Float32Array to regular array for JSON serialization
          const descriptorArray = Array.from(detections.descriptor);
          onCapture(descriptorArray);
        } else {
          setScanStatus('error');
          toast.error("No face detected. Please ensure you are clearly visible.");
          stopVideo();
        }
        setIsScanning(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setScanStatus('error');
      setIsScanning(false);
      stopVideo();
    }
  };

  useEffect(() => {
    return () => stopVideo(); // Cleanup on unmount
  }, []);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 border border-gray-200 rounded-xl">
      {!isModelsLoaded ? (
        <div className="flex items-center space-x-2 text-gray-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading face AI models...</span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {scanStatus === 'scanning' ? (
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
              <video
                ref={videoRef}
                autoPlay
                muted
                onPlaying={handleVideoPlay}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-dashed border-green-400 rounded-full animate-[spin_4s_linear_infinite] opacity-50"></div>
                <div className="absolute text-white text-sm font-bold drop-shadow-md">Scanning...</div>
              </div>
            </div>
          ) : scanStatus === 'success' ? (
            <div className="w-full aspect-video bg-green-50 flex flex-col items-center justify-center rounded-lg border-2 border-green-200">
              <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
              <span className="text-green-700 font-medium">Face Detected Successfully!</span>
            </div>
          ) : (
             <div className="w-full aspect-video bg-gray-100 flex flex-col items-center justify-center rounded-lg border-2 border-gray-200">
               <Camera className="w-12 h-12 text-gray-400 mb-2" />
               <span className="text-gray-500 text-sm">
                 {scanStatus === 'error' ? 'Scan failed. Try again.' : 'Camera ready'}
               </span>
             </div>
          )}

          <div className="mt-4 w-full">
            {scanStatus !== 'scanning' && scanStatus !== 'success' && (
              <button
                type="button"
                onClick={startVideo}
                className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>{mode === 'login' ? 'Scan Face to Login' : 'Scan Face to Register'}</span>
              </button>
            )}
            
            {(scanStatus === 'success' || scanStatus === 'error') && (
              <button
                type="button"
                onClick={() => setScanStatus('idle')}
                className="w-full mt-2 py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Retake
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceAuth;
