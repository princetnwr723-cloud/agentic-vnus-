"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection, query, where, getDocs,
  doc, updateDoc, deleteDoc, getDoc, setDoc
} from "firebase/firestore";
import toast from "react-hot-toast";

interface Skill {
  docId: string;
  id: string;
  name: string;
  description: string;
  category: string;
  author?: string;
  authorType: "official" | "community" | "mine";
  downloads?: number;
  rating?: number;
  price: "free" | "pro";
  installed: boolean;
  examples: string[];
  visibility?: "public" | "private";
  userId?: string;
  systemPrompt?: string;
}

const IC = {
  search:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  star:    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  dl:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  check:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  plus:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  back:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  verified:<svg width="14" height="14" viewBox="0 0 24 24" fill="#FF3B30"><path d="M12 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L12 17.77L7.82 21.02L9 14.14L4 9.27L10.91 8.26L12 2Z"/></svg>,
  lock:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  globe:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  trash:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>,
  skill:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  code:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
};

const OFFICIAL_SKILLS: Skill[] = [
  { docId:"o1", id:"email-agent", name:"Email Agent", description:"Clear inbox, send & reply to emails automatically. Works with Gmail and Outlook.", category:"productivity", author:"Vnus AI", authorType:"official", downloads:4820, rating:4.9, price:"free", installed:false, examples:["Clear all unread emails","Reply to last email from John","Send email to team"], visibility:"public" },
  { docId:"o2", id:"calendar-agent", name:"Calendar Agent", description:"Schedule meetings, set reminders, manage your calendar hands-free.", category:"productivity", author:"Vnus AI", authorType:"official", downloads:3210, rating:4.8, price:"free", installed:false, examples:["Schedule meeting tomorrow 3PM","Cancel all Friday meetings"], visibility:"public" },
  { docId:"o3", id:"browser-agent", name:"Web Browser Agent", description:"Navigate any website, fill forms, extract data and automate web tasks.", category:"productivity", author:"Vnus AI", authorType:"official", downloads:5100, rating:4.7, price:"free", installed:false, examples:["Open Gmail in Chrome","Search cheapest flights"], visibility:"public" },
  { docId:"o4", id:"file-manager", name:"File Manager", description:"Organize, move, rename and delete files across your PC automatically.", category:"productivity", author:"Vnus AI", authorType:"official", downloads:2890, rating:4.6, price:"free", installed:false, examples:["Move all PDFs to Documents","Delete files older than 30 days"], visibility:"public" },
];

const CATEGORIES = ["All","Productivity","Developer","Entertainment","Communication","Shopping"];

function SkillIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-[#FF3B30]/8 border border-[#FF3B30]/15 flex items-center justify-center text-[#FF3B30] shrink-0">
      {IC.skill}
    </div>
  );
}

function SkillCard({ skill, onInstall, onView, onDelete, onToggleVisibility, isOwner }: {
  skill: Skill;
  onInstall: (docId: string) => void;
  onView: (skill: Skill) => void;
  onDelete?: (docId: string) => void;
  onToggleVisibility?: (skill: Skill) => void;
  isOwner?: boolean;
}) {
  return (
    <div className="glass-card rounded-xl p-5 group relative overflow-hidden cursor-pointer"
      onClick={() => onView(skill)}>
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#FF3B30] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      <div className="flex items-start justify-between mb-3">
        <SkillIcon />
        <div className="flex flex-col items-end gap-1">
          {skill.visibility && (
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              skill.visibility === "private"
                ? "bg-white/5 text-gray-500 border border-white/10"
                : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}>
              {skill.visibility === "private" ? IC.lock : IC.globe}
              {skill.visibility === "private" ? "Private" : "Public"}
            </span>
          )}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            skill.price === "free"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20"
          }`}>
            {skill.price === "free" ? "Free" : "Pro"}
          </span>
        </div>
      </div>

      <h3 className="text-white font-bold text-sm mb-1">{skill.name}</h3>
      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{skill.description}</p>

      <div className="flex items-center gap-1.5 mb-3">
        {skill.authorType === "official" ? IC.verified : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        <span className="text-gray-600 text-xs">{skill.author || "Community"}</span>
        {skill.authorType === "official" && <span className="text-xs text-[#FF3B30]/70">Official</span>}
        {skill.authorType === "mine" && <span className="text-xs text-[#FF3B30]/70">Mine</span>}
      </div>

      {(skill.rating || skill.downloads) ? (
        <div className="flex items-center gap-3 mb-4">
          {skill.rating ? <div className="flex items-center gap-1 text-yellow-400">{IC.star}<span className="text-xs text-gray-400">{skill.rating}</span></div> : null}
          {skill.downloads ? <div className="flex items-center gap-1 text-gray-600">{IC.dl}<span className="text-xs text-gray-500">{skill.downloads.toLocaleString()}</span></div> : null}
        </div>
      ) : <div className="mb-4" />}

      <div className="flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); onInstall(skill.docId); }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            skill.installed ? "bg-green-500/10 text-green-400 border border-green-500/20" : "btn-primary text-white"
          }`}>
          {skill.installed ? <>{IC.check} Installed</> : <>{IC.plus} Install</>}
        </button>
        {isOwner && (
          <>
            {onToggleVisibility && (
              <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(skill); }}
                className="px-2.5 py-2 rounded-lg border border-white/8 text-gray-500 hover:text-white hover:border-white/20 transition-all text-xs">
                {skill.visibility === "private" ? IC.globe : IC.lock}
              </button>
            )}
            {onDelete && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(skill.docId); }}
                className="px-2.5 py-2 rounded-lg border border-white/8 text-gray-600 hover:text-red-400 hover:border-red-500/20 transition-all">
                {IC.trash}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SkillModal({ skill, onClose, onInstall, onDelete, onToggleVisibility, isOwner }: {
  skill: Skill;
  onClose: () => void;
  onInstall: (docId: string) => void;
  onDelete?: (docId: string) => void;
  onToggleVisibility?: (skill: Skill) => void;
  isOwner?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg z-10">
        <div className="absolute -inset-1 rounded-2xl opacity-20 blur-xl"
          style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }} aria-hidden />
        <div className="relative rounded-2xl border border-[#FF3B30]/20 overflow-hidden"
          style={{ background: "rgba(8,4,4,0.98)" }}>
          <div className="h-px w-full" style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }} />
          <div className="p-6">
            <div className="flex items-start gap-4 mb-5">
              <SkillIcon />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-white font-bold text-lg">{skill.name}</h2>
                  {skill.authorType === "official" && <span className="text-xs bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20 px-2 py-0.5 rounded-full">Official</span>}
                  {skill.visibility && (
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${skill.visibility === "private" ? "bg-white/5 text-gray-500 border border-white/10" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
                      {skill.visibility === "private" ? IC.lock : IC.globe} {skill.visibility}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">by {skill.author || "Community"}</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-4">{skill.description}</p>

            {skill.systemPrompt && (
              <div className="mb-4">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">AI Instructions</p>
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 max-h-24 overflow-y-auto">
                  <p className="text-gray-600 text-xs font-mono leading-relaxed">{skill.systemPrompt.slice(0, 300)}...</p>
                </div>
              </div>
            )}

            {skill.examples.length > 0 && (
              <div className="mb-5">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Example Commands</p>
                <div className="space-y-1.5">
                  {skill.examples.slice(0, 4).map((ex, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/3 border border-white/5 rounded-lg px-3 py-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                      <span className="text-gray-300 text-xs font-mono">{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => { onInstall(skill.docId); onClose(); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${skill.installed ? "bg-green-500/10 text-green-400 border border-green-500/20" : "btn-primary text-white"}`}>
                {skill.installed ? <>{IC.check} Installed</> : <>{IC.dl} Install Skill</>}
              </button>
              {isOwner && onToggleVisibility && (
                <button onClick={() => { onToggleVisibility(skill); onClose(); }}
                  className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm flex items-center gap-1.5 transition-all">
                  {skill.visibility === "private" ? <>{IC.globe} Make Public</> : <>{IC.lock} Make Private</>}
                </button>
              )}
              {isOwner && onDelete && (
                <button onClick={() => { onDelete(skill.docId); onClose(); }}
                  className="px-4 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm flex items-center gap-1.5 transition-all">
                  {IC.trash}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"marketplace" | "my-skills">("marketplace");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [officialSkills, setOfficialSkills] = useState<Skill[]>(OFFICIAL_SKILLS);
  const [communitySkills, setCommunitySkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSkills = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      // Load ALL skills from collection (no where filter — avoids index/rules issues)
      const allSnap = await getDocs(collection(db, "skills"));
      const allDocs = allSnap.docs;

      // Community = public skills by others
      const community: Skill[] = allDocs
        .filter(d => d.data().visibility === "public" && d.data().userId !== user.uid)
        .map(d => ({
          docId: d.id,
          id: d.data().id || d.id,
          name: d.data().name || "Untitled",
          description: d.data().description || "",
          category: d.data().category || "productivity",
          author: "Community",
          authorType: "community" as const,
          downloads: d.data().installed || 0,
          rating: d.data().rating || 0,
          price: (d.data().price || "free") as "free" | "pro",
          installed: false,
          examples: d.data().examples || [],
          visibility: "public" as const,
          userId: d.data().userId,
          systemPrompt: d.data().systemPrompt || "",
        }));
      setCommunitySkills(community);

      // My skills = all skills by me (both public + private)
      const mine: Skill[] = allDocs
        .filter(d => d.data().userId === user.uid)
        .map(d => ({
          docId: d.id,
          id: d.data().id || d.id,
          name: d.data().name || "Untitled",
          description: d.data().description || "",
          category: d.data().category || "productivity",
          author: "You",
          authorType: "mine" as const,
          price: (d.data().price || "free") as "free" | "pro",
          installed: true,
          examples: d.data().examples || [],
          visibility: (d.data().visibility || "private") as "public" | "private",
          userId: d.data().userId,
          systemPrompt: d.data().systemPrompt || "",
          downloads: d.data().installed || 0,
          rating: d.data().rating || 0,
        }));
      setMySkills(mine);

    } catch (err: unknown) {
      console.error("Load skills error:", err);
      toast.error("Failed to load skills. Please update Firestore rules!");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (user) loadSkills(); }, [user]);

  const handleInstall = (docId: string) => {
    setOfficialSkills(p => p.map(s => s.docId === docId ? { ...s, installed: !s.installed } : s));
    setCommunitySkills(p => p.map(s => s.docId === docId ? { ...s, installed: !s.installed } : s));
    toast.success("Skill installed!");
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Delete this skill permanently?")) return;
    try {
      await deleteDoc(doc(db, "skills", docId));
      setMySkills(p => p.filter(s => s.docId !== docId));
      setCommunitySkills(p => p.filter(s => s.docId !== docId));
      toast.success("Skill deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete skill!");
    }
  };

  const handleToggleVisibility = async (skill: Skill) => {
    const newVis = skill.visibility === "private" ? "public" : "private";
    try {
      await updateDoc(doc(db, "skills", skill.docId), { visibility: newVis });
      setMySkills(p => p.map(s => s.docId === skill.docId ? { ...s, visibility: newVis } : s));
      if (newVis === "public") {
        setCommunitySkills(p => [...p, { ...skill, visibility: "public", authorType: "community" }]);
      } else {
        setCommunitySkills(p => p.filter(s => s.docId !== skill.docId));
      }
      toast.success(`Skill is now ${newVis}!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update visibility!");
    }
  };

  const filterFn = (skills: Skill[]) => skills.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    const matchCat = category === "All" || s.category?.toLowerCase() === category.toLowerCase();
    return matchSearch && matchCat;
  });

  const myPublic = mySkills.filter(s => s.visibility === "public");
  const myPrivate = mySkills.filter(s => s.visibility === "private");

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width: Math.random() * 1.5 + 0.4 + "px", height: Math.random() * 1.5 + 0.4 + "px", top: Math.random() * 100 + "%", left: Math.random() * 100 + "%", opacity: Math.random() * 0.4 + 0.1, animation: `starTwinkle ${3 + Math.random() * 4}s ease-in-out infinite`, animationDelay: Math.random() * 4 + "s" }} />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">{IC.back}</Link>
            <div>
              <h1 className="text-3xl font-black text-white">Skill Marketplace</h1>
              <p className="text-gray-500 text-sm mt-0.5">Install skills or create your own</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadSkills} disabled={refreshing}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50">
              <span className={refreshing ? "animate-spin" : ""}>{IC.refresh}</span>
            </button>
            <Link href="/dashboard/skills/create"
              className="btn-primary px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2">
              {IC.plus} Create Skill
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1 mb-6 max-w-xs">
          {(["marketplace", "my-skills"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${tab === t ? "bg-[#FF3B30] text-white" : "text-gray-400 hover:text-white"}`}>
              {t === "marketplace" ? "Marketplace" : "My Skills"}
              {t === "my-skills" && mySkills.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === "my-skills" ? "bg-white/20" : "bg-white/10 text-gray-400"}`}>{mySkills.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        {tab === "marketplace" && (
          <>
            <div className="relative mb-4">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">{IC.search}</div>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/40 transition-all" />
            </div>
            <div className="flex gap-2 mb-7 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${category === cat ? "bg-[#FF3B30] text-white" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </>
        )}

        {/* MARKETPLACE TAB */}
        {tab === "marketplace" && (
          <div className="space-y-8">
            {/* Official */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#FF3B30]">{IC.verified}</span>
                <h2 className="text-white font-bold text-base">Official Skills</h2>
                <span className="text-xs text-gray-600">by Vnus AI</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filterFn(officialSkills).map(skill => (
                  <SkillCard key={skill.docId} skill={skill} onInstall={handleInstall} onView={setSelectedSkill} />
                ))}
              </div>
            </div>

            {/* Community */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-white font-bold text-base">Community Skills</h2>
                {!loading && <span className="text-xs text-gray-600">({filterFn(communitySkills).length})</span>}
              </div>
              {loading ? (
                <div className="flex items-center gap-3 py-6">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  <span className="text-gray-500 text-sm">Loading...</span>
                </div>
              ) : filterFn(communitySkills).length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <p className="text-gray-500 text-sm mb-2">No community skills yet</p>
                  <p className="text-gray-600 text-xs mb-4">Create a skill and set it to Public to share!</p>
                  <Link href="/dashboard/skills/create" className="btn-primary px-5 py-2 rounded-xl text-white font-bold text-sm inline-flex items-center gap-2">
                    {IC.plus} Create & Share
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filterFn(communitySkills).map(skill => (
                    <SkillCard key={skill.docId} skill={skill} onInstall={handleInstall} onView={setSelectedSkill} />
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-[#FF3B30]/15 p-8 text-center relative overflow-hidden"
              style={{ background: "rgba(255,59,48,0.03)" }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }} />
              <h3 className="text-white font-bold text-xl mb-2">Build your own skill</h3>
              <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">No coding required. Just describe what you want and our AI will build it.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/dashboard/skills/create?mode=ai" className="btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-sm">Build with AI</Link>
                <Link href="/dashboard/skills/create?mode=code" className="btn-ghost px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2">{IC.code} Write Code</Link>
              </div>
            </div>
          </div>
        )}

        {/* MY SKILLS TAB */}
        {tab === "my-skills" && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex items-center gap-3 py-8">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                <span className="text-gray-500 text-sm">Loading your skills...</span>
              </div>
            ) : mySkills.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FF3B30]/8 border border-[#FF3B30]/15 flex items-center justify-center mx-auto mb-4 text-[#FF3B30]">{IC.skill}</div>
                <h3 className="text-white font-bold text-lg mb-2">No skills yet</h3>
                <p className="text-gray-500 text-sm mb-5">Create your first skill — no coding needed!</p>
                <Link href="/dashboard/skills/create" className="btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-sm inline-flex items-center gap-2">
                  {IC.plus} Create My First Skill
                </Link>
              </div>
            ) : (
              <>
                {/* Public */}
                {myPublic.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-green-400">{IC.globe}</span>
                      <h2 className="text-white font-bold text-base">Public Skills</h2>
                      <span className="text-xs text-gray-600">({myPublic.length}) — visible in marketplace</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myPublic.map(skill => (
                        <SkillCard key={skill.docId} skill={skill}
                          onInstall={handleInstall} onView={setSelectedSkill}
                          onDelete={handleDelete} onToggleVisibility={handleToggleVisibility} isOwner />
                      ))}
                    </div>
                  </div>
                )}

                {/* Private */}
                {myPrivate.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-gray-500">{IC.lock}</span>
                      <h2 className="text-white font-bold text-base">Private Skills</h2>
                      <span className="text-xs text-gray-600">({myPrivate.length}) — only you can see</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myPrivate.map(skill => (
                        <SkillCard key={skill.docId} skill={skill}
                          onInstall={handleInstall} onView={setSelectedSkill}
                          onDelete={handleDelete} onToggleVisibility={handleToggleVisibility} isOwner />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selectedSkill && (
        <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)}
          onInstall={handleInstall} onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          isOwner={selectedSkill.userId === user?.uid} />
      )}
    </div>
  );
}