import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export type SidebarItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  component: React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>;
};

export type SidebarCategory = {
  id: string;
  label: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
};

interface AppSidebarProps {
  categories: SidebarCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ categories, activeId, onSelect }) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, category) => ({
      ...acc,
      [category.id]: category.defaultOpen ?? true
    }), {})
  );

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderMenuItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const isActive = activeId === item.id;
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => onSelect(item.id)}
          className="transition-all duration-200 hover:bg-accent/50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:shadow-sm relative group"
        >
          <Icon className="h-5 w-5 transition-colors duration-200" />
          {!collapsed && <span className="font-medium">{item.label}</span>}
          {isActive && !collapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      <SidebarContent>
        {/* Brand Header */}
        <div className="px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <img
                src="/Picture1.png"
                alt="SmartSpend"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-primary-foreground font-bold text-sm">S</span>';
                }}
              />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-foreground">SmartSpend</h2>
                <p className="text-xs text-muted-foreground">Financial Assistant</p>
              </div>
            )}
          </div>
        </div>

        {categories.map((category) => (
          <Collapsible 
            key={category.id}
            open={openCategories[category.id]}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-accent/30 rounded-lg px-4 py-3 flex items-center justify-between group transition-all duration-200 text-sm font-semibold text-muted-foreground">
                  <span className="uppercase tracking-wider">{category.label}</span>
                  {!collapsed && (
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                      openCategories[category.id] ? 'rotate-180' : ''
                    }`} />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {category.items.map(renderMenuItem)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;

