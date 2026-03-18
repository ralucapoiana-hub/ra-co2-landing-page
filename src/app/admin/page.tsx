"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [seoConfig, setSeoConfig] = useState({ title: "", description: "" });
  const [testimonials, setTestimonials] = useState<{id: number, text: string, author: string}[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

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
        setMessage({ type: "success", text: `${data.message} ${data.url ? `URL: ${data.url}` : ""}` });
        // Refresh images
        fetch('/api/images')
          .then(res => res.json())
          .then(data => setImageUrls(data));
        form.reset();
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Clinic Operations Panel</h1>
            <p className="text-slate-500">Manage digital assets and search engine metadata.</p>
          </div>
          <a href="/" target="_blank" className="px-4 py-2 bg-obsidian text-white rounded shadow-sm hover:bg-obsidian/90 text-sm font-medium transition-colors">
            View Live Site
          </a>
        </div>

        {message.text && (
          <div className={`mb-8 p-4 rounded-md border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {message.type === 'success' ? '✓ ' : '⚠ '} {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Image Management Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-200">Visual Assets</h2>
            
            {/* Logo Upload */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-medium mb-1">Navigation Logo</h3>
              <p className="text-xs text-slate-500 mb-4">Transparent PNG recommended for the navbar.</p>
              <form onSubmit={(e) => handleFileUpload(e, 'logo')} className="flex flex-col gap-3">
                <input type="file" accept="image/jpeg, image/png, image/webp" required className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                <button type="submit" disabled={loading} className="w-full py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium disabled:opacity-50">
                  Update Logo
                </button>
              </form>
            </div>

            {/* Hero Upload */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-medium mb-1">Hero Background Image</h3>
              <p className="text-xs text-slate-500 mb-4">Replaces the main background (1920x1080 req).</p>
              <form onSubmit={(e) => handleFileUpload(e, 'hero')} className="flex flex-col gap-3">
                <input type="file" accept="image/jpeg, image/png, image/webp" required className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                <button type="submit" disabled={loading} className="w-full py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium disabled:opacity-50">
                  Update Hero Image
                </button>
              </form>
            </div>

            {/* Doctor Upload */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-medium mb-1">Dr. Victoria Profile</h3>
              <p className="text-xs text-slate-500 mb-4">Portrait orientation (high-resolution req).</p>
              <form onSubmit={(e) => handleFileUpload(e, 'doctor')} className="flex flex-col gap-3">
                <input type="file" accept="image/jpeg, image/png, image/webp" required className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                <button type="submit" disabled={loading} className="w-full py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium disabled:opacity-50">
                  Update Profile Image
                </button>
              </form>
            </div>

            {/* Before After Upload Carousel */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-medium mb-1">Before & After Slider</h3>
              <p className="text-xs text-slate-500 mb-4">Landscape orientation. Upload up to 3 images for the interactive carousel.</p>
              
              <div className="flex flex-col gap-5">
                {[1, 2, 3].map((num) => (
                  <form key={num} onSubmit={(e) => handleFileUpload(e, `before-after-${num}`)} className="flex flex-col md:flex-row gap-3 md:items-center border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-700 mb-1">Carousel Slide {num}</p>
                      <input type="file" accept="image/jpeg, image/png, image/webp" required className="w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full md:w-auto px-4 py-2 mt-2 md:mt-0 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-xs font-medium disabled:opacity-50 whitespace-nowrap">
                      Upload #{num}
                    </button>
                  </form>
                ))}
              </div>
            </div>

            {/* Final CTA Upload */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-medium mb-1">Final CTA Banner</h3>
              <p className="text-xs text-slate-500 mb-4">The wide banner at the bottom of the page.</p>
              <form onSubmit={(e) => handleFileUpload(e, 'final-cta')} className="flex flex-col gap-3">
                <input type="file" accept="image/jpeg, image/png, image/webp" required className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                <button type="submit" disabled={loading} className="w-full py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium disabled:opacity-50">
                  Update CTA Image
                </button>
              </form>
            </div>
          </div>

          {/* Column 2: SEO & Testimonials */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-slate-200">Content & Search</h2>
            
            {/* SEO Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-medium mb-4">Search Engine Optimization</h3>
              <form onSubmit={handleSeoUpdate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                  <input 
                    type="text" 
                    value={seoConfig.title}
                    onChange={(e) => setSeoConfig({...seoConfig, title: e.target.value})}
                    placeholder="e.g. Cutera Secret PRO | Harley Street"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-obsidian"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                  <textarea 
                    value={seoConfig.description}
                    onChange={(e) => setSeoConfig({...seoConfig, description: e.target.value})}
                    placeholder="Brief description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-obsidian resize-none"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium disabled:opacity-50">
                  Save SEO Changes
                </button>
              </form>
            </div>

            {/* Testimonials Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-medium mb-4">Patient Testimonials</h3>
              <form onSubmit={handleTestimonialUpdate} className="flex flex-col gap-6">
                {testimonials.map((t, index) => (
                  <div key={t.id} className="space-y-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Testimonial #{index + 1}</p>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Client Name</label>
                      <input 
                        type="text" 
                        value={t.author}
                        onChange={(e) => {
                          const newT = [...testimonials];
                          newT[index].author = e.target.value;
                          setTestimonials(newT);
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Feedback Content</label>
                      <textarea 
                        value={t.text}
                        onChange={(e) => {
                          const newT = [...testimonials];
                          newT[index].text = e.target.value;
                          setTestimonials(newT);
                        }}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
                        required
                      />
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-white rounded-md hover:bg-black transition-colors text-sm font-semibold disabled:opacity-50 shadow-sm">
                  Save All Testimonials
                </button>
              </form>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="flex items-center gap-2 text-blue-800 font-medium text-sm mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Digital Strategy Tip
              </h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Testimonials with specific client names build significantly more trust for high-value treatments like CO2 Laser and RF Microneedling on Harley Street.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
