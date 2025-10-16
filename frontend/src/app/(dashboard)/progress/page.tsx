"use client";

import React, { useState } from 'react';
import { CleanAppShell, CleanPageLayout, CleanCard, CleanButton } from '@/components/layout';
import { TrendingUp, Target, Award, Flame, Calendar, Clock, Star, CheckCircle, BarChart, PieChart } from 'lucide-react';

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Progress', href: '/progress' }
  ];

  const progressStats = [
    { label: 'Total XP', value: '12,450', change: '+1,250', icon: <Star className="w-5 h-5 text-gray-700" /> },
    { label: 'Current Level', value: '15', change: '+2', icon: <Target className="w-5 h-5 text-purple-600" /> },
    { label: 'Streak', value: '12 days', change: '+3', icon: <Flame className="w-5 h-5 text-green-600" /> },
    { label: 'Accuracy', value: '94%', change: '+2%', icon: <CheckCircle className="w-5 h-5 text-green-600" /> }
  ];

  const recentAchievements = [
    { id: 1, title: 'Hiragana Master', description: 'Completed all Hiragana characters', date: '2 days ago', icon: <Award className="w-5 h-5 text-purple-600" /> },
    { id: 2, title: 'Week Warrior', description: '7-day learning streak', date: '1 week ago', icon: <Flame className="w-5 h-5 text-green-600" /> },
    { id: 3, title: 'Speed Demon', description: 'Answered 50 questions in under 5 minutes', date: '2 weeks ago', icon: <Clock className="w-5 h-5 text-gray-700" /> }
  ];

  const weeklyProgress = [
    { day: 'Mon', value: 85, label: 'Monday' },
    { day: 'Tue', value: 92, label: 'Tuesday' },
    { day: 'Wed', value: 78, label: 'Wednesday' },
    { day: 'Thu', value: 95, label: 'Thursday' },
    { day: 'Fri', value: 88, label: 'Friday' },
    { day: 'Sat', value: 76, label: 'Saturday' },
    { day: 'Sun', value: 90, label: 'Sunday' }
  ];

  const learningGoals = [
    { id: 1, title: 'Learn 50 Kanji', progress: 34, target: 50, deadline: '2024-02-15' },
    { id: 2, title: 'Complete Hiragana', progress: 100, target: 100, deadline: '2024-01-20' },
    { id: 3, title: 'Daily Practice', progress: 12, target: 30, deadline: '2024-02-01' }
  ];

  return (
    <CleanAppShell currentPage="progress" user={{ streak: 12, notifications: 3 }}>
      <CleanPageLayout
        title="Your Progress"
        description="Track your learning journey and celebrate achievements"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <CleanButton variant="outline" size="sm">
              <BarChart className="w-4 h-4 mr-2" />
              Detailed Analytics
            </CleanButton>
          </div>
        }
      >
        <div className="p-6 space-y-6">
          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {progressStats.map((stat, index) => (
              <CleanCard key={index} padding="sm">
                <div className="flex items-center justify-between mb-2">
                  {stat.icon}
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </CleanCard>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Progress Chart */}
            <div className="lg:col-span-2">
              <CleanCard title="Weekly Progress" description="Your learning activity this week">
                <div className="space-y-4">
                  <div className="flex items-end justify-between h-32">
                    {weeklyProgress.map((day, index) => (
                      <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="bg-green-600 rounded-t w-8 transition-all duration-300 hover:bg-green-700"
                        style={{ height: `${(day.value / 100) * 80}px` }}
                        title={`${day.label}: ${day.value}%`}
                      />
                        <span className="text-xs text-gray-600">{day.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Lowest: 76% (Saturday)</span>
                    <span>Highest: 95% (Thursday)</span>
                  </div>
                </div>
              </CleanCard>
            </div>

            {/* Recent Achievements */}
            <div>
              <CleanCard title="Recent Achievements" description="Your latest accomplishments">
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">{achievement.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CleanCard>
            </div>
          </div>

          {/* Learning Goals */}
          <CleanCard title="Learning Goals" description="Track your progress towards your objectives">
            <div className="space-y-4">
              {learningGoals.map((goal) => (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <span className="text-sm text-gray-600">
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 mr-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round((goal.progress / goal.target) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                    {goal.progress >= goal.target && (
                      <span className="text-green-600 font-medium">Completed!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CleanCard>

        </div>
      </CleanPageLayout>
    </CleanAppShell>
  );
}