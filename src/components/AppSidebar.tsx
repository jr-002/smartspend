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
  component: React.LazyExoticComponent<React.ComponentType<any>>;
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
          className="transition-colors"
        >
          <Icon className="mr-2 h-4 w-4" />
          {!collapsed && <span>{item.label}</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {categories.map((category) => (
          <Collapsible 
            key={category.id}
            open={openCategories[category.id]}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-md p-2 flex items-center justify-between group">
                  <span>{category.label}</span>
                  {!collapsed && (
                    <ChevronDown className={`h-4 w-4 transition-transform ${
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

