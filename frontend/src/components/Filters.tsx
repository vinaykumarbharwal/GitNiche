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
  const domains = [
    'All Domains',
    'AI/ML',
    'Blockchain',
    'Cybersecurity',
    'Web Development',
    'DevOps',
    'Cloud',
  ];

  const levels = ['All Levels', 'Beginner-Friendly', 'Intermediate', 'Advanced'];

  const languages = [
    'All Languages',
    'TypeScript',
    'Python',
    'Rust',
    'Go',
    'JavaScript',
    'Java',
    'C++',
    'Ruby',
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md h-fit w-full lg:w-80 flex flex-col gap-6 sticky top-24">
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-4 bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Refine Results
        </h2>
        <div className="h-px bg-slate-800/80 w-full mb-6"></div>
      </div>

      {/* Domain Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Domain</label>
        <div className="relative">
          <select
            value={selectedDomain}
            onChange={(e) => onChangeDomain(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm cursor-pointer appearance-none"
          >
            {domains.map((dom) => (
              <option key={dom} value={dom} className="bg-slate-950">
                {dom}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Experience Level Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty Level</label>
        <div className="relative">
          <select
            value={selectedLevel}
            onChange={(e) => onChangeLevel(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm cursor-pointer appearance-none"
          >
            {levels.map((level) => (
              <option key={level} value={level} className="bg-slate-950">
                {level}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Language Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tech Language</label>
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm cursor-pointer appearance-none"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang} className="bg-slate-950">
                {lang}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
