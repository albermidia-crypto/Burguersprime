import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, AlertCircle, RefreshCw, Sparkles, Check } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (order: { name: string; phone: string; burger: string; value: number }) => void;
  onClose?: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("Inicializando câmara...");
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdMap = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setStatusMessage("A obter acesso à câmara...");
      setErrorMsg("");
      setScannedResult(null);
      setParsedData(null);

      // Stop previous streams first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
      });

      streamRef.current = stream;
      setHasPermission(true);
      setCameraActive(true);
      setStatusMessage("Câmara iniciada. Posiciona o QR Code no centro.");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.debug("Reprodução do vídeo interrompida ou impedida (esperado durante mudança de feeds):", error);
          });
        }
        
        // Start decoding process
        animationFrameIdMap.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      setCameraActive(false);
      setErrorMsg(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Permissão de acesso à câmara foi rejeitada. Ative a câmara nas definições do seu navegador."
          : "Não foi possível aceder à câmara. Certifique-se de que nenhum outro programa está a usá-la."
      );
    }
  };

  const stopCamera = () => {
    setCameraActive(false);
    if (animationFrameIdMap.current) {
      cancelAnimationFrame(animationFrameIdMap.current);
      animationFrameIdMap.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {
        console.debug("Erro ao pausar vídeo:", e);
      }
    }
  };

  const tryParseQr = (text: string): { name: string; phone: string; burger: string; value: number } | null => {
    text = text.trim();
    
    // 1. Try JSON parsing
    try {
      if (text.startsWith("{") && text.endsWith("}")) {
        const obj = JSON.parse(text);
        if (obj.name && obj.phone) {
          return {
            name: obj.name,
            phone: obj.phone,
            burger: obj.burger || "Hambúrguer de Festa",
            value: Number(obj.value || obj.price || 0)
          };
        }
      }
    } catch (e) {
      // Not JSON
    }

    // 2. Try pipe separated: name|phone|burger|value
    if (text.includes("|")) {
      const parts = text.split("|").map(p => p.trim());
      if (parts.length >= 2) {
        return {
          name: parts[0],
          phone: parts[1],
          burger: parts[2] || "Smash Clássico",
          value: Number(parts[3]) || 5000
        };
      }
    }

    // 3. Try comma-separated values
    if (text.includes(",")) {
      const parts = text.split(",").map(p => p.trim());
      if (parts.length >= 2 && parts[1].match(/[\d+]/)) {
        return {
          name: parts[0],
          phone: parts[1],
          burger: parts[2] || "Smash Clássico",
          value: Number(parts[3]) || 5000
        };
      }
    }

    // 4. Fallback: Parse generic multiline text
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length >= 1) {
      const name = lines[0];
      const phone = lines[1] || "+244 900 000 000";
      const burger = lines[2] || "Smash Supremo";
      const valStr = lines[3] || "";
      const value = Number(valStr.replace(/\D/g, "")) || 4800;

      return { name, phone, burger, value };
    }

    return null;
  };

  const tick = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) {
      animationFrameIdMap.current = requestAnimationFrame(tick);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure video is playing and has loaded metadata dimensions
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          const parsed = tryParseQr(code.data);
          if (parsed) {
            // Found valid QR! Sound or visually freeze
            setScannedResult(code.data);
            setParsedData(parsed);
            stopCamera();
            
            // Auto commit scan success
            onScanSuccess(parsed);
            return; // Exit loop
          }
        }
      }
    }
    
    animationFrameIdMap.current = requestAnimationFrame(tick);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 max-w-lg mx-auto relative overflow-hidden font-sans">
      
      {/* Decorative Matrix Background Effect */}
      <div className="absolute inset-0 bg-radial-gradient from-emerald-950/20 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400 font-mono block leading-none">
              Leitor Integrado
            </span>
            <h3 className="font-extrabold text-sm text-white">Scanner de Pedidos Real-Time</h3>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-[10px] bg-slate-800 hover:bg-slate-705 border border-slate-700 hover:border-slate-600 px-2.5 py-1 rounded-lg text-slate-350 font-bold transition-all"
          >
            Sair
          </button>
        )}
      </div>

      {/* Camera stream display frame */}
      <div className="relative bg-black rounded-xl border border-slate-800 overflow-hidden h-64 flex flex-col items-center justify-center shadow-inner">
        {hasPermission === false ? (
          <div className="p-6 text-center space-y-3 max-w-sm relative z-10">
            <AlertCircle className="w-10 h-10 text-red-510 mx-auto" />
            <h4 className="text-xs font-black text-white">Permissão de Câmara Requerida</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              {errorMsg || "Para digitalizar os códigos de barras e QR Codes das faturas de venda, necessitamos do acesso temporário à câmara fotográfica."}
            </p>
            <button
              onClick={startCamera}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg transition"
            >
              Conceder Permissão
            </button>
          </div>
        ) : scannedResult ? (
          // Success View Container
          <div className="text-center p-4 space-y-3 z-10 relative bg-emerald-950/40 border border-emerald-500/30 rounded-2xl max-w-md mx-6">
            <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Check className="w-5 h-5 stroke-[3px]" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xs font-black text-white">QR Code Lido com Sucesso!</h4>
              <p className="text-[9.5px] text-emerald-300 font-bold">
                Pedido de {parsedData?.name || "Cliente"} registado no sistema.
              </p>
            </div>

            {parsedData && (
              <div className="bg-slate-950/80 p-2.5 rounded-lg text-left text-[9px] font-mono space-y-1 text-slate-300 border border-emerald-500/20">
                <p><span className="text-emerald-400">CLIENTE:</span> {parsedData.name}</p>
                <p><span className="text-emerald-400">TLM:</span> {parsedData.phone}</p>
                <p><span className="text-emerald-400 font-sans">🍔 ITEM:</span> {parsedData.burger}</p>
                <p className="border-t border-slate-850 pt-1 mt-1 font-bold text-white text-right">
                  {parsedData.value?.toLocaleString()} Kz
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setScannedResult(null);
                setParsedData(null);
                startCamera();
              }}
              className="py-1 px-3 bg-white hover:bg-slate-100 text-slate-950 font-black text-[9.5px] rounded-lg shadow-sm transition inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Digitalizar Próximo</span>
            </button>
          </div>
        ) : (
          <>
            {/* Real Video Component */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              muted
              playsInline
            />

            {/* Hidden Canvas used to analyze pixels internally */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Pulsing targeting overlay */}
            <div className="absolute top-[15%] bottom-[15%] left-[20%] right-[20%] border-2 border-emerald-500/60 rounded-xl pointer-events-none z-10 flex flex-col items-center justify-center">
              {/* Scan Laser effect */}
              <div className="w-full h-0.5 bg-emerald-400 animate-bounce absolute top-1 shadow-[0_0_8px_rgba(52,211,153,0.8)]" style={{ animationDuration: '2.5s' }} />
              
              {/* "Scanning..." Pulsing overlay text */}
              <div className="text-[10px] font-mono font-bold text-emerald-400 bg-black/60 px-2.5 py-1 rounded-md border border-emerald-500/25 animate-pulse select-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span>Scanning...</span>
              </div>

              {/* Frame corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400 -mt-0.5 -ml-0.5" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400 -mt-0.5 -mr-0.5" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400 -mb-0.5 -ml-0.5" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400 -mb-0.5 -mr-0.5" />
            </div>

            {/* Scanning status banner */}
            <div className="absolute bottom-3 left-3 right-3 bg-black/70 py-1.5 px-2.5 rounded-lg border border-slate-800 text-center text-[9px] text-slate-300 font-semibold z-10 flex items-center justify-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>{statusMessage}</span>
            </div>
          </>
        )}
      </div>

      {/* Manual copy assistance text / testing helper */}
      <div className="text-[10px] text-slate-400 leading-relaxed font-semibold bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 select-none">
        <div className="flex items-center gap-1.5 text-emerald-400 mb-1 font-bold">
          <Sparkles className="w-3 h-3" />
          <span>Fidelização e CRM Integrados instantâneos:</span>
        </div>
        Basta apontar para qualquer código QR que possua informações de faturação ou pedidos. O sistema fará a leitura local, verificará na base de dados e apresentará o resultado sincronizado de imediato.
      </div>
    </div>
  );
}
