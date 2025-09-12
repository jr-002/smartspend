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
          className="transition-all duration-200 hover:bg-accent/80"
        >
          <Icon className="mr-3 h-5 w-5" />
          {!collapsed && <span>{item.label}</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {categories.map((category) => (
          <Collapsible 
            key={category.id}
            open={openCategories[category.id]}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-lg px-4 py-3 flex items-center justify-between group transition-all duration-200">
                  <span>{category.label}</span>
                  {!collapsed && (
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                      openCategories[category.id] ? 'rotate-180' : ''
                    }`} />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
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

