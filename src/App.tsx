import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUp, 
  RotateCcw, 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Activity,
  ClipboardList,
  Paperclip,
  Brain,
  Pencil,
  Trash2,
  Plus,
  FileText,
  Check,
  FileCode,
  Presentation,
  File,
  Inbox,
  Loader2
} from 'lucide-react';
import { cn } from './lib/utils';

// Context to track edits
const EditContext = React.createContext({ onEdit: () => {} });

// Helper to check if a node is hidden
const isNodeHidden = (node: HTMLElement) => {
  return node.style.display === 'none' || node.classList.contains('hidden');
};

// Editable text wrapper for normal text
const EditableText = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { onEdit } = React.useContext(EditContext);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(e.currentTarget);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const isAtStart = preCaretRange.toString().length === 0;

    const postCaretRange = range.cloneRange();
    postCaretRange.selectNodeContents(e.currentTarget);
    postCaretRange.setStart(range.endContainer, range.endOffset);
    const isAtEnd = postCaretRange.toString().length === 0;

    if (e.key === 'Backspace' && isAtStart) {
      e.preventDefault();
      let prevNode = e.currentTarget.previousElementSibling as HTMLElement;
      while (prevNode && isNodeHidden(prevNode)) {
        prevNode = prevNode.previousElementSibling as HTMLElement;
      }
      if (prevNode) {
        if (prevNode.classList.contains('inline-field') || prevNode.classList.contains('deletable-block')) {
          let nodeBeforeField = prevNode.previousElementSibling as HTMLElement;
          while (nodeBeforeField && isNodeHidden(nodeBeforeField)) {
            nodeBeforeField = nodeBeforeField.previousElementSibling as HTMLElement;
          }
          prevNode.style.display = 'none';
          onEdit();
          if (nodeBeforeField && nodeBeforeField.getAttribute('contenteditable') === 'true') {
            setTimeout(() => {
              const newRange = document.createRange();
              newRange.selectNodeContents(nodeBeforeField);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }, 0);
          }
        } else if (prevNode.getAttribute('contenteditable') === 'true') {
          setTimeout(() => {
            const newRange = document.createRange();
            newRange.selectNodeContents(prevNode);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }, 0);
        }
      }
    } else if (e.key === 'Delete' && isAtEnd) {
      e.preventDefault();
      let nextNode = e.currentTarget.nextElementSibling as HTMLElement;
      while (nextNode && isNodeHidden(nextNode)) {
        nextNode = nextNode.nextElementSibling as HTMLElement;
      }
      if (nextNode) {
        if (nextNode.classList.contains('inline-field') || nextNode.classList.contains('deletable-block')) {
          nextNode.style.display = 'none';
          onEdit();
        } else if (nextNode.getAttribute('contenteditable') === 'true') {
          setTimeout(() => {
            const newRange = document.createRange();
            newRange.selectNodeContents(nextNode);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }, 0);
        }
      }
    } else if (e.key === 'ArrowLeft' && isAtStart) {
      e.preventDefault();
      let prevNode = e.currentTarget.previousElementSibling as HTMLElement;
      while (prevNode && isNodeHidden(prevNode)) {
        prevNode = prevNode.previousElementSibling as HTMLElement;
      }
      if (prevNode && prevNode.getAttribute('contenteditable') === 'true') {
        setTimeout(() => {
          const newRange = document.createRange();
          newRange.selectNodeContents(prevNode);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }, 0);
      }
    } else if (e.key === 'ArrowRight' && isAtEnd) {
      e.preventDefault();
      let nextNode = e.currentTarget.nextElementSibling as HTMLElement;
      while (nextNode && isNodeHidden(nextNode)) {
        nextNode = nextNode.nextElementSibling as HTMLElement;
      }
      if (nextNode && nextNode.getAttribute('contenteditable') === 'true') {
        setTimeout(() => {
          const newRange = document.createRange();
          newRange.selectNodeContents(nextNode);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }, 0);
      }
    }
  };

  return (
    <span 
      contentEditable 
      suppressContentEditableWarning 
      onInput={() => onEdit()}
      onKeyDown={handleKeyDown}
      className={cn("outline-none focus:bg-gray-50 rounded px-1 -mx-1 cursor-text", className)}
    >
      {children}
    </span>
  );
};

// --- Types ---
type AgentType = 'lesson' | 'plan' | 'report' | null;
type PlanMode = 'group' | 'individual';
type ReportMode = 'group' | 'individual';
type ReportDataSource = 'single' | 'multiple';

type Template = {
  id: string;
  name: string;
  type: 'system' | 'custom';
};

const initialTemplates: Template[] = [
  { id: 'sys-1', name: '通用', type: 'system' },
  { id: 'sys-2', name: '模板一', type: 'system' },
];

export const GENDER_OPTIONS = ['男', '女'];
export const PLAN_CYCLE_OPTIONS = ['4 周', '8 周', '12 周', '一学期'];
export const PLAN_FOCUS_OPTIONS = ['耐力', '力量', '柔韧性', '速度与灵敏', '综合体质'];
export const GRADE_OPTIONS = [
  { category: '小学', items: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'] },
  { category: '初中', items: ['七年级', '八年级', '九年级'] },
  { category: '高中', items: ['高一', '高二', '高三'] },
  { category: '大学', items: ['大一', '大二', '大三', '大四'] },
  { category: '成人', items: ['成人'] }
];

type SimpleDropdownOption = string;
type CascadingDropdownOption = {
  category: string;
  items: string[];
};
type DropdownOptions = SimpleDropdownOption[] | CascadingDropdownOption[];

// --- Helper Compon// Inline editable field (the blue text)
const InlineField = ({ 
  value, 
  hasDropdown = false, 
  dropdownOptions,
  onClick, 
  className 
}: { 
  value: string, 
  hasDropdown?: boolean, 
  dropdownOptions?: DropdownOptions,
  onClick?: () => void, 
  className?: string 
}) => {
  const [val, setVal] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLSpanElement>(null);
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const { onEdit } = React.useContext(EditContext);
  
  React.useEffect(() => {
    setVal(value);
    if (spanRef.current && spanRef.current.textContent !== value) {
      spanRef.current.textContent = value;
    }
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isInteractive = onClick || hasDropdown;

  if (isInteractive) {
    const isCascading = dropdownOptions && typeof dropdownOptions[0] !== 'string';
    
    // Initialize active category for cascading dropdown
    React.useEffect(() => {
      if (isOpen && isCascading) {
        const options = dropdownOptions as CascadingDropdownOption[];
        const currentCategory = options.find(opt => opt.items.includes(val))?.category || options[0].category;
        setActiveCategory(currentCategory);
      }
    }, [isOpen, isCascading, dropdownOptions, val]);

    return (
      <span className="relative inline-block" ref={dropdownRef}>
        <span 
          onClick={(e) => {
            if (onClick) onClick();
            if (hasDropdown) {
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            "inline-field inline-flex items-center gap-1 px-3 py-1 mx-1 text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition-colors text-base font-medium border border-gray-200 shadow-sm",
            (onClick || hasDropdown) ? "cursor-pointer" : "cursor-text",
            className
          )}
        >
          {val}
          {hasDropdown && <ChevronDown className="w-4 h-4 text-gray-400" />}
        </span>
        
        {isOpen && dropdownOptions && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden flex w-max">
            {!isCascading ? (
              <div className="flex flex-col min-w-[80px] py-1">
                {(dropdownOptions as string[]).map(option => (
                  <button
                    key={option}
                    className={cn(
                      "px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                      val === option ? "text-blue-600 font-medium bg-blue-50/50" : "text-gray-700"
                    )}
                    onClick={() => {
                      setVal(option);
                      setIsOpen(false);
                      onEdit();
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col w-28 border-r border-gray-100 py-1 bg-gray-50/50">
                  {(dropdownOptions as CascadingDropdownOption[]).map(opt => {
                    const isDirect = opt.items.length === 1 && opt.items[0] === opt.category;
                    return (
                      <button
                        key={opt.category}
                        className={cn(
                          "px-4 py-2 text-left text-sm flex items-center justify-between transition-colors",
                          activeCategory === opt.category ? "text-blue-600 font-medium bg-white" : "text-gray-700 hover:bg-gray-100"
                        )}
                        onMouseEnter={() => {
                          setActiveCategory(opt.category);
                        }}
                        onClick={() => {
                          if (isDirect) {
                            setVal(opt.items[0]);
                            setIsOpen(false);
                            onEdit();
                          } else {
                            setActiveCategory(opt.category);
                          }
                        }}
                      >
                        {opt.category}
                        {!isDirect && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                      </button>
                    );
                  })}
                </div>
                {(() => {
                  const activeOpt = (dropdownOptions as CascadingDropdownOption[]).find(opt => opt.category === activeCategory);
                  const showRightPanel = activeOpt && !(activeOpt.items.length === 1 && activeOpt.items[0] === activeOpt.category);
                  
                  if (!showRightPanel) return null;
                  
                  return (
                    <div className="flex flex-col w-32 py-1 bg-white max-h-[200px] overflow-y-auto">
                      {activeOpt.items.map(item => (
                        <button
                          key={item}
                          className={cn(
                            "px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2",
                            val === item ? "text-blue-600 font-medium" : "text-gray-700"
                          )}
                          onClick={() => {
                            setVal(item);
                            setIsOpen(false);
                            onEdit();
                          }}
                        >
                          {val === item && <Check className="w-3.5 h-3.5" />}
                          <span className={cn(val !== item && "ml-5")}>{item}</span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </span>
    );
  }

  return (
    <span 
      ref={spanRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const newVal = e.currentTarget.textContent || '';
        if (newVal !== val) {
          setVal(newVal);
          onEdit();
        }
      }}
      onInput={() => onEdit()}
      onKeyDown={(e) => {
        const selection = window.getSelection();
        if (!selection || !selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(e.currentTarget);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const isAtStart = preCaretRange.toString().length === 0;

        const postCaretRange = range.cloneRange();
        postCaretRange.selectNodeContents(e.currentTarget);
        postCaretRange.setStart(range.endContainer, range.endOffset);
        const isAtEnd = postCaretRange.toString().length === 0;
        
        const isEmpty = e.currentTarget.textContent === '' || e.currentTarget.textContent === '\u200B';

        if (e.key === 'Backspace' && isAtStart) {
          e.preventDefault();
          let prev = e.currentTarget.previousElementSibling as HTMLElement;
          while (prev && isNodeHidden(prev)) {
            prev = prev.previousElementSibling as HTMLElement;
          }
          if (isEmpty) {
            e.currentTarget.style.display = 'none';
            onEdit();
          }
          if (prev && prev.getAttribute('contenteditable') === 'true') {
            setTimeout(() => {
              const newRange = document.createRange();
              newRange.selectNodeContents(prev);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }, 0);
          }
        } else if (e.key === 'Delete' && isAtEnd) {
          e.preventDefault();
          let next = e.currentTarget.nextElementSibling as HTMLElement;
          while (next && isNodeHidden(next)) {
            next = next.nextElementSibling as HTMLElement;
          }
          if (isEmpty) {
            e.currentTarget.style.display = 'none';
            onEdit();
          }
          if (next && next.getAttribute('contenteditable') === 'true') {
            setTimeout(() => {
              const newRange = document.createRange();
              newRange.selectNodeContents(next);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }, 0);
          }
        } else if (e.key === 'ArrowLeft' && isAtStart) {
          e.preventDefault();
          let prev = e.currentTarget.previousElementSibling as HTMLElement;
          while (prev && isNodeHidden(prev)) {
            prev = prev.previousElementSibling as HTMLElement;
          }
          if (prev && prev.getAttribute('contenteditable') === 'true') {
            setTimeout(() => {
              const newRange = document.createRange();
              newRange.selectNodeContents(prev);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }, 0);
          }
        } else if (e.key === 'ArrowRight' && isAtEnd) {
          e.preventDefault();
          let next = e.currentTarget.nextElementSibling as HTMLElement;
          while (next && isNodeHidden(next)) {
            next = next.nextElementSibling as HTMLElement;
          }
          if (next && next.getAttribute('contenteditable') === 'true') {
            setTimeout(() => {
              const newRange = document.createRange();
              newRange.selectNodeContents(next);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }, 0);
          }
        }
      }}
      className={cn("inline-field inline-block mx-1 px-3 py-1 text-blue-600 bg-white hover:bg-gray-50 focus:bg-white rounded-lg transition-colors text-base font-medium border border-gray-200 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 min-w-[2rem] text-center cursor-text", className)}
    >
      {val}
    </span>
  );
};

// Segmented Control for Group/Individual
const SegmentedControl = ({ 
  value, 
  onChange 
}: { 
  value: 'group' | 'individual', 
  onChange: (v: any) => void 
}) => (
  <div className="flex items-center bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/50">
    <button
      onClick={() => onChange('group')}
      className={cn(
        "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
        value === 'group' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
      )}
    >
      群体
    </button>
    <button
      onClick={() => onChange('individual')}
      className={cn(
        "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
        value === 'individual' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
      )}
    >
      个人
    </button>
  </div>
);

// Form Input for Report Metrics
const MetricInput = ({ value, width = "w-16" }: { value: string, width?: string }) => (
  <input 
    type="text" 
    defaultValue={value}
    className={cn(
      "px-2 py-1 text-center bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-blue-600 font-medium text-sm transition-all shadow-sm",
      width
    )}
  />
);

// --- Main App Component ---

const TemplateModal = ({
  isOpen,
  onClose,
  templates,
  setTemplates,
  selectedTemplateId,
  setSelectedTemplateId,
  previewTemplateId,
  setPreviewTemplateId
}: {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  previewTemplateId: string;
  setPreviewTemplateId: (id: string) => void;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [parsingTemplateId, setParsingTemplateId] = useState<string | null>(null);
  const [fileSizeError, setFileSizeError] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = () => {
    if (parsingTemplateId) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.doc,.docx,.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 1024 * 1024) {
          setFileSizeError(true);
          return;
        }
        
        const newId = `custom-${Date.now()}`;
        const newTemplate: Template = {
          id: newId,
          name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
          type: 'custom'
        };
        setTemplates(prev => [...prev, newTemplate]);
        setPreviewTemplateId(newId);
        setParsingTemplateId(newId);
        
        setTimeout(() => {
          setParsingTemplateId(null);
        }, 2500);
      }
    };
    input.click();
  };

  const handleRename = (id: string, newName: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, name: newName } : t));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const newTemplates = templates.filter(t => t.id !== id);
    setTemplates(newTemplates);
    if (previewTemplateId === id) {
      setPreviewTemplateId('sys-1');
    }
    if (selectedTemplateId === id) {
      setSelectedTemplateId('sys-1');
    }
  };

  const systemTemplates = templates.filter(t => t.type === 'system');
  const customTemplates = templates.filter(t => t.type === 'custom');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] h-[550px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">教学模版</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r border-gray-100 bg-gray-50/50 flex flex-col">
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">系统模板</div>
              <div className="space-y-1 px-2 mb-6">
                {systemTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setPreviewTemplateId(t.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      previewTemplateId === t.id ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {t.name}
                    <ChevronRight className={cn("w-4 h-4", previewTemplateId === t.id ? "text-blue-500" : "text-transparent")} />
                  </button>
                ))}
              </div>

              <div className="px-4 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">我的模板</div>
              <div className="space-y-1 px-2 mb-4">
                {customTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <Inbox className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">暂无自定义模板</p>
                    <p className="text-xs text-gray-400 mt-1">点击下方按钮上传</p>
                  </div>
                ) : (
                  customTemplates.map(t => (
                    <div
                      key={t.id}
                      className={cn(
                        "group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                        previewTemplateId === t.id ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={() => setPreviewTemplateId(t.id)}
                    >
                      {editingId === t.id ? (
                        <input
                          autoFocus
                          className="flex-1 bg-white border border-blue-300 rounded px-1.5 py-0.5 outline-none text-gray-800"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleRename(t.id, editName || t.name)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(t.id, editName || t.name);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {parsingTemplateId === t.id && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
                            )}
                            <span className={cn("truncate", parsingTemplateId === t.id && "text-gray-400")}>
                              {t.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {parsingTemplateId !== t.id && (
                              <>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditName(t.name);
                                    setEditingId(t.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-500 rounded"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTemplateToDelete(t.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col items-center">
              <button
                onClick={handleFileUpload}
                disabled={!!parsingTemplateId}
                className={cn(
                  "w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm transition-colors border border-dashed",
                  parsingTemplateId 
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300 bg-white"
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">上传新模板</span>
              </button>
              <span className="text-xs text-gray-400 mt-2">支持 doc/docx 格式</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-white relative">
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start bg-gray-50/30">
              {parsingTemplateId === previewTemplateId ? (
                <div className="flex flex-col items-center justify-center text-gray-400 h-full w-full">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <FileText className="w-6 h-6 text-blue-500 relative z-10" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">正在解析文档...</h3>
                  <p className="text-sm text-gray-500 max-w-xs text-center">
                    AI 正在读取您的模板结构和内容，请稍候。这可能需要几秒钟时间。
                  </p>
                </div>
              ) : templates.find(t => t.id === previewTemplateId)?.type === 'system' ? (
                previewTemplateId === 'sys-1' ? (
                  <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-sm rounded-lg p-8 my-auto">
                    <h3 className="text-xl font-serif text-center mb-6">新课标水平三《________》体育与健康教案</h3>
                    <table className="w-full border-collapse border border-gray-800 text-sm">
                      <tbody>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center w-20">备课人</td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2 text-center w-16">周次</td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2 text-center w-16">课次</td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2 text-center w-20">授课教师</td>
                          <td className="border border-gray-800 p-2"></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center">教学内容</td>
                          <td className="border border-gray-800 p-2 h-16" colSpan={7}></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center">教学目标</td>
                          <td className="border border-gray-800 p-2 h-16" colSpan={7}></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center">教学重难点</td>
                          <td className="border border-gray-800 p-2 h-16" colSpan={7}></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center bg-gray-50/50">教学过程</td>
                          <td className="border border-gray-800 p-2 text-center font-medium bg-gray-50/50" colSpan={2}>教学内容</td>
                          <td className="border border-gray-800 p-2 text-center font-medium bg-gray-50/50" colSpan={3}>教师活动</td>
                          <td className="border border-gray-800 p-2 text-center font-medium bg-gray-50/50" colSpan={2}>学生活动</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center">准备部分<br/>(8')</td>
                          <td className="border border-gray-800 p-2 h-24" colSpan={2}></td>
                          <td className="border border-gray-800 p-2" colSpan={3}></td>
                          <td className="border border-gray-800 p-2" colSpan={2}></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center">基本部分<br/>(28')</td>
                          <td className="border border-gray-800 p-2 h-32" colSpan={2}></td>
                          <td className="border border-gray-800 p-2" colSpan={3}></td>
                          <td className="border border-gray-800 p-2" colSpan={2}></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center">结束部分<br/>(4')</td>
                          <td className="border border-gray-800 p-2 h-20" colSpan={2}></td>
                          <td className="border border-gray-800 p-2" colSpan={3}></td>
                          <td className="border border-gray-800 p-2" colSpan={2}></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center">场地器材</td>
                          <td className="border border-gray-800 p-2 h-12" colSpan={3}></td>
                          <td className="border border-gray-800 p-2 text-center">预计心率</td>
                          <td className="border border-gray-800 p-2" colSpan={3}></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-sm rounded-lg p-8 my-auto">
                    <h3 className="text-xl font-serif text-center mb-6">________学校《体育与健康》课时计划</h3>
                    <table className="w-full border-collapse border border-gray-800 text-sm">
                      <tbody>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center w-12 bg-gray-100/50">年级</td>
                          <td className="border border-gray-800 p-2 w-16"></td>
                          <td className="border border-gray-800 p-2 text-center w-16 bg-gray-100/50">人数</td>
                          <td className="border border-gray-800 p-2 w-16"></td>
                          <td className="border border-gray-800 p-2 text-center w-12 bg-gray-100/50">日期</td>
                          <td className="border border-gray-800 p-2 w-20"></td>
                          <td className="border border-gray-800 p-2 text-center w-12 bg-gray-100/50">执教</td>
                          <td className="border border-gray-800 p-2 w-20"></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center bg-gray-100/50">班级</td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2 text-center bg-gray-100/50">组织形式</td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2 text-center bg-gray-100/50">周次</td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2 text-center bg-gray-100/50">课次</td>
                          <td className="border border-gray-800 p-2"></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center bg-gray-100/50">学习目标</td>
                          <td className="border border-gray-800 p-2 h-20" colSpan={7}></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center bg-gray-100/50" rowSpan={2}>内容主题</td>
                          <td className="border border-gray-800 p-2 h-16" colSpan={4} rowSpan={2}></td>
                          <td className="border border-gray-800 p-2 text-center bg-gray-100/50">重点</td>
                          <td className="border border-gray-800 p-2" colSpan={2}></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center bg-gray-100/50">难点</td>
                          <td className="border border-gray-800 p-2" colSpan={2}></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 text-center font-medium bg-gray-100/50" rowSpan={2}>课序</td>
                          <td className="border border-gray-800 p-2 text-center font-medium bg-gray-100/50" rowSpan={2}>时间</td>
                          <td className="border border-gray-800 p-2 text-center font-medium bg-gray-100/50" rowSpan={2}>教学内容</td>
                          <td className="border border-gray-800 p-1 text-center font-medium bg-gray-100/50" colSpan={3}>运动负荷</td>
                          <td className="border border-gray-800 p-2 text-center font-medium bg-gray-100/50" rowSpan={2}>教与学的活动</td>
                          <td className="border border-gray-800 p-2 text-center font-medium bg-gray-100/50" rowSpan={2}>组织、队形与数智赋能</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-1 text-center font-medium bg-gray-100/50">次数</td>
                          <td className="border border-gray-800 p-1 text-center font-medium bg-gray-100/50">时间</td>
                          <td className="border border-gray-800 p-1 text-center font-medium bg-gray-100/50">强度</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 h-20"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 h-24"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-800 p-2 h-16"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                          <td className="border border-gray-800 p-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 h-full">
                  <FileText className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">{templates.find(t => t.id === previewTemplateId)?.name}</p>
                  <p className="text-sm mt-2">自定义模板预览</p>
                </div>
              )}
            </div>
            {parsingTemplateId !== previewTemplateId && (
              <div className="p-4 border-t border-gray-100 flex justify-center bg-white">
                <button
                  onClick={() => {
                    setSelectedTemplateId(previewTemplateId);
                    onClose();
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-lg font-medium transition-colors"
                >
                  使用该模版
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {templateToDelete && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50 rounded-xl">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-lg font-medium text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-500 text-sm mb-6">确定要删除这个自定义模板吗？此操作无法撤销。</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setTemplateToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    handleDelete(templateToDelete);
                    setTemplateToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Size Error Modal */}
        {fileSizeError && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50 rounded-xl">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-lg font-medium text-gray-900 mb-2">文件过大，无法上传</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">模板文档不能超过 1MB，请精简内容（如移除高清图片）后重新上传。</p>
              <div className="flex justify-end">
                <button 
                  onClick={() => setFileSizeError(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getFileStyle = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return {
      bg: 'bg-green-50',
      border: 'border-green-200/60',
      text: 'text-green-700',
      iconText: 'text-green-600',
      hoverBg: 'hover:bg-green-200/50',
      btnText: 'text-green-500',
      btnHoverText: 'hover:text-green-700',
      Icon: FileSpreadsheet
    };
  }
  if (['doc', 'docx'].includes(ext)) {
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-200/60',
      text: 'text-blue-700',
      iconText: 'text-blue-600',
      hoverBg: 'hover:bg-blue-200/50',
      btnText: 'text-blue-500',
      btnHoverText: 'hover:text-blue-700',
      Icon: FileText
    };
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return {
      bg: 'bg-orange-50',
      border: 'border-orange-200/60',
      text: 'text-orange-700',
      iconText: 'text-orange-600',
      hoverBg: 'hover:bg-orange-200/50',
      btnText: 'text-orange-500',
      btnHoverText: 'hover:text-orange-700',
      Icon: Presentation
    };
  }
  if (['pdf'].includes(ext)) {
    return {
      bg: 'bg-red-50',
      border: 'border-red-200/60',
      text: 'text-red-700',
      iconText: 'text-red-600',
      hoverBg: 'hover:bg-red-200/50',
      btnText: 'text-red-500',
      btnHoverText: 'hover:text-red-700',
      Icon: FileText
    };
  }
  if (['html', 'css', 'js', 'ts', 'jsx', 'tsx', 'json', 'xml'].includes(ext)) {
    return {
      bg: 'bg-purple-50',
      border: 'border-purple-200/60',
      text: 'text-purple-700',
      iconText: 'text-purple-600',
      hoverBg: 'hover:bg-purple-200/50',
      btnText: 'text-purple-500',
      btnHoverText: 'hover:text-purple-700',
      Icon: FileCode
    };
  }
  // Default (txt, etc.)
  return {
    bg: 'bg-gray-100',
    border: 'border-gray-200/60',
    text: 'text-gray-700',
    iconText: 'text-gray-600',
    hoverBg: 'hover:bg-gray-200/50',
    btnText: 'text-gray-500',
    btnHoverText: 'hover:text-gray-700',
    Icon: FileText
  };
};

export default function App() {
  // State
  const [activeAgent, setActiveAgent] = useState<AgentType>(null);
  const [chatInput, setChatInput] = useState('');
  const [isDeepThinkEnabled, setIsDeepThinkEnabled] = useState(false);
  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const chatFileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [planMode, setPlanMode] = useState<PlanMode>('group');
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  
  // Template State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('sys-1');
  const [previewTemplateId, setPreviewTemplateId] = useState<string>('sys-1');
  
  // Edit tracking state
  const [isEdited, setIsEdited] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isPromptEmpty, setIsPromptEmpty] = useState(false);
  const promptContainerRef = React.useRef<HTMLDivElement>(null);

  const checkPromptEmpty = React.useCallback(() => {
    setTimeout(() => {
      if (!promptContainerRef.current) return;
      
      // Find all text-containing elements that could be part of the prompt
      const elements = promptContainerRef.current.querySelectorAll('span');
      let totalText = '';
      
      elements.forEach(el => {
        // Only count text from elements that are not hidden
        if (el.style.display !== 'none' && !el.classList.contains('hidden')) {
          // If it's an EditableText or InlineField
          if (el.getAttribute('contenteditable') === 'true' || el.classList.contains('inline-field')) {
            totalText += el.textContent || '';
          }
        }
      });
      
      const cleaned = totalText.replace(/[\u200B]/g, '').trim();
      setIsPromptEmpty(cleaned.length === 0);
    }, 0);
  }, []);

  // Report specific state
  const [reportMode, setReportMode] = useState<ReportMode>('group');
  const [reportDataSource, setReportDataSource] = useState<ReportDataSource>('single');
  const [reportHasUploadedFile, setReportHasUploadedFile] = useState(false);

  // Reset prompt empty state when agent or mode changes
  React.useEffect(() => {
    setIsPromptEmpty(false);
  }, [activeAgent, planMode, reportMode, reportDataSource, resetKey]);

  // Handlers
  const handleCloseAgent = () => {
    setActiveAgent(null);
    setHasUploadedFile(false);
    setShowDetails(true);
    setReportHasUploadedFile(false);
    setIsEdited(false);
  };

  const handleAgentSelect = (agent: AgentType) => {
    setActiveAgent(agent);
    setIsEdited(false);
    setResetKey(prev => prev + 1);
    if (agent === 'plan') {
      setPlanMode('group');
      setHasUploadedFile(false);
    } else if (agent === 'report') {
      setReportMode('group');
      setReportDataSource('single');
      setReportHasUploadedFile(false);
    }
    setShowDetails(true);
  };

  const handleRestoreDefault = () => {
    setIsEdited(false);
    setIsPromptEmpty(false);
    setResetKey(prev => prev + 1);
  };

  // Renderers for different content states
  const renderLessonContent = () => {
    const detailsClass = showDetails ? "" : "hidden";
    return (
      <div className="text-gray-700 text-base leading-loose">
        <EditableText>为 </EditableText><InlineField value="三年级" hasDropdown dropdownOptions={GRADE_OPTIONS} /><EditableText> 设计一节 </EditableText><InlineField value="足球" /><EditableText> 课的教案，时长 </EditableText><InlineField value="40" /><EditableText> 分钟，面向 </EditableText><InlineField value="30" /><EditableText> 名学生。</EditableText>
        
        <div className="deletable-block block mt-4 w-full" contentEditable={false}>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors mb-2"
          >
            {showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            更详细描述
          </button>
        </div>
        
        <EditableText className={detailsClass}>教学重点 </EditableText>
        <InlineField className={detailsClass} value="脚内侧传接球" />
        <EditableText className={detailsClass}> ，教学难点 </EditableText>
        <InlineField className={detailsClass} value="传球方向与力度控制" />
        <EditableText className={detailsClass}> ，课程目标聚焦 </EditableText>
        <InlineField className={detailsClass} value="技巧掌握与运用" />
        <EditableText className={detailsClass}> ，运动密度为 </EditableText>
        <InlineField className={detailsClass} value="70%" />
        <EditableText className={detailsClass}> ，运动强度为 </EditableText>
        <InlineField className={detailsClass} value="中等" />
        <EditableText className={detailsClass}> ，可用器材 </EditableText>
        <InlineField className={detailsClass} value="足球 20 个，标志桶 10 个" />
        <EditableText className={detailsClass}> 。</EditableText>
        
        <EditableText>&#8203;</EditableText>
      </div>
    );
  };

  const DownloadDropdown = ({ options, buttonText = "下载数据模板" }: { options?: string[], buttonText?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!options || options.length === 0) {
      return <button className="text-blue-500 hover:text-blue-600 font-medium">{buttonText}</button>;
    }

    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors text-sm font-medium",
            "bg-[#f0f4f8] hover:bg-[#e2e8f0]",
            "text-blue-600"
          )}
        >
          {buttonText}
          <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", isOpen && "rotate-180")} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-50"
            >
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-6 h-7 rounded bg-green-100 text-green-600 flex items-center justify-center shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-bl"></div>
                    <span className="text-[11px] font-bold mt-1">X</span>
                  </div>
                  <span className="truncate">{opt}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderUploadBox = (title: string, hint: string, onUpload: () => void, downloadOptions?: string[], downloadText?: string) => (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{title}</span>
        {(downloadOptions || downloadText) && (
          <DownloadDropdown options={downloadOptions} buttonText={downloadText} />
        )}
      </div>
      
      <div 
        className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors hover:bg-blue-50 cursor-pointer"
        onClick={onUpload}
      >
        <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500 mb-1">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div className="text-gray-700 font-medium">
          拖拽文件到此处 或 <span className="text-blue-500">点击上传</span>
        </div>
        <div className="text-gray-400 text-xs flex items-center justify-center flex-wrap gap-x-1">
          <span>{hint}</span>
          {(downloadOptions || downloadText) && (
            <>
              <span>，建议下载</span>
              <span className="text-blue-500">{downloadText?.replace(/^下载/, '') || "体测成绩模板"}</span>
              <span>文件</span>
            </>
          )}
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 mt-2">
        (点击虚线框模拟上传成功)
      </div>
    </div>
  );

  const renderUploadedFile = (filename: string, onRemove: () => void, promptText: React.ReactNode) => {
    const style = getFileStyle(filename);
    return (
      <div className="flex flex-col gap-4">
        {/* File Token */}
        <div className={cn("flex items-center gap-2 border px-3 py-2 rounded-lg w-fit shadow-sm", style.bg, style.border, style.text)}>
          <style.Icon className={cn("w-4 h-4", style.iconText)} />
          <span className="text-sm font-medium">{filename}</span>
          <button 
            onClick={onRemove}
            className={cn("ml-1 rounded-full p-0.5 transition-colors", style.btnText, style.btnHoverText, style.hoverBg)}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Prompt */}
        <div className="text-gray-700 text-base leading-loose">
          {promptText}
        </div>
      </div>
    );
  };

  const renderPlanGroupPrompt = () => {
    const detailsClass = showDetails ? "" : "hidden";
    return (
      <>
        <EditableText>基于上传的数据，生成一份群体运动计划：计划周期 </EditableText>
        <InlineField value="4 周" hasDropdown dropdownOptions={PLAN_CYCLE_OPTIONS} />
        <EditableText> ，每周 </EditableText>
        <InlineField value="2 节" />
        <EditableText> 体育课，本阶段重点提升 </EditableText>
        <InlineField value="耐力" hasDropdown dropdownOptions={PLAN_FOCUS_OPTIONS} />
        <EditableText> 。</EditableText>

        <div className="deletable-block block mt-4 w-full" contentEditable={false}>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors mb-2"
          >
            {showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            更详细描述
          </button>
        </div>

        <EditableText className={detailsClass}>目前教学项目  </EditableText>
        <InlineField className={detailsClass} value="篮球" />
        <EditableText className={detailsClass}> ，重点关注学生情况 </EditableText>
        <InlineField className={detailsClass} value="有哮喘的学生" />
        <EditableText className={detailsClass}> ，数据采集时间 </EditableText>
        <InlineField className={detailsClass} value="2025 年 9 月" />
        <EditableText className={detailsClass}> 。</EditableText>
      </>
    );
  };

  const renderPlanIndividual = () => {
    const detailsClass = showDetails ? "" : "hidden";
    return (
      <div className="text-gray-700 text-base leading-loose">
        <EditableText>为一名 </EditableText><InlineField value="女" hasDropdown dropdownOptions={GENDER_OPTIONS} /><EditableText> 、 </EditableText><InlineField value="16" /><EditableText> 岁的用户生成一份个人运动计划，身高 </EditableText><InlineField value="172" /><EditableText> 厘米，体重 </EditableText><InlineField value="60" /><EditableText> 千克，单次运动时长 </EditableText><InlineField value="30" /><EditableText> 分钟，运动目的 </EditableText><InlineField value="增强体能" /><EditableText> ，想提升的技能 </EditableText><InlineField value="跑步速度" /><EditableText> 。</EditableText>
        
        <div className="deletable-block block mt-4 w-full" contentEditable={false}>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors mb-2"
          >
            {showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            更详细描述
          </button>
        </div>
        
        <EditableText className={detailsClass}>当前水平 </EditableText>
        <InlineField className={detailsClass} value="初学者" />
        <EditableText className={detailsClass}> ，体测成绩 </EditableText>
        <InlineField className={detailsClass} value="50米跑：5秒" />
        <EditableText className={detailsClass}> ，基础疾病 </EditableText>
        <InlineField className={detailsClass} value="无" />
        <EditableText className={detailsClass}> ，损伤史 </EditableText>
        <InlineField className={detailsClass} value="无" />
        <EditableText className={detailsClass}> 。</EditableText>
        
        <EditableText>&#8203;</EditableText>
      </div>
    );
  };

  const renderReportIndividual = () => (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        {reportDataSource === 'single' ? (
          <motion.div 
            key="single-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col bg-gray-50/80 border border-gray-100 rounded-xl p-5"
          >
            <div className="text-gray-700 text-base leading-loose mb-6 flex flex-wrap items-center gap-x-1">
              <EditableText>为一名</EditableText>
              <InlineField value="女" hasDropdown dropdownOptions={GENDER_OPTIONS} />
              <EditableText>、</EditableText>
              <InlineField value="初三" hasDropdown dropdownOptions={GRADE_OPTIONS} />
              <EditableText>的用户生成体测报告。</EditableText>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              体测数据录入（可填一项或多项）：
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm w-32 shrink-0 flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">·</span> 50 米成绩
                </span>
                <div className="flex items-center gap-2">
                  <MetricInput value="8.4" />
                  <span className="text-gray-500 text-sm w-4">秒</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm w-32 shrink-0 flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">·</span> 立定跳远
                </span>
                <div className="flex items-center gap-2">
                  <MetricInput value="1.95" />
                  <span className="text-gray-500 text-sm w-4">米</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm w-32 shrink-0 flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">·</span> 坐位体前屈
                </span>
                <div className="flex items-center gap-2">
                  <MetricInput value="8.5" />
                  <span className="text-gray-500 text-sm w-4">厘米</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm w-32 shrink-0 flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">·</span> 1分钟仰卧起坐
                </span>
                <div className="flex items-center gap-2">
                  <MetricInput value="40" />
                  <span className="text-gray-500 text-sm w-4">个</span>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:col-span-2 sm:w-[calc(50%-1rem)]">
                <span className="text-gray-600 text-sm w-32 shrink-0 flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">·</span> 800 米跑步
                </span>
                <div className="flex items-center gap-2">
                  <MetricInput value="3" width="w-12" />
                  <span className="text-gray-500 text-sm">分</span>
                  <MetricInput value="40" width="w-12" />
                  <span className="text-gray-500 text-sm w-4">秒</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="multiple-upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {!reportHasUploadedFile ? (
              <div className="flex flex-col">
                {renderUploadBox(
                  "上传多次体测成绩", 
                  "支持格式：Excel / CSV ，文件内容需包含国测项目、成绩",
                  () => setReportHasUploadedFile(true),
                  ['一、二年级', '三、四、五、六年级', '初中及以上（男）', '初中及以上（女）'],
                  "下载体测成绩模板"
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200/60 text-green-700 px-3 py-2 rounded-lg w-fit shadow-sm">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">数据模板.xlsx</span>
                  <button 
                    onClick={() => setReportHasUploadedFile(false)}
                    className="ml-1 text-green-500 hover:text-green-700 bg-green-100/50 hover:bg-green-200/50 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-gray-700 text-base leading-loose px-1 flex flex-wrap items-center gap-x-1">
                  <EditableText>基于上传的数据，为一名</EditableText>
                  <InlineField value="女" hasDropdown dropdownOptions={GENDER_OPTIONS} />
                  <EditableText>、</EditableText>
                  <InlineField value="初三" hasDropdown dropdownOptions={GRADE_OPTIONS} />
                  <EditableText>的用户生成体测报告。</EditableText>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const showSendButton = (() => {
    if (activeAgent === 'plan' && planMode === 'group' && !hasUploadedFile) return false;
    if (activeAgent === 'report' && reportMode === 'group' && !reportHasUploadedFile) return false;
    if (activeAgent === 'report' && reportMode === 'individual' && reportDataSource === 'multiple' && !reportHasUploadedFile) return false;
    return true;
  })();

  const isSendEnabled = (() => {
    if (activeAgent === null) return chatInput.trim().length > 0;
    if (isPromptEmpty) return false;
    return true;
  })();

  const disabledReason = (() => {
    if (activeAgent === null && chatInput.trim().length === 0) {
      return "请输入你的需求";
    }
    if (isPromptEmpty) {
      return "请输入你的需求";
    }
    return "";
  })();

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Main Container */}
      <div className="w-full max-w-3xl flex flex-col items-center gap-8">
        
        {/* Header Greeting */}
        <motion.h1 
          key={activeAgent}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight"
        >
          {activeAgent === 'lesson' && "下午好，让我来帮你写一篇体育教案吧"}
          {activeAgent === 'plan' && "下午好，让我来帮你制定一份运动计划吧"}
          {activeAgent === 'report' && "下午好，让我来帮你生成一份体测报告吧"}
          {activeAgent === null && "上午好，我是灵跃，你的体育AI助手"}
        </motion.h1>

        {/* Input Box Area */}
        <div className="w-full bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col transition-all duration-300">
          
          {/* Content Area (Top) */}
          <div className="p-6 min-h-[160px] flex flex-col rounded-t-2xl">
            {activeAgent === null && (
              <>
                {chatFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {chatFiles.map((file, index) => {
                      const style = getFileStyle(file.name);
                      return (
                        <div key={index} className={cn("flex items-center gap-2 border px-3 py-2 rounded-lg w-fit shadow-sm", style.bg, style.border, style.text)}>
                          <style.Icon className={cn("w-4 h-4", style.iconText)} />
                          <span className="text-sm font-medium max-w-[150px] truncate">{file.name}</span>
                          <button 
                            onClick={() => setChatFiles(files => files.filter((_, i) => i !== index))}
                            className={cn("ml-1 rounded-full p-0.5 transition-colors", style.btnText, style.btnHoverText, style.hoverBg)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full flex-1 min-h-[112px] bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400 text-base leading-relaxed"
                  placeholder="向 灵跃 提问..."
                />
              </>
            )}
            
            {/* Lesson Mode */}
            <EditContext.Provider value={{ onEdit: () => { setIsEdited(true); checkPromptEmpty(); } }}>
              <div key={resetKey} ref={promptContainerRef}>
                {activeAgent === 'lesson' && renderLessonContent()}
                
                {/* Plan Mode */}
                {activeAgent === 'plan' && planMode === 'group' && !hasUploadedFile && 
                  renderUploadBox(
                    "上传群体的体测数据", 
                    "支持格式：Excel / CSV ，文件内容需包含国测项目、姓名（或学号）、年级、性别和成绩", 
                    () => setHasUploadedFile(true),
                    undefined,
                    "下载数据模板"
                  )}
                {activeAgent === 'plan' && planMode === 'group' && hasUploadedFile && 
                  renderUploadedFile("数据模板.xlsx", () => setHasUploadedFile(false), renderPlanGroupPrompt())}
                {activeAgent === 'plan' && planMode === 'individual' && renderPlanIndividual()}

                {/* Report Mode */}
                {activeAgent === 'report' && reportMode === 'group' && !reportHasUploadedFile && 
                  renderUploadBox(
                    "上传群体的体测数据", 
                    "支持格式：Excel / CSV ，文件内容需包含国测项目、姓名（或学号）、年级、性别和成绩", 
                    () => setReportHasUploadedFile(true),
                    ['一、二年级', '三、四、五、六年级', '初中及以上（男）', '初中及以上（女）'],
                    "下载体测成绩模板"
                  )}
                {activeAgent === 'report' && reportMode === 'group' && reportHasUploadedFile && 
                  renderUploadedFile("群体体测数据.xlsx", () => setReportHasUploadedFile(false), <><EditableText>基于上传的数据，生成一份群体体测报告。</EditableText></>)}
                {activeAgent === 'report' && reportMode === 'individual' && renderReportIndividual()}
              </div>
            </EditContext.Provider>
          </div>

          {/* Command Bar (Bottom) */}
          <div className="px-4 py-3 bg-white border-t border-gray-50 flex items-center justify-between rounded-b-2xl">
            
            {/* Left Side: Context & Config */}
            <div className="flex items-center gap-3">
              {/* Normal Chat Tools */}
              {!activeAgent && (
                <>
                  <button 
                    onClick={() => {
                      const mockFiles = [
                        new window.File([""], "体测数据.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
                        new window.File([""], "教学大纲.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
                        new window.File([""], "公开课课件.pptx", { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }),
                        new window.File([""], "学生手册.pdf", { type: "application/pdf" }),
                        new window.File([""], "index.html", { type: "text/html" }),
                        new window.File([""], "备注.txt", { type: "text/plain" })
                      ];
                      setChatFiles(prev => {
                        const nextIndex = prev.length % mockFiles.length;
                        return [...prev, mockFiles[nextIndex]];
                      });
                    }}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsDeepThinkEnabled(!isDeepThinkEnabled)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition-colors",
                      isDeepThinkEnabled 
                        ? "border-blue-200 bg-blue-50 text-blue-600" 
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Brain className={cn("w-4 h-4", isDeepThinkEnabled && "text-blue-500")} />
                    深度思考
                  </button>
                </>
              )}

              {/* Context Tag */}
              {activeAgent && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100/50">
                  {activeAgent === 'lesson' && 'AI 教案'}
                  {activeAgent === 'plan' && '运动计划'}
                  {activeAgent === 'report' && '体测报告'}
                  <button 
                    onClick={handleCloseAgent}
                    className="ml-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100/50 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Sub-mode / Template Selector */}
              {activeAgent === 'lesson' && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>教案模板</span>
                  <button 
                    onClick={() => {
                      setPreviewTemplateId(selectedTemplateId);
                      setIsTemplateModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-300 shadow-sm px-3 py-1.5 rounded-lg text-gray-700 font-medium transition-all hover:border-blue-400 hover:text-blue-600 group"
                  >
                    <ClipboardList className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="max-w-[150px] truncate">{templates.find(t => t.id === selectedTemplateId)?.name || '通用'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors ml-1" />
                  </button>
                </div>
              )}

              {activeAgent === 'plan' && (
                <SegmentedControl value={planMode} onChange={setPlanMode} />
              )}
              
              {activeAgent === 'report' && (
                <>
                  <SegmentedControl value={reportMode} onChange={setReportMode} />
                  {reportMode === 'individual' && (
                    <>
                      <div className="w-px h-4 bg-gray-300 mx-2"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">体测数据</span>
                        <div className="flex items-center bg-gray-100/80 p-1 rounded-lg">
                          <button 
                            onClick={() => setReportDataSource('single')}
                            className={cn(
                              "px-3 py-1 text-sm font-medium rounded-md transition-all duration-200", 
                              reportDataSource === 'single' 
                                ? "bg-white text-gray-800 shadow-sm" 
                                : "text-gray-500 hover:text-gray-700"
                            )}
                          >
                            单次
                          </button>
                          <button 
                            onClick={() => setReportDataSource('multiple')}
                            className={cn(
                              "px-3 py-1 text-sm font-medium rounded-md transition-all duration-200", 
                              reportDataSource === 'multiple' 
                                ? "bg-white text-gray-800 shadow-sm" 
                                : "text-gray-500 hover:text-gray-700"
                            )}
                          >
                            多次
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-4">
              {activeAgent && isEdited && (
                <button 
                  onClick={handleRestoreDefault}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  恢复默认
                </button>
              )}
              
              {showSendButton && (
                <div className="relative group flex items-center justify-center">
                  <button 
                    disabled={!isSendEnabled}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200",
                      isSendEnabled ? "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md hover:-translate-y-0.5" : "bg-gray-300 hover:bg-gray-400 cursor-not-allowed"
                    )}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  
                  {!isSendEnabled && disabledReason && (
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-50">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg">
                        {disabledReason}
                      </div>
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900 -mt-[1px]"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Agent Selectors */}
        <div className="flex items-center gap-4 mt-4">
          <button 
            onClick={() => handleAgentSelect('lesson')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border shadow-sm",
              activeAgent === 'lesson' 
                ? "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200" 
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            )}
          >
            <BookOpen className="w-4 h-4" />
            AI 教案
          </button>
          
          <button 
            onClick={() => handleAgentSelect('plan')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border shadow-sm",
              activeAgent === 'plan' 
                ? "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200" 
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            )}
          >
            <Activity className="w-4 h-4" />
            运动计划
          </button>
          
          <button 
            onClick={() => handleAgentSelect('report')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border shadow-sm",
              activeAgent === 'report' 
                ? "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200" 
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            )}
          >
            <ClipboardList className="w-4 h-4" />
            体测报告
          </button>
        </div>

      </div>
      
      <TemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={templates}
        setTemplates={setTemplates}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId}
        previewTemplateId={previewTemplateId}
        setPreviewTemplateId={setPreviewTemplateId}
      />
    </div>
  );
}

