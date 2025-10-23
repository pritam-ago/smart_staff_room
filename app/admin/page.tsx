"use client";

import React, { useEffect, useRef, useState } from 'react';
let faceapi: any = null;

type Staff = {
  id?: number;
  name: string;
  seatCode: string;
  status?: string;
  location?: string;
  faceId?: string;
  department?: string;
  faceDescriptor?: any;
};

export default function AdminPage() {
  const [list, setList] = useState<Staff[]>([]);
  const [form, setForm] = useState<Staff>({ name: '', seatCode: '' });
  const [loading, setLoading] = useState(false);
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [toast, setToast] = useState<{ text: string; type?: 'info'|'error'|'success'; visible: boolean }>({ text: '', type: 'info', visible: false });

  function showToast(text: string, type: 'info'|'error'|'success' = 'info') {
    setToast({ text, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  const fetchList = async () => {
    setLoading(true);
    const res = await fetch('/api/staff');
    const data = await res.json();
    setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
    (async () => {
      try {
        faceapi = await import('face-api.js');
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      } catch (e) {
        console.warn('face-api load', e);
      }
    })();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setShowCamera(true);
      await new Promise(r => setTimeout(r, 60));
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.muted = true;
        try { await videoRef.current.play(); } catch {}
      }
    } catch (e) { showToast('Camera permission required', 'error'); }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      try { videoRef.current.srcObject = null; } catch {}
    }
    setShowCamera(false);
  };

  const captureDescriptor = async () => {
    if (!faceapi) return showToast('Models not loaded', 'error');
    if (!videoRef.current) return showToast('No video', 'error');
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const opts = new faceapi.TinyFaceDetectorOptions();
    const detection = await faceapi.detectSingleFace(canvas, opts).withFaceLandmarks().withFaceDescriptor();
    if (!detection) return showToast('No face detected', 'error');
    const desc = Array.from(detection.descriptor as Float32Array);
    setDescriptor(desc);
    stopCamera();
    showToast('Face captured', 'success');
  };

  const create = async () => {
    if (!form.name || !form.seatCode) return showToast('Name and seat code required', 'error');
    if (!descriptor) return showToast('Please scan face first', 'error');
    setLoading(true);
    const res = await fetch('/api/staff/register', { method: 'POST', body: JSON.stringify({ ...form, department: form.department, faceDescriptor: descriptor }), headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) { setLoading(false); showToast('Failed to register', 'error'); return; }
    setForm({ name: '', seatCode: '' });
    setDescriptor(null);
    fetchList();
    setLoading(false);
  };

  const remove = async (id?: number) => {
    if (!id) return;
    await fetch('/api/staff', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } });
    fetchList();
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-300 via-pink-300 to-blue-300">
      <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
  <h1 className="text-4xl font-black uppercase text-black">Admin — Manage Staff</h1>
  <p className="text-sm font-bold mt-1 text-black">Create staff records (face scan required)</p>

        <div className="mt-6 bg-white border-4 border-black rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3">
            <input className="p-2 border-2 border-black text-black" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="p-2 border-2 border-black text-black" placeholder="Seat Code" value={form.seatCode} onChange={e => setForm(f => ({ ...f, seatCode: e.target.value }))} />
            <input className="p-2 border-2 border-black text-black" placeholder="Department" value={form.department || ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <button className="bg-green-400 border-4 border-black px-6 py-3 font-black" onClick={startCamera}>Scan Face</button>
            <button className="bg-black text-white px-6 py-3 font-black" onClick={captureDescriptor}>Capture</button>
            <button className="bg-blue-400 border-4 border-black px-6 py-3 font-black" onClick={create}>Register</button>
            <div className="ml-auto">{descriptor ? <span className="font-bold text-green-700">Face scanned</span> : <span className="text-xs">No face scanned</span>}</div>
          </div>
        </div>

        {showCamera && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-3xl w-full">
              <div className="bg-yellow-400 border-4 border-black rounded-xl p-4 mb-6">
                <h2 className="text-3xl font-black text-black uppercase tracking-tight">Face Scan</h2>
                <p className="text-black text-sm font-bold mt-1">Position your face in the frame</p>
              </div>
              <div className="bg-black rounded-xl overflow-hidden mb-6 border-4 border-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-96 object-cover" />
              </div>
              <div className="flex gap-4">
                <button className="flex-1 bg-green-400 border-4 border-black text-black px-8 py-4 rounded-xl font-black" onClick={captureDescriptor}>Capture</button>
                <button className="flex-1 bg-red-400 border-4 border-black text-black px-8 py-4 rounded-xl font-black" onClick={stopCamera}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-white border-4 border-black rounded-lg p-4">
          <h2 className="font-black mb-3">Staff ({list.length})</h2>
          {loading ? <div>Loading...</div> : (
            <ul className="space-y-2">
              {list.map(s => (
                <li key={s.id} className="flex items-center justify-between p-2 border-4 border-black rounded-lg">
                  <div>
                    <div className="font-black text-lg">{s.name} <span className="text-sm">({s.seatCode})</span></div>
                    <div className="text-xs opacity-80">{s.department} • {s.status} • {s.location}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-red-400 border-2 border-black" onClick={() => remove(s.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {toast.visible && (
          <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg font-bold ${toast.type === 'error' ? 'bg-red-400' : toast.type === 'success' ? 'bg-green-400' : 'bg-black text-white'}`}>
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
}
