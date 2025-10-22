"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';

// Mock database - 10 staff members only
const initialStaff = [
  { id: 1, name: 'Dr. Smith', seatCode: 'A1', status: 'in', location: 'Staff Room', lastSeen: new Date().toISOString(), faceId: 'face_001', department: 'Computer Science' },
  { id: 2, name: 'Prof. Johnson', seatCode: 'A2', status: 'out', location: 'Meeting', lastSeen: new Date().toISOString(), faceId: 'face_002', department: 'Mathematics' },
  { id: 3, name: 'Dr. Williams', seatCode: 'A3', status: 'class', location: 'Room 301', lastSeen: new Date().toISOString(), faceId: 'face_003', department: 'Physics' },
  { id: 4, name: 'Prof. Brown', seatCode: 'A4', status: 'in', location: 'Staff Room', lastSeen: new Date().toISOString(), faceId: 'face_004', department: 'Chemistry' },
  { id: 5, name: 'Dr. Davis', seatCode: 'A5', status: 'out', location: 'Library', lastSeen: new Date().toISOString(), faceId: 'face_005', department: 'Biology' },
  { id: 6, name: 'Prof. Miller', seatCode: 'B1', status: 'in', location: 'Staff Room', lastSeen: new Date().toISOString(), faceId: 'face_006', department: 'English' },
  { id: 7, name: 'Dr. Wilson', seatCode: 'B2', status: 'class', location: 'Lab 2B', lastSeen: new Date().toISOString(), faceId: 'face_007', department: 'Mechanical' },
  { id: 8, name: 'Prof. Moore', seatCode: 'B3', status: 'in', location: 'Staff Room', lastSeen: new Date().toISOString(), faceId: 'face_008', department: 'Electronics' },
  { id: 9, name: 'Dr. Taylor', seatCode: 'B4', status: 'out', location: 'Conference', lastSeen: new Date().toISOString(), faceId: 'face_009', department: 'Civil' },
  { id: 10, name: 'Prof. Anderson', seatCode: 'B5', status: 'in', location: 'Staff Room', lastSeen: new Date().toISOString(), faceId: 'face_010', department: 'Economics' },
];

const SmartStaffRoomClient = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [destinationModal, setDestinationModal] = useState<{staff:any, open:boolean} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const videoRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = {
    total: staff.length,
    in: staff.filter(s => s.status === 'in').length,
    out: staff.filter(s => s.status === 'out').length,
    inClass: staff.filter(s => s.status === 'class').length,
  };

  const getSeatStyle = (status: string) => {
    const base = "relative border-4 border-black rounded-2xl p-4 cursor-pointer transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]";
    switch (status) {
      case 'in': return `${base} bg-green-400`;
      case 'out': return `${base} bg-red-400`;
      case 'class': return `${base} bg-yellow-400`;
      default: return `${base} bg-gray-300`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in': return 'bg-black text-green-400 border-green-400';
      case 'out': return 'bg-black text-red-400 border-red-400';
      case 'class': return 'bg-black text-yellow-400 border-yellow-400';
      default: return 'bg-black text-gray-400 border-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in': return 'IN ROOM';
      case 'out': return 'OUT';
      case 'class': return 'IN CLASS';
      default: return 'UNKNOWN';
    }
  };

  const handleCheckIn = (staffId: number) => {
    setStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, status: 'in', location: 'Staff Room', lastSeen: new Date().toISOString() }
        : s
    ));
  };

  const handleCheckOut = (staffId: number, location: string) => {
    setStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, status: 'out', location, lastSeen: new Date().toISOString() }
        : s
    ));
  };

  const handleInClass = (staffId: number, classroom: string) => {
    setStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, status: 'class', location: classroom, lastSeen: new Date().toISOString() }
        : s
    ));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      alert('Camera access denied. Please allow camera access for face recognition.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track: any) => track.stop());
    }
    setShowCamera(false);
  };

  const PLACES = [
    'BMS-401',
    'Admin-103',
    'Block III-305',
    'Library',
    'Lab-201',
    'Cafeteria',
  ];

  const simulateRecognition = () => {
    const randomStaff = staff[Math.floor(Math.random() * staff.length)];
    // Instead of immediately prompting, auto-check current status and act accordingly
    alert(`✓ Face recognized: ${randomStaff.name}`);
    if (randomStaff.status === 'in') {
      // If currently in, open destination modal to mark out with chosen place
      setDestinationModal({ staff: randomStaff, open: true });
    } else {
      // If not in, mark them in immediately
      handleCheckIn(randomStaff.id);
    }
    stopCamera();
  };

  const Seat = ({ staffMember }: { staffMember: any }) => (
    <div
      onClick={() => setSelectedStaff(staffMember)}
      className={getSeatStyle(staffMember.status)}
    >
      {/* Status Indicator */}
      <div className="absolute top-3 right-3">
        <div className={`w-4 h-4 rounded-full border-2 border-black ${
          staffMember.status === 'in' ? 'bg-green-600' :
          staffMember.status === 'out' ? 'bg-red-600' :
          'bg-yellow-600'
        } animate-pulse`}></div>
      </div>
      
      {/* Seat Number */}
      <div className="bg-black text-white px-3 py-1 rounded-lg inline-block text-xs font-bold mb-3">{staffMember.seatCode}</div>
      
      {/* Name */}
      <div className="text-black font-black text-base mb-1 truncate uppercase tracking-tight">{staffMember.name}</div>
      
      {/* Department */}
      <div className="text-black text-xs mb-3 truncate font-bold opacity-70">{staffMember.department}</div>
  {/* Location on card */}
  <div className="text-black text-xs mb-3 truncate font-bold opacity-90">{staffMember.location}</div>
      
      {/* Status Badge */}
      <div className={`${getStatusBadge(staffMember.status)} border-2 text-xs px-3 py-1.5 rounded-lg text-center font-black tracking-wide`}>
        {getStatusText(staffMember.status)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-300 to-blue-300 p-6">
      {/* Header */}
      <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 overflow-hidden">
        <div className="bg-yellow-400 border-b-4 border-black px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-black tracking-tighter uppercase">
                Smart Staff Room
              </h1>
              <p className="text-black text-sm mt-1 font-bold">Real-Time Attendance Tracker</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-black text-yellow-400 px-6 py-3 rounded-xl border-2 border-black font-mono font-bold text-lg">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <button
                onClick={startCamera}
                className="bg-black text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase tracking-wide"
              >
                <Camera className="w-5 h-5" />
                Scan Face
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 divide-x-4 divide-black">
          <div className="p-6 bg-white">
            <div className="text-black text-sm font-black mb-2 uppercase">Total</div>
            <div className="text-5xl font-black text-black">{stats.total}</div>
          </div>
          <div className="p-6 bg-green-400">
            <div className="text-black text-sm font-black mb-2 uppercase">In Room</div>
            <div className="text-5xl font-black text-black">{stats.in}</div>
          </div>
          <div className="p-6 bg-red-400">
            <div className="text-black text-sm font-black mb-2 uppercase">Out</div>
            <div className="text-5xl font-black text-black">{stats.out}</div>
          </div>
          <div className="p-6 bg-yellow-400">
            <div className="text-black text-sm font-black mb-2 uppercase">In Class</div>
            <div className="text-5xl font-black text-black">{stats.inClass}</div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">Staff Room Layout</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-400 border-2 border-black rounded-lg px-3 py-1">
              <div className="w-4 h-4 bg-black rounded-full"></div>
              <span className="text-black font-bold text-sm">IN</span>
            </div>
            <div className="flex items-center gap-2 bg-red-400 border-2 border-black rounded-lg px-3 py-1">
              <div className="w-4 h-4 bg-black rounded-full"></div>
              <span className="text-black font-bold text-sm">OUT</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 border-2 border-black rounded-lg px-3 py-1">
              <div className="w-4 h-4 bg-black rounded-full"></div>
              <span className="text-black font-bold text-sm">CLASS</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Seating Area */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left Side (A1-A5) */}
            <div className="space-y-4">
              <div className="bg-purple-200 border-2 border-black rounded-lg px-4 py-2 inline-block">
                <span className="font-black text-black uppercase">Side A</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {staff.filter(s => s.seatCode.startsWith('A')).map(s => (
                  <Seat key={s.id} staffMember={s} />
                ))}
              </div>
            </div>

            {/* Right Side (B1-B5) */}
            <div className="space-y-4">
              <div className="bg-blue-200 border-2 border-black rounded-lg px-4 py-2 inline-block">
                <span className="font-black text-black uppercase">Side B</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {staff.filter(s => s.seatCode.startsWith('B')).map(s => (
                  <Seat key={s.id} staffMember={s} />
                ))}
              </div>
            </div>
          </div>

          {/* Door at Bottom Center */}
          <div className="flex justify-center mt-8">
            <div className="relative bg-gradient-to-b from-amber-500 to-amber-600 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 w-96">
              <div className="text-center">
                <div className="text-black font-black text-2xl mb-3 uppercase tracking-wider">
                  Entrance Door
                </div>
                <div className="flex justify-center gap-3">
                  <div className="w-6 h-6 bg-yellow-300 rounded-full border-2 border-black"></div>
                  <div className="w-16 h-16 bg-gray-800 rounded-lg border-2 border-black flex items-center justify-center">
                    <div className="w-3 h-8 bg-yellow-300 rounded-full"></div>
                  </div>
                  <div className="w-6 h-6 bg-yellow-300 rounded-full border-2 border-black"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 max-w-3xl w-full">
            <div className="bg-yellow-400 border-4 border-black rounded-xl p-4 mb-6">
              <h2 className="text-3xl font-black text-black uppercase tracking-tight">Face Recognition</h2>
              <p className="text-black text-sm font-bold mt-1">Position your face in the frame</p>
            </div>
            <div className="bg-black rounded-xl overflow-hidden mb-6 border-4 border-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={simulateRecognition}
                className="flex-1 bg-green-400 border-4 border-black text-black px-8 py-4 rounded-xl font-black hover:bg-green-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] text-lg uppercase"
              >
                Scan Now
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 bg-red-400 border-4 border-black text-black px-8 py-4 rounded-xl font-black hover:bg-red-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] text-lg uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destination Modal (on scan when staff is currently 'in') */}
      {destinationModal && destinationModal.open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 max-w-lg w-full">
            <div className="bg-yellow-400 border-4 border-black rounded-xl p-4 mb-6">
              <h2 className="text-3xl font-black text-black uppercase tracking-tight">Marking Out</h2>
              <p className="text-black text-sm font-bold">Where are you going, {destinationModal.staff.name}?</p>
            </div>

            <div className="space-y-4 mb-6">
              <label className="text-xs font-black uppercase">Destination</label>
              <select
                id="destination-select"
                className="w-full border-2 border-black rounded-lg p-3 text-black font-bold bg-white"
                defaultValue={PLACES[0]}
              >
                {PLACES.map(place => (
                  <option key={place} value={place}>{place}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  const sel = (document.getElementById('destination-select') as HTMLSelectElement);
                  const location = sel?.value || PLACES[0];
                  handleCheckOut(destinationModal.staff.id, location);
                  setDestinationModal(null);
                  setSelectedStaff(null);
                }}
                className="flex-1 bg-red-400 border-4 border-black text-black px-8 py-4 rounded-xl font-black hover:bg-red-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] text-lg uppercase"
              >
                Confirm & Mark Out
              </button>
              <button
                onClick={() => setDestinationModal(null)}
                className="flex-1 bg-gray-300 border-4 border-black text-black px-8 py-4 rounded-xl font-black hover:bg-gray-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] text-lg uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 max-w-lg w-full">
            <div className="bg-yellow-400 border-4 border-black rounded-xl p-4 mb-6">
              <h2 className="text-3xl font-black text-black uppercase tracking-tight">{selectedStaff.name}</h2>
              <p className="text-black text-sm font-bold">{selectedStaff.department}</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="bg-gray-100 border-2 border-black rounded-lg p-4">
                <div className="text-xs text-black font-black mb-1 uppercase">Seat Number</div>
                <div className="text-black font-black text-xl">{selectedStaff.seatCode}</div>
              </div>

              <div className="bg-gray-100 border-2 border-black rounded-lg p-4">
                <div className="text-xs text-black font-black mb-2 uppercase">Status</div>
                <span className={`${getStatusBadge(selectedStaff.status)} border-2 px-4 py-2 rounded-lg text-sm font-black inline-block`}>
                  {getStatusText(selectedStaff.status)}
                </span>
              </div>

              <div className="bg-gray-100 border-2 border-black rounded-lg p-4">
                <div className="text-xs text-black font-black mb-1 uppercase">Location</div>
                <div className="text-black font-black text-lg">{selectedStaff.location}</div>
              </div>

              <div className="bg-gray-100 border-2 border-black rounded-lg p-4">
                <div className="text-xs text-black font-black mb-1 uppercase">Last Activity</div>
                <div className="text-black font-black text-lg font-mono">
                  {new Date(selectedStaff.lastSeen).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Read-only detail modal: removed edit controls per request */}
              <button
                onClick={() => setSelectedStaff(null)}
                className="w-full bg-gray-300 border-4 border-black text-black px-6 py-3 rounded-xl font-black hover:bg-gray-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartStaffRoomClient;
