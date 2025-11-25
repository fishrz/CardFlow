import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parse
} from 'date-fns';
import { useThemeStore } from '../store/useThemeStore';

interface DatePickerProps {
  value: string; // yyyy-MM-dd format
  onChange: (date: string) => void;
  label?: string;
  className?: string;
}

export default function DatePicker({ value, onChange, label, className = '' }: DatePickerProps) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date();
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : null;

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 400; // Approximate height
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Position above or below based on available space
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        // Position above
        setDropdownPosition({
          top: rect.top - dropdownHeight - 8 + window.scrollY,
          left: rect.left + window.scrollX,
        });
      } else {
        // Position below
        setDropdownPosition({
          top: rect.bottom + 8 + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Get calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handleDateSelect = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onChange(format(today, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const inputClasses = `w-full px-4 py-3 rounded-xl transition-colors cursor-pointer ${
    isLight 
      ? 'bg-slate-100 border border-slate-200 text-slate-900 hover:bg-slate-200' 
      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
  }`;

  // Calendar dropdown rendered via portal
  const calendarDropdown = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`fixed z-[100] p-4 rounded-2xl shadow-2xl ${
            isLight 
              ? 'bg-white border border-slate-200 shadow-slate-200/50' 
              : 'bg-zinc-900 border border-white/10 shadow-black/50'
          }`}
          style={{ 
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: '320px',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevMonth}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <motion.span
              whileHover={{ scale: 1.02 }}
              className="text-lg font-semibold px-4 py-1 rounded-lg"
            >
              {format(currentMonth, 'MMMM yyyy')}
            </motion.span>
            
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextMonth}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div 
                key={day} 
                className={`text-center text-xs font-medium py-2 ${
                  isLight ? 'text-slate-400' : 'text-zinc-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDayToday = isToday(day);

              return (
                <motion.button
                  key={index}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateSelect(day)}
                  className={`
                    relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium
                    transition-all duration-200
                    ${!isCurrentMonth 
                      ? (isLight ? 'text-slate-300' : 'text-zinc-700') 
                      : ''
                    }
                    ${isSelected 
                      ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30' 
                      : isCurrentMonth 
                        ? (isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10')
                        : ''
                    }
                    ${isDayToday && !isSelected 
                      ? `ring-2 ${isLight ? 'ring-violet-300' : 'ring-violet-500/50'}` 
                      : ''
                    }
                  `}
                >
                  {format(day, 'd')}
                  {isDayToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between mt-4 pt-4 border-t ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleToday}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isLight 
                  ? 'bg-violet-100 text-violet-600 hover:bg-violet-200' 
                  : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
              }`}
            >
              Today
            </motion.button>
            
            {selectedDate && (
              <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {format(selectedDate, 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={className}>
      {label && (
        <label className={`flex items-center gap-2 text-sm mb-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
          <Calendar className="w-4 h-4" />
          {label}
        </label>
      )}
      
      {/* Input Trigger */}
      <motion.button
        ref={triggerRef}
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClasses} flex items-center justify-between`}
      >
        <span className={selectedDate ? '' : (isLight ? 'text-slate-400' : 'text-zinc-500')}>
          {selectedDate ? format(selectedDate, 'EEEE, MMM d, yyyy') : 'Select date...'}
        </span>
        <Calendar className={`w-5 h-5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
      </motion.button>

      {/* Calendar Dropdown - Rendered via Portal */}
      {createPortal(calendarDropdown, document.body)}
    </div>
  );
}
