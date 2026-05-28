import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getMatterById, getMatterDocuments, attachDraftToMatter } from "./matterStore";
import { getSavedDrafts } from "./draftStore";

export function MatterDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const matter = getMatterById(id);
  const docs = getMatterDocuments(id);
  const unlinked = useMemo(() => getSavedDrafts().filter((d) => !d.matterId), [refresh]);
  if (!matter) return <main className="p-6">Matter not found.</main>;
  return <main className="max-w-[1440px] mx-auto p-4 sm:p-6 grid gap-4">
    <div className="bg-white border rounded-2xl p-4"><h1 className="text-2xl font-bold">{matter.title}</h1><p>{matter.court} • Suit No: {matter.suitNumber || 'N/A'}</p><p className="text-sm text-gray-600">{matter.parties}</p><button onClick={()=>navigate(`/matters/${id}/edit`)} className="mt-2 underline">Edit Matter</button></div>
    <div className="bg-white border rounded-2xl p-4"><h2 className="font-semibold mb-2">Related documents</h2>{docs.length===0?<p className="text-sm text-gray-500">No documents yet.</p>:docs.map(d=><div key={d.id} className="py-1 text-sm">{d.templateName}</div>)}
      <div className='flex gap-2 flex-wrap mt-3'>
      <button onClick={()=>navigate('/templates/Motion%20on%20Notice', { state: { matterId: id } })} className="bg-[#22B8C7] text-white rounded-lg px-3 py-2">New Motion on Notice</button>
      <button onClick={()=>navigate('/templates/Affidavit%20of%20Facts', { state: { matterId: id } })} className="border rounded-lg px-3 py-2">New Affidavit</button>
      </div></div>
    <div className="bg-white border rounded-2xl p-4"><h3 className="font-semibold">Add existing documents</h3>{unlinked.slice(0,10).map(d=><div key={d.id} className="flex justify-between py-1 text-sm"><span>{d.templateName}</span><button className="underline" onClick={()=>{attachDraftToMatter(d,id);setRefresh(v=>v+1);}}>Add</button></div>)}</div>
  </main>;
}

