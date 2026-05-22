import React, { useState, useEffect } from 'react';
import { Atom, FlaskConical, Pi, CheckSquare, Square, ChevronDown, Trash2, GripVertical, Plus, X, Pencil } from 'lucide-react';
import confetti from 'canvas-confetti';

const continuousSprayConfetti = () => {
  const duration = 2000; 
  const end = Date.now() + duration;
  const leftCannon = confetti.create(null, { resize: true });
  const rightCannon = confetti.create(null, { resize: true });
  const fire = () => {
    leftCannon({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, gravity: 0.8, ticks: 150, colors: ['#3b82f6', '#f59e0b', '#ec4899'] });
    rightCannon({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, gravity: 0.8, ticks: 150, colors: ['#3b82f6', '#f59e0b', '#ec4899'] });
    if (Date.now() < end) requestAnimationFrame(fire);
  };
  fire();
};

const defaultSyllabus = [
  { id: 'p1', subject: 'Physics', title: 'Units and Measurements', priority: 'None' },
  { id: 'p2', subject: 'Physics', title: 'Kinematics', priority: 'None' },
  { id: 'p3', subject: 'Physics', title: 'Laws of Motion', priority: 'None' },
  { id: 'p4', subject: 'Physics', title: 'Work Energy and Power', priority: 'None' },
  { id: 'p5', subject: 'Physics', title: 'System of Particles and Rotational Motion', priority: 'None' },
  { id: 'p6', subject: 'Physics', title: 'Gravitation', priority: 'None' },
  { id: 'p7', subject: 'Physics', title: 'Properties of Bulk Matter', priority: 'None' },
  { id: 'p8', subject: 'Physics', title: 'Thermodynamics', priority: 'None' },
  { id: 'p9', subject: 'Physics', title: 'Kinetic Theory of Gases', priority: 'None' },
  { id: 'p10', subject: 'Physics', title: 'Oscillations', priority: 'None' },
  { id: 'p11', subject: 'Physics', title: 'Waves', priority: 'None' },
  { id: 'p12', subject: 'Physics', title: 'Electrostatics', priority: 'None' },
  { id: 'p13', subject: 'Physics', title: 'Current Electricity', priority: 'None' },
  { id: 'p14', subject: 'Physics', title: 'Magnetic Effects of Current', priority: 'None' },
  { id: 'p15', subject: 'Physics', title: 'Magnetism and Matter', priority: 'None' },
  { id: 'p16', subject: 'Physics', title: 'Electromagnetic Induction', priority: 'None' },
  { id: 'p17', subject: 'Physics', title: 'Alternating Current', priority: 'None' },
  { id: 'p18', subject: 'Physics', title: 'Electromagnetic Waves', priority: 'None' },
  { id: 'p19', subject: 'Physics', title: 'Ray Optics', priority: 'None' },
  { id: 'p20', subject: 'Physics', title: 'Wave Optics', priority: 'None' },
  { id: 'p21', subject: 'Physics', title: 'Dual Nature of Radiation and Matter', priority: 'None' },
  { id: 'p22', subject: 'Physics', title: 'Atoms', priority: 'None' },
  { id: 'p23', subject: 'Physics', title: 'Nuclei', priority: 'None' },
  { id: 'p24', subject: 'Physics', title: 'Semiconductor Electronics', priority: 'None' },
  { id: 'c1', subject: 'Chemistry', title: 'Some Basic Concepts of Chemistry', priority: 'None' },
  { id: 'c2', subject: 'Chemistry', title: 'Structure of Atom', priority: 'None' },
  { id: 'c3', subject: 'Chemistry', title: 'Classification of Elements', priority: 'None' },
  { id: 'c4', subject: 'Chemistry', title: 'Chemical Bonding', priority: 'None' },
  { id: 'c5', subject: 'Chemistry', title: 'States of Matter', priority: 'None' },
  { id: 'c6', subject: 'Chemistry', title: 'Thermodynamics', priority: 'None' },
  { id: 'c7', subject: 'Chemistry', title: 'Equilibrium', priority: 'None' },
  { id: 'c8', subject: 'Chemistry', title: 'Redox Reactions', priority: 'None' },
  { id: 'c9', subject: 'Chemistry', title: 'Hydrogen', priority: 'None' },
  { id: 'c10', subject: 'Chemistry', title: 's-Block Elements', priority: 'None' },
  { id: 'c11', subject: 'Chemistry', title: 'p-Block Elements', priority: 'None' },
  { id: 'c12', subject: 'Chemistry', title: 'Organic Chemistry Basics', priority: 'None' },
  { id: 'c13', subject: 'Chemistry', title: 'Hydrocarbons', priority: 'None' },
  { id: 'c14', subject: 'Chemistry', title: 'Environmental Chemistry', priority: 'None' },
  { id: 'c15', subject: 'Chemistry', title: 'Solid State', priority: 'None' },
  { id: 'c16', subject: 'Chemistry', title: 'Solutions', priority: 'None' },
  { id: 'c17', subject: 'Chemistry', title: 'Electrochemistry', priority: 'None' },
  { id: 'c18', subject: 'Chemistry', title: 'Chemical Kinetics', priority: 'None' },
  { id: 'c19', subject: 'Chemistry', title: 'Surface Chemistry', priority: 'None' },
  { id: 'c20', subject: 'Chemistry', title: 'd and f Block Elements', priority: 'None' },
  { id: 'c21', subject: 'Chemistry', title: 'Coordination Compounds', priority: 'None' },
  { id: 'c22', subject: 'Chemistry', title: 'Haloalkanes and Haloarenes', priority: 'None' },
  { id: 'c23', subject: 'Chemistry', title: 'Alcohols Phenols and Ethers', priority: 'None' },
  { id: 'c24', subject: 'Chemistry', title: 'Aldehydes Ketones and Carboxylic Acids', priority: 'None' },
  { id: 'c25', subject: 'Chemistry', title: 'Amines', priority: 'None' },
  { id: 'c26', subject: 'Chemistry', title: 'Biomolecules', priority: 'None' },
  { id: 'c27', subject: 'Chemistry', title: 'Polymers', priority: 'None' },
  { id: 'c28', subject: 'Chemistry', title: 'Salt Hydrolysis', priority: 'None' },
  { id: 'c29', subject: 'Chemistry', title: 'Chemistry in Everyday Life', priority: 'None' },
  { id: 'm1', subject: 'Mathematics', title: 'Sets Relations and Functions', priority: 'None' },
  { id: 'm2', subject: 'Mathematics', title: 'Complex Numbers', priority: 'None' },
  { id: 'm3', subject: 'Mathematics', title: 'Quadratic Equations', priority: 'None' },
  { id: 'm4', subject: 'Mathematics', title: 'Permutations and Combinations', priority: 'None' },
  { id: 'm5', subject: 'Mathematics', title: 'Binomial Theorem', priority: 'None' },
  { id: 'm6', subject: 'Mathematics', title: 'Sequences and Series', priority: 'None' },
  { id: 'm7', subject: 'Mathematics', title: 'Limits Continuity and Differentiability', priority: 'None' },
  { id: 'm8', subject: 'Mathematics', title: 'Methods of Differentiation', priority: 'None' },
  { id: 'm9', subject: 'Mathematics', title: 'Application of Derivatives', priority: 'None' },
  { id: 'm10', subject: 'Mathematics', title: 'Indefinite Integration', priority: 'None' },
  { id: 'm11', subject: 'Mathematics', title: 'Definite Integration', priority: 'None' },
  { id: 'm12', subject: 'Mathematics', title: 'Area Under Curves', priority: 'None' },
  { id: 'm13', subject: 'Mathematics', title: 'Differential Equations', priority: 'None' },
  { id: 'm14', subject: 'Mathematics', title: 'Coordinate Geometry Basics', priority: 'None' },
  { id: 'm15', subject: 'Mathematics', title: 'Straight Lines', priority: 'None' },
  { id: 'm16', subject: 'Mathematics', title: 'Circles', priority: 'None' },
  { id: 'm17', subject: 'Mathematics', title: 'Parabola', priority: 'None' },
  { id: 'm18', subject: 'Mathematics', title: 'Ellipse', priority: 'None' },
  { id: 'm19', subject: 'Mathematics', title: 'Hyperbola', priority: 'None' },
  { id: 'm20', subject: 'Mathematics', title: 'Vectors', priority: 'None' },
  { id: 'm21', subject: 'Mathematics', title: '3D Geometry', priority: 'None' },
  { id: 'm22', subject: 'Mathematics', title: 'Probability', priority: 'None' },
  { id: 'm23', subject: 'Mathematics', title: 'Statistics', priority: 'None' },
  { id: 'm24', subject: 'Mathematics', title: 'Trigonometric Ratios and Identities', priority: 'None' },
  { id: 'm25', subject: 'Mathematics', title: 'Trigonometric Equations', priority: 'None' },
  { id: 'm26', subject: 'Mathematics', title: 'Properties of Triangles', priority: 'None' },
  { id: 'm27', subject: 'Mathematics', title: 'Inverse Trigonometry', priority: 'None' },
  { id: 'm28', subject: 'Mathematics', title: 'Matrices and Determinants', priority: 'None' }
];

const defaultMaterials = { Physics: ['NCERT', 'PYQS', 'MODULES'], Chemistry: ['PYQS', 'SHEET', 'DPPS'], Mathematics: ['NCERT', 'PYQS', 'MODULES'] };

export default function SyllabusView({ themeToggle, timerIsland }) {
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [isEditMode, setIsEditMode] = useState(false);
  const [openPriorityId, setOpenPriorityId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);

  const [syllabus, setSyllabus] = useState(() => { const saved = localStorage.getItem('tracker-syllabus'); return saved ? JSON.parse(saved) : defaultSyllabus; });
  const [materials, setMaterials] = useState(() => { const saved = localStorage.getItem('tracker-materials'); return saved ? JSON.parse(saved) : defaultMaterials; });

  useEffect(() => { localStorage.setItem('tracker-syllabus', JSON.stringify(syllabus)); }, [syllabus]);
  useEffect(() => { localStorage.setItem('tracker-materials', JSON.stringify(materials)); }, [materials]);

  useEffect(() => {
    const closeDropdown = (e) => { if (!e.target.closest('.priority-dropdown')) setOpenPriorityId(null); };
    document.addEventListener('mousedown', closeDropdown); return () => document.removeEventListener('mousedown', closeDropdown);
  }, []);

  const activeChapters = syllabus.filter(ch => ch.subject === activeSubject);
  const activeMats = materials[activeSubject] || [];
  const totalTasks = activeChapters.length * activeMats.length;
  const completedTasks = activeChapters.reduce((acc, chap) => {
    let count = 0;
    activeMats.forEach((mat, idx) => { if (chap.progress ? chap.progress[mat] : chap[`col${idx + 1}`]) count++; });
    return acc + count;
  }, 0);
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const toggleCheckbox = (id, matName, matIndex) => {
    setSyllabus(prev => prev.map(ch => {
      if (ch.id === id) {
        const legacyKey = `col${matIndex + 1}`; const prog = ch.progress || {}; const currentVal = prog[matName] !== undefined ? prog[matName] : ch[legacyKey];
        if (!currentVal) continuousSprayConfetti(); return { ...ch, progress: { ...prog, [matName]: !currentVal }, [legacyKey]: !currentVal };
      }
      return ch;
    }));
  };

  const updatePriority = (id, value) => setSyllabus(prev => prev.map(ch => ch.id === id ? { ...ch, priority: value } : ch));
  const renameChapter = (id, oldTitle) => { const newTitle = prompt("Rename Chapter:", oldTitle); if (newTitle && newTitle.trim()) setSyllabus(prev => prev.map(ch => ch.id === id ? { ...ch, title: newTitle.trim() } : ch)); };
  const deleteChapter = (id) => { if (confirm("Delete this chapter?")) setSyllabus(prev => prev.filter(ch => ch.id !== id)); };
  const addChapter = () => { const title = prompt(`Enter new chapter name for ${activeSubject}:`); if (title && title.trim()) setSyllabus([...syllabus, { id: `new_${Date.now()}`, subject: activeSubject, title: title.trim(), priority: 'None', progress: {} }]); };
  const addMaterial = () => { const mat = prompt("Enter new material column:"); if (mat && mat.trim()) setMaterials(prev => ({ ...prev, [activeSubject]: [...(prev[activeSubject] || []), mat.trim().toUpperCase()] })); };
  const removeMaterial = (mat) => { if (confirm(`Delete column ${mat}?`)) setMaterials(prev => ({ ...prev, [activeSubject]: prev[activeSubject].filter(m => m !== mat) })); };
  const handleDragStart = (e, id) => { setDraggedId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDrop = (e, targetId) => { e.preventDefault(); if (draggedId === targetId || !draggedId) return; const newSyllabus = [...syllabus]; const sourceIdx = newSyllabus.findIndex(c => c.id === draggedId); const targetIdx = newSyllabus.findIndex(c => c.id === targetId); const [movedChapter] = newSyllabus.splice(sourceIdx, 1); newSyllabus.splice(targetIdx, 0, movedChapter); setSyllabus(newSyllabus); setDraggedId(null); };

  const getRowColor = (priority) => {
    if (priority === 'High') return 'bg-red-500/10 dark:bg-red-500/10 border-red-500/20';
    if (priority === 'Medium') return 'bg-yellow-500/10 dark:bg-yellow-500/10 border-yellow-500/20';
    if (priority === 'Low') return 'bg-green-500/10 dark:bg-green-500/10 border-green-500/20';
    return 'bg-transparent border-slate-200/40 dark:border-slate-700/40 hover:bg-slate-500/10';
  };

  const gridColumns = `50px 1fr repeat(${activeMats.length}, minmax(80px, 100px)) 130px`;

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl h-full w-full flex flex-col transition-colors duration-300 relative rounded-[32px] shadow-2xl border border-white/20 overflow-hidden mb-2 mr-2">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-300/40 dark:border-slate-700/50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white tracking-tight select-none">Syllabus</h2>
            {isEditMode && (
              <div className="flex gap-2 ml-4">
                <button onClick={addChapter} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-2.5 rounded-full text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform shadow-lg border border-white/20"><Plus size={18} /></button>
                <button onClick={addMaterial} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded-full text-purple-600 dark:text-purple-400 hover:scale-105 transition-transform text-xs font-black shadow-lg border border-white/20 uppercase tracking-widest">+ Col</button>
              </div>
            )}
          </div>
          
          <div className="relative flex w-[350px] bg-slate-300/30 dark:bg-black/30 backdrop-blur-xl p-1.5 rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/5 z-0">
            <div className="absolute top-1.5 bottom-1.5 rounded-full bg-white/90 dark:bg-white/20 shadow-md border border-white/60 dark:border-white/30 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
                 style={{ width: 'calc(33.33% - 4px)', transform: `translateX(${['Physics', 'Chemistry', 'Mathematics'].indexOf(activeSubject) * 100}%)` }}></div>
            {['Physics', 'Chemistry', 'Mathematics'].map(sub => (
              <button key={sub} onClick={() => setActiveSubject(sub)} className={`relative flex-1 flex justify-center items-center gap-1.5 py-1.5 text-sm z-10 transition-all duration-300 ${activeSubject === sub ? 'text-slate-900 dark:text-white font-black drop-shadow-sm scale-105' : 'text-slate-500/60 dark:text-slate-300/50 font-bold'}`}>
                {sub === 'Physics' ? <Atom size={16}/> : sub === 'Chemistry' ? <FlaskConical size={16}/> : <Pi size={16}/>} {sub === 'Mathematics' ? 'Maths' : sub}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{progressPercent}% Done</span>
            <div className="w-32 h-2.5 bg-slate-300/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner border border-slate-300/30 dark:border-slate-700/50">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
          <div className="w-px h-6 bg-slate-300/50 dark:bg-slate-700/50"></div>
          <button onClick={() => setIsEditMode(!isEditMode)} className={`px-5 py-1.5 text-xs font-extrabold rounded-full transition-all shadow-sm ${isEditMode ? 'bg-blue-600 text-white shadow-blue-500/30 border border-blue-400' : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80'}`}>
            {isEditMode ? 'Done Editing' : 'Edit Details'}
          </button>
          <div className="flex items-center gap-3 ml-2">
             {timerIsland}
             {themeToggle}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-transparent relative hide-scrollbar p-6">
        <div className="w-full max-w-6xl mx-auto rounded-3xl border border-slate-300/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30 overflow-hidden shadow-sm backdrop-blur-md">
          <div className="grid gap-4 p-4 border-b border-slate-300/50 dark:border-slate-700/50 bg-slate-200/40 dark:bg-slate-800/40 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-xl" style={{ gridTemplateColumns: gridColumns }}>
            <div className="text-center">#</div><div>Chapter</div>
            {activeMats.map((mat, idx) => (<div key={idx} className="flex items-center justify-center gap-1.5">{mat}{isEditMode && <X size={14} onClick={() => removeMaterial(mat)} className="text-red-400 hover:text-red-500 cursor-pointer ml-1" />}</div>))}
            <div className="text-center">Priority</div>
          </div>

          <div className="flex flex-col">
            {activeChapters.map((chapter, idx) => {
              const isChapterDone = activeMats.length > 0 && activeMats.every(mat => chapter.progress?.[mat]);
              return (
                <div key={chapter.id} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, chapter.id)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, chapter.id)} className={`grid gap-4 p-4 border-b items-center transition-colors ${isChapterDone ? 'bg-slate-500/10 grayscale opacity-60' : getRowColor(chapter.priority)} ${draggedId === chapter.id ? 'opacity-50' : ''}`} style={{ gridTemplateColumns: gridColumns }}>
                  <div className="flex justify-center items-center">{isEditMode ? <GripVertical size={16} className="text-slate-400 cursor-grab hover:text-blue-500" /> : <span className="text-sm font-bold text-slate-500 dark:text-slate-500">{idx + 1}</span>}</div>
                  <div className="flex items-center justify-between pr-4">
                    <span className={`text-sm font-extrabold tracking-tight truncate mr-2 ${isChapterDone ? 'line-through text-slate-500' : chapter.priority !== 'None' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{chapter.title}</span>
                    {isEditMode && (<div className="flex items-center gap-2"><Pencil size={15} className="text-slate-400 hover:text-blue-500 cursor-pointer" onClick={() => renameChapter(chapter.id, chapter.title)} /><Trash2 size={15} className="text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => deleteChapter(chapter.id)} /></div>)}
                  </div>
                  {activeMats.map((mat, matIdx) => {
                    const isDone = chapter.progress ? chapter.progress[mat] : chapter[`col${matIdx + 1}`];
                    return (<div key={matIdx} className="flex justify-center cursor-pointer" onClick={() => toggleCheckbox(chapter.id, mat, matIdx)}>{isDone ? <CheckSquare size={20} className="text-blue-500 drop-shadow-md" /> : <Square size={20} className="text-slate-400 dark:text-slate-500 hover:text-blue-400 transition-colors" />}</div>)
                  })}
                  <div className="flex justify-center priority-dropdown">
                    <div className="relative w-full max-w-[100px]">
                      <div onClick={() => setOpenPriorityId(openPriorityId === chapter.id ? null : chapter.id)} className={`flex justify-between items-center px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors border backdrop-blur-sm ${chapter.priority === 'High' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' : chapter.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 border-yellow-500/30' : chapter.priority === 'Low' ? 'bg-green-500/20 text-green-600 dark:text-green-500 border-green-500/30' : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}>
                        <span>{chapter.priority}</span><ChevronDown size={14} className="opacity-70" />
                      </div>
                      {openPriorityId === chapter.id && (<div className="absolute top-full left-0 mt-1 w-32 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-300/50 dark:border-slate-700/50 rounded-2xl shadow-xl z-50 overflow-hidden p-1">{['None', 'Low', 'Medium', 'High'].map(p => (<div key={p} onClick={() => { updatePriority(chapter.id, p); setOpenPriorityId(null); }} className={`px-3 py-2 text-xs font-bold cursor-pointer transition-colors rounded-xl ${chapter.priority === p ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>{p}</div>))}</div>)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
