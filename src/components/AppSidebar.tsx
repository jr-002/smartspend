import React from "react";
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

export type SidebarItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

interface AppSidebarProps {
  coreItems: SidebarItem[];
  moreItems: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ coreItems, moreItems, activeId, onSelect }) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

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
        {/* Core Features */}
        <SidebarGroup>
          <SidebarGroupLabel>Core Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* More Features */}
        <SidebarGroup>
          <SidebarGroupLabel>More Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moreItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;

