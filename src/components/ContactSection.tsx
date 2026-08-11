import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../data/translations';

interface ContactSectionProps {
  lang: 'EN' | 'PT';
}

type FormState = 'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR';

const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang].contact;

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formState, setFormState] = useState<FormState>('IDLE');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('hello@mvirgilstudio.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setFormState('SENDING');

    try {
      const response = await fetch("https://formsubmit.co/ajax/hello@mvirgilstudio.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `New Portfolio Message from ${formData.name}`
        })
      });

      if (response.ok) {
        setFormState('SUCCESS');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormState('ERROR');
        setTimeout(() => setFormState('IDLE'), 5000);
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setFormState('ERROR');
      setTimeout(() => setFormState('IDLE'), 5000);
    }
  };

  return (
    <section
      id="section_contact"
      className="relative w-full min-h-screen flex items-center justify-center py-24 px-6 sm:px-12 md:px-24 bg-black overflow-hidden border-t border-white/5"
    >
      {/* Visual background lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-[20%] w-[1px] h-full bg-white"></div>
        <div className="absolute top-0 left-[80%] w-[1px] h-full bg-white"></div>
        <div className="absolute top-[30%] left-0 w-full h-[1px] bg-white"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 lg:items-stretch items-start">

        {/* Left Column: Direct info & Telemetry indicators */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-5 flex flex-col gap-6 lg:h-full"
        >
          <div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold uppercase tracking-tight text-white leading-[1.05]">
              {t.title}
            </h2>
          </div>
          <div className="h-[2px] w-20 bg-gradient-to-r from-white/40 to-transparent"></div>

          <p className="font-sans font-light text-base sm:text-lg text-concrete/80 tracking-wide leading-relaxed">
            {t.subtitle}
          </p>

          {/* Telemetry Info Blocks */}
          <div className="flex flex-col gap-4 mt-auto font-mono lg:flex-grow">
            {/* Email Badge (Copyable) */}
            <div
              onClick={handleCopyEmail}
              className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all cursor-pointer flex justify-between items-center relative overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[9px] tracking-widest text-concrete/40 group-hover:text-concrete/60 transition-colors uppercase">{t.info.email}</span>
                <span className="text-sm sm:text-base font-medium text-white tracking-wide">hello@mvirgilstudio.com</span>
              </div>
              <div className="flex items-center gap-2">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-[10px] text-accent tracking-widest uppercase font-bold"
                    >
                      {lang === 'EN' ? 'COPIED' : 'COPIADO'}
                    </motion.span>
                  ) : (
                    <motion.div
                      key="copy-icon"
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-concrete group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Phone Badge */}
            <a
              href="tel:+351933628268"
              className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col gap-1"
            >
              <span className="text-[9px] tracking-widest text-concrete/40 group-hover:text-concrete/60 transition-colors uppercase">
                {t.info.phone}
              </span>
              <span className="text-sm sm:text-base font-medium text-white tracking-wide">
                +351 933 628 268
              </span>
            </a>

            {/* Location Badge */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
              <span className="text-[9px] tracking-widest text-concrete/40 uppercase">{t.info.location}</span>
              <span className="text-xs sm:text-sm font-medium text-white">{t.info.locationVal}</span>
            </div>

            {/* Interactive Map */}
            <div className="hidden lg:flex w-full lg:flex-grow min-h-[220px] h-60 sm:h-72 rounded-xl overflow-hidden border border-white/5 bg-white/[0.02] relative group flex-col">
              <iframe
                title="Alcobaça, Portugal Map"
                src="https://maps.google.com/maps?q=39.5487,-8.9774&t=&z=7&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: 'grayscale(100%) invert(92%) contrast(120%) brightness(90%)',
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-75 group-hover:opacity-90 transition-opacity duration-300 flex-grow"
              ></iframe>
              {/* Clickable overlay to open maps in a new tab */}
              <a
                href="https://www.google.com/maps/search/?api=1&query=39.5487,-8.9774"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/10 hover:bg-black/35 transition-colors flex items-center justify-center group/map-link cursor-pointer"
              >
                <div className="opacity-100 md:opacity-0 md:group-hover/map-link:opacity-100 transition-opacity duration-300 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 text-xs font-mono tracking-widest text-white uppercase text-center">
                  {lang === 'EN' ? 'Open in Google Maps' : 'Abrir no Google Maps'}
                </div>
              </a>
              <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl group-hover:border-white/15 transition-all"></div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interaction Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-7 w-full p-6 sm:p-10 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-md relative overflow-hidden flex flex-col lg:h-full justify-end"
        >
          {/* Top glow indicator */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8 relative z-10 w-full">
            {/* Input Name */}
            <div className="flex flex-col gap-2 relative group">
              <label htmlFor="name" className="text-[10px] font-mono tracking-widest text-concrete/60 group-focus-within:text-white transition-colors uppercase">
                {t.form.name}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={formState !== 'IDLE'}
                className="w-full bg-transparent border-b border-white/10 focus:border-white focus:outline-none py-2.5 text-sm sm:text-base font-sans tracking-wide text-white transition-all disabled:opacity-50"
              />
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white transition-all duration-300 group-focus-within:w-full"></span>
            </div>

            {/* Input Email */}
            <div className="flex flex-col gap-2 relative group">
              <label htmlFor="email" className="text-[10px] font-mono tracking-widest text-concrete/60 group-focus-within:text-white transition-colors uppercase">
                {t.form.email}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={formState !== 'IDLE'}
                className="w-full bg-transparent border-b border-white/10 focus:border-white focus:outline-none py-2.5 text-sm sm:text-base font-sans tracking-wide text-white transition-all disabled:opacity-50"
              />
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white transition-all duration-300 group-focus-within:w-full"></span>
            </div>

            {/* Input Message */}
            <div className="flex flex-col gap-2 relative group">
              <label htmlFor="message" className="text-[10px] font-mono tracking-widest text-concrete/60 group-focus-within:text-white transition-colors uppercase">
                {t.form.message}
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                required
                disabled={formState !== 'IDLE'}
                className="w-full bg-transparent border-b border-white/10 focus:border-white focus:outline-none py-2.5 text-sm sm:text-base font-sans tracking-wide text-white transition-all resize-none custom-scrollbar disabled:opacity-50"
              />
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white transition-all duration-300 group-focus-within:w-full"></span>
            </div>

            {/* Submit Button */}
            <div className="relative">
              <motion.button
                type="submit"
                disabled={formState !== 'IDLE'}
                className={`w-full font-mono text-xs sm:text-sm tracking-widest font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer ${
                  formState === 'ERROR' 
                    ? 'bg-red-950/40 text-red-500 border border-red-500/20' 
                    : 'bg-white text-black hover:bg-concrete disabled:bg-white/10 disabled:text-concrete'
                }`}
                whileHover={formState === 'IDLE' ? { scale: 1.01 } : {}}
              >
                {formState === 'SENDING' && (
                  <svg className="animate-spin h-4 w-4 text-concrete" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {formState === 'IDLE' && t.form.submit}
                {formState === 'SENDING' && t.form.sending}
                {formState === 'SUCCESS' && t.form.success}
                {formState === 'ERROR' && t.form.error}
              </motion.button>
            </div>
          </form>

          {/* Success telemetry feedback overlay */}
          <AnimatePresence>
            {formState === 'SUCCESS' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mb-6 text-white"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>

                <h4 className="font-mono text-sm tracking-[0.2em] font-bold text-white mb-2 uppercase">
                  {lang === 'EN' ? 'TRANSMISSION COMPLETE' : 'TRANSMISSÃO COMPLETA'}
                </h4>
                <p className="font-sans font-light text-xs sm:text-sm text-concrete max-w-sm mb-8 leading-relaxed">
                  {t.form.success}
                </p>

                <button
                  onClick={() => setFormState('IDLE')}
                  className="font-mono text-[10px] sm:text-xs tracking-widest px-4 py-2 border border-white/20 rounded-lg hover:bg-white hover:text-black transition-all active:scale-95"
                >
                  {lang === 'EN' ? 'NEW TRANSMISSION' : 'NOVA TRANSMISSÃO'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
};

export default ContactSection;
