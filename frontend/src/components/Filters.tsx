"use client";

interface FiltersProps {
  selectedDomain: string;
  selectedLevel: string;
  selectedLanguage: string;
  onChangeDomain: (domain: string) => void;
  onChangeLevel: (level: string) => void;
  onChangeLanguage: (language: string) => void;
  onReset: () => void;
}

export default function Filters({
  selectedDomain,
  selectedLevel,
  selectedLanguage,
  onChangeDomain,
  onChangeLevel,
  onChangeLanguage,
  onReset,
}: FiltersProps) {
  const domains = ['All Domains', 'AI/ML', 'Blockchain', 'Cybersecurity', 'Web Development', 'DevOps', 'Cloud'];
  const levels = ['All Levels', 'Beginner-Friendly', 'Intermediate', 'Advanced'];
  const languages = ['All Languages', 'TypeScript', 'Python', 'Rust', 'Go', 'JavaScript', 'Java', 'C++', 'Ruby'];

<<<<<<< HEAD
  const selectClass = 'w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#f0f6fc] outline-none focus:border-[#1f6feb] focus:bg-[#0d1117] focus:ring-2 focus:ring-[#1f6feb]/30';

  return (
    <aside className="sticky top-24 h-fit w-full rounded-md border border-[#30363d] bg-[#161b22] p-4 shadow-sm lg:w-72">
      <div className="mb-4 border-b border-[#30363d] pb-3">
        <h2 className="text-base font-semibold text-[#f0f6fc]">Filters</h2>
        <p className="mt-1 text-xs text-[#8b949e]">Narrow repositories by stack and contribution fit.</p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#8b949e]">Domain</span>
          <select value={selectedDomain} onChange={(e) => onChangeDomain(e.target.value)} className={selectClass}>
            {domains.map((dom) => <option key={dom} value={dom}>{dom}</option>)}
=======
  const selectClass = 'w-full rounded-md border border-border-color bg-bg-btn px-3 py-2 text-sm text-text-primary outline-none focus:border-[#0969da] focus:bg-bg-card focus:ring-2 focus:ring-[#0969da]/20 dark:focus:bg-bg-card dark:text-text-primary transition';

  return (
    <aside className="sticky top-24 h-fit w-full rounded-md border border-border-color bg-bg-card p-4 shadow-sm lg:w-72 transition duration-200">
      <div className="mb-4 border-b border-border-divider pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Filters</h2>
          <p className="mt-1 text-xs text-text-secondary">Narrow repositories by stack.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline cursor-pointer"
        >
          Clear filters
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="domain-filter" className="text-xs font-semibold text-text-secondary">Domain</label>
          <select id="domain-filter" value={selectedDomain} onChange={(e) => onChangeDomain(e.target.value)} className={selectClass}>
            {domains.map((dom) => <option key={dom} value={dom} className="bg-bg-card text-text-primary">{dom}</option>)}
>>>>>>> a1ea59ddba13503b89a0d3877394e0da728a17a0
          </select>
        </div>

<<<<<<< HEAD
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#8b949e]">Difficulty</span>
          <select value={selectedLevel} onChange={(e) => onChangeLevel(e.target.value)} className={selectClass}>
            {levels.map((level) => <option key={level} value={level}>{level}</option>)}
=======
        <div className="flex flex-col gap-1.5">
          <label htmlFor="difficulty-filter" className="text-xs font-semibold text-text-secondary">Difficulty</label>
          <select id="difficulty-filter" value={selectedLevel} onChange={(e) => onChangeLevel(e.target.value)} className={selectClass}>
            {levels.map((level) => <option key={level} value={level} className="bg-bg-card text-text-primary">{level}</option>)}
>>>>>>> a1ea59ddba13503b89a0d3877394e0da728a17a0
          </select>
        </div>

<<<<<<< HEAD
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#8b949e]">Language</span>
          <select value={selectedLanguage} onChange={(e) => onChangeLanguage(e.target.value)} className={selectClass}>
            {languages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
=======
        <div className="flex flex-col gap-1.5">
          <label htmlFor="language-filter" className="text-xs font-semibold text-text-secondary">Language</label>
          <select id="language-filter" value={selectedLanguage} onChange={(e) => onChangeLanguage(e.target.value)} className={selectClass}>
            {languages.map((lang) => <option key={lang} value={lang} className="bg-bg-card text-text-primary">{lang}</option>)}
>>>>>>> a1ea59ddba13503b89a0d3877394e0da728a17a0
          </select>
        </div>
      </div>
    </aside>
  );
}
