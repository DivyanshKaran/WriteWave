"use client";

import React, { useState } from 'react';
import { CleanAppShell, CleanPageLayout, CleanCard, CleanButton } from '@/components/layout';
import { 
  Label, 
  Input, 
  Button, 
  Checkbox, 
  Radio as RadioComponent, 
  Select, 
  Toggle, 
  Textarea, 
  Field,
  type SelectOption 
} from '@/components/ui';
import {
  ModalAnimation,
  DrawerAnimation,
  DropdownAnimation,
  ToastContainer,
  Toast,
  TabSwitcher,
  ShimmerEffect,
  SkeletonShimmer,
  TextShimmer,
  LinkHover,
  CardHover,
  ImageHover,
  SuccessCheckmark,
  ErrorShake,
  LoadingSpinner,
  PulseAnimation,
  BounceAnimation,
  ScaleAnimation,
  ProgressBar
} from '@/components/motion';
import {
  Skeleton, 
  SkeletonText, 
  SkeletonButton, 
  SkeletonCard, 
  SkeletonTable,
  LinearProgress,
  EmptyState,
  EmptyStateIcons,
  ErrorState,
  NetworkError,
  NotFoundError,
  ServerError,
  DataTable,
  type DataTableProps
} from '@/components/ui';
import {
  WelcomeScreen,
  GoalSelection,
  LevelAssessment,
  PaceSelection,
} from '@/components/onboarding';
import {
  AccessibleField,
  AccessibleInput,
  FocusManager,
  SkipLinks
} from '@/components/accessibility';
import {
  PersonalLearningAnalytics,
  LearningVelocityTracking,
  WeaknessIdentificationSystem
} from '@/components/analytics';
import {
  XPChart,
  LearningHeatmap,
  ChartSkeleton
} from '@/components/visualizations';
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Star, 
  Heart, 
  BookOpen, 
  Target, 
  Users, 
  Settings, 
  Bell, 
  Search,
  Pen,
  Play,
  Pause,
  Volume2,
  Camera,
  Mic,
  Download,
  Upload,
  Share,
  Copy,
  Edit,
  Trash,
  Plus,
  Menu,
  X,
  Home,
  User,
  LogOut,
  UserPlus,
  Award,
  Trophy,
  Image,
  Video,
  Music,
  Loader2,
  Save,
  BarChart,
  Eye
} from 'lucide-react';

export default function UIShowcasePage() {
  const [activeTab, setActiveTab] = useState('forms');
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    level: '',
    newsletter: false,
    notifications: true,
    theme: 'light'
  });

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'UI Showcase', href: '/ui-showcase' }
  ];

  const selectOptions: SelectOption[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Sample data for tables and charts
  const sampleTableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator', status: 'Active' },
  ];

  const sampleChartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 },
    { name: 'Apr', value: 278 },
    { name: 'May', value: 189 },
    { name: 'Jun', value: 239 },
  ];

  const tableColumns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
  ];

  const tabs = [
    { id: 'forms', label: 'Forms', icon: <Pen className="w-4 h-4" /> },
    { id: 'motion', label: 'Motion', icon: <Play className="w-4 h-4" /> },
    { id: 'loading', label: 'Loading', icon: <Loader2 className="w-4 h-4" /> },
    { id: 'tables', label: 'Tables', icon: <Menu className="w-4 h-4" /> },
    { id: 'charts', label: 'Charts', icon: <BarChart className="w-4 h-4" /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Eye className="w-4 h-4" /> },
    { id: 'onboarding', label: 'Onboarding', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'icons', label: 'Icons', icon: <Star className="w-4 h-4" /> }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowToast(true);
    }, 2000);
  };

  const handleProgressUpdate = () => {
    if (progress < 100) {
      setProgress(prev => Math.min(prev + 10, 100));
    } else {
      setProgress(0);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleModalOpen = () => {
    setShowModal(true);
    showToastMessage('Modal opened successfully!', 'info');
  };

  const handleDrawerOpen = () => {
    setShowDrawer(true);
    showToastMessage('Drawer opened successfully!', 'info');
  };

  const handleDropdownOpen = () => {
    setShowDropdown(true);
    showToastMessage('Dropdown opened successfully!', 'info');
  };

  const renderFormsTab = () => (
    <div className="space-y-8">
      <CleanCard title="Form Components" description="Interactive form elements">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </Field>

            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </Field>

            <Field>
              <Label htmlFor="level">Level</Label>
              <Select
                id="level"
                value={formData.level}
                onChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                options={selectOptions}
                placeholder="Select your level"
              />
            </Field>

            <Field>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </Field>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                id="newsletter"
                checked={formData.newsletter}
                onChange={(checked) => setFormData(prev => ({ ...prev, newsletter: checked }))}
              />
              <Label htmlFor="newsletter">Subscribe to newsletter</Label>
            </div>

            <div className="flex items-center space-x-4">
              <Toggle
                id="notifications"
                checked={formData.notifications}
                onChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
              />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>

            <div className="space-y-3">
              <Label>Theme Preference</Label>
              <div className="flex space-x-4">
                <RadioComponent
                  id="light"
                  name="theme"
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                />
                <Label htmlFor="light">Light</Label>
                <RadioComponent
                  id="dark"
                  name="theme"
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                />
                <Label htmlFor="dark">Dark</Label>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <CleanButton type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Form
            </CleanButton>
            <CleanButton variant="outline" type="button">
              Cancel
            </CleanButton>
          </div>
        </form>
      </CleanCard>
    </div>
  );

  const renderMotionTab = () => (
    <div className="space-y-8">
      <CleanCard title="Animations & Transitions" description="Motion components and effects">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Button Animations</h4>
            <div className="space-y-3">
              <CleanButton>Hover Me</CleanButton>
              <CleanButton variant="outline">Ripple Effect</CleanButton>
              <CleanButton variant="outline">Button Hover</CleanButton>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Loading States</h4>
            <div className="space-y-3">
              <LoadingSpinner />
              <PulseAnimation>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </PulseAnimation>
              <BounceAnimation>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </BounceAnimation>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Feedback</h4>
            <div className="space-y-3">
              <SuccessCheckmark />
              <ErrorShake>
                <div className="w-8 h-8 bg-red-300 rounded"></div>
              </ErrorShake>
              <ScaleAnimation>
                <div className="w-8 h-8 bg-green-300 rounded"></div>
              </ScaleAnimation>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Progress</h4>
            <div className="space-y-3">
              <ProgressBar progress={progress} />
              <CleanButton onClick={handleProgressUpdate} size="sm">
                Update Progress
              </CleanButton>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Shimmer Effects</h4>
            <div className="space-y-3">
              <ShimmerEffect>
                <div className="w-full h-4 bg-gray-200 rounded"></div>
              </ShimmerEffect>
              <SkeletonShimmer>
                <div className="w-full h-4 bg-gray-200 rounded"></div>
              </SkeletonShimmer>
              <TextShimmer>
                <span>Shimmering Text</span>
              </TextShimmer>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Hover Effects</h4>
            <div className="space-y-3">
              <LinkHover>
                <span className="text-blue-600">Hover Link</span>
              </LinkHover>
              <CardHover>
                <div className="p-4 border border-gray-300 rounded-lg">
                  <p>Hover Card</p>
                </div>
              </CardHover>
              <ImageHover>
                <div className="w-16 h-16 bg-gray-300 rounded"></div>
              </ImageHover>
            </div>
          </div>
        </div>
      </CleanCard>

      <CleanCard title="Interactive Elements" description="Modals, drawers, and dropdowns">
        <div className="flex space-x-4">
          <CleanButton onClick={() => setShowModal(true)}>
            Open Modal
          </CleanButton>
          <CleanButton onClick={() => setShowDrawer(true)}>
            Open Drawer
          </CleanButton>
          <div className="relative">
            <CleanButton onClick={() => setShowDropdown(!showDropdown)}>
              Dropdown
            </CleanButton>
            {showDropdown && (
              <DropdownAnimation>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                      Option 1
                    </div>
                    <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                      Option 2
                    </div>
                    <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                      Option 3
                    </div>
                  </div>
                </div>
              </DropdownAnimation>
            )}
          </div>
        </div>
      </CleanCard>
    </div>
  );

  const renderLoadingTab = () => (
    <div className="space-y-8">
      <CleanCard title="Loading States" description="Skeletons and progress indicators">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Skeleton Components</h4>
            <div className="space-y-4">
              <Skeleton className="w-full h-4" />
              <SkeletonText lines={3} />
              <SkeletonButton />
              <SkeletonCard />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Progress Bars</h4>
            <div className="space-y-4">
              <LinearProgress progress={75} />
              <ProgressBar progress={progress} />
              <CleanButton onClick={handleProgressUpdate} size="sm">
                Update Progress
              </CleanButton>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Empty States</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EmptyState
                icon={EmptyStateIcons.book}
                title="No Content"
                description="There's nothing to show here yet."
                action={<CleanButton>Get Started</CleanButton>}
              />
              <EmptyState
                icon={EmptyStateIcons.search}
                title="No Results"
                description="Try adjusting your search criteria."
                action={<CleanButton variant="outline">Clear Filters</CleanButton>}
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Error States</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ErrorState
                icon={<NetworkError />}
                title="Network Error"
                description="Check your connection and try again."
                action={<CleanButton>Retry</CleanButton>}
              />
              <ErrorState
                icon={<NotFoundError />}
                title="Not Found"
                description="The page you're looking for doesn't exist."
                action={<CleanButton variant="outline">Go Home</CleanButton>}
              />
              <ErrorState
                icon={<ServerError />}
                title="Server Error"
                description="Something went wrong on our end."
                action={<CleanButton>Report Issue</CleanButton>}
              />
            </div>
          </div>
        </div>
      </CleanCard>
    </div>
  );

  const renderOnboardingTab = () => (
    <div className="space-y-8">
      <CleanCard title="Onboarding Components" description="User onboarding flow elements">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Welcome Screen</h4>
              <div className="p-4 border border-gray-200 rounded-lg">
                <WelcomeScreen
                  onNext={() => {}}
                  onSkip={() => {}}
                  data={{}}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Goal Selection</h4>
              <div className="p-4 border border-gray-200 rounded-lg">
                <GoalSelection
                  onNext={() => {}}
                  onBack={() => {}}
                  data={{}}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Level Assessment</h4>
              <div className="p-4 border border-gray-200 rounded-lg">
                <LevelAssessment
                  onNext={() => {}}
                  onBack={() => {}}
                  data={{}}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Pace Selection</h4>
              <div className="p-4 border border-gray-200 rounded-lg">
                <PaceSelection
                  onNext={() => {}}
                  onBack={() => {}}
                  data={{}}
                />
              </div>
            </div>
          </div>
        </div>
      </CleanCard>
    </div>
  );

  const renderIconsTab = () => (
    <div className="space-y-8">
      <CleanCard title="Icon Library" description="Comprehensive icon collection">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Navigation Icons</h4>
            <div className="grid grid-cols-8 gap-4">
              {[Home, User, Settings, Bell, Search, Menu, X, LogOut].map((Icon, index) => (
                <div key={index} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Icon className="w-6 h-6 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-500">{Icon.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Action Icons</h4>
            <div className="grid grid-cols-8 gap-4">
              {[Edit, Copy, Share, Download, Upload, Save, Trash, Plus].map((Icon, index) => (
                <div key={index} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Icon className="w-6 h-6 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-500">{Icon.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Learning Icons</h4>
            <div className="grid grid-cols-8 gap-4">
              {[BookOpen, Pen, Target, Users, Star, Heart, Award, Trophy].map((Icon, index) => (
                <div key={index} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Icon className="w-6 h-6 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-500">{Icon.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Media Icons</h4>
            <div className="grid grid-cols-8 gap-4">
              {[Play, Pause, Volume2, Camera, Mic, Image, Video, Music].map((Icon, index) => (
                <div key={index} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Icon className="w-6 h-6 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-500">{Icon.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CleanCard>
    </div>
  );

  const renderTablesTab = () => (
    <div className="space-y-8">
      <CleanCard title="Data Tables" description="Interactive data tables with sorting and pagination">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {tableColumns.map((column) => (
                    <th key={column.key} className="border border-gray-300 px-4 py-2 text-left font-medium">
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleTableData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{row.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.email}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.role}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CleanCard>

      <CleanCard title="Table Features" description="Advanced table functionality">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <CleanButton variant="outline" onClick={() => showToastMessage('Sorting enabled!', 'info')}>
              Enable Sorting
            </CleanButton>
            <CleanButton variant="outline" onClick={() => showToastMessage('Filtering enabled!', 'info')}>
              Enable Filtering
            </CleanButton>
            <CleanButton variant="outline" onClick={() => showToastMessage('Pagination enabled!', 'info')}>
              Enable Pagination
            </CleanButton>
          </div>
        </div>
      </CleanCard>
    </div>
  );

  const renderChartsTab = () => (
    <div className="space-y-8">
      <CleanCard title="Chart Components" description="Data visualization charts">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">XP Chart</h4>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <XPChart userId="demo-user" className="w-full h-full" />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Learning Heatmap</h4>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <LearningHeatmap userId="demo-user" className="w-full h-full" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Chart Skeletons</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChartSkeleton type="line" className="h-32" />
              <ChartSkeleton type="bar" className="h-32" />
              <ChartSkeleton type="radar" className="h-32" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Analytics Components</h4>
            <div className="space-y-4">
              <PersonalLearningAnalytics userId="demo-user" className="h-48" />
              <LearningVelocityTracking userId="demo-user" className="h-48" />
              <WeaknessIdentificationSystem userId="demo-user" className="h-48" />
            </div>
          </div>
        </div>
      </CleanCard>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="space-y-8">
      <CleanCard title="Accessibility Components" description="Accessible form elements and utilities">
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Accessible Form Fields</h4>
            <div className="space-y-4">
              <AccessibleField label="Name" required error="">
                <AccessibleInput
                  type="text"
                  placeholder="Enter your name"
                  aria-describedby="name-help"
                />
              </AccessibleField>
              <AccessibleField label="Email" required helpText="We'll never share your email">
                <AccessibleInput
                  type="email"
                  placeholder="Enter your email"
                />
              </AccessibleField>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Focus Management</h4>
            <FocusManager>
              <div className="space-y-2">
                <CleanButton variant="outline">First Button</CleanButton>
                <CleanButton variant="outline">Second Button</CleanButton>
                <CleanButton variant="outline">Third Button</CleanButton>
              </div>
            </FocusManager>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Skip Links</h4>
            <SkipLinks>
              <a href="#main-content">Skip to main content</a>
              <a href="#navigation">Skip to navigation</a>
              <a href="#footer">Skip to footer</a>
            </SkipLinks>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Accessibility Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium mb-2">Screen Reader Support</h5>
                <p className="text-sm text-gray-600">Proper ARIA labels and descriptions</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium mb-2">Keyboard Navigation</h5>
                <p className="text-sm text-gray-600">Full keyboard accessibility</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium mb-2">High Contrast</h5>
                <p className="text-sm text-gray-600">Supports high contrast mode</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium mb-2">Reduced Motion</h5>
                <p className="text-sm text-gray-600">Respects motion preferences</p>
              </div>
            </div>
          </div>
        </div>
      </CleanCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'forms':
        return renderFormsTab();
      case 'motion':
        return renderMotionTab();
      case 'loading':
        return renderLoadingTab();
      case 'tables':
        return renderTablesTab();
      case 'charts':
        return renderChartsTab();
      case 'accessibility':
        return renderAccessibilityTab();
      case 'onboarding':
        return renderOnboardingTab();
      case 'icons':
        return renderIconsTab();
      default:
        return renderFormsTab();
    }
  };

  return (
    <CleanAppShell currentPage="ui-showcase" user={{ streak: 12, notifications: 3 }}>
      <CleanPageLayout
        title="UI Showcase"
        description="Comprehensive collection of all UI components and elements"
        breadcrumbs={breadcrumbs}
        actions={
          <CleanButton variant="outline" onClick={() => window.history.back()}>
            Back
          </CleanButton>
        }
      >
        <div className="space-y-6">
          {/* Tab Navigation */}
          <CleanCard>
            <TabSwitcher
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </CleanCard>

          {/* Tab Content */}
          <div className="mt-6">
            {renderTabContent()}
          </div>

          {/* Toast Container */}
          <ToastContainer>
            {showToast && (
              <Toast
                type={toastType}
                title={toastType === 'success' ? 'Success!' : toastType === 'error' ? 'Error!' : 'Info!'}
                description={toastMessage}
                onClose={() => setShowToast(false)}
              />
            )}
          </ToastContainer>

          {/* Modal */}
          {showModal && (
            <ModalAnimation>
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Modal Title</h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 mb-6">
                    This is a modal dialog. You can put any content here.
                  </p>
                  <div className="flex space-x-3">
                    <CleanButton onClick={() => setShowModal(false)}>
                      Close
                    </CleanButton>
                    <CleanButton variant="outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </CleanButton>
                  </div>
                </div>
              </div>
            </ModalAnimation>
          )}

          {/* Drawer */}
          {showDrawer && (
            <DrawerAnimation>
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
                <div className="bg-white rounded-t-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Drawer Title</h3>
                    <button
                      onClick={() => setShowDrawer(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 mb-6">
                    This is a drawer component. It slides up from the bottom.
                  </p>
                  <div className="flex space-x-3">
                    <CleanButton onClick={() => setShowDrawer(false)}>
                      Close
                    </CleanButton>
                    <CleanButton variant="outline" onClick={() => setShowDrawer(false)}>
                      Cancel
                    </CleanButton>
                  </div>
                </div>
              </div>
            </DrawerAnimation>
          )}
        </div>
      </CleanPageLayout>
    </CleanAppShell>
  );
}
