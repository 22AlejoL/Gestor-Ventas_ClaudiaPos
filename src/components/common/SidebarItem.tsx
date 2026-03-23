import React from 'react';
import { cn } from '../../lib/utils';

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
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
