import {
	AppShell,
	Sidebar,
	MainContentArea,
	Grid,
	GridItem,
	Section,
	SidebarIcons,
	type SidebarSection,
} from "@/components/layout";
import {
	Breadcrumb,
	type TopNavigationItem,
	type BreadcrumbItem,
} from "@/components/navigation";

const navigation: TopNavigationItem[] = [
	{ id: "learn", label: "Learn", href: "/learn", active: true },
	{ id: "progress", label: "Progress", href: "/progress" },
	{ id: "community", label: "Community", href: "/community" },
	{ id: "profile", label: "Profile", href: "/profile" },
];

const breadcrumbs: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Learn", href: "/learn" },
	{ label: "Dashboard", current: true },
];

const sidebarSections: SidebarSection[] = [
	{
		id: "learning",
		title: "Learning",
		items: [
			{
				id: "lessons",
				label: "Lessons",
				href: "/lessons",
				icon: SidebarIcons.learn,
				active: true,
			},
			{
				id: "exercises",
				label: "Exercises",
				href: "/exercises",
				icon: SidebarIcons.learn,
			},
			{
				id: "vocabulary",
				label: "Vocabulary",
				href: "/vocabulary",
				icon: SidebarIcons.learn,
			},
		],
	},
	{
		id: "progress",
		title: "Progress",
		items: [
			{
				id: "stats",
				label: "Statistics",
				href: "/stats",
				icon: SidebarIcons.progress,
			},
			{
				id: "achievements",
				label: "Achievements",
				href: "/achievements",
				icon: SidebarIcons.progress,
			},
			{
				id: "streaks",
				label: "Streaks",
				href: "/streaks",
				icon: SidebarIcons.progress,
			},
		],
	},
	{
		id: "settings",
		title: "Settings",
		items: [
			{
				id: "profile",
				label: "Profile",
				href: "/profile",
				icon: SidebarIcons.settings,
			},
			{
				id: "preferences",
				label: "Preferences",
				href: "/preferences",
				icon: SidebarIcons.settings,
			},
		],
	},
];

export default function Home() {
	return (
		<AppShell navigation={navigation} user={{ streak: 7, notifications: 3 }}>
			<div className="flex">
				<Sidebar sections={sidebarSections} />

				<MainContentArea hasSidebar>
					<Section>
						<div className="space-y-8">
							{/* Breadcrumb Navigation */}
							<Breadcrumb items={breadcrumbs} />
							{/* Hero Section */}
							<div className="text-center">
								<h1 className="heading text-4xl font-bold mb-4">
									Welcome to WriteWave
								</h1>
								<p className="body text-lg text-gray-600 max-w-2xl mx-auto">
									Master Japanese writing with our comprehensive learning
									platform. Track your progress, build streaks, and achieve your
									language goals.
								</p>
							</div>

							{/* Grid Demo */}
							<div>
								<h2 className="heading text-2xl font-semibold mb-6">
									Grid System Demo
								</h2>
								<Grid cols={12} gap="md">
									<GridItem span={6}>
										<div className="border-base p-6 h-32 flex items-center justify-center">
											<span className="body text-base">
												Grid Item 1 (6 cols)
											</span>
										</div>
									</GridItem>
									<GridItem span={6}>
										<div className="border-base p-6 h-32 flex items-center justify-center">
											<span className="body text-base">
												Grid Item 2 (6 cols)
											</span>
										</div>
									</GridItem>
									<GridItem span={4}>
										<div className="border-base p-6 h-32 flex items-center justify-center">
											<span className="body text-base">
												Grid Item 3 (4 cols)
											</span>
										</div>
									</GridItem>
									<GridItem span={4}>
										<div className="border-base p-6 h-32 flex items-center justify-center">
											<span className="body text-base">
												Grid Item 4 (4 cols)
											</span>
										</div>
									</GridItem>
									<GridItem span={4}>
										<div className="border-base p-6 h-32 flex items-center justify-center">
											<span className="body text-base">
												Grid Item 5 (4 cols)
											</span>
										</div>
									</GridItem>
								</Grid>
							</div>

							{/* Typography Demo */}
							<div>
								<h2 className="heading text-2xl font-semibold mb-6">
									Typography System
								</h2>
								<div className="space-y-4">
									<div>
										<h3 className="heading text-xl font-semibold mb-2">
											Headings (Space Grotesk)
										</h3>
										<div className="space-y-2">
											<h1 className="heading text-4xl font-bold">
												Heading 1 - 64px
											</h1>
											<h2 className="heading text-3xl font-bold">
												Heading 2 - 48px
											</h2>
											<h3 className="heading text-2xl font-semibold">
												Heading 3 - 32px
											</h3>
											<h4 className="heading text-xl font-semibold">
												Heading 4 - 24px
											</h4>
										</div>
									</div>

									<div>
										<h3 className="body text-lg font-medium mb-2">
											Body Text (Inter)
										</h3>
										<div className="space-y-2">
											<p className="body text-base">Body text - 16px regular</p>
											<p className="body text-sm">Small text - 14px regular</p>
											<p className="body text-xs">Extra small - 12px regular</p>
										</div>
									</div>

									<div>
										<h3 className="jp text-lg font-medium mb-2">
											Japanese Text (Noto Sans JP)
										</h3>
										<p className="jp text-base">
											日本語のテキスト - 16px regular
										</p>
										<p className="jp text-sm">小さな日本語 - 14px regular</p>
									</div>
								</div>
							</div>

							{/* Color System Demo */}
							<div>
								<h2 className="heading text-2xl font-semibold mb-6">
									Color System
								</h2>
								<Grid cols={6} gap="md">
									<GridItem span={2}>
										<div className="bg-primary text-white p-4 rounded-sm">
											<span className="body text-sm font-medium">Primary</span>
											<div className="body text-xs mt-1">#0066FF</div>
										</div>
									</GridItem>
									<GridItem span={2}>
										<div className="bg-success text-white p-4 rounded-sm">
											<span className="body text-sm font-medium">Success</span>
											<div className="body text-xs mt-1">#00A86B</div>
										</div>
									</GridItem>
									<GridItem span={2}>
										<div className="bg-warning text-white p-4 rounded-sm">
											<span className="body text-sm font-medium">Warning</span>
											<div className="body text-xs mt-1">#FF9500</div>
										</div>
									</GridItem>
									<GridItem span={2}>
										<div className="bg-error text-white p-4 rounded-sm">
											<span className="body text-sm font-medium">Error</span>
											<div className="body text-xs mt-1">#DC143C</div>
										</div>
									</GridItem>
									<GridItem span={2}>
										<div className="bg-gray-800 text-white p-4 rounded-sm">
											<span className="body text-sm font-medium">Gray 800</span>
											<div className="body text-xs mt-1">#333333</div>
										</div>
									</GridItem>
									<GridItem span={2}>
										<div className="bg-gray-600 text-white p-4 rounded-sm">
											<span className="body text-sm font-medium">Gray 600</span>
											<div className="body text-xs mt-1">#999999</div>
										</div>
									</GridItem>
								</Grid>
							</div>
						</div>
					</Section>
				</MainContentArea>
			</div>
		</AppShell>
	);
}
