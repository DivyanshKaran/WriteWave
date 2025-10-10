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
  Label, 
  Input, 
  Button, 
  Checkbox, 
  Radio, 
  Select, 
  Toggle, 
  Textarea, 
  Field,
  type SelectOption 
} from '@/components/forms';
import { useState } from 'react';

const navigation: TopNavigationItem[] = [
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
  { id: 'profile', label: 'Profile', href: '/profile' },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Forms Demo', current: true },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'demo',
    title: 'Demo',
    items: [
      { id: 'forms', label: 'Form Components', href: '/forms-demo', icon: SidebarIcons.settings, active: true },
    ],
  },
];

const selectOptions: SelectOption[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert', disabled: true },
];

export default function FormsDemoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    level: '',
    newsletter: false,
    notifications: true,
    experience: '',
    bio: '',
    terms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, level: value }));
  };

  const handleCheckboxChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.checked }));
  };

  return (
    <AppShell 
      navigation={navigation}
      user={{ streak: 7, notifications: 3 }}
    >
      <div className="flex">
        <Sidebar sections={sidebarSections} />
        
        <MainContentArea hasSidebar>
          <Section>
            <div className="space-y-8">
              <Breadcrumb items={breadcrumbs} />
              
              <div className="max-w-2xl">
                <h1 className="heading text-3xl font-bold mb-8">Form System Demo</h1>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Text Inputs */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Text Inputs</h2>
                    
                    <Field label="Full Name" required>
                      <Input
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        state={errors.name ? 'error' : 'default'}
                        errorMessage={errors.name}
                      />
                    </Field>

                    <Field label="Email Address" required>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        state={errors.email ? 'error' : 'default'}
                        errorMessage={errors.email}
                      />
                    </Field>

                    <Field label="Success State Example">
                      <Input
                        placeholder="This field has success state"
                        state="success"
                      />
                    </Field>

                    <Field label="Disabled Input">
                      <Input
                        placeholder="This input is disabled"
                        disabled
                        defaultValue="Disabled value"
                      />
                    </Field>
                  </div>

                  {/* Select Dropdown */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Select Dropdown</h2>
                    
                    <Field label="Experience Level" required>
                      <Select
                        placeholder="Select your level"
                        options={selectOptions}
                        value={formData.level}
                        onChange={handleSelectChange}
                      />
                    </Field>
                  </div>

                  {/* Checkboxes and Radios */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Checkboxes & Radios</h2>
                    
                    <div className="space-y-4">
                      <Checkbox
                        label="Subscribe to newsletter"
                        checked={formData.newsletter}
                        onChange={handleCheckboxChange('newsletter')}
                      />
                      
                      <Checkbox
                        label="Disabled checkbox"
                        disabled
                        defaultChecked
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Experience Level</Label>
                      <div className="space-y-2">
                        <Radio
                          name="experience"
                          value="beginner"
                          label="Beginner (0-1 years)"
                          checked={formData.experience === 'beginner'}
                          onChange={handleInputChange('experience')}
                        />
                        <Radio
                          name="experience"
                          value="intermediate"
                          label="Intermediate (1-3 years)"
                          checked={formData.experience === 'intermediate'}
                          onChange={handleInputChange('experience')}
                        />
                        <Radio
                          name="experience"
                          value="advanced"
                          label="Advanced (3+ years)"
                          checked={formData.experience === 'advanced'}
                          onChange={handleInputChange('experience')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Toggle Switch</h2>
                    
                    <Toggle
                      label="Enable notifications"
                      checked={formData.notifications}
                      onChange={handleCheckboxChange('notifications')}
                    />
                    
                    <Toggle
                      label="Disabled toggle"
                      disabled
                      defaultChecked
                    />
                  </div>

                  {/* Textarea */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Textarea</h2>
                    
                    <Field label="Bio" required>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={handleInputChange('bio')}
                        rows={4}
                        minHeight="120px"
                      />
                    </Field>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-6">
                    <h2 className="heading text-xl font-semibold">Buttons</h2>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4 flex-wrap">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="tertiary">Tertiary Button</Button>
                        <Button variant="destructive">Destructive Button</Button>
                      </div>
                      
                      <div className="flex gap-4 flex-wrap">
                        <Button variant="primary" disabled>Disabled Primary</Button>
                        <Button variant="secondary" disabled>Disabled Secondary</Button>
                        <Button variant="primary" loading>Loading Button</Button>
                      </div>
                      
                      <div className="flex gap-4 flex-wrap">
                        <Button variant="primary" size="sm">Small</Button>
                        <Button variant="primary" size="md">Medium</Button>
                        <Button variant="primary" size="lg">Large</Button>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        label="I agree to the terms and conditions"
                        checked={formData.terms}
                        onChange={handleCheckboxChange('terms')}
                        required
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        loading={loading}
                        disabled={!formData.terms}
                      >
                        Submit Form
                      </Button>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </Section>
        </MainContentArea>
      </div>
    </AppShell>
  );
}
