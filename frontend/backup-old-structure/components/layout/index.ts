// Layout components barrel export
export { AppShell } from "./AppShell";
export { Sidebar, SidebarIcons } from "./Sidebar";
export {
	MainContentArea,
	Grid,
	GridItem,
	Container,
	Section,
	ResponsiveGrid,
	ResponsiveFlex,
} from "./MainContentArea";

// Navigation Components
export { Breadcrumb } from "./Breadcrumb";
export { TopNavigation } from "./TopNavigation";
export { QuickActions, CommonQuickActions } from "./QuickActions";
export { BottomNavigation } from "./BottomNavigation";
export { MobileNavigationOverlay } from "./MobileNavigationOverlay";
export { ResponsiveSidebar } from "./ResponsiveSidebar";

// Re-export types
export type { UserAreaProps } from "./AppShell";
export type {
	SidebarSection,
	SidebarItem,
} from "./Sidebar";
export type {
	TopNavigationItem,
} from "./TopNavigation";
export type {
	BreadcrumbItem,
} from "./Breadcrumb";
