"use client";

interface FiltersProps {
  selectedDomain: string;
  selectedLevel: string;
  selectedLanguage: string;
  onChangeDomain: (domain: string) => void;
  onChangeLevel: (level: string) => void;
  onChangeLanguage: (language: string) => void;
}

export default function Filters({
  selectedDomain,
  selectedLevel,
  selectedLanguage,
  onChangeDomain,
  onChangeLevel,
  onChangeLanguage,
}: FiltersProps) {
  const domains = ['All Domains', 'AI/ML', 'Blockchain', 'Cybersecurity', 'Web Development', 'DevOps', 'Cloud'];
  const levels = ['All Levels', 'Beginner-Friendly', 'Intermediate', 'Advanced'];
  const languages = ['All Languages', 'TypeScript', 'Python', 'Rust', 'Go', 'JavaScript', 'Java', 'C++', 'Ruby'];

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
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#8b949e]">Difficulty</span>
          <select value={selectedLevel} onChange={(e) => onChangeLevel(e.target.value)} className={selectClass}>
            {levels.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#8b949e]">Language</span>
          <select value={selectedLanguage} onChange={(e) => onChangeLanguage(e.target.value)} className={selectClass}>
            {languages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </label>
      </div>
    </aside>
  );
}
