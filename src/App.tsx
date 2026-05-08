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

interface MappedFile {
  name: string;
  section: string;
}

interface FormData {
  businessName: string;
  niche: string;
  objectives: string[];
  otherObjective: string;
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
    if (data.objectives.includes('Outros') && !data.otherObjective.trim()) missing.push('Descrição do Outro Objetivo');
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
      className="glass-card max-w-md w-full p-8 border-amber-500/20 relative z-10"
    >
      <div className="flex items-center gap-4 text-amber-500 mb-6">
        <div className="p-3 bg-amber-500/10 rounded-2xl">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight">Campos em Branco</h3>
      </div>
      
      <div className="text-slate-400 text-sm mb-6 leading-relaxed">
        Aviso: Você deixou as seguintes informações em branco:
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 font-bold text-slate-300 text-xs max-h-32 overflow-y-auto custom-scrollbar">
          {fields.join(', ')}
        </div>
        <p className="mt-4 italic">Tem certeza que deseja pular esta etapa? Isso pode impactar o detalhamento do seu projeto.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={onClose}
          className="btn-primary w-full !bg-amber-500 hover:!bg-amber-600 shadow-amber-500/10"
        >
          Voltar e Preencher
        </button>
        <button 
          onClick={onConfirm}
          className="btn-secondary w-full border-white/10 hover:bg-white/5 !text-slate-500 hover:!text-slate-300"
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

  const objectivesList = ['Captar Leads', 'Vender Produto', 'Vender Serviço', 'Agendar Consultoria', 'Outros'];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="glass-card p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-widest">Nome da Empresa / Profissional</span>
            <input 
              type="text" 
              placeholder="Ex: Dra. Juliana Silva"
              value={formData.businessName}
              onChange={e => setFormData((prev: any) => ({ ...prev, businessName: e.target.value }))}
              className="input-premium"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-widest">Ramo de Atuação</span>
            <input 
              type="text" 
              placeholder="Ex: Odontologia Estética"
              value={formData.niche}
              onChange={e => setFormData((prev: any) => ({ ...prev, niche: e.target.value }))}
              className="input-premium"
            />
          </label>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 mb-4 block uppercase tracking-widest flex items-center gap-2">
            <Target size={14} className="text-accent" /> Objetivos do Site
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {objectivesList.map((obj) => (
              <button
                key={obj}
                onClick={() => toggleObjective(obj)}
                className={`px-4 py-3 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between gap-2 uppercase tracking-tight ${
                  formData.objectives.includes(obj) 
                    ? 'bg-accent/20 border-accent/40 text-accent accent-glow shadow-inner' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                }`}
              >
                {obj}
                {formData.objectives.includes(obj) && <CheckCircle2 size={14} />}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {formData.objectives.includes('Outros') && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <input 
                  type="text" 
                  placeholder="Descreva seu outro objetivo..."
                  value={formData.otherObjective}
                  onChange={e => setFormData((p: any) => ({ ...p, otherObjective: e.target.value }))}
                  className="input-premium"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-6">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-widest flex items-center gap-2">
            <MessageCircle size={14} className="text-accent" /> Canais de Contato
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Zap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                type="text" 
                placeholder="WhatsApp (ex: 21 973629114)"
                value={formData.whatsapp}
                onChange={e => setFormData((prev: any) => ({ ...prev, whatsapp: e.target.value }))}
                className="input-premium pl-12"
              />
            </div>
            <div className="relative">
              <Instagram size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                type="text" 
                placeholder="Instagram (ex: @meuprovedor)"
                value={formData.instagram}
                onChange={e => setFormData((prev: any) => ({ ...prev, instagram: e.target.value }))}
                className="input-premium pl-12"
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
      <div className="glass-card p-8 space-y-6">
        <span className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-widest flex items-center gap-2">
          <Layout size={14} className="text-accent" /> Escolha de Estrutura
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, structureMode: 'manual' }))}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col gap-2 ${formData.structureMode === 'manual' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-xs font-black uppercase tracking-widest text-slate-200">Definir seções</p>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.structureMode === 'manual' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.structureMode === 'manual' && <CheckCircle2 size={14} />}
              </div>
            </div>
            <p className="text-[10px] leading-relaxed">Eu quero definir as seções do meu site.</p>
          </button>
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, structureMode: 'specialist' }))}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col gap-2 ${formData.structureMode === 'specialist' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-xs font-black uppercase tracking-widest text-slate-200">Dica do Otávio</p>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.structureMode === 'specialist' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.structureMode === 'specialist' && <CheckCircle2 size={14} />}
              </div>
            </div>
            <p className="text-[10px] leading-relaxed">Prefiro que o Otávio sugira a estrutura mais estratégica.</p>
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
                className="input-premium h-32 resize-none pt-4"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass-card p-8 space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Upload size={14} className="text-accent" /> Mapeamento de Arquivos
        </h3>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group px-6 py-10 border-2 border-dashed border-white/5 hover:border-accent/40 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-900/40 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Upload size={32} className="text-slate-600 group-hover:text-accent transition-colors mb-4 group-hover:scale-110" />
          <p className="text-sm font-bold text-slate-300">Selecione suas Fotos e Vídeos</p>
          <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em]">Detectamos os nomes automaticamente</p>
          <input 
            type="file" 
            ref={fileInputRef}
            multiple 
            accept="image/*,video/*" 
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="space-y-3">
          {formData.files.map((file, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-3 items-center p-4 bg-white/3 rounded-2xl border border-white/5"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText size={18} className="text-accent shrink-0" />
                <span className="text-[11px] font-mono text-slate-400 truncate w-full" title={file.name}>{file.name}</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Em qual parte do site?"
                  value={file.section}
                  onChange={e => updateFileSection(file.name, e.target.value)}
                  className="flex-1 sm:w-56 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-accent outline-none"
                />
                <button 
                  onClick={() => removeFile(file.name)}
                  className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
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
      className="space-y-6"
    >
      <div className="glass-card p-8 space-y-6">
        <span className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-widest flex items-center gap-2">
          <Palette size={14} className="text-accent" /> Definição de Cores
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, colorMode: 'manual' }))}
            className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col gap-2 ${formData.colorMode === 'manual' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
             <div className="flex items-center justify-between w-full">
              <p className="text-xs font-black uppercase tracking-widest text-[#FFF]">Descrever cores</p>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.colorMode === 'manual' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.colorMode === 'manual' && <CheckCircle2 size={14} />}
              </div>
            </div>
            <p className="text-[10px] leading-relaxed">Desejo descrever as cores (Ex: Azul marinho com branco).</p>
          </button>
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, colorMode: 'specialist' }))}
            className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col gap-2 ${formData.colorMode === 'specialist' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
             <div className="flex items-center justify-between w-full">
              <p className="text-xs font-black uppercase tracking-widest text-[#FFF]">Confiar no Otávio</p>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.colorMode === 'specialist' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.colorMode === 'specialist' && <CheckCircle2 size={14} />}
              </div>
            </div>
            <p className="text-[10px] leading-relaxed">Prefiro que o Otávio escolha a paleta mais adequada.</p>
          </button>
        </div>

        <AnimatePresence>
          {formData.colorMode === 'manual' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input 
                type="text" 
                placeholder="Ex: Tons pastéis com detalhes em dourado..."
                value={formData.manualColors}
                onChange={e => setFormData((p: any) => ({ ...p, manualColors: e.target.value }))}
                className="input-premium"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass-card p-8 space-y-6">
        <span className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-widest flex items-center gap-2">
          <Type size={14} className="text-accent" /> Definição de Tipografia
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, typographyMode: 'manual' }))}
            className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col gap-2 ${formData.typographyMode === 'manual' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
             <div className="flex items-center justify-between w-full">
              <p className="text-xs font-black uppercase tracking-widest text-[#FFF]">Sugerir estilos</p>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.typographyMode === 'manual' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.typographyMode === 'manual' && <CheckCircle2 size={14} />}
              </div>
            </div>
            <p className="text-[10px] leading-relaxed">Desejo sugerir estilos de fontes.</p>
          </button>
          <button 
            onClick={() => setFormData((p: any) => ({ ...p, typographyMode: 'specialist' }))}
            className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col gap-2 ${formData.typographyMode === 'specialist' ? 'bg-accent/10 border-accent/40 shadow-inner' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500'}`}
          >
             <div className="flex items-center justify-between w-full">
              <p className="text-xs font-black uppercase tracking-widest text-[#FFF]">Critério do Designer</p>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.typographyMode === 'specialist' ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                {formData.typographyMode === 'specialist' && <CheckCircle2 size={14} />}
              </div>
            </div>
            <p className="text-[10px] leading-relaxed">Deixar a escolha das fontes sob critério do Otávio.</p>
          </button>
        </div>

        <AnimatePresence>
          {formData.typographyMode === 'manual' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input 
                type="text" 
                placeholder="Ex: Fontes modernas e minimalistas sem serifa..."
                value={formData.manualTypography}
                onChange={e => setFormData((p: any) => ({ ...p, manualTypography: e.target.value }))}
                className="input-premium"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Step4 = ({ formData }: { key?: string, formData: FormData }) => {
  const compileMessage = useCallback(() => {
    let msg = `🚀 *NOVO BRIEFING - PORTAL DO OTÁVIO*\n\n`;
    msg += `🏢 *EMPRESA:* ${formData.businessName || 'Não informado'}\n`;
    msg += `💼 *RAMO:* ${formData.niche || 'Não informado'}\n`;
    msg += `🎯 *OBJETIVOS:* ${formData.objectives.length > 0 ? formData.objectives.join(', ') : 'Não informado'}`;
    if (formData.objectives.includes('Outros')) msg += ` (${formData.otherObjective || 'Descrição não informada'})`;
    msg += `\n\n📱 *CONTATOS:*\n`;
    msg += `- WhatsApp: ${formData.whatsapp || 'Não informado'}\n`;
    msg += `- Instagram: ${formData.instagram || 'Não informado'}\n`;
    formData.extraChannels.forEach(c => {
      if (c.type && c.value) msg += `- ${c.type}: ${c.value}\n`;
    });

    msg += `\n✨ *ESTRUTURA:* ${formData.structureMode === 'specialist' ? 'Pelo olhar do Otávio' : (formData.manualStructure || 'Não informada')}\n`;
    
    if (formData.files.length > 0) {
      msg += `\n📂 *MAPEAMENTO DE ARQUIVOS:*\n`;
      formData.files.forEach((f, idx) => {
        msg += `${idx + 1}. ${f.name} (Seção: ${f.section || 'Não informada'})\n`;
      });
    }

    msg += `\n🎨 *DESIGN & IDENTIDADE:*\n`;
    msg += `- Cores: ${formData.colorMode === 'specialist' ? 'O Otávio escolhe' : (formData.manualColors || 'Não informado')}\n`;
    msg += `- Fontes: ${formData.typographyMode === 'specialist' ? 'O Otávio escolhe' : (formData.manualTypography || 'Não informado')}\n`;

    return msg;
  }, [formData]);

  const handleSend = () => {
    const text = encodeURIComponent(compileMessage());
    window.open(`https://wa.me/5521973629114?text=${text}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="glass-card p-10 space-y-10">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#25D366]/20">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Revisão Final</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Confira os dados coletados abaixo antes de finalizar o seu pedido.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-4 p-6 bg-white/3 rounded-3xl border border-white/5">
            <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
              <Briefcase size={12} /> Negócio & Objetivos
            </h4>
            <div className="space-y-1.5">
              <p className="text-sm text-slate-100 font-bold">{formData.businessName || 'Empresa (Não informado)'}</p>
              <p className="text-[11px] text-slate-500">{formData.niche || 'Ramo (Não informado)'}</p>
              <p className="text-[10px] text-slate-400 mt-2">{formData.objectives.length > 0 ? formData.objectives.join(', ') : 'Objetivos (Não informado)'}</p>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-white/3 rounded-3xl border border-white/5">
            <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles size={12} /> Identidade Visual
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette size={14} className="text-slate-600" />
                <p className="text-[11px] text-slate-400">Cores: <span className="text-slate-200">{formData.colorMode === 'specialist' ? 'A critério do designer' : (formData.manualColors || 'Não informado')}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <Type size={14} className="text-slate-600" />
                <p className="text-[11px] text-slate-400">Fontes: <span className="text-slate-200">{formData.typographyMode === 'specialist' ? 'A critério do designer' : (formData.manualTypography || 'Não informado')}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6 flex items-start gap-4 text-left">
          <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed italic">
            Aviso importante: Ao clicar em enviar, o WhatsApp abrirá com o resumo. <span className="text-amber-500 font-bold underline decoration-amber-500/30 underline-offset-4">Lembre-se de anexar as fotos e vídeos diretamente na conversa</span> para que o Otávio receba os arquivos originais e com máxima qualidade.
          </p>
        </div>

        <button 
          onClick={handleSend}
          className="btn-primary w-full !bg-[#25D366] hover:!bg-[#20bd5c] !py-6 !text-lg !rounded-[2rem] shadow-emerald-500/10"
        >
          <MessageCircle size={28} />
          Enviar Briefing para o Otávio
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
    otherObjective: '',
    whatsapp: '',
    instagram: '',
    extraChannels: [],
    structureMode: null,
    manualStructure: '',
    files: [],
    colorMode: null,
    manualColors: '',
    typographyMode: null,
    manualTypography: ''
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
    <div className="h-screen flex flex-col bg-[#020617] text-slate-100 font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-950/20 via-slate-950 to-slate-950" />
      <div className="fixed top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/30 backdrop-blur-2xl shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white accent-glow">
            <Briefcase size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">Portal <span className="text-accent underline decoration-accent/20 underline-offset-2">Briefing</span></h1>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">Design Premium by Otávio</p>
          </div>
        </div>
        
        <div className="flex gap-1 items-center scale-90 sm:scale-100">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              className={`w-10 h-1 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-accent shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'bg-white/5'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
        <div className="max-w-[1000px] mx-auto">
          <div className="mb-12 text-center lg:text-left space-y-3">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent">
                <Sparkles size={10} /> Passo {step} de 4
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                {step === 1 && "Sobre seu Negócio"}
                {step === 2 && "Arquitetura & Mídias"}
                {step === 3 && "Identidade Visual"}
                {step === 4 && "Pronto para Enviar"}
              </h2>
              <p className="text-slate-500 text-sm md:text-base max-w-2xl">
                {step === 1 && "Fale um pouco sobre o que você faz para que possamos criar algo que ressoe com seu público."}
                {step === 2 && "Configure como as seções serão exibidas e anexe os arquivos essenciais do projeto."}
                {step === 3 && "O visual dita o tom. Escolha suas preferências de estilo ou deixe sob nosso critério técnico."}
                {step === 4 && "Confira o resumo geral. Notou algo errado? Volte e ajuste agora mesmo."}
              </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && <Step1 key="s1" formData={formData} setFormData={setFormData} />}
            {step === 2 && <Step2 key="s2" formData={formData} setFormData={setFormData} />}
            {step === 3 && <Step3 key="s3" formData={formData} setFormData={setFormData} />}
            {step === 4 && <Step4 key="s4" formData={formData} />}
          </AnimatePresence>
        </div>
      </main>

      {/* Actions */}
      <footer className="h-24 bg-slate-950/50 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between px-8 sm:px-12 shrink-0">
        <button 
          onClick={prevStep}
          disabled={step === 1}
          className="btn-secondary flex items-center gap-2 disabled:opacity-0 pointer-events-auto"
        >
          <ChevronLeft size={18} /> Voltar
        </button>

        <div className="flex items-center gap-4">
           {step < 4 && (
            <button 
              onClick={handleNext}
              className="btn-primary group"
            >
              Próximo <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
