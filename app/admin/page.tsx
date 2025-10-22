"use client";

import React, { useEffect, useState } from 'react';

type Staff = {
  id?: number;
  name: string;
  seatCode: string;
  status?: string;
  location?: string;
  faceId?: string;
  department?: string;
};

export default function AdminPage() {
  const [list, setList] = useState<Staff[]>([]);
  const [form, setForm] = useState<Staff>({ name: '', seatCode: '' });
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    const res = await fetch('/api/staff');
    const data = await res.json();
    setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const create = async () => {
    if (!form.name || !form.seatCode) return alert('Name and seat code required');
    const res = await fetch('/api/staff', { method: 'POST', body: JSON.stringify({ ...form, status: 'out' }), headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return alert('Failed');
    setForm({ name: '', seatCode: '' });
    fetchList();
  };

  const remove = async (id?: number) => {
    if (!id) return;
    await fetch('/api/staff', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } });
    fetchList();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin — Manage Staff</h1>
      <div className="mb-6 bg-white p-4 border-2 border-black rounded-lg">
        <div className="grid grid-cols-3 gap-3">
          <input className="p-2 border-2 border-black" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="p-2 border-2 border-black" placeholder="Seat Code" value={form.seatCode} onChange={e => setForm(f => ({ ...f, seatCode: e.target.value }))} />
          <button className="bg-black text-white px-4 py-2" onClick={create}>Create</button>
        </div>
      </div>

      <div className="bg-white p-4 border-2 border-black rounded-lg">
        <h2 className="font-bold mb-3">Staff ({list.length})</h2>
        {loading ? <div>Loading...</div> : (
          <ul className="space-y-2">
            {list.map(s => (
              <li key={s.id} className="flex items-center justify-between p-2 border-2 border-black rounded">
                <div>
                  <div className="font-bold">{s.name} <span className="text-sm">({s.seatCode})</span></div>
                  <div className="text-xs opacity-80">{s.department} • {s.status} • {s.location}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-red-400" onClick={() => remove(s.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
