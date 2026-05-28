import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { deleteMatter, getMatters, type Matter } from "./matterStore";

export function MattersPage() {
  const navigate = useNavigate();
  const [matters, setMatters] = useState<Matter[]>([]);
  const sync = () => setMatters(getMatters());
  useEffect(() => { sync(); window.addEventListener("lexdraft-counters", sync); return () => window.removeEventListener("lexdraft-counters", sync); }, []);

  return <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
    <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-bold">Matter Workspace</h1>
    <button onClick={()=>navigate('/matters/new')} className="bg-[#22B8C7] text-white rounded-lg px-4 py-2 flex items-center gap-2"><Plus size={16}/>Create Matter</button></div>
    {matters.length===0 ? <div className="bg-white border rounded-2xl p-10 text-center"><Briefcase className="mx-auto mb-2 text-[#22B8C7]"/><p className="font-semibold">No matters yet</p><p className="text-sm text-gray-500 mb-3">Create your first legal matter.</p><button onClick={()=>navigate('/matters/new')} className="bg-[#22B8C7] text-white rounded-lg px-4 py-2">Create Matter</button></div>:
    <div className="grid gap-3 md:grid-cols-2">{matters.map(m=><div key={m.id} className="bg-white border rounded-xl p-4">
      <div className="flex justify-between"><button className="font-semibold text-left" onClick={()=>navigate(`/matters/${m.id}`)}>{m.title}</button>
      <button onClick={()=>{deleteMatter(m.id); sync();}} className="text-red-500"><Trash2 size={16}/></button></div>
      <p className="text-sm text-gray-600">{m.court} • Suit No: {m.suitNumber || 'N/A'}</p><p className="text-xs mt-1 uppercase">{m.status}</p></div>)}</div>}
  </main>;
}
