"use client";

import { 
  AppShell, 
  Sidebar, 
  MainContentArea, 
  Section,
  SidebarIcons,
  type SidebarSection 
} from '@/components/layout';
import { Breadcrumb, type TopNavigationItem, type BreadcrumbItem } from '@/components/navigation';
import { 
  Modal, 
  Drawer, 
  ToastProvider, 
  useToast, 
  DropdownMenuComponent, 
  SimpleDropdown,
  type DropdownMenuItem 
} from '@/components/overlay';
import { Button } from '@/components/forms';
import { useState } from 'react';
import { Settings, User, LogOut, MoreHorizontal, Bell, Mail } from 'lucide-react';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Overlay Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'overlay', label: 'Overlay Components', href: '/overlay-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

const dropdownItems: DropdownMenuItem[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  { id: 'logout', label: 'Logout', icon: <LogOut className="w-5 h-5" /> },
];

function OverlayDemoContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { addToast } = useToast();

  const showToast = (type: 'success' | 'error' | 'info' | 'warning') => {
    addToast({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      description: `This is a ${type} notification message.`,
    });
  };

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbs} />
      
      <div className="max-w-4xl">
        <h1 className="heading text-3xl font-bold mb-8">Overlay System Demo</h1>
        
        <div className="space-y-8">
          {/* Modal Demo */}
          <div className="space-y-4">
            <h2 className="heading text-xl font-semibold">Modal Dialog</h2>
            <Button onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
            
            <Modal
              open={modalOpen}
              onOpenChange={setModalOpen}
              title="Confirm Action"
              actions={
                <>
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setModalOpen(false)}>
                    Confirm
                  </Button>
                </>
              }
            >
              <p className="body text-base">
                Are you sure you want to perform this action? This cannot be undone.
              </p>
            </Modal>
          </div>

          {/* Drawer Demo */}
          <div className="space-y-4">
            <h2 className="heading text-xl font-semibold">Drawer (Side Panel)</h2>
            <Button onClick={() => setDrawerOpen(true)}>
              Open Drawer
            </Button>
            
            <Drawer
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
              title="Settings"
              footer={
                <div className="flex justify-end gap-4">
                  <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDrawerOpen(false)}>
                    Save Changes
                  </Button>
                </div>
              }
            >
              <div className="space-y-6">
                <div>
                  <h3 className="heading text-lg font-semibold mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="body text-base">Email notifications</span>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="body text-base">Push notifications</span>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="body text-base">Dark mode</span>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="heading text-lg font-semibold mb-4">Account</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="body text-sm font-medium text-gray-600 block mb-2">
                        Display Name
                      </label>
                      <input 
                        type="text" 
                        className="w-full h-12 px-4 border-base body text-base"
                        defaultValue="John Doe"
                      />
                    </div>
                    <div>
                      <label className="body text-sm font-medium text-gray-600 block mb-2">
                        Email
                      </label>
                      <input 
                        type="email" 
                        className="w-full h-12 px-4 border-base body text-base"
                        defaultValue="john@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Drawer>
          </div>

          {/* Toast Demo */}
          <div className="space-y-4">
            <h2 className="heading text-xl font-semibold">Toast Notifications</h2>
            <div className="flex gap-4 flex-wrap">
              <Button variant="secondary" onClick={() => showToast('success')}>
                Success Toast
              </Button>
              <Button variant="secondary" onClick={() => showToast('error')}>
                Error Toast
              </Button>
              <Button variant="secondary" onClick={() => showToast('warning')}>
                Warning Toast
              </Button>
              <Button variant="secondary" onClick={() => showToast('info')}>
                Info Toast
              </Button>
            </div>
          </div>

          {/* Dropdown Menu Demo */}
          <div className="space-y-4">
            <h2 className="heading text-xl font-semibold">Dropdown Menus</h2>
            <div className="flex gap-4 flex-wrap">
              <SimpleDropdown
                label="Select Option"
                items={dropdownItems}
              />
              
              <DropdownMenuComponent
                trigger={
                  <button className="h-12 px-4 body text-base bg-white text-black border-base hover:border-strong flex items-center gap-2">
                    <MoreHorizontal className="w-5 h-5" />
                    Actions
                  </button>
                }
                items={dropdownItems}
              />
              
              <DropdownMenuComponent
                trigger={
                  <button className="w-12 h-12 border-base bg-white hover:border-strong flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </button>
                }
                items={[
                  { id: 'notif1', label: 'New message', icon: <Mail className="w-5 h-5" /> },
                  { id: 'notif2', label: 'Friend request', icon: <User className="w-5 h-5" /> },
                  { id: 'notif3', label: 'System update', icon: <Settings className="w-5 h-5" /> },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OverlayDemoPage() {
  return (
    <ToastProvider>
      <AppShell 
        navigation={navigation}
        user={{ streak: 7, notifications: 3 }}
      >
        <div className="flex">
          <Sidebar sections={sidebarSections} />
          
          <MainContentArea hasSidebar>
            <Section>
              <OverlayDemoContent />
            </Section>
          </MainContentArea>
        </div>
      </AppShell>
    </ToastProvider>
  );
}
