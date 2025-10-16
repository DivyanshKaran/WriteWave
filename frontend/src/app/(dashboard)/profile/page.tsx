"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CleanAppShell, CleanPageLayout, CleanCard, CleanButton, CleanInput } from '@/components/layout';
import { Label, Checkbox, Select } from '@/components/ui';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Settings, 
  Camera, 
  Save, 
  Edit3,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  Target,
  BookOpen,
  Trophy,
  Calendar,
  Clock,
  Volume2,
  Palette,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    bio: 'Passionate Japanese learner with 2 years of experience. Love exploring Japanese culture through language.',
    location: 'San Francisco, CA',
    website: 'https://alexjohnson.dev',
    twitter: '@alexjohnson',
    level: 'intermediate',
    dailyGoal: '30',
    notifications: {
      email: true,
      push: true,
      weekly: false,
      achievements: true,
      reminders: true
    },
    privacy: {
      profile: 'public',
      progress: 'friends',
      achievements: 'public'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      sound: true,
      animations: true
    }
  });

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Profile', href: '/profile' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <Settings className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> }
  ];

  const stats = [
    { label: 'Level', value: '13', icon: <Star className="w-5 h-5 text-yellow-500" /> },
    { label: 'Total XP', value: '2,847', icon: <Trophy className="w-5 h-5 text-purple-500" /> },
    { label: 'Current Streak', value: '7 days', icon: <Target className="w-5 h-5 text-green-500" /> },
    { label: 'Characters Learned', value: '156', icon: <BookOpen className="w-5 h-5 text-blue-500" /> }
  ];

  const recentAchievements = [
    { id: 1, title: 'First Week Complete', description: 'Completed 7 days of practice', date: '2 days ago', icon: <Trophy className="w-5 h-5 text-yellow-500" /> },
    { id: 2, title: 'Speed Master', description: 'Wrote 50 characters in under 5 minutes', date: '1 week ago', icon: <Target className="w-5 h-5 text-green-500" /> },
    { id: 3, title: 'Dedicated Learner', description: 'Practiced for 30 days straight', date: '2 weeks ago', icon: <Star className="w-5 h-5 text-purple-500" /> }
  ];

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setEditing(false);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleNestedChange = (parent: string, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
      }
    }));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <CleanCard className="p-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">AJ</span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.name}</h1>
            <p className="text-gray-600 mb-4">{formData.bio}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>{formData.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined Jan 2023</span>
              </div>
            </div>
          </div>
          <CleanButton variant="outline" onClick={() => setEditing(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </CleanButton>
        </div>
      </CleanCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <CleanCard className="p-6 text-center">
              <div className="flex justify-center mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </CleanCard>
          </motion.div>
        ))}
      </div>

      {/* Recent Achievements */}
      <CleanCard title="Recent Achievements" description="Your latest accomplishments">
        <div className="space-y-4">
          {recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
              <div className="text-xs text-gray-500">
                {achievement.date}
              </div>
            </div>
          ))}
        </div>
      </CleanCard>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      <CleanCard title="Account Information" description="Manage your account details">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                Full Name
              </Label>
              <CleanInput
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </Label>
              <CleanInput
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700 mb-2 block">
              Bio
            </Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={handleInputChange('bio')}
              placeholder="Tell us about yourself"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                Location
              </Label>
              <CleanInput
                id="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange('location')}
                placeholder="City, Country"
              />
            </div>
            <div>
              <Label htmlFor="website" className="text-sm font-medium text-gray-700 mb-2 block">
                Website
              </Label>
              <CleanInput
                id="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange('website')}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      </CleanCard>

      <CleanCard title="Learning Settings" description="Customize your learning experience">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="level" className="text-sm font-medium text-gray-700 mb-2 block">
                Current Level
              </Label>
              <Select
                id="level"
                value={formData.level}
                onChange={handleInputChange('level')}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' }
                ]}
              />
            </div>
            <div>
              <Label htmlFor="dailyGoal" className="text-sm font-medium text-gray-700 mb-2 block">
                Daily Goal (minutes)
              </Label>
              <Select
                id="dailyGoal"
                value={formData.dailyGoal}
                onChange={handleInputChange('dailyGoal')}
                options={[
                  { value: '10', label: '10 minutes' },
                  { value: '20', label: '20 minutes' },
                  { value: '30', label: '30 minutes' },
                  { value: '60', label: '1 hour' }
                ]}
              />
            </div>
          </div>
        </div>
      </CleanCard>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <CleanCard title="Appearance" description="Customize how the app looks and feels">
        <div className="space-y-6">
          <div>
            <Label htmlFor="theme" className="text-sm font-medium text-gray-700 mb-2 block">
              Theme
            </Label>
            <Select
              id="theme"
              value={formData.preferences.theme}
              onChange={(e) => handleNestedChange('preferences', 'theme')(e)}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto' }
              ]}
            />
          </div>

          <div>
            <Label htmlFor="language" className="text-sm font-medium text-gray-700 mb-2 block">
              Language
            </Label>
            <Select
              id="language"
              value={formData.preferences.language}
              onChange={(e) => handleNestedChange('preferences', 'language')(e)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'ja', label: '日本語' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' }
              ]}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700">Sound Effects</Label>
                <p className="text-xs text-gray-500">Play sounds for interactions</p>
              </div>
              <Checkbox
                id="sound"
                checked={formData.preferences.sound}
                onChange={(e) => handleNestedChange('preferences', 'sound')(e)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700">Animations</Label>
                <p className="text-xs text-gray-500">Enable smooth animations</p>
              </div>
              <Checkbox
                id="animations"
                checked={formData.preferences.animations}
                onChange={(e) => handleNestedChange('preferences', 'animations')(e)}
              />
            </div>
          </div>
        </div>
      </CleanCard>

      <CleanCard title="Notifications" description="Choose what notifications you want to receive">
        <div className="space-y-4">
          {Object.entries(formData.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <p className="text-xs text-gray-500">
                  {key === 'email' && 'Receive notifications via email'}
                  {key === 'push' && 'Receive push notifications'}
                  {key === 'weekly' && 'Weekly progress summaries'}
                  {key === 'achievements' && 'Achievement unlocks'}
                  {key === 'reminders' && 'Practice reminders'}
                </p>
              </div>
              <Checkbox
                id={key}
                checked={value}
                onChange={(e) => handleNestedChange('notifications', key)(e)}
              />
            </div>
          ))}
        </div>
      </CleanCard>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <CleanCard title="Privacy Settings" description="Control who can see your information">
        <div className="space-y-6">
          <div>
            <Label htmlFor="profile" className="text-sm font-medium text-gray-700 mb-2 block">
              Profile Visibility
            </Label>
            <Select
              id="profile"
              value={formData.privacy.profile}
              onChange={(e) => handleNestedChange('privacy', 'profile')(e)}
              options={[
                { value: 'public', label: 'Public' },
                { value: 'friends', label: 'Friends Only' },
                { value: 'private', label: 'Private' }
              ]}
            />
            <p className="text-xs text-gray-500 mt-1">Who can see your profile information</p>
          </div>

          <div>
            <Label htmlFor="progress" className="text-sm font-medium text-gray-700 mb-2 block">
              Progress Sharing
            </Label>
            <Select
              id="progress"
              value={formData.privacy.progress}
              onChange={(e) => handleNestedChange('privacy', 'progress')(e)}
              options={[
                { value: 'public', label: 'Public' },
                { value: 'friends', label: 'Friends Only' },
                { value: 'private', label: 'Private' }
              ]}
            />
            <p className="text-xs text-gray-500 mt-1">Who can see your learning progress</p>
          </div>

          <div>
            <Label htmlFor="achievements" className="text-sm font-medium text-gray-700 mb-2 block">
              Achievement Sharing
            </Label>
            <Select
              id="achievements"
              value={formData.privacy.achievements}
              onChange={(e) => handleNestedChange('privacy', 'achievements')(e)}
              options={[
                { value: 'public', label: 'Public' },
                { value: 'friends', label: 'Friends Only' },
                { value: 'private', label: 'Private' }
              ]}
            />
            <p className="text-xs text-gray-500 mt-1">Who can see your achievements</p>
          </div>
        </div>
      </CleanCard>

      <CleanCard title="Data & Security" description="Manage your data and security settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Download Your Data</h4>
              <p className="text-sm text-gray-600">Get a copy of all your data</p>
            </div>
            <CleanButton variant="outline" size="sm">
              Download
            </CleanButton>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-600">Permanently delete your account and data</p>
            </div>
            <CleanButton variant="danger" size="sm">
              Delete
            </CleanButton>
          </div>
        </div>
      </CleanCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'account':
        return renderAccount();
      case 'preferences':
        return renderPreferences();
      case 'privacy':
        return renderPrivacy();
      default:
        return renderOverview();
    }
  };

  return (
    <CleanAppShell currentPage="profile" user={{ streak: 7, notifications: 2 }}>
      <CleanPageLayout
        title="Profile"
        description="Manage your account settings and preferences"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            {editing && (
              <>
                <CleanButton variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </CleanButton>
                <CleanButton variant="primary" size="sm" onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </CleanButton>
              </>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Tab Navigation */}
          <CleanCard className="p-0">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </CleanCard>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </CleanPageLayout>
    </CleanAppShell>
  );
}
