"use client";

import { useState, useEffect } from "react";
import { Reorder, AnimatePresence as FramerAnimatePresence } from "framer-motion";
import { GripVertical, Save, Trash2, Plus, Image as ImageIcon, Camera, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [seoConfig, setSeoConfig] = useState({ title: "", description: "" });
  const [testimonials, setTestimonials] = useState<{id: number, text: string, author: string}[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [resultsMetadata, setResultsMetadata] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const assetV = "?v=3";
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Fetch current SEO config on load
    fetch('/api/seo')
      .then(res => res.json())
      .then(data => setSeoConfig({ title: data.title || "", description: data.description || "" }))
      .catch(err => console.error("Failed to load SEO config", err));

    // Fetch testimonials on load
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(err => console.error("Failed to load testimonials", err));

    // Fetch image mappings on load
    fetch('/api/images')
      .then(res => res.json())
      .then(data => setImageUrls(data))
      .catch(err => console.error("Failed to load image mappings", err));

    // Fetch results metadata on load
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Add IDs if missing (required for Reorder)
          const withIds = data.map((d: any, i: number) => ({
            ...d,
            id: d.id || `slide-${Date.now()}-${i}`,
            // Ensure image fields exist
            beforeImage: d.beforeImage || "",
            afterImage: d.afterImage || ""
          }));
          setResultsMetadata(withIds);
        } else {
          // Initialize with 3 empty slides
          setResultsMetadata([
            { id: `slide-${Date.now()}-0`, patient: "Female, late 30s", concerns: "", treatment: "", photographed: "", beforeImage: "", afterImage: "" },
            { id: `slide-${Date.now()}-1`, patient: "Female, 26", concerns: "", treatment: "", photographed: "", beforeImage: "", afterImage: "" },
            { id: `slide-${Date.now()}-2`, patient: "Female, 42", concerns: "", treatment: "", photographed: "", beforeImage: "", afterImage: "" }
          ]);
        }
      })
      .catch(err => console.error("Failed to load results metadata", err));
  }, []);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>, type: string) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setMessage({ type: "error", text: "Please select a file." });
      setLoading(false);
      return;
    }

    setUploadingSlots(prev => ({ ...prev, [type]: true }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: "success", text: `${data.message}` });
        
        // If it's a slide image, update metadata directly
        if (type.startsWith('before-') || type.startsWith('after-')) {
          const dashIndex = type.indexOf('-');
          const prefix = type.substring(0, dashIndex);
          const id = type.substring(dashIndex + 1);
          
          setResultsMetadata(prev => {
            const index = prev.findIndex(m => m.id === id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = { 
                ...updated[index], 
                [prefix === 'before' ? 'beforeImage' : 'afterImage']: data.url 
              };
              return updated;
            }
            return prev;
          });
        } else {
          // Standard assets (logo, hero, etc.)
          setImageUrls(prev => ({ ...prev, [type]: data.url }));
        }

        // Always refresh global images to be safe
        fetch('/api/images')
          .then(res => res.json())
          .then(data => setImageUrls(data));
        
        form.reset();
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred during upload." });
    } finally {
      setLoading(false);
      setUploadingSlots(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSeoUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seoConfig),
      });
      
      if (res.ok) {
        setMessage({ type: "success", text: "SEO metadata updated successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to update SEO metadata." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleTestimonialUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testimonials),
      });
      
      if (res.ok) {
        setMessage({ type: "success", text: "Testimonials updated successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to update testimonials." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleResultsUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultsMetadata),
      });
      
      if (res.ok) {
        setMessage({ type: "success", text: "Results metadata & ordering saved." });
      } else {
        setMessage({ type: "error", text: "Failed to update results metadata." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-gold/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-serif text-obsidian tracking-tight mb-2">Clinic Operations Panel</h1>
            <p className="text-slate-500 font-light italic">Manage digital assets, results, and SEO metadata.</p>
          </div>
          <button 
            onClick={() => window.open('/', '_blank')}
            className="px-4 py-2 bg-obsidian text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
          >
            View Live Site
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-8 mb-10 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('content')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'content' ? 'text-gold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Content Management
            {activeTab === 'content' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
          </button>
          <button 
            onClick={() => setActiveTab('seo')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'seo' ? 'text-gold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            SEO & Metadata
            {activeTab === 'seo' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
          </button>
        </div>

        {message.text && (
          <div className={`mb-8 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            <span className="text-sm font-medium">{message.text}</span>
            <button onClick={() => setMessage({ type: "", text: "" })} className="text-current opacity-50 hover:opacity-100 text-lg">&times;</button>
          </div>
        )}

        <div className="w-full">
          {activeTab === 'content' ? (
            <div className="space-y-12">
              
              {/* 1. Global Assets (Landing Page Order) */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                  <span className="text-gold font-serif text-2xl">01</span>
                  <h2 className="text-xl font-serif text-obsidian">Global Asset Management</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="flex items-end gap-6 mb-2">
                      <div className="w-24 h-16 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden">
                        {(imageUrls['logo'] || `/uploads/logo.png${assetV}`) ? <img src={imageUrls['logo'] || `/uploads/logo.png${assetV}`} alt="Current Logo" className="max-h-full max-w-full object-contain" /> : <ImageIcon className="text-slate-200" size={24} />}
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400">Navigation Logo</label>
                        <p className="text-[10px] text-slate-400">High-res transparent PNG recommended.</p>
                      </div>
                    </div>
                    <form onSubmit={(e) => handleFileUpload(e, 'logo')} className="flex gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <input type="file" required className="flex-1 text-xs file:hidden px-3 py-2 bg-white border border-slate-200 rounded-lg" />
                      <button type="submit" className="px-5 py-2 bg-obsidian text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">Upload</button>
                    </form>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-end gap-6 mb-2">
                      <div className="w-32 h-16 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden">
                        {(imageUrls['hero'] || `/uploads/hero.jpg${assetV}`) ? <img src={imageUrls['hero'] || `/uploads/hero.jpg${assetV}`} alt="Current Hero" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-200" size={24} />}
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400">Hero Main Background</label>
                        <p className="text-[10px] text-slate-400">Large cinematic image (1920x1080+).</p>
                      </div>
                    </div>
                    <form onSubmit={(e) => handleFileUpload(e, 'hero')} className="flex gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <input type="file" required className="flex-1 text-xs file:hidden px-3 py-2 bg-white border border-slate-200 rounded-lg" />
                      <button type="submit" className="px-5 py-2 bg-obsidian text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">Upload</button>
                    </form>
                  </div>
                </div>
              </section>

              {/* 2. Doctor Profile Section */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                  <span className="text-gold font-serif text-2xl">02</span>
                  <h2 className="text-xl font-serif text-obsidian">Practitioner Profile</h2>
                </div>
                <div className="max-w-2xl flex items-center gap-8">
                  <div className="w-24 h-24 rounded-full border-2 border-gold/20 flex items-center justify-center overflow-hidden bg-slate-50">
                    {(imageUrls['doctor'] || `/uploads/doctor.jpg${assetV}`) ? <img src={imageUrls['doctor'] || `/uploads/doctor.jpg${assetV}`} alt="Dr Victoria" className="w-full h-full object-cover" /> : <Camera className="text-slate-200" size={32} />}
                  </div>
                  <form onSubmit={(e) => handleFileUpload(e, 'doctor')} className="flex-1 space-y-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400">Dr. Victoria Clinical Headshot</label>
                    <div className="flex gap-4">
                      <input type="file" required className="flex-1 text-xs file:hidden px-3 py-2 bg-white border border-slate-200 rounded-lg" />
                      <button type="submit" className="px-5 py-2 bg-obsidian text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all whitespace-nowrap">Update Portrait</button>
                    </div>
                  </form>
                </div>
              </section>

              {/* 3. Clinical Results Section */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-gold font-serif text-2xl">03</span>
                    <h2 className="text-xl font-serif text-obsidian">Clinical Results Carousel</h2>
                  </div>
                  <button 
                    onClick={() => setResultsMetadata([...resultsMetadata, { id: `slide-${Date.now()}`, patient: "", concerns: "", treatment: "", photographed: "", testimonial: "", beforeImage: "", afterImage: "" }])}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 text-gold hover:bg-gold hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    <Plus size={14} /> Add New Result
                  </button>
                </div>

                <Reorder.Group axis="y" values={resultsMetadata} onReorder={setResultsMetadata} className="space-y-6">
                  {resultsMetadata.map((slide, index) => (
                    <Reorder.Item 
                      key={slide.id || index} 
                      value={slide}
                      className="bg-slate-50/30 rounded-xl border border-slate-100 overflow-hidden group hover:border-gold/30 transition-all"
                    >
                      <div className="flex">
                        <div className="w-10 flex items-center justify-center border-r border-slate-100 cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-gold transition-colors">
                          <GripVertical size={18} />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Case Study #{index + 1}</h3>
                            <button 
                              onClick={() => {
                                const newM = [...resultsMetadata];
                                newM.splice(index, 1);
                                setResultsMetadata(newM);
                              }}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="grid lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">Patient Descriptor</label>
                                  <input type="text" value={slide.patient} onChange={(e) => { const newM = [...resultsMetadata]; newM[index].patient = e.target.value; setResultsMetadata(newM); }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-gold/30" />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">Timing (e.g. 8 weeks post)</label>
                                  <input type="text" value={slide.photographed} onChange={(e) => { const newM = [...resultsMetadata]; newM[index].photographed = e.target.value; setResultsMetadata(newM); }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-gold/30" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">Primary Concerns</label>
                                <input type="text" value={slide.concerns} onChange={(e) => { const newM = [...resultsMetadata]; newM[index].concerns = e.target.value; setResultsMetadata(newM); }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-gold/30" />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">Treatment Protocol</label>
                                <input type="text" value={slide.treatment} onChange={(e) => { const newM = [...resultsMetadata]; newM[index].treatment = e.target.value; setResultsMetadata(newM); }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-gold/30" />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">Patient Quote</label>
                                <textarea rows={2} value={slide.testimonial} onChange={(e) => { const newM = [...resultsMetadata]; newM[index].testimonial = e.target.value; setResultsMetadata(newM); }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm outline-none resize-none focus:ring-1 focus:ring-gold/30" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <form onSubmit={(e) => handleFileUpload(e, `before-${slide.id}`)} className="group/upload relative aspect-[4/5] bg-white border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gold/30 transition-all cursor-pointer overflow-hidden">
                                {slide.beforeImage ? (
                                  <img src={slide.beforeImage} className="absolute inset-0 w-full h-full object-cover" alt="Before" />
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <ImageIcon size={20} className="text-slate-200 transition-colors group-hover/upload:text-gold" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover/upload:text-gold">Add Before</span>
                                  </div>
                                )}
                                
                                {uploadingSlots[`before-${slide.id}`] ? (
                                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                                    <RefreshCw className="animate-spin text-gold" size={24} />
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 bg-gold/0 group-hover/upload:bg-gold/5 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-all z-10">
                                    <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border border-gold/20 flex items-center gap-2">
                                      <Plus size={12} className="text-gold" />
                                      <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Update</span>
                                    </div>
                                  </div>
                                )}
                                <input type="file" onChange={(e) => e.target.closest('form')?.requestSubmit()} className="absolute inset-0 opacity-0 cursor-pointer z-30" />
                              </form>
                              <form onSubmit={(e) => handleFileUpload(e, `after-${slide.id}`)} className="group/upload relative aspect-[4/5] bg-white border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gold/30 transition-all cursor-pointer overflow-hidden">
                                {slide.afterImage ? (
                                  <img src={slide.afterImage} className="absolute inset-0 w-full h-full object-cover" alt="After" />
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <Camera size={20} className="text-slate-200 transition-colors group-hover/upload:text-gold" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover/upload:text-gold">Add After</span>
                                  </div>
                                )}

                                {uploadingSlots[`after-${slide.id}`] ? (
                                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                                    <RefreshCw className="animate-spin text-gold" size={24} />
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 bg-gold/0 group-hover/upload:bg-gold/5 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-all z-10">
                                    <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border border-gold/20 flex items-center gap-2">
                                      <Plus size={12} className="text-gold" />
                                      <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Update</span>
                                    </div>
                                  </div>
                                )}
                                <input type="file" onChange={(e) => e.target.closest('form')?.requestSubmit()} className="absolute inset-0 opacity-0 cursor-pointer z-30" />
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                <div className="flex justify-end mt-12">
                  <button onClick={() => handleResultsUpdate(null as any)} disabled={loading} className="px-10 py-3 bg-obsidian text-white rounded-xl shadow-lg hover:bg-black transition-all font-bold text-sm disabled:opacity-50">
                    Save Carousel Changes
                  </button>
                </div>
              </section>

              {/* 4. Testimonials Section */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                  <span className="text-gold font-serif text-2xl">04</span>
                  <h2 className="text-xl font-serif text-obsidian">Patient Testimonials</h2>
                </div>
                <form onSubmit={handleTestimonialUpdate} className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, index) => (
                      <div key={t.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">Author</label>
                          <input type="text" value={t.author} onChange={(e) => { const newT = [...testimonials]; newT[index].author = e.target.value; setTestimonials(newT); }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:ring-1 focus:ring-gold/30 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">Testimonial Content</label>
                          <textarea rows={4} value={t.text} onChange={(e) => { const newT = [...testimonials]; newT[index].text = e.target.value; setTestimonials(newT); }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:ring-1 focus:ring-gold/30 outline-none resize-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-obsidian text-white rounded-xl shadow-md hover:bg-black transition-all font-bold text-sm">
                      Update Wall of Love
                    </button>
                  </div>
                </form>
              </section>

              {/* 5. Final Call to Action Section */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                  <span className="text-gold font-serif text-2xl">05</span>
                  <h2 className="text-xl font-serif text-obsidian">Final Call to Action</h2>
                </div>
                <div className="max-w-4xl flex items-center gap-8">
                  <div className="w-48 h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                    {(imageUrls['final-cta'] || `/uploads/final-cta.jpg${assetV}`) ? <img src={imageUrls['final-cta'] || `/uploads/final-cta.jpg${assetV}`} alt="Footer Banner" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-200" size={32} />}
                  </div>
                  <form onSubmit={(e) => handleFileUpload(e, 'final-cta')} className="flex-1 space-y-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400">Footer Banner Background</label>
                    <div className="flex gap-4">
                      <input type="file" required className="flex-1 text-xs file:hidden px-3 py-2 bg-white border border-slate-200 rounded-lg" />
                      <button type="submit" className="px-5 py-2 bg-obsidian text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all whitespace-nowrap">Upload Banner</button>
                    </div>
                  </form>
                </div>
              </section>

            </div>
          ) : (
            <div className="max-w-4xl space-y-12">
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                  <span className="text-gold font-serif text-2xl">#</span>
                  <h2 className="text-xl font-serif text-obsidian">General SEO Metadata</h2>
                </div>
                <form onSubmit={handleSeoUpdate} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Meta Page Title</label>
                    <input type="text" value={seoConfig.title} onChange={(e) => setSeoConfig({...seoConfig, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-gold/30 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Meta Description (Social & Search Snippet)</label>
                    <textarea value={seoConfig.description} onChange={(e) => setSeoConfig({...seoConfig, description: e.target.value})} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-gold/30 outline-none resize-none" required />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="px-10 py-3 bg-obsidian text-white rounded-xl shadow-lg hover:bg-black transition-all font-bold text-sm">
                      Sync Metadata
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
