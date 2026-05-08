/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Upload,
  Palette, 
  Type, 
  Zap,
  Instagram,
  Sparkles,
  Layout,
  MessageCircle,
  Briefcase,
  Target,
  FileText,
  AlertCircle,
  Globe,
  Info
} from 'lucide-react';

// --- Types ---

interface ContactChannel {
  id: string;
  type: string;
  value: string;
}

interface ProductService {
  id: string;
  name: string;
  price: string;
  description: string;
  fileName: string;
}

interface MappedFile {
  name: string;
  section: string;
}

interface FormData {
  businessName: string;
  niche: string;
  objectives: string[];
  leadsRedirect: string;
  products: ProductService[];
  services: ProductService[];
  consultancies: ProductService[];
  otherDetails: string;
  otherFileName: string;
  whatsapp: string;
  instagram: string;
  extraChannels: ContactChannel[];
  structureMode: 'manual' | 'specialist' | null;
  manualStructure: string;
  files: MappedFile[];
  colorMode: 'manual' | 'specialist' | null;
  manualColors: string;
  typographyMode: 'manual' | 'specialist' | null;
  manualTypography: string;
  extraNotes: string;
}

// --- Validation Logic ---

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

const validateStep = (step: number, data: FormData): ValidationResult => {
  const missing: string[] = [];
  
  if (step === 1) {
    if (!data.businessName.trim()) missing.push('Nome da Empresa');
    if (!data.niche.trim()) missing.push('Ramo de Atuação');
    if (data.objectives.length === 0) missing.push('Objetivos do Site');
    if (data.objectives.includes('Outros') && !data.otherDetails.trim()) missing.push('Descrição do Outro Objetivo');
    if (!data.whatsapp.trim()) missing.push('WhatsApp');
    if (!data.instagram.trim()) missing.push('Instagram');
  } else if (step === 2) {
    if (data.structureMode === null) missing.push('Escolha de Estrutura');
    if (data.structureMode === 'manual' && !data.manualStructure.trim()) missing.push('Descrição da Estrutura');
    if (data.files.length > 0) {
      const unmapped = data.files.filter(f => !f.section.trim());
      if (unmapped.length > 0) missing.push(`${unmapped.length} arquivo(s) sem indicação de seção`);
    } else {
      missing.push('Nenhum arquivo enviado');
    }
  } else if (step === 3) {
    if (data.colorMode === null) missing.push('Definição de Cores');
    if (data.colorMode === 'manual' && !data.manualColors.trim()) missing.push('Sugestão de Cores');
    if (data.typographyMode === null) missing.push('Definição de Tipografia');
    if (data.typographyMode === 'manual' && !data.manualTypography.trim()) missing.push('Sugestão de Fontes');
  }

  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};

// --- Components ---

const WarningModal = ({ 
  fields, 
  onClose, 
  onConfirm 
}: { 
  fields: string[], 
  onClose: () => void, 
  onConfirm: () => void 
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    />
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="glass-card max-w-2xl w-full p-12 md:p-16 border-amber-500/20 relative z-10 space-y-8"
    >
      <div className="flex items-center gap-6 text-amber-500">
        <div className="p-4 bg-amber-500/10 rounded-[2rem] shadow-xl shadow-amber-500/5">
          <AlertCircle size={44} />
        </div>
        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Campos em Branco</h3>
      </div>
      
      <div className="text-slate-400 text-lg leading-relaxed space-y-6">
        <p>Aviso: Você deixou as seguintes informações em branco:</p>
        <div className="p-8 bg-white/5 rounded-3xl border border-white/5 font-bold text-slate-300 text-sm max-h-48 overflow-y-auto custom-scrollbar flex flex-wrap gap-2">
          {fields.map(f => (
            <span key={f} className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-400 uppercase tracking-widest">{f}</span>
          ))}
        </div>
        <p className="italic text-base text-slate-500 leading-relaxed max-w-md">Tem certeza que deseja pular esta etapa? Isso pode impactar o detalhamento do seu projeto.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button 
          onClick={onClose}
          className="btn-primary w-full !bg-amber-500 hover:!bg-amber-600 shadow-amber-500/10 !py-6 !text-lg !rounded-[2rem] font-black uppercase tracking-widest"
        >
          Voltar e Preencher
        </button>
        <button 
          onClick={onConfirm}
          className="btn-secondary w-full border-white/10 hover:bg-white/5 !text-slate-500 hover:!text-slate-300 !py-6 !text-lg !rounded-[2rem] font-black uppercase tracking-widest"
        >
          Sim, pular e continuar
        </button>
      </div>
    </motion.div>
  </div>
);

// --- Step Views ---

const Step1 = ({ formData, setFormData }: { key?: string, formData: FormData, setFormData: any }) => {
  const toggleObjective = (obj: string) => {
    const next = formData.objectives.includes(obj)
      ? formData.objectives.filter(o => o !== obj)
      : [...formData.objectives, obj];
    setFormData((prev: FormData) => ({ ...prev, objectives: next }));
  };

  const addChannel = () => {
    setFormData((prev: FormData) => ({
      ...prev,
      extraChannels: [...prev.extraChannels, { id: crypto.randomUUID(), type: '', value: '' }]
    }));
  };

  const removeChannel = (id: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      extraChannels: prev.extraChannels.filter(c => c.id !== id)
    }));
  };

  const updateChannel = (id: string, field: 'type' | 'value', value: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      extraChannels: prev.extraChannels.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addItem = (type: 'products' | 'services' | 'consultancies') => {
    if ((formData[type] as any[]).length >= 4) return;
    setFormData((prev: any) => ({
      ...prev,
      [type]: [...prev[type], { id: crypto.randomUUID(), name: '', price: '', description: '', fileName: '' }]
    }));
  };

  const updateItem = (type: 'products' | 'services' | 'consultancies', id: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [type]: prev[type].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (type: 'products' | 'services' | 'consultancies', id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [type]: prev[type].filter((item: any) => item.id !== id)
    }));
  };

  const objectivesList = ['Captar Leads', 'Vender Produto', 'Vender Serviço', 'Agendar Consultoria', 'Outros'];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <div className="glass-card p-10 md:p-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <label className="block">
            <span className="text-sm font-bold text-slate-400 mb-4 block uppercase tracking-widest">Nome da Empresa / Profissional</span>
            <input 
              type="text" 
              placeholder="Ex: Dra. Juliana Silva"
              value={formData.businessName}
              onChange={e => setFormData((prev: any) => ({ ...prev, businessName: e.target.value }))}
              className="input-premium py-4 px-6 text-base"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-400 mb-4 block uppercase tracking-widest">Ramo de Atuação</span>
            <input 
              type="text" 
              placeholder="Ex: Odontologia Estética"
              value={formData.niche}
              onChange={e => setFormData((prev: any) => ({ ...prev, niche: e.target.value }))}
              className="input-premium py-4 px-6 text-base"
            />
          </label>
        </div>

        <div>
          <span className="text-sm font-bold text-slate-400 mb-6 block uppercase tracking-widest flex items-center gap-2">
            <Target size={16} className="text-accent" /> Objetivos do Site
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {objectivesList.map((obj) => (
              <button
                key={obj}
                onClick={() => toggleObjective(obj)}
                className={`px-6 py-5 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between gap-3 uppercase tracking-tight ${
                  formData.objectives.includes(obj) 
                    ? 'bg-accent/20 border-accent/40 text-accent accent-glow shadow-inner' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                }`}
              >
                {obj}
                {formData.objectives.includes(obj) && <CheckCircle2 size={18} />}
              </button>
            ))}
          </div>
          
          <AnimatePresence>
            {formData.objectives.includes('Captar Leads') && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-8 pt-8 border-t border-white/5 space-y-4"
              >
                <label className="block">
                  <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-4">Para onde o lead deve ser redirecionado?</span>
                  <input 
                    type="text" 
                    placeholder="Ex: Meu WhatsApp, Página de Obrigado, Link Calendly..."
                    value={formData.leadsRedirect}
                    onChange={e => setFormData((p: any) => ({ ...p, leadsRedirect: e.target.value }))}
                    className="input-premium py-4 px-6"
                  />
                </label>
              </motion.div>
            )}

            {formData.objectives.includes('Vender Produto') && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-8 pt-8 border-t border-white/5 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">Catálogo de Produtos (Até 4)</span>
                  {formData.products.length < 4 && (
                    <button onClick={() => addItem('products')} className="text-[10px] bg-accent/20 text-accent px-4 py-2 rounded-lg font-black uppercase tracking-widest border border-accent/20 hover:bg-accent/30 transition-all flex items-center gap-2">
                       <Plus size={12} /> Adicionar Produto
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.products.map((prod, idx) => (
                    <div key={prod.id} className="p-6 bg-white/3 rounded-3xl border border-white/5 space-y-4 relative group">
                      <button onClick={() => removeItem('products', prod.id)} className="absolute top-4 right-4 text-slate-700 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Produto #{idx + 1}</p>
                      <input 
                        type="text" 
                        placeholder="Nome do Produto"
                        value={prod.name}
                        onChange={e => updateItem('products', prod.id, 'name', e.target.value)}
                        className="input-premium !bg-black/20"
                      />
                      <input 
                        type="text" 
                        placeholder="Preço (Ex: R$ 197,00)"
                        value={prod.price}
                        onChange={e => updateItem('products', prod.id, 'price', e.target.value)}
                        className="input-premium !bg-black/20"
                      />
                      <textarea 
                        placeholder="Breve descrição ou benefícios..."
                        value={prod.description}
                        onChange={e => updateItem('products', prod.id, 'description', e.target.value)}
                        className="input-premium !bg-black/20 h-24 resize-none"
                      />
                      <div className="relative group/file">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => updateItem('products', prod.id, 'fileName', e.target.files?.[0]?.name || '')}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="px-4 py-3 bg-accent/10 border border-dashed border-accent/30 rounded-xl flex items-center gap-3 group-hover/file:border-accent/60 transition-all">
                           <Upload size={16} className="text-accent" />
                           <span className="text-[11px] font-bold text-slate-300 truncate">
                             {prod.fileName || "Adicionar foto deste produto (Opcional)"}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {formData.objectives.includes('Vender Serviço') && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-8 pt-8 border-t border-white/5 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">Nossos Serviços (Até 4)</span>
                  {formData.services.length < 4 && (
                    <button onClick={() => addItem('services')} className="text-[10px] bg-accent/20 text-accent px-4 py-2 rounded-lg font-black uppercase tracking-widest border border-accent/20 hover:bg-accent/30 transition-all flex items-center gap-2">
                       <Plus size={12} /> Adicionar Serviço
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.services.map((serv, idx) => (
                    <div key={serv.id} className="p-6 bg-white/3 rounded-3xl border border-white/5 space-y-4 relative group">
                      <button onClick={() => removeItem('services', serv.id)} className="absolute top-4 right-4 text-slate-700 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Serviço #{idx + 1}</p>
                      <input 
                        type="text" 
                        placeholder="Nome do Serviço"
                        value={serv.name}
                        onChange={e => updateItem('services', serv.id, 'name', e.target.value)}
                        className="input-premium !bg-black/20"
                      />
                      <input 
                        type="text" 
                        placeholder="Valor (Ex: R$ 500,00 ou 'Sob Consulta')"
                        value={serv.price}
                        onChange={e => updateItem('services', serv.id, 'price', e.target.value)}
                        className="input-premium !bg-black/20"
                      />
                      <textarea 
                        placeholder="O que está incluso no serviço?"
                        value={serv.description}
                        onChange={e => updateItem('services', serv.id, 'description', e.target.value)}
                        className="input-premium !bg-black/20 h-24 resize-none"
                      />
                      <div className="relative group/file">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => updateItem('services', serv.id, 'fileName', e.target.files?.[0]?.name || '')}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="px-4 py-3 bg-accent/10 border border-dashed border-accent/30 rounded-xl flex items-center gap-3 group-hover/file:border-accent/60 transition-all">
                           <Upload size={16} className="text-accent" />
                           <span className="text-[11px] font-bold text-slate-300 truncate">
                             {serv.fileName || "Adicionar foto deste serviço (Opcional)"}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {formData.objectives.includes('Agendar Consultoria') && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-8 pt-8 border-t border-white/5 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">Consultoria & Assessoria (Até 4)</span>
                  {formData.consultancies.length < 4 && (
                    <button onClick={() => addItem('consultancies')} className="text-[10px] bg-accent/20 text-accent px-4 py-2 rounded-lg font-black uppercase tracking-widest border border-accent/20 hover:bg-accent/30 transition-all flex items-center gap-2">
                       <Plus size={12} /> Adicionar Pacote
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.consultancies.map((consult, idx) => (
                    <div key={consult.id} className="p-6 bg-white/3 rounded-3xl border border-white/5 space-y-4 relative group">
                      <button onClick={() => removeItem('consultancies', consult.id)} className="absolute top-4 right-4 text-slate-700 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pacote #{idx + 1}</p>
                      <input 
                        type="text" 
                        placeholder="Nome (Ex: Consultoria Individual)"
                        value={consult.name}
                        onChange={e => updateItem('consultancies', consult.id, 'name', e.target.value)}
                        className="input-premium !bg-black/20"
                      />
                      <input 
                        type="text" 
                        placeholder="Investimento (Ex: R$ 500,00)"
                        value={consult.price}
                        onChange={e => updateItem('consultancies', consult.id, 'price', e.target.value)}
                        className="input-premium !bg-black/20"
                      />
                      <textarea 
                        placeholder="Duração, frequência ou o que está incluso..."
                        value={consult.description}
                        onChange={e => updateItem('consultancies', consult.id, 'description', e.target.value)}
                        className="input-premium !bg-black/20 h-24 resize-none"
                      />
                      <div className="relative group/file">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => updateItem('consultancies', consult.id, 'fileName', e.target.files?.[0]?.name || '')}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="px-4 py-3 bg-accent/10 border border-dashed border-accent/30 rounded-xl flex items-center gap-3 group-hover/file:border-accent/60 transition-all">
                           <Upload size={16} className="text-accent" />
                           <span className="text-[11px] font-bold text-slate-300 truncate">
                             {consult.fileName || "Adicionar foto/banner (Opcional)"}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {formData.objectives.includes('Outros') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-8 border-t border-white/5 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-2">Descreva seu objetivo específico</span>
                    <textarea 
                      placeholder="Dê detalhes do que você precisa no site..."
                      value={formData.otherDetails}
                      onChange={e => setFormData((p: any) => ({ ...p, otherDetails: e.target.value }))}
                      className="input-premium !bg-black/20 h-40 resize-none pt-6"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-4">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Anexar Referência Visual</span>
                    <div className="relative group/file">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setFormData((p: any) => ({ ...p, otherFileName: e.target.files?.[0]?.name || '' }))}
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      />
                      <div className="px-10 py-12 border-2 border-dashed border-white/5 bg-slate-900/50 rounded-[2rem] flex flex-col items-center justify-center text-center group-hover/file:border-accent/40 transition-all">
                        <Upload size={32} className="text-slate-600 group-hover/file:text-accent mb-4 transition-colors" />
                        <p className="text-xs font-bold text-slate-400">{formData.otherFileName || "Selecionar imagem de referência"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-10 border-t border-white/5 space-y-8">
          <span className="text-sm font-bold text-slate-400 block uppercase tracking-widest flex items-center gap-2">
            <MessageCircle size={16} className="text-accent" /> Canais de Contato
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Zap size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                type="text" 
                placeholder="WhatsApp (ex: 21 973629114)"
                value={formData.whatsapp}
                onChange={e => setFormData((prev: any) => ({ ...prev, whatsapp: e.target.value }))}
                className="input-premium pl-14 py-4 pr-6 text-base"
              />
            </div>
            <div className="relative">
              <Instagram size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                type="text" 
                placeholder="Instagram (ex: @meuprovedor)"
                value={formData.instagram}
                onChange={e => setFormData((prev: any) => ({ ...prev, instagram: e.target.value }))}
                className="input-premium pl-14 py-4 pr-6 text-base"
              />
            </div>
          </div>

          <div className="space-y-3">
            {formData.extraChannels.map((channel) => (
              <div key={channel.id} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  placeholder="Canal (ex: LinkedIn)"
                  value={channel.type}
                  onChange={e => updateChannel(channel.id, 'type', e.target.value)}
                  className="w-1/3 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:border-accent/40 outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Link ou ID"
                  value={channel.value}
                  onChange={e => updateChannel(channel.id, 'value', e.target.value)}
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:border-accent/40 outline-none"
                />
                <button 
                  onClick={() => removeChannel(channel.id)}
                  className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button 
              onClick={addChannel}
              className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest hover:text-violet-300 transition-colors pt-2"
            >
              <Plus size={14} /> + Adicionar outro canal
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Step2 = ({ formData, setFormData }: { key?: string, formData: FormData, setFormData: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        name: file.name,
        section: ''
      }));
      setFormData((prev: FormData) => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };

  const updateFileSection = (fileName: string, section: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      files: prev.files.map(f => f.name === fileName ? { ...f, section } : f)
    }));
  };

  const removeFile = (fileName: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      files: prev.files.filter(f => f.name !== fileName)
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="glass-card p-10 md:p-14 space-y-10">
        <span className="text-sm font-bold text-slate-400 mb-4 block uppercase tracking-widest flex items-center gap-2">
          <Layout size={16} className="text-accent" /> Escolha de Estrutura
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, structureMode: 'manual' }))}
            className={`p-8 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col gap-4 ${formData.structureMode === 'manual' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-sm font-black uppercase tracking-widest text-slate-200">Definir seções</p>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.structureMode === 'manual' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.structureMode === 'manual' && <CheckCircle2 size={16} />}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">Eu quero definir as seções do meu site.</p>
          </button>
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, structureMode: 'specialist' }))}
            className={`p-8 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col gap-4 ${formData.structureMode === 'specialist' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-sm font-black uppercase tracking-widest text-slate-200">Dica do Otávio</p>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.structureMode === 'specialist' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.structureMode === 'specialist' && <CheckCircle2 size={16} />}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">Prefiro que o Otávio sugira a estrutura mais estratégica.</p>
          </button>
        </div>

        <AnimatePresence>
          {formData.structureMode === 'manual' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <textarea 
                placeholder="Ex: Introdução, Sobre o Serviço, Depoimentos, Planos..."
                value={formData.manualStructure}
                onChange={e => setFormData((p: any) => ({ ...p, manualStructure: e.target.value }))}
                className="input-premium h-48 resize-none py-6 px-8 text-base"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass-card p-10 md:p-14 space-y-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Upload size={16} className="text-accent" /> Mapeamento de Arquivos
        </h3>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group px-10 py-20 border-2 border-dashed border-white/5 hover:border-accent/40 rounded-[2.5rem] flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-900/40 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Upload size={48} className="text-slate-600 group-hover:text-accent transition-colors mb-6 group-hover:scale-110" />
          <p className="text-lg font-bold text-slate-300">Selecione suas Fotos e Vídeos</p>
          <p className="text-sm text-slate-500 mt-3 uppercase tracking-[0.2em]">Detectamos os nomes automaticamente</p>
          <input 
            type="file" 
            ref={fileInputRef}
            multiple 
            accept="image/*,video/*" 
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="space-y-4">
          {formData.files.map((file, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 items-center p-6 bg-white/3 rounded-3xl border border-white/5"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <FileText size={24} className="text-accent shrink-0" />
                <span className="text-xs font-mono text-slate-400 truncate w-full" title={file.name}>{file.name}</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Em qual parte do site?"
                  value={file.section}
                  onChange={e => updateFileSection(file.name, e.target.value)}
                  className="input-premium sm:w-72 !py-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-accent outline-none"
                />
                <button 
                  onClick={() => removeFile(file.name)}
                  className="p-3 text-slate-700 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Step3 = ({ formData, setFormData }: { key?: string, formData: FormData, setFormData: any }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <div className="glass-card p-10 md:p-14 space-y-10">
        <span className="text-sm font-bold text-slate-400 mb-4 block uppercase tracking-widest flex items-center gap-2">
          <Palette size={16} className="text-accent" /> Definição de Cores
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, colorMode: 'manual' }))}
            className={`p-10 rounded-[2rem] border text-left transition-all relative overflow-hidden flex flex-col gap-4 ${formData.colorMode === 'manual' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
             <div className="flex items-center justify-between w-full">
              <p className="text-sm font-black uppercase tracking-widest text-[#FFF]">Descrever cores</p>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.colorMode === 'manual' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.colorMode === 'manual' && <CheckCircle2 size={16} />}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">Desejo descrever as cores (Ex: Azul marinho com branco).</p>
          </button>
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, colorMode: 'specialist' }))}
            className={`p-10 rounded-[2rem] border text-left transition-all relative overflow-hidden flex flex-col gap-4 ${formData.colorMode === 'specialist' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
             <div className="flex items-center justify-between w-full">
              <p className="text-sm font-black uppercase tracking-widest text-[#FFF]">Confiar no Otávio</p>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.colorMode === 'specialist' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.colorMode === 'specialist' && <CheckCircle2 size={16} />}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">Prefiro que o Otávio escolha a paleta mais adequada.</p>
          </button>
        </div>

        <AnimatePresence>
          {formData.colorMode === 'manual' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <input 
                type="text" 
                placeholder="Ex: Tons pastéis com detalhes em dourado..."
                value={formData.manualColors}
                onChange={e => setFormData((p: any) => ({ ...p, manualColors: e.target.value }))}
                className="input-premium py-5 px-8 text-base"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass-card p-10 md:p-14 space-y-10">
        <span className="text-sm font-bold text-slate-400 mb-4 block uppercase tracking-widest flex items-center gap-2">
          <Type size={16} className="text-accent" /> Definição de Tipografia
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, typographyMode: 'manual' }))}
            className={`p-10 rounded-[2rem] border text-left transition-all relative overflow-hidden flex flex-col gap-4 ${formData.typographyMode === 'manual' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
             <div className="flex items-center justify-between w-full">
              <p className="text-sm font-black uppercase tracking-widest text-[#FFF]">Sugerir estilos</p>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.typographyMode === 'manual' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.typographyMode === 'manual' && <CheckCircle2 size={16} />}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">Desejo sugerir estilos de fontes.</p>
          </button>
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, typographyMode: 'specialist' }))}
            className={`p-10 rounded-[2rem] border text-left transition-all relative overflow-hidden flex flex-col gap-4 ${formData.typographyMode === 'specialist' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
             <div className="flex items-center justify-between w-full">
              <p className="text-sm font-black uppercase tracking-widest text-[#FFF]">Critério do Designer</p>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.typographyMode === 'specialist' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.typographyMode === 'specialist' && <CheckCircle2 size={16} />}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">Deixar a escolha das fontes sob critério do Otávio.</p>
          </button>
        </div>

        <AnimatePresence>
          {formData.typographyMode === 'manual' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <input 
                type="text" 
                placeholder="Ex: Fontes modernas e minimalistas sem serifa..."
                value={formData.manualTypography}
                onChange={e => setFormData((p: any) => ({ ...p, manualTypography: e.target.value }))}
                className="input-premium py-5 px-8 text-base"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Step4 = ({ formData, setFormData }: { key?: string, formData: FormData, setFormData: any }) => {
  const compileMessage = useCallback(() => {
    let msg = `🚀 *NOVO BRIEFING - PORTAL DO OTÁVIO*\n\n`;
    msg += `🏢 *EMPRESA:* ${formData.businessName || 'Não informado'}\n`;
    msg += `💼 *RAMO:* ${formData.niche || 'Não informado'}\n`;
    msg += `🎯 *OBJETIVOS:* ${formData.objectives.length > 0 ? formData.objectives.join(', ') : 'Não informado'}\n`;
    
    if (formData.objectives.includes('Captar Leads')) {
      msg += `📍 *LEADS:* Redirecionar para: ${formData.leadsRedirect || 'Não informado'}\n`;
    }

    if (formData.objectives.includes('Vender Produto') && formData.products.length > 0) {
      msg += `\n📦 *CATÁLOGO DE PRODUTOS:*\n`;
      formData.products.forEach((p, idx) => {
        msg += `🔹 ${p.name}\n`;
        if (p.price) msg += `   💰 Preço: ${p.price}\n`;
        if (p.fileName) msg += `   🖼️ Foto: ${p.fileName}\n`;
        if (p.description) msg += `   📝 Obs: ${p.description}\n`;
        msg += `\n`;
      });
    }

    if (formData.objectives.includes('Vender Serviço') && formData.services.length > 0) {
      msg += `\n🛠️ *CATÁLOGO DE SERVIÇOS:*\n`;
      formData.services.forEach((s, idx) => {
        msg += `🔹 ${s.name}\n`;
        if (s.price) msg += `   💰 Valor: ${s.price}\n`;
        if (s.fileName) msg += `   🖼️ Foto: ${s.fileName}\n`;
        if (s.description) msg += `   📝 Detalhes: ${s.description}\n`;
        msg += `\n`;
      });
    }

    if (formData.objectives.includes('Agendar Consultoria') && formData.consultancies.length > 0) {
      msg += `\n🗓️ *CONSULTORIA & ASSESSORIA:*\n`;
      formData.consultancies.forEach((c) => {
        msg += `🔹 ${c.name}\n`;
        if (c.price) msg += `   💰 Investimento: ${c.price}\n`;
        if (c.fileName) msg += `   🖼️ Foto: ${c.fileName}\n`;
        if (c.description) msg += `   📝 Descrição: ${c.description}\n`;
        msg += `\n`;
      });
    }

    if (formData.objectives.includes('Outros')) {
      msg += `\n❓ *OUTROS DETALHES:* ${formData.otherDetails || 'Não informado'}\n`;
      if (formData.otherFileName) msg += `   🖼️ Ref. Visual: ${formData.otherFileName}\n`;
    }

    msg += `\n📱 *CONTATOS:*\n`;
    msg += `- WhatsApp: ${formData.whatsapp || 'Não informado'}\n`;
    msg += `- Instagram: ${formData.instagram || 'Não informado'}\n`;
    formData.extraChannels.forEach(c => {
      if (c.type && c.value) msg += `- ${c.type}: ${c.value}\n`;
    });

    msg += `\n✨ *ESTRUTURA:* ${formData.structureMode === 'specialist' ? 'Pelo olhar do Otávio' : (formData.manualStructure || 'Não informada')}\n`;
    
    if (formData.files.length > 0) {
      msg += `\n📂 *MAPEAMENTO DE ARQUIVOS GERAIS:*\n`;
      formData.files.forEach((f, idx) => {
        msg += `${idx + 1}. ${f.name} (Seção: ${f.section || 'Não informada'})\n`;
      });
    }

    msg += `\n🎨 *DESIGN & IDENTIDADE:*\n`;
    msg += `- Cores: ${formData.colorMode === 'specialist' ? 'O Otávio escolhe' : (formData.manualColors || 'Não informado')}\n`;
    msg += `- Fontes: ${formData.typographyMode === 'specialist' ? 'O Otávio escolhe' : (formData.manualTypography || 'Não informado')}\n`;

    if (formData.extraNotes) {
      msg += `\n📝 *OBSERVAÇÕES EXTRAS:*\n${formData.extraNotes}\n`;
    }

    return msg;
  }, [formData]);

  const handleSend = () => {
    const text = encodeURIComponent(compileMessage());
    window.open(`https://wa.me/5521973629114?text=${text}`, '_blank');
  };

  const WhatsAppLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-2.531c1.562.934 3.451 1.427 5.383 1.428h.005c5.896 0 10.693-4.797 10.696-10.696.002-2.857-1.11-5.544-3.134-7.568-2.025-2.024-4.712-3.136-7.568-3.137-5.898 0-10.694 4.797-10.697 10.696-.001 2.031.569 4.013 1.65 5.753l-1.077 3.929 4.042-1.06zm10.98-7.142c-.301-.151-1.782-.879-2.057-.979-.275-.1-.475-.151-.675.151-.2.301-.776.979-.951 1.179-.175.2-.351.225-.651.075-.3-.151-1.268-.467-2.417-1.492-.893-.796-1.496-1.78-1.671-2.079-.175-.3-.018-.463.132-.612.135-.133.301-.351.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.491-.508-.675-.518-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.026-1.05 2.503 0 1.478 1.075 2.903 1.225 3.102.15.2 2.115 3.227 5.125 4.525.715.309 1.274.494 1.708.632.718.228 1.37.196 1.885.119.574-.086 1.782-.728 2.032-1.429.25-.701.25-1.301.175-1.429-.075-.128-.275-.201-.575-.351z"/>
    </svg>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="glass-card p-8 md:p-14 lg:p-20 space-y-10 sm:space-y-12">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#25D366]/20 accent-glow shadow-[#25D366]/20">
            <CheckCircle2 size={40} className="sm:hidden" />
            <CheckCircle2 size={44} className="hidden sm:block" />
          </div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">Revisão Visual</h3>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-sm sm:max-w-md mx-auto leading-relaxed">Confira cada detalhe do seu site estratégico antes do envio.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 text-left">
          {/* Header Info */}
          <div className="space-y-6 p-8 sm:p-10 bg-white/3 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5">
            <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.25em] flex items-center gap-3">
              <Briefcase size={14} /> O Negócio
            </h4>
            <div className="space-y-2">
              <p className="text-base sm:text-lg text-slate-100 font-black uppercase">{formData.businessName || 'Empresa não informada'}</p>
              <p className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-widest">{formData.niche || 'Ramo não informado'}</p>
            </div>
            
            <div className="pt-4 border-t border-white/5 space-y-3">
              <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Objetivos Selecionados</h5>
              <div className="flex flex-wrap gap-2">
                {formData.objectives.map(obj => (
                  <span key={obj} className="px-3 py-1.5 bg-accent/5 border border-accent/20 rounded-lg text-[10px] font-bold text-accent uppercase">{obj}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Design Info */}
          <div className="space-y-6 p-8 sm:p-10 bg-white/3 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5">
            <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.25em] flex items-center gap-3">
              <Sparkles size={14} /> Estética & Identidade
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Palette size={18} className="text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Cores</p>
                  <p className="text-xs sm:text-sm text-slate-300 italic">{formData.colorMode === 'specialist' ? 'Expertise do Designer' : (formData.manualColors || 'Não informado')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Type size={18} className="text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Tipografia</p>
                  <p className="text-xs sm:text-sm text-slate-300 italic">{formData.typographyMode === 'specialist' ? 'Expertise do Designer' : (formData.manualTypography || 'Não informado')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products & Services Summary */}
          {(formData.products.length > 0 || formData.services.length > 0) && (
            <div className="lg:col-span-2 space-y-6 p-8 sm:p-10 bg-white/3 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5">
              <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.25em] flex items-center gap-3">
                <Zap size={14} /> Funil de Ofertas (Itens & Fotos)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.products.map(p => (
                  <div key={p.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Produto</p>
                    <p className="text-xs font-bold text-white truncate">{p.name || '(Sem nome)'}</p>
                    <p className="text-[10px] text-accent font-black">{p.price || '(Sem preço)'}</p>
                    <div className="mt-2 py-2 px-3 bg-accent/5 rounded-lg border border-dashed border-accent/20 flex items-center gap-2 overflow-hidden">
                      <Upload size={10} className="text-accent shrink-0" />
                      <span className="text-[9px] font-bold text-slate-400 truncate">{p.fileName || 'Sem mídia vinculada'}</span>
                    </div>
                  </div>
                ))}
                {formData.services.map(s => (
                  <div key={s.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Serviço</p>
                    <p className="text-xs font-bold text-white truncate">{s.name || '(Sem nome)'}</p>
                    <p className="text-[10px] text-accent font-black">{s.price || '(Sem valor)'}</p>
                    <div className="mt-2 py-2 px-3 bg-accent/5 rounded-lg border border-dashed border-accent/20 flex items-center gap-2 overflow-hidden">
                      <Upload size={10} className="text-accent shrink-0" />
                      <span className="text-[9px] font-bold text-slate-400 truncate">{s.fileName || 'Sem mídia vinculada'}</span>
                    </div>
                  </div>
                ))}
                {formData.consultancies.map(c => (
                   <div key={c.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consultoria/Assessoria</p>
                    <p className="text-xs font-bold text-white truncate">{c.name || '(Sem nome)'}</p>
                    <p className="text-[10px] text-accent font-black">{c.price || '(Sem valor)'}</p>
                    <div className="mt-2 py-2 px-3 bg-accent/5 rounded-lg border border-dashed border-accent/20 flex items-center gap-2 overflow-hidden">
                      <Upload size={10} className="text-accent shrink-0" />
                      <span className="text-[9px] font-bold text-slate-400 truncate">{c.fileName || 'Sem mídia vinculada'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex items-start gap-4 sm:gap-6 text-left">
          <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed italic">
            REFA DE OURO: Ao clicar em enviar, seu WhatsApp abrirá com o resumo. <span className="text-amber-500 font-bold underline decoration-amber-500/30 underline-offset-4 uppercase tracking-tighter">É vital anexar TODAS as fotos e vídeos</span> que você selecionou durante os passos anteriores diretamente na conversa.
          </p>
        </div>

        {/* Extra Notes */}
        <div className="space-y-4 p-8 sm:p-10 bg-white/3 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 text-left">
          <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.25em] flex items-center gap-3">
            <FileText size={14} /> Observações Extras
          </h4>
          <textarea 
            placeholder="Algum detalhe crucial que não mencionou? Digite aqui..."
            value={formData.extraNotes}
            onChange={e => setFormData((prev: any) => ({ ...prev, extraNotes: e.target.value }))}
            className="input-premium !bg-black/20 h-32 resize-none pt-4"
          />
        </div>

        <button 
          onClick={handleSend}
          className="btn-primary w-full !bg-[#25D366] hover:!bg-[#20bd5c] !py-8 sm:!py-10 !text-lg sm:!text-2xl !rounded-[2rem] sm:!rounded-[3rem] shadow-emerald-500/20 tracking-widest font-black uppercase text-center flex items-center justify-center gap-3 sm:gap-4"
        >
          <WhatsAppLogo />
          <span className="truncate">Enviar Briefing para Otávio</span>
        </button>
      </div>
    </motion.div>
  );
};

// --- Main App Controller ---

export default function App() {
  const [step, setStep] = useState(1);
  const [showWarning, setShowWarning] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    niche: '',
    objectives: [],
    leadsRedirect: '',
    products: [],
    services: [],
    consultancies: [],
    otherDetails: '',
    otherFileName: '',
    whatsapp: '',
    instagram: '',
    extraChannels: [],
    structureMode: null,
    manualStructure: '',
    files: [],
    colorMode: null,
    manualColors: '',
    typographyMode: null,
    manualTypography: '',
    extraNotes: ''
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleNext = () => {
    const { isValid, missingFields: missing } = validateStep(step, formData);
    if (!isValid) {
      setMissingFields(missing);
      setShowWarning(true);
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    setShowWarning(false);
    nextStep();
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-950/20 via-slate-950 to-slate-950" />
      <div className="fixed top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="h-16 sm:h-20 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 bg-slate-950/30 backdrop-blur-2xl shrink-0 z-50">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-lg flex items-center justify-center text-white accent-glow">
            <Briefcase size={16} className="sm:hidden" />
            <Briefcase size={20} className="hidden sm:block" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight uppercase leading-none">Portal <span className="text-accent underline decoration-accent/20 underline-offset-2 text-xs sm:text-lg">Briefing</span></h1>
            <p className="text-[8px] sm:text-[10px] text-slate-600 uppercase tracking-widest mt-0.5 sm:mt-1">by Otávio</p>
          </div>
        </div>
        
        <div className="flex gap-1.5 sm:gap-2 items-center scale-90 sm:scale-110 md:scale-125 lg:scale-150 transform transition-transform">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              className={`w-8 sm:w-12 h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-accent shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-white/5'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 md:p-12 lg:p-20">
        <div className="max-w-[1200px] mx-auto pb-10">
          <div className="mb-10 sm:mb-16 text-center lg:text-left space-y-3 sm:space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-accent">
                <Sparkles size={10} /> Passo {step} de 4
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                {step === 1 && "Foco no Negócio"}
                {step === 2 && "Estrutura & Mídia"}
                {step === 3 && "Visual & Tom"}
                {step === 4 && "Confirmação"}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl">
                {step === 1 && "Defina a essência e o funil de ofertas que guiarão o projeto."}
                {step === 2 && "Como as seções se organizam e quais arquivos darão vida à página."}
                {step === 3 && "Cores e tipografia que comunicam autoridade e atraem conversão."}
                {step === 4 && "Finalize o envio e comece a ver seu projeto se tornar realidade."}
              </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && <Step1 key="s1" formData={formData} setFormData={setFormData} />}
            {step === 2 && <Step2 key="s2" formData={formData} setFormData={setFormData} />}
            {step === 3 && <Step3 key="s3" formData={formData} setFormData={setFormData} />}
            {step === 4 && <Step4 key="s4" formData={formData} setFormData={setFormData} />}
          </AnimatePresence>
        </div>
      </main>

      {/* Actions */}
      <footer className="h-20 sm:h-24 bg-slate-950/50 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between px-4 sm:px-8 shrink-0">
        <button 
          onClick={prevStep}
          disabled={step === 1}
          className="btn-secondary !py-2.5 !px-4 sm:!py-3 sm:!px-6 flex items-center gap-2 disabled:opacity-0 pointer-events-auto text-xs sm:text-sm"
        >
          <ChevronLeft size={16} className="sm:w-5 sm:h-5" /> Anterior
        </button>

        <div className="flex items-center gap-4">
           {step < 4 && (
            <button 
              onClick={handleNext}
              className="btn-primary !py-2.5 !px-6 sm:!py-3 sm:!px-10 group text-xs sm:text-sm"
            >
              Próximo <ChevronRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
           )}
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showWarning && (
          <WarningModal 
            fields={missingFields}
            onClose={() => setShowWarning(false)}
            onConfirm={handleSkip}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
