import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-500" 
        : "text-slate-500 border-transparent hover:bg-white hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
    <span className="font-medium text-sm flex-1 text-left">{label}</span>
    {badge && (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold",
        active ? "bg-indigo-400 text-white" : "bg-red-100 text-red-600"
      )}>
        {badge}
      </span>
    )}
  </button>
);

export default SidebarItem;
