import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import {
  Diamond,
  Flame,
  Trophy,
  User,
  Database,
  Cpu,
  GitBranch,
  Globe,
  Menu,
} from 'lucide-react';

const Navbar = () => {
  const [selectedSkill, setSelectedSkill] = useState('dsa');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const pathname = router.pathname;

  const skills = [
    { id: 'dsa', label: 'DSA', icon: Database, active: true },
    { id: 'algorithms', label: 'Algorithms', icon: Cpu, active: false },
    { id: 'system-design', label: 'System Design', icon: GitBranch, active: false },
    { id: 'web-dev', label: 'Web Dev', icon: Globe, active: false },
  ];

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Learning', path: '/learning' },
    { label: 'Leaderboard', path: '/leaderboard' },
  ];

  return (
    <nav className="bg-white dark:bg-[#0f131a] backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main Navigation */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <Diamond className="h-8 w-8 text-blue-600" />
              <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-md" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              CampusPrep
            </span>
          </Link>

          {/* Main Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                href={item.path}
                className={`transition-colors duration-200 font-medium ${
                  pathname === item.path
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Stats & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Streak */}
            <div className="hidden sm:flex items-center gap-2 text-sm flex-shrink-0 text-gray-700 dark:text-gray-300">
              <Flame className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{user?.gamification?.currentStreak ?? 0}</span>
            </div>

            {/* Credits */}
            <div className="hidden sm:flex items-center gap-2 text-sm flex-shrink-0 text-gray-700 dark:text-gray-300">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{user?.gamification?.totalCredits ?? 0}</span>
            </div>

            {!user ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full w-10 h-10 p-0 flex-shrink-0"
                >
                  <Link href="/login" aria-label="Open login">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex flex-shrink-0">
                  <Link href="/login" aria-label="Sign in">
                    Sign In
                  </Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 flex-shrink-0">
                  <Link href={`/profile/${user.id}`} aria-label="Open profile">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Theme toggle */}
            <ThemeSwitcher />

            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden flex-shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-4">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <Diamond className="h-6 w-6 text-blue-600" />
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      CampusPrep
                    </span>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`p-3 rounded-lg transition-colors ${
                          pathname === item.path
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    {!user ? (
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Sign In
                      </Link>
                    ) : (
                      <>
                        <Link
                          href={`/profile/${user.id}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="p-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Profile
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Mobile Stats */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">6 days</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Credits</span>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Skills Toggle Bar */}
        <div className="pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pr-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
              Learning Path:
            </span>
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              const active = selectedSkill === skill.id;
              return (
                <Button
                  key={skill.id}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSkill(skill.id)}
                  className={active ? 'shadow-sm' : ''}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {skill.label}
                  {skill.active && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
