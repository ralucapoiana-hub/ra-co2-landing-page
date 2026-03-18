"use client";

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, Variants, AnimatePresence } from 'framer-motion';
import { Star, ShieldPlus, Focus, Droplet, Shield, CheckCircle2, Wand2, Sun, ShieldCheck, Hourglass, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const parallaxY = useTransform(scrollY, [0, 3000], [0, -300]);
  
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Asset versioning to prevent caching issues after upload
  const assetV = "?v=3"; // Increment this or use a timestamp
  
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const getImage = (type: string, fallback: string) => {
    return imageUrls[type] || fallback;
  };

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const beforeAfterImages = [
    getImage('before-after-1', `/uploads/before-after-1.jpg${assetV}`),
    getImage('before-after-2', `/uploads/before-after-2.jpg${assetV}`),
    getImage('before-after-3', `/uploads/before-after-3.jpg${assetV}`)
  ];

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % beforeAfterImages.length);
  };
  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + beforeAfterImages.length) % beforeAfterImages.length);
  };

  // FAQ State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => setActiveFaq(activeFaq === index ? null : index);

  // Testimonials State
  const [testimonials, setTestimonials] = useState<{id: number, text: string, author: string}[]>([
    {
      "id": 1,
      "text": "Dr. Victoria’s expertise with the CO2 laser completely transformed my skin texture. Incredible results.",
      "author": "G.E."
    },
    {
      "id": 2,
      "text": "Dr Victoria has been looking after me for about 2 years now and I can say simply that I look way better that 7-8 years ago.",
      "author": "V.M."
    }
  ]);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(err => console.error("Failed to load testimonials", err));

    fetch('/api/images')
      .then(res => res.json())
      .then(data => setImageUrls(data))
      .catch(err => console.error("Failed to load cloud images", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation Variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeUpLight: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const silkReveal: Variants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 1.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const overlayReveal: Variants = {
    hidden: { x: "0%" },
    visible: { x: "100%", transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 } }
  };

  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <main className="min-h-screen bg-alabaster overflow-hidden">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-white shadow-sm border-transparent' : 'bg-white/0 border-white/10'}`}>
        <div className="flex justify-between items-center px-6 md:px-12">
          
          {/* Logo */}
          <div className="relative h-20 md:h-24 w-48 md:w-64 shrink-0 py-8">
            <Image 
              src={`/uploads/logo.png${assetV}`}
              alt="The Regenerative Aesthetics Logo"
              fill
              className="object-contain object-left"
              unoptimized
            />
          </div>

          {/* Right Side Info */}
          <div className="flex flex-col flex-1 pl-8 relative">
            
            {/* Soft Light Bloom */}
            <div 
              className={`absolute -top-40 -right-20 w-[350px] h-[350px] bg-white/80 blur-3xl pointer-events-none transition-opacity duration-700 -z-10 rounded-full
                ${isScrolled ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* Top Bar */}
            <div className="hidden md:flex justify-end pt-4">
              <div className={`pb-2 border-b text-sm tracking-wide font-medium transition-colors duration-500 ${isScrolled ? 'border-gray-200 text-gray-500' : 'border-[#555555]/20 text-[#555555]/90'}`}>
                <span>Welcome to The Regenerative Aesthetics <span className={`mx-2 font-light ${isScrolled ? 'text-gray-300' : 'text-[#555555]/40'}`}>|</span> Call Us <span className="text-gold ml-1 font-semibold">079 2037 7207</span></span>
              </div>
            </div>
            
            {/* Main Nav Links */}
            <div className={`hidden md:flex justify-end items-center gap-8 text-[15px] tracking-wide pt-4 pb-5 transition-colors duration-500 text-obsidian`}>
              <a href="#" className="hover:text-gold transition-colors font-normal">Home</a>
              <a href="#" className="hover:text-gold transition-colors font-normal">About</a>
              <a href="#" className="text-gold font-bold hover:opacity-80 transition-opacity">Services</a>
              <a href="#" className="hover:text-gold transition-colors font-normal">Blog</a>
              <a href="#" className="hover:text-gold transition-colors font-normal">Contact</a>
            </div>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: y1, scale: 1.05 }} className="absolute inset-0 w-full h-full z-0 origin-center transition-transform duration-[10s] ease-out hover:scale-100">
          <div className="absolute inset-0 bg-gradient-to-t from-alabaster via-transparent to-transparent z-15" />
          <Image 
            src={getImage('hero', `/uploads/hero.jpg${assetV}`)} 
            alt="Clinical Environment" 
            fill
            className="object-cover object-center"
            unoptimized
            priority
          />
        </motion.div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-20 text-center px-4 max-w-4xl mt-20"
        >
          <motion.p 
            variants={fadeUpLight}
            className="text-gold uppercase tracking-[0.4em] text-[10px] md:text-xs font-medium mb-6"
          >
            Physician-Led Aesthetics | 82 Harley Street, London
          </motion.p>
          <motion.h1 
            variants={fadeUp}
            className="text-[#555555] font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 font-light"
          >
            Cutera Secret PRO <span className="italic block font-light mt-4 text-gold/90 drop-shadow-md">CO2 Laser Resurfacing</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-[#555555]/90 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto"
          >
            The gold standard clinical treatment for deep acne scarring, uneven texture, and advanced skin rejuvenation.
          </motion.p>
 
          <motion.div
            variants={staggerContainer}
            className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-12"
          >
             <motion.div variants={fadeUp}>
               <a href="#consultation" className="group relative inline-flex justify-center items-center bg-gold hover:bg-black text-white transition-colors duration-300 h-[54px] pl-8 pr-10 uppercase tracking-[0.09em] text-[16px] font-medium font-montserrat shadow-lg">
                 <span>Book Your Consultation</span>
                 <div className="absolute right-0 translate-x-1/2 w-[40px] h-[40px] rounded-full bg-black group-hover:bg-gold flex items-center justify-center transition-colors duration-300 shadow-md">
                   <ChevronRight size={18} className="text-white" />
                 </div>
               </a>
             </motion.div>

             <motion.a 
               variants={fadeUp}
               href="https://share.google/nV5t4lagKFOOAFdoe" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center hover:opacity-80 transition-opacity"
             >
               <div className="relative h-[54px] w-56">
                 <Image 
                   src={getImage('google-reviews', `/uploads/google-reviews.png${assetV}`)}
                   alt="Google Reviews"
                   fill
                   className="object-contain"
                   unoptimized
                 />
               </div>
             </motion.a>

             <motion.div variants={fadeUp} className="flex gap-4 text-[#555555]/90 text-[11px] tracking-[0.2em] uppercase font-bold drop-shadow-sm items-center border-l border-[#555555]/10 pl-8 h-[54px]">
               <div className="flex items-center gap-3">
                 <ShieldPlus size={32} className="text-gold flex-shrink-0" />
                 <div className="flex flex-col items-start leading-[1.1]">
                   <span>CQC</span>
                   <span>Registered</span>
                 </div>
               </div>
             </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Group A: Light Grey Background Section */}
      <section className="bg-slate-50/80 py-32 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* 1. Why Choose Dr. Victoria */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-12 gap-16 md:gap-24 items-center mb-32"
          >
            <div className="md:col-span-5 relative aspect-[4/5] w-full overflow-hidden group shadow-2xl border border-gold/10 max-w-md mx-auto md:mx-0 bg-alabaster">
               {/* Silk Reveal Overlay */}
               <motion.div 
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true }}
                 variants={overlayReveal}
                 className="absolute inset-0 z-30 bg-white"
               />
               
               <div className="absolute inset-0 bg-gold/5 transform translate-x-4 translate-y-4 -z-10 transition-transform duration-700 group-hover:translate-x-6 group-hover:translate-y-6" />
               <motion.div
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true }}
                 variants={silkReveal}
                 className="relative h-full w-full"
               >
              <Image 
                src={getImage('doctor', `/uploads/doctor.jpg${assetV}`)}
                alt="Dr. Victoria Virtosu"
                fill
                className="object-cover hover:scale-105 transition-transform duration-[2s]"
                unoptimized
              />
               </motion.div>
            </div>
            <motion.div variants={fadeUp} className="md:col-span-7 max-w-xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-obsidian mb-8 leading-tight font-light">
                Why choose <br/><span className="italic text-gold">Dr. Victoria Virtosu?</span>
              </h2>
              <p className="text-obsidian/70 text-lg leading-relaxed font-light mb-12">
                CO2 Laser resurfacing is an advanced medical procedure, not a standard beauty treatment. At The Regenerative Aesthetics, your treatment is exclusively physician-led. We combine the world-class Cutera Secret PRO technology with bespoke regenerative serums to ensure maximum structural remodeling with minimized downtime.
              </p>
              
              <div className="grid gap-10 border-t border-gold/15 pt-10">
                  {testimonials.map((t) => (
                    <motion.div variants={fadeUpLight} key={t.id}>
                      <div className="flex text-gold mb-3"><Star fill="currentColor" size={12}/><Star fill="currentColor" size={12}/><Star fill="currentColor" size={12}/><Star fill="currentColor" size={12}/><Star fill="currentColor" size={12}/></div>
                      <p className="font-light italic text-obsidian/80 text-sm mb-3">"{t.text}"</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold/80">- {t.author}</p>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </motion.div>

          {/* 2. Our 3-Step Protocol */}
          <div className="mb-32">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center mb-16 md:mb-20"
            >
              <h2 className="text-4xl md:text-6xl font-serif mb-6 font-light text-obsidian">Our <span className="italic text-gold">3-Step</span> Protocol</h2>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8"
            >
              <motion.div variants={fadeUp} className="luxury-panel bg-white p-10 group cursor-default shadow-lg">
                 <Focus className="text-gold w-10 h-10 mb-8 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
                 <h3 className="text-2xl font-serif mb-4 font-medium tracking-wide text-gold">Step 1:<br/><span className="text-[#555555] text-xl italic font-medium">Deep Fractional Resurfacing</span></h3>
                 <p className="text-obsidian/70 font-light leading-relaxed mb-4 text-sm">We safely vaporize damaged scar tissue to trigger the production of fresh, tight collagen.</p>
              </motion.div>
              <motion.div variants={fadeUp} className="luxury-panel bg-white p-10 group cursor-default shadow-lg">
                 <Droplet className="text-gold w-10 h-10 mb-8 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
                 <h3 className="text-2xl font-serif mb-4 font-medium tracking-wide text-gold">Step 2:<br/><span className="text-[#555555] text-xl italic font-medium">Regenerative Infusion</span></h3>
                 <p className="text-obsidian/70 font-light leading-relaxed mb-4 text-sm">While the skin's micro-channels are open, we deliver a potent cellular repair serum deep into the dermis to accelerate healing.</p>
              </motion.div>
              <motion.div variants={fadeUp} className="luxury-panel bg-white p-10 group cursor-default shadow-lg">
                 <Shield className="text-gold w-10 h-10 mb-8 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
                 <h3 className="text-2xl font-serif mb-4 font-medium tracking-wide text-gold">Step 3:<br/><span className="text-[#555555] text-xl italic font-medium">The Barrier Shield</span></h3>
                 <p className="text-obsidian/70 font-light leading-relaxed mb-4 text-sm">We complete the protocol with a deeply cooling clinical mask to soothe the tissue and protect the skin barrier.</p>
              </motion.div>
            </motion.div>
          </div>

          {/* 3. Before & After Carousel */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="max-w-5xl mx-auto relative group"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-serif mb-4 font-light text-obsidian">Clinical <span className="italic text-gold">Results</span></h2>
            </div>
            <button onClick={prevSlide} className="absolute left-[-20px] md:left-[-40px] top-[60%] -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border border-gold/20 hover:bg-gold hover:text-white transition-colors duration-300">
               <ChevronRight className="w-5 h-5 -scale-x-100" />
            </button>
            <button onClick={nextSlide} className="absolute right-[-20px] md:right-[-40px] top-[60%] -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border border-gold/20 hover:bg-gold hover:text-white transition-colors duration-300">
               <ChevronRight className="w-5 h-5" />
            </button>

            <div className="relative aspect-video w-full overflow-hidden shadow-2xl border border-gold/10 bg-white flex items-center justify-center rounded-sm">
              <div className="absolute inset-0 bg-gold/5 z-10 pointer-events-none mix-blend-overlay" />
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0"
                >
                  <Image 
                    src={beforeAfterImages[currentSlide]}
                    alt={`Clinical CO2 Laser Before and After Results - Slide ${currentSlide + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="text-[10px] font-light text-obsidian/50 italic text-center tracking-wider mt-6">
              Results from our Harley Street Clinic. Individual results may vary. <br/>A full clinical assessment is required to determine suitability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Benefits Grid (NOW STEP 3) */}
      <section className="relative py-32 px-6 md:px-12 border-y border-gold/10 overflow-hidden bg-[#FFECD9]/30 transition-colors duration-700">
        
        {/* Lava Lamp Background Effect (Actual Parallax) - Lowest Layer */}
        <motion.div style={{ y: parallaxY }} className="absolute inset-x-0 top-[-20%] bottom-[-20%] z-0 pointer-events-none opacity-90">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-gold/40 rounded-[40%_60%_70%_30%] mix-blend-multiply filter blur-[80px] md:blur-[120px] animate-lava-1" />
          <div className="absolute top-[20%] right-[-10%] w-[50vw] md:w-[35vw] h-[50vw] md:h-[35vw] bg-[#EBD5BE] rounded-[60%_40%_30%_70%] mix-blend-multiply filter blur-[90px] md:blur-[140px] animate-lava-2" />
          <div className="absolute bottom-[-10%] left-[10%] w-[70vw] md:w-[45vw] h-[70vw] md:h-[45vw] bg-[#E6C4A3] rounded-[50%_50%_60%_40%] mix-blend-multiply filter blur-[100px] md:blur-[150px] animate-lava-3" />
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Static Soft Light Blob directly under the H2 */}
            <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-white/60 blur-[60px] rounded-[50%] -z-10 pointer-events-none" />
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-serif text-obsidian mb-16 font-light"
            >
              Is the <span className="text-gold italic">Cutera Secret Pro</span> right for you?
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white border border-gold/15 rounded-2xl relative overflow-hidden shadow-[0_8px_32px_rgba(10,17,40,0.04)] p-10 md:p-16 max-w-7xl mx-auto text-left"
            >
              <div className="max-w-4xl mx-auto">
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="mb-24"
                >
                  <h2 className="text-2xl md:text-4xl font-serif text-obsidian mb-8 font-light text-center">What it <span className="italic text-gold">targets</span></h2>
                  <ul className="flex flex-wrap justify-center items-center gap-y-4 text-[11px] md:text-xs tracking-[0.15em] font-medium text-obsidian/70">
                    <li className="px-4 md:px-6 text-center">
                      Acne Scars
                    </li>
                    <li className="px-4 md:px-6 text-center border-l border-gold/30">
                      Sun Damage
                    </li>
                    <li className="px-4 md:px-6 text-center border-l border-gold/30">
                      Deep Wrinkles
                    </li>
                    <li className="px-4 md:px-6 text-center border-l border-gold/30">
                      Texture
                    </li>
                  </ul>
                </motion.div>

                <h2 className="text-2xl md:text-4xl font-serif text-obsidian mb-12 font-light text-center pt-6">How it <span className="italic text-gold">works</span></h2>


              <motion.ul 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-10"
              >
                <motion.li 
                  variants={fadeUp}
                  className="flex items-start gap-5 md:gap-6 border-b border-gold/10 pb-8 last:border-0 last:pb-0 pl-4 md:pl-8"
                >
                  <Wand2 className="text-gold w-8 h-8 flex-shrink-0 mt-1 opacity-80" strokeWidth={1} />
                  <div className="max-w-2xl">
                    <h3 className="text-xl md:text-2xl font-serif text-obsidian mb-3 font-light">Erase Deep Acne Scarring</h3>
                    <p className="text-obsidian/70 leading-relaxed font-light text-sm pr-4 md:pr-12">We don't just treat the surface. The laser safely breaks down stubborn, fibrotic scar tissue deep within the dermis, forcing the skin to rebuild a smooth, flawless canvas from the inside out.</p>
                  </div>
                </motion.li>
                <motion.li 
                  variants={fadeUp}
                  className="flex items-start gap-5 md:gap-6 border-b border-gold/10 pb-8 last:border-0 last:pb-0 pl-4 md:pl-8"
                >
                  <Sun className="text-gold w-8 h-8 flex-shrink-0 mt-1 opacity-80" strokeWidth={1} />
                  <div className="max-w-2xl">
                    <h3 className="text-xl md:text-2xl font-serif text-obsidian mb-3 font-light">Clear Years of Sun Damage</h3>
                    <p className="text-obsidian/70 leading-relaxed font-light text-sm pr-4 md:pr-12">Effectively lift and vaporize severe hyperpigmentation, age spots, and uneven texture. Reveal a significantly brighter, glass-like complexion in a fraction of the time of standard peels.</p>
                  </div>
                </motion.li>
                <motion.li 
                  variants={fadeUp}
                  className="flex items-start gap-5 md:gap-6 border-b border-gold/10 pb-8 last:border-0 last:pb-0 pl-4 md:pl-8"
                >
                  <ShieldCheck className="text-gold w-8 h-8 flex-shrink-0 mt-1 opacity-80" strokeWidth={1} />
                  <div className="max-w-2xl">
                    <h3 className="text-xl md:text-2xl font-serif text-obsidian mb-3 font-light">Restore Structural Firmness</h3>
                    <p className="text-obsidian/70 leading-relaxed font-light text-sm pr-4 md:pr-12">The intense thermal energy triggers an immediate tissue contraction, followed by a massive surge of fresh collagen. The result? Plumper skin, reduced deep wrinkles, and visible structural tightening.</p>
                  </div>
                </motion.li>
                <motion.li 
                  variants={fadeUp}
                  className="flex items-start gap-5 md:gap-6 border-b border-gold/10 pb-8 last:border-0 last:pb-0 pl-4 md:pl-8"
                >
                  <Hourglass className="text-gold w-8 h-8 flex-shrink-0 mt-1 opacity-80" strokeWidth={1} />
                  <div className="max-w-2xl">
                    <h3 className="text-xl md:text-2xl font-serif text-obsidian mb-3 font-light">Fractional Precision = Faster Recovery</h3>
                    <p className="text-obsidian/70 leading-relaxed font-light text-sm pr-4 md:pr-12">Unlike older, highly aggressive CO2 lasers that require weeks of hiding indoors, our fractional technology leaves microscopic zones of healthy tissue intact. You get heavy-hitting clinical results with significantly accelerated healing.</p>
                  </div>
                </motion.li>
              </motion.ul>
              </div>
            </motion.div>
        </div>
      </section>

      {/* Group C: Cream Gradient Background Section */}
      <section className="py-24 md:py-32 bg-creamy-transition text-obsidian px-6 md:px-12 border-t border-b border-gold/10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center mb-24 md:mb-32"
        >
            <h2 className="text-3xl md:text-5xl font-serif text-obsidian mb-8 font-light">What to Expect <span className="italic text-gold">During Recovery</span></h2>
            <p className="text-obsidian/60 text-lg leading-relaxed font-light mb-16 max-w-3xl mx-auto">
              Because the Cutera Secret PRO provides medical-grade resurfacing, proper healing is essential to achieve optimal results. While our fractional approach significantly reduces downtime compared to older lasers, you should still anticipate a recovery period.
            </p>
            <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6 text-left text-sm">
              <motion.div variants={fadeUp} className="luxury-panel p-8 bg-white/40">
                <h3 className="font-serif text-xl mb-3 text-gold italic font-light">Days 1-2</h3>
                <p className="text-obsidian/70 leading-relaxed font-light">Skin will appear red and feel hot or tight, similar to a sunburn. Mild to moderate swelling is completely normal.</p>
              </motion.div>
              <motion.div variants={fadeUp} className="luxury-panel p-8 bg-white/40">
                <h3 className="font-serif text-xl mb-3 text-gold italic font-light">Days 3-4</h3>
                <p className="text-obsidian/70 leading-relaxed font-light">Redness begins to subside. Skin develops a sandpaper-like texture. Early microscopic flaking will occur.</p>
              </motion.div>
              <motion.div variants={fadeUp} className="luxury-panel p-8 bg-white/40">
                <h3 className="font-serif text-xl mb-3 text-gold italic font-light">Days 5-7</h3>
                <p className="text-obsidian/70 leading-relaxed font-light">Active peeling and shedding reveal brighter, smoother skin. Many return to regular activities with light makeup.</p>
              </motion.div>
            </motion.div>
        </motion.div>

        {/* Collapsible FAQ Section */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="max-w-3xl mx-auto"
        >
            <h2 className="text-3xl md:text-5xl font-serif text-obsidian mb-16 text-center font-light">Frequently Asked <span className="italic text-gold">Questions</span></h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "Is the treatment painful?",
                  a: "We prioritize your comfort by applying a medical-grade topical numbing cream prior to your procedure. While you may feel heat and a slight prickling sensation, most patients find the treatment very tolerable. We also utilize deep cooling masks post-treatment to instantly soothe the skin."
                },
                {
                  q: "When will I see the final results?",
                  a: "Initial improvements in skin tone and brightness are visible as soon as the peeling phase completes (around day 7). However, because the CO2 laser triggers deep cellular remodeling, your body will continue creating new collagen for 3 to 6 months, meaning your results will continue to improve over time."
                },
                {
                  q: "Can it be used on darker skin tones?",
                  a: "CO2 laser resurfacing is generally best suited for fair to medium skin tones due to the risk of post-inflammatory hyperpigmentation. However, the Cutera Secret PRO also features an RF Microneedling modality which is safe for all skin tones. A full clinical assessment with Dr. Victoria is required to determine suitability."
                },
                {
                  q: "How many sessions will I need?",
                  a: "This depends on your specific skin concerns. For mild texture or an anti-aging glow, one session may be sufficient. For deep acne scarring or advanced sun damage, a series of 2 to 3 treatments is often required to achieve optimal structural remodeling."
                }
              ].map((item, idx) => (
                <div key={idx} className="border border-gold/15 rounded-sm overflow-hidden bg-white/30 backdrop-blur-sm">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center gap-6 p-6 text-left hover:bg-white/50 transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 text-gold shrink-0 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} strokeWidth={1} />
                    <h3 className="text-lg font-serif font-light text-obsidian">{item.q}</h3>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: activeFaq === idx ? 'auto' : 0, opacity: activeFaq === idx ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-obsidian/70 font-light leading-relaxed text-sm ml-10">
                      {item.a}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
        </motion.div>
      </section>



      {/* Final CTA Section */}
      <section id="consultation" className="bg-alabaster py-24 px-6 md:px-12 border-t border-gold/10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="max-w-[1400px] mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <div className="order-2 lg:order-1 relative group">
              <div className="relative aspect-video w-full overflow-hidden shadow-2xl border border-gold/10 bg-white">
                <motion.div 
                   initial="hidden"
                   whileInView="visible"
                   viewport={{ once: true }}
                   variants={overlayReveal}
                   className="absolute inset-0 z-30 bg-white"
                />
                <div className="absolute inset-0 bg-gold/5 z-10 pointer-events-none mix-blend-overlay" />
                <motion.div
                   initial="hidden"
                   whileInView="visible"
                   viewport={{ once: true }}
                   variants={silkReveal}
                   className="relative h-full w-full"
                >
                  <Image 
                    src={getImage('final-cta', `/uploads/final-cta.jpg${assetV}`)}
                    alt="Clinical Results"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </motion.div>
              </div>
            </div>

            <motion.div variants={staggerContainer} className="order-1 lg:order-2">
              <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-serif text-obsidian mb-8 leading-tight font-light">
                Ready to restore your <br/><span className="text-gold italic">skin's natural architecture?</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-obsidian/60 text-lg mb-4 font-light">
                Located in the heart of London's medical district at <span className="font-medium text-obsidian">82 Harley Street</span>.
              </motion.p>
              <motion.p variants={fadeUp} className="text-gold/80 text-sm mb-12 font-light italic">
                Consultations from £250. Treatment plans are bespoke and discussed during your assessment.
              </motion.p>

              <motion.div variants={fadeUp}>
                <a href="#consultation" className="group relative inline-flex justify-center items-center bg-gold hover:bg-black text-white transition-colors duration-300 h-[54px] pl-8 pr-10 uppercase tracking-[0.09em] text-[16px] font-medium font-montserrat mr-5 shadow-lg">
                  <span>Book Your Consultation Now</span>
                  <div className="absolute right-0 translate-x-1/2 w-[40px] h-[40px] rounded-full bg-black group-hover:bg-gold flex items-center justify-center transition-colors duration-300 shadow-sm">
                    <ChevronRight size={18} className="text-white" />
                  </div>
                </a>
              </motion.div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-alabaster pt-12 pb-12 px-6 md:px-12 border-t border-gold/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] tracking-[0.2em] text-obsidian/40 uppercase">
            <p>© 2026 The Regenerative Aesthetics.</p>
            <p>82 Harley Street, London</p>
          </div>
        </div>
      </footer>

      {/* Sticky Floating 'Book' Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-50 pointer-events-auto"
      >
        <a 
          href="#consultation"
          className="group flex items-center gap-2.5 bg-gold text-white px-6 py-3.5 rounded-full shadow-[0_10px_25px_rgba(205,154,87,0.3)] hover:shadow-[0_15px_35px_rgba(205,154,87,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
        >
          <Calendar size={18} className="text-white group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          <span className="font-montserrat font-semibold tracking-wider text-sm uppercase">Book</span>
        </a>
      </motion.div>
    </main>
  );
}
