import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getMatterById, saveMatter } from "./matterStore";

export function MatterFormPage() {
  const { id } = useParams();
  const existing = id ? getMatterById(id) : null;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: existing?.title || "", suitNumber: existing?.suitNumber || "", court: existing?.court || "", parties: existing?.parties || "", category: existing?.category || "Litigation", description: existing?.description || "", status: existing?.status || "active",
  });
  return <main className="max-w-3xl mx-auto p-4 sm:p-6"><h1 className="text-2xl font-bold mb-4">{existing ? 'Edit Matter' : 'Create Matter'}</h1>
    <div className="bg-white border rounded-2xl p-4 grid gap-3">{Object.entries(form).map(([k,v])=> <input key={k} value={v} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={k} className="border rounded-lg px-3 py-2"/> )}
    <button onClick={()=>{saveMatter(form as any, id); navigate('/matters');}} className="bg-[#22B8C7] text-white rounded-lg px-4 py-2">Save Matter</button></div></main>;
}
