import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme, Theme } from '../context/ThemeContext';
import { Sun, Moon, Layers, Menu, ChevronDown, Palette } from 'lucide-react';

const Navbar: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const themes: { id: Theme; label: string; icon: React.ReactNode }[] = [
        { id: 'light', label: 'Light', icon: <Sun size={16} /> },
        { id: 'dark', label: 'Dark', icon: <Moon size={16} /> },
        { id: 'blueprint', label: 'Blueprint', icon: <Palette size={16} /> },
        { id: 'sandstone', label: 'Sandstone', icon: <Layers size={16} /> },
    ];

    const currentTheme = themes.find(t => t.id === theme) || themes[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsThemeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="border-b border-[var(--border)] bg-[var(--bg-secondary)] transition-colors duration-300 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
                            <span>DNA</span> <span className="font-light">ARCHITECT</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-6">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-[var(--accent)]' : 'hover:text-[var(--accent)]'
                                    }`}
                            >
                                Portfolio
                            </Link>
                            <Link
                                to="/admin"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/admin' ? 'text-[var(--accent)]' : 'hover:text-[var(--accent)]'
                                    }`}
                            >
                                Admin
                            </Link>

                            <div className="relative ml-4 border-l border-[var(--border)] pl-6" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-full border border-[var(--border)] hover:bg-[var(--bg-primary)] transition-all"
                                >
                                    <Palette size={18} />
                                    <span className="text-sm font-medium">{currentTheme.label}</span>
                                    <ChevronDown size={14} className={`transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isThemeDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-[var(--bg-secondary)] ring-1 ring-black ring-opacity-5 border border-[var(--border)] overflow-hidden">
                                        <div className="py-1">
                                            {themes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => {
                                                        setTheme(t.id);
                                                        setIsThemeDropdownOpen(false);
                                                    }}
                                                    className={`flex items-center w-full px-4 py-2 text-sm text-left transition-colors ${theme === t.id
                                                            ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                                                            : 'hover:bg-[var(--bg-primary)]'
                                                        }`}
                                                >
                                                    <span className="mr-3">{t.icon}</span>
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-[var(--bg-primary)] focus:outline-none"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--bg-primary)]"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Portfolio
                        </Link>
                        <Link
                            to="/admin"
                            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--bg-primary)]"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Admin
                        </Link>

                        <div className="px-3 py-2">
                            <p className="text-xs uppercase text-[var(--text-secondary)] font-semibold mb-2">Theme</p>
                            <div className="grid grid-cols-2 gap-2">
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setTheme(t.id);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`flex items-center justify-center px-3 py-2 rounded-md text-sm border ${theme === t.id
                                                ? 'bg-[var(--accent)] text-[var(--bg-primary)] border-transparent'
                                                : 'border-[var(--border)] hover:bg-[var(--bg-primary)]'
                                            }`}
                                    >
                                        <span className="mr-2">{t.icon}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
