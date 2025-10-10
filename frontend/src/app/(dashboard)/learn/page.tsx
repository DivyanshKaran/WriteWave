"use client";

import {
	AppShell,
	Sidebar,
	MainContentArea,
	Section,
	SidebarIcons,
	type SidebarSection,
} from "@/components/layout";
import {
	Breadcrumb,
	type TopNavigationItem,
	type BreadcrumbItem,
} from "@/components/layout";
import { CharacterLearningInterface } from "@/components/learning";

const navigation: TopNavigationItem[] = [
	{ id: "learn", label: "Learn", href: "/learn", active: true },
	{ id: "progress", label: "Progress", href: "/progress" },
	{ id: "community", label: "Community", href: "/community" },
	{ id: "profile", label: "Profile", href: "/profile" },
];

const breadcrumbs: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Learn", href: "/learn" },
	{ label: "Character Practice", current: true },
];

const sidebarSections: SidebarSection[] = [
	{
		id: "learning",
		title: "Learning",
		items: [
			{
				id: "lessons",
				label: "Lessons",
				href: "/learn",
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
];

// Sample stroke order paths for the character "人" (person)
const sampleStrokePaths = [
	"M 120 60 L 120 180", // Vertical line
	"M 60 120 L 180 120", // Horizontal line
];

export default function LearnPage() {
	const handleAnswerCheck = (answer: string) => {
		console.log("Answer checked:", answer);
		// Here you would implement the answer checking logic
	};

	const handleHintRequest = () => {
		console.log("Hint requested");
		// Here you would implement hint logic
	};

	const handleContinue = () => {
		console.log("Continue to next character");
		// Here you would implement navigation to next character
	};

	return (
		<AppShell navigation={navigation} user={{ streak: 7, notifications: 3 }}>
			<div className="flex">
				<Sidebar sections={sidebarSections} />

				<MainContentArea hasSidebar>
					<Section>
						<div className="space-y-8">
							{/* Breadcrumb Navigation */}
							<Breadcrumb items={breadcrumbs} />

							{/* Character Learning Interface */}
							<CharacterLearningInterface
								character="人"
								strokeOrderPaths={sampleStrokePaths}
								currentLesson={5}
								totalLessons={20}
								progress={0.25}
								onAnswerCheck={handleAnswerCheck}
								onHintRequest={handleHintRequest}
								onContinue={handleContinue}
							/>
						</div>
					</Section>
				</MainContentArea>
			</div>
		</AppShell>
	);
}
