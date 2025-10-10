"use client";

import { 
  AppShell, 
  Sidebar, 
  MainContentArea, 
  Section,
  SidebarIcons,
  type SidebarSection 
} from '@/components/layout';
import { Breadcrumb, type TopNavigationItem, type BreadcrumbItem } from '@/components/layout';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile', active: true },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Profile', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    items: [
      { id: 'overview', label: 'Overview', href: '/profile', icon: SidebarIcons.settings, active: true },
      { id: 'settings', label: 'Settings', href: '/profile/settings', icon: SidebarIcons.settings },
      { id: 'preferences', label: 'Preferences', href: '/profile/preferences', icon: SidebarIcons.settings },
    ],
  },
];

export default function ProfilePage() {
  return (
    <AppShell 
      navigation={navigation}
      user={{ streak: 7, notifications: 2 }}
    >
      <div className="flex">
        <Sidebar sections={sidebarSections} />
        
        <MainContentArea hasSidebar>
          <Section>
            <div className="space-y-8">
              <Breadcrumb items={breadcrumbs} />

              {/* Profile Header */}
              <div className="border-base bg-white p-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">U</span>
                  </div>
                  <div>
                    <h1 className="heading text-2xl font-bold">User Profile</h1>
                    <p className="body text-sm text-gray-600">user@example.com</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="body text-sm">Level 13</span>
                      <span className="body text-sm">2,847 XP</span>
                      <span className="body text-sm">🔥 7 day streak</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border-base bg-white p-6">
                  <h2 className="body text-base font-medium mb-4">Account Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="body text-sm font-medium text-gray-700">Display Name</label>
                      <input 
                        type="text" 
                        defaultValue="User Name"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="body text-sm font-medium text-gray-700">Email</label>
                      <input 
                        type="email" 
                        defaultValue="user@example.com"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="border-base bg-white p-6">
                  <h2 className="body text-base font-medium mb-4">Learning Preferences</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="body text-sm font-medium text-gray-700">Difficulty Level</label>
                      <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="body text-sm font-medium text-gray-700">Daily Goal</label>
                      <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>10 minutes</option>
                        <option>20 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                      </select>
                    </div>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                      Update Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </MainContentArea>
      </div>
    </AppShell>
  );
}
