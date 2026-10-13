import React from 'react';
import { Camera, ScanLine, AlertCircle, Lock } from 'lucide-react';
import { PassItem, Gate } from '../types';

interface GateScannerCameraConsoleProps {
  activeGate: Gate | undefined;
  cameraModeType: 'back' | 'front' | 'external';
  availableCameras: MediaDeviceInfo[];
  selectedDeviceId: string;
  onSelectCameraMode: (mode: 'back' | 'front' | 'external') => void;
  onDeviceChange: (deviceId: string) => void;
  isCameraActive: boolean;
  startCamera: () => void;
  stopCamera: () => void;
  cameraError: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  manualCodeInput: string;
  setManualCodeInput: (val: string) => void;
  handleProcessCode: (code: string) => void;
  eventPasses: PassItem[];
  currentEventTitle: string;
  onEndEventEntries: () => void;
}

export const GateScannerCameraConsole: React.FC<GateScannerCameraConsoleProps> = ({
  activeGate,
  cameraModeType,
  availableCameras,
  selectedDeviceId,
  onSelectCameraMode,
  onDeviceChange,
  isCameraActive,
  startCamera,
  stopCamera,
  cameraError,
  videoRef,
  canvasRef,
  manualCodeInput,
  setManualCodeInput,
  handleProcessCode,
  eventPasses,
  currentEventTitle,
  onEndEventEntries,
}) => {
  return (
    <div id="gate-scanner-camera-console-bottom" className="w-full pt-2">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
        
        {/* Header with Camera Title & Ingress End Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {isCameraActive ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Camera Streaming"></span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" title="Camera Standby"></span>
            )}
            <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Live Camera Scanner &amp; Turnstile Verification Station
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/30 rounded-lg">
              {activeGate?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEndEventEntries}
              className="px-3.5 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30 transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" /> End Entries &amp; View Report
            </button>
          </div>
        </div>

        {/* 2-Column Scanner Layout: Left Video Viewport, Right Code Entry & Simulations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          
          {/* Left Column: Optical Camera Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Optical Camera Feed:
              </span>
              <div className="flex items-center gap-1.5">
                {/* Camera Selector Dropdown */}
                <select
                  value={
                    selectedDeviceId && availableCameras.some(c => c.deviceId === selectedDeviceId)
                      ? selectedDeviceId
                      : cameraModeType === 'front'
                      ? 'mode:front'
                      : cameraModeType === 'external'
                      ? 'mode:external'
                      : 'mode:back'
                  }
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'mode:back') onSelectCameraMode('back');
                    else if (val === 'mode:front') onSelectCameraMode('front');
                    else if (val === 'mode:external') onSelectCameraMode('external');
                    else onDeviceChange(val);
                  }}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold px-2 py-1 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer min-h-[32px] max-w-[150px] truncate"
                >
                  <option value="mode:back">📷 Back</option>
                  <option value="mode:front">🤳 Front</option>
                  {availableCameras.length > 0 ? (
                    <optgroup label="Available Cameras">
                      {availableCameras.map((d, idx) => (
                        <option key={d.deviceId || idx} value={d.deviceId}>
                          📹 {d.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <option value="mode:external">🎥 USB / Ext</option>
                  )}
                </select>

                {isCameraActive ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer min-h-[32px] flex items-center gap-1 shrink-0"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-600/30 cursor-pointer min-h-[32px] shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" /> Start
                  </button>
                )}
              </div>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video max-h-[290px] sm:max-h-[310px] bg-slate-950 rounded-xl overflow-hidden border-2 border-dashed border-slate-700/80 flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isCameraActive ? (
                <div className="text-center p-4 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <ScanLine className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Camera is Inactive</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click "Start" above or scan pass barcode to verify
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-emerald-600/20 min-h-[36px]"
                  >
                    Turn On Gate Camera
                  </button>
                </div>
              ) : (
                /* Optical Scanning Reticle Overlay */
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400 rounded-2xl relative animate-pulse shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                    <div className="absolute -top-2 -left-2 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                    <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                    
                    {/* Laser scanning line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
                  </div>
                  <span className="mt-3 px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold rounded-full">
                    ALIGN PASS QR / BARCODE
                  </span>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Right Column: Manual Barcode / Scanner Input & Test Simulations */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Manual Code Entry or USB Laser Gun:
              </label>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (manualCodeInput.trim()) {
                    handleProcessCode(manualCodeInput.trim());
                    setManualCodeInput('');
                  }
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={e => setManualCodeInput(e.target.value)}
                    placeholder="Scan/Paste 16 digits or last 4 digits (e.g. 4592... or 1928)..."
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 shadow-inner min-h-[38px]"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md shadow-emerald-600/30 shrink-0 min-h-[38px]"
                >
                  Verify
                </button>
              </form>
            </div>

            {/* Gate Simulation Quick Triggers */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Test Pass Simulations for {currentEventTitle}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {eventPasses.slice(0, 4).map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProcessCode(p.code16 || p.id)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-colors min-h-[30px]"
                  >
                    {p.assignedTo?.name ? `👤 ${p.assignedTo.name}` : `Pass #${idx + 1}`} ({p.category} • ••••{(p.code16 || '').slice(-4)})
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleProcessCode('9999999999999999')}
                  className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-colors min-h-[30px]"
                >
                  🚨 Test Fake Pass
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
