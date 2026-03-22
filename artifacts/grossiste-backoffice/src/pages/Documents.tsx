import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGrossiste } from "@/context/GrossisteContext";
import { FileText, Upload, Download, Trash2, Search, Filter, Building2, Camera, File, FileCheck } from "lucide-react";

const API = (import.meta.env.VITE_API_BASE_URL || "") + "/api";

const DOC_TYPES = [
  { value: "facture", label: "Facture", icon: "🧾", color: "#f97316" },
  { value: "devis", label: "Devis", icon: "📋", color: "#3b82f6" },
  { value: "bon_commande", label: "Bon de Commande", icon: "🛒", color: "#8b5cf6" },
  { value: "bon_livraison", label: "Bon de Livraison", icon: "📦", color: "#22c55e" },
  { value: "contrat", label: "Contrat", icon: "📜", color: "#f59e0b" },
  { value: "autre", label: "Autre", icon: "📄", color: "#64748b" },
];

const fmtType = (t: string) => DOC_TYPES.find(d => d.value === t) || DOC_TYPES[5];
const fmtTaille = (bytes: number) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

export default function Documents() {
  const { grossisteId, authFetch } = useGrossiste();
  const qc = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterBoutique, setFilterBoutique] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    nom: "",
    type: "facture",
    boutiqueId: "",
    description: "",
  });
  const [fileData, setFileData] = useState<{ name: string; mimeType: string; taille: number; contenu: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents", grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${grossisteId}/documents`).then(r => r.json()),
    enabled: !!grossisteId,
    refetchInterval: 60000,
  });

  const { data: boutiques = [] } = useQuery({
    queryKey: ["boutiques-list", grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${grossisteId}/boutiques`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: number) => authFetch(`${API}/grossistes/${grossisteId}/documents/${docId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents", grossisteId] }),
  });

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const contenu = await readFileAsBase64(file);
    setFileData({ name: file.name, mimeType: file.type || "application/octet-stream", taille: file.size, contenu });
    if (!form.nom) setForm(f => ({ ...f, nom: file.name.replace(/\.[^.]+$/, "") }));
  };

  const handleUpload = async () => {
    if (!fileData) { alert("Veuillez sélectionner un fichier."); return; }
    if (!form.nom.trim()) { alert("Veuillez saisir un nom pour ce document."); return; }
    setUploading(true);
    try {
      const res = await authFetch(`${API}/grossistes/${grossisteId}/documents`, {
        method: "POST",
        body: JSON.stringify({
          nom: form.nom,
          type: form.type,
          boutiqueId: form.boutiqueId || null,
          description: form.description || null,
          mimeType: fileData.mimeType,
          taille: fileData.taille,
          contenu: fileData.contenu,
        }),
      });
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["documents", grossisteId] });
        setShowUpload(false);
        setForm({ nom: "", type: "facture", boutiqueId: "", description: "" });
        setFileData(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur: " + (err.error || "Upload échoué"));
      }
    } finally { setUploading(false); }
  };

  const downloadDoc = (doc: any) => {
    const a = document.createElement("a");
    a.href = `${API}/grossistes/${grossisteId}/documents/${doc.id}/download`;
    a.download = doc.nom;
    a.click();
  };

  const filtered = docs.filter((d: any) => {
    if (filterType !== "all" && d.type !== filterType) return false;
    if (filterBoutique !== "all") {
      if (filterBoutique === "global" && d.boutiqueId) return false;
      if (filterBoutique !== "global" && String(d.boutiqueId) !== filterBoutique) return false;
    }
    if (search && !d.nom.toLowerCase().includes(search.toLowerCase()) && !d.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statsBy = (key: string) => docs.filter((d: any) => d.type === key).length;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Gestion Documentaire
          </h1>
          <p className="text-slate-400 text-sm mt-1">Factures, devis, bons de commande et livraison</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { cameraInputRef.current?.click(); setShowUpload(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            <Camera className="w-4 h-4" /> Scanner
          </button>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" /> Importer un document
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xlsx" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {DOC_TYPES.map(t => (
          <div key={t.value} className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center cursor-pointer hover:border-slate-500 transition-colors"
            onClick={() => setFilterType(filterType === t.value ? "all" : t.value)}>
            <div className="text-2xl mb-1">{t.icon}</div>
            <div className="text-white font-bold text-lg">{statsBy(t.value)}</div>
            <div className="text-slate-400 text-xs truncate">{t.label}</div>
            {filterType === t.value && <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1" />}
          </div>
        ))}
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Importer un document
          </h3>

          {/* File drop zone */}
          <div
            className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            {fileData ? (
              <div className="flex flex-col items-center gap-2">
                <FileCheck className="w-12 h-12 text-green-400" />
                <div className="text-green-400 font-semibold">{fileData.name}</div>
                <div className="text-slate-500 text-sm">{fmtTaille(fileData.taille)} · {fileData.mimeType}</div>
                <button className="text-slate-400 text-xs underline mt-1" onClick={e => { e.stopPropagation(); setFileData(null); }}>Changer de fichier</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <File className="w-12 h-12 text-slate-500" />
                <div className="text-slate-300 font-medium">Glissez un fichier ici ou cliquez pour parcourir</div>
                <div className="text-slate-500 text-sm">PDF, Images, Word, Excel · Max 10 Mo</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Nom du document *</label>
              <input
                value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="Ex: Facture janvier 2026"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Type *</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              >
                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                Destinataire <span className="text-slate-600 font-normal">(optionnel — laisser vide = tous)</span>
              </label>
              <select
                value={form.boutiqueId}
                onChange={e => setForm(f => ({ ...f, boutiqueId: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="">🌐 Toutes les boutiques</option>
                {boutiques.map((b: any) => <option key={b.id} value={b.id}>🏪 {b.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Notes additionnelles..."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowUpload(false); setFileData(null); setForm({ nom: "", type: "facture", boutiqueId: "", description: "" }); }}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-semibold transition-colors">
              Annuler
            </button>
            <button onClick={handleUpload} disabled={uploading || !fileData}
              className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi en cours...</> : <><Upload className="w-4 h-4" /> Importer</>}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un document..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary">
          <option value="all">Tous les types</option>
          {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterBoutique} onChange={e => setFilterBoutique(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary">
          <option value="all">Toutes boutiques</option>
          <option value="global">🌐 Documents globaux</option>
          {boutiques.map((b: any) => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm">Chargement des documents...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <FileText className="w-16 h-16 text-slate-700" />
          <div className="text-slate-400 font-semibold text-lg">Aucun document trouvé</div>
          <p className="text-slate-600 text-sm text-center">Importez votre première facture, devis ou bon de commande.</p>
          <button onClick={() => setShowUpload(true)} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold">
            Importer un document
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase tracking-wide px-5 py-3">Document</th>
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase tracking-wide px-5 py-3">Type</th>
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase tracking-wide px-5 py-3">Destinataire</th>
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase tracking-wide px-5 py-3">Taille</th>
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase tracking-wide px-5 py-3">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc: any) => {
                  const t = fmtType(doc.type);
                  return (
                    <tr key={doc.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{t.icon}</div>
                          <div>
                            <div className="text-white font-semibold text-sm">{doc.nom}</div>
                            {doc.description && <div className="text-slate-500 text-xs mt-0.5">{doc.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: t.color + "20", color: t.color }}>
                          {t.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                          {doc.boutique ? <><Building2 className="w-3.5 h-3.5 text-slate-500" /> {doc.boutique.nom}</> : <span className="text-slate-500">🌐 Toutes boutiques</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{fmtTaille(doc.taille)}</td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{new Date(doc.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => downloadDoc(doc)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary rounded-lg text-xs font-semibold transition-colors">
                            <Download className="w-3.5 h-3.5" /> Télécharger
                          </button>
                          <button onClick={() => { if (confirm(`Supprimer "${doc.nom}" ?`)) deleteMutation.mutate(doc.id); }}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((doc: any) => {
              const t = fmtType(doc.type);
              return (
                <div key={doc.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{t.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold truncate">{doc.nom}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: t.color + "20", color: t.color }}>{t.label}</span>
                        <span className="text-slate-500 text-xs">{fmtTaille(doc.taille)}</span>
                        <span className="text-slate-600 text-xs">{new Date(doc.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        {doc.boutique ? `🏪 ${doc.boutique.nom}` : "🌐 Toutes boutiques"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => downloadDoc(doc)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/15 hover:bg-primary/25 text-primary rounded-xl text-sm font-semibold transition-colors">
                      <Download className="w-4 h-4" /> Télécharger
                    </button>
                    <button onClick={() => { if (confirm(`Supprimer "${doc.nom}" ?`)) deleteMutation.mutate(doc.id); }}
                      className="px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-slate-500 text-sm text-center pt-2">{filtered.length} document(s) · {docs.length} au total</div>
        </>
      )}
    </div>
  );
}
