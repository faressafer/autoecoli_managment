"use client";

import {useState, useEffect, useRef} from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Receipt,
    LogOut,
    Menu,
    X,
    Settings,
    ChevronDown,
    Star,
    ChevronRight,
    Bell,
    Headset,
    Car,
    ClipboardList,
    type LucideIcon,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {useAuth} from "@/contexts/AuthContext";

interface NestedMenuItem {
    name: string;
    href: string;
}

interface SubMenuItem {
    name: string;
    href: string;
    subItems?: NestedMenuItem[];
}

interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    subItems?: SubMenuItem[];
}


export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const {signOut, user, autoEcole, isSuperAdmin, adminProfile} = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const toggleSubmenu = (name: string) => {
        setExpandedMenus(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    const autoEcoleName = isSuperAdmin ? (adminProfile?.username || "Super Admin") : (autoEcole?.name || "Auto-école");
    const autoEcoleLogo = isSuperAdmin ? null : (autoEcole?.logo || null);

    const handleSignOut = async () => {
        await signOut();
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserMenuOpen]);

    // Subscribe to real-time unread notifications count
    useEffect(() => {
        // Dynamically import to avoid SSR issues
        const loadNotificationListener = async () => {
            const { subscribeToUnreadCount } = await import("@/lib/firebase/services/notifications");
            
            const unsubscribe = subscribeToUnreadCount(
                (count) => setUnreadCount(count),
                isSuperAdmin ? undefined : autoEcole?.id
            );

            return unsubscribe;
        };

        let unsubscribePromise: Promise<() => void>;
        
        if (autoEcole?.id || isSuperAdmin) {
            unsubscribePromise = loadNotificationListener();
        }

        return () => {
            if (unsubscribePromise) {
                unsubscribePromise.then((unsubscribe) => unsubscribe());
            }
        };
    }, [isSuperAdmin, autoEcole?.id]);

    const navigation: MenuItem[] = [
        {
            name: "Tableau de bord",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Questionnaires",
            href: "/questionnaires",
            icon: ClipboardList,
        },
        {
            name: "Auto-école",
            href: "/commercial/auto-ecole",
            icon: Car,
        },
        {
            name: "Candidat",
            href: "/commercial/candidat",
            icon: Users,
        },

        {
            name: "Sponsoring",
            href: "/sponsoring",
            icon: Star,
        },
        {
            name: "Caisse",
            href: "/caisse",
            icon: Receipt,
        },
        {
            name: "Notifications",
            href: "/notifications",
            icon: Bell,
        },
        {
            name: "Support",
            href: "/support",
            icon: Headset,
        },
    ];

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname?.startsWith(href);
    };

    const currentPage = navigation.find((item) => isActive(item.href));
    const accountEmail = isSuperAdmin ? (adminProfile?.email || user?.email) : (autoEcole?.email || user?.email);

    const linkClass = (active: boolean) =>
        `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active
            ? "bg-[#1E3A8A] text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`;
    const iconClass = (active: boolean) =>
        `h-5 w-5 shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`;
    const subLinkClass = (active: boolean) =>
        `block rounded-lg px-3 py-2 text-sm transition-colors ${active
            ? "bg-[#1E3A8A]/10 font-medium text-[#1E3A8A]"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 text-gray-900 lg:flex">
                {/* Mobile Header */}
                <header
                    className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 -ml-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu className="w-6 h-6"/>
                    </button>
                    <Link href="/dashboard" className="absolute left-1/2 -translate-x-1/2">
                        <Image
                            src="/logo.png"
                            alt="AutoEcoli"
                            width={100}
                            height={100}
                            className="object-contain h-11 w-auto"
                            priority
                        />
                    </Link>
                    <span className="max-w-[40%] truncate text-sm font-semibold text-gray-900">
                        {currentPage?.name}
                    </span>
                </header>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/40 z-40"
                        onClick={closeMobileMenu}
                    />
                )}

                {/* Sidebar Navigation */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-gray-200 bg-white transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo Section */}
                        <div className="relative flex h-24 shrink-0 items-center justify-center border-b border-gray-100">
                            <Link href="/dashboard" onClick={closeMobileMenu}>
                                <Image
                                    src="/logo.png"
                                    alt="AutoEcoli"
                                    width={100}
                                    height={100}
                                    className="object-contain h-20 w-auto"
                                    priority
                                />
                            </Link>

                            {/* Mobile Close Button */}
                            <button
                                onClick={closeMobileMenu}
                                className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                aria-label="Fermer le menu"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-3 py-4">
                            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Menu</p>
                            <div className="space-y-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.href);
                                    const hasSubItems = item.subItems && item.subItems.length > 0;
                                    const isExpanded = expandedMenus.includes(item.name);

                                    return (
                                        <div key={item.name}>
                                            {hasSubItems ? (
                                                <>
                                                    <button
                                                        onClick={() => toggleSubmenu(item.name)}
                                                        className={`w-full justify-between ${linkClass(false)} ${active ? "text-[#1E3A8A]" : ""}`}
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            <Icon className={iconClass(false)}/>
                                                            {item.name}
                                                        </span>
                                                        <ChevronRight
                                                            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                                        />
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="ml-8 mt-1 space-y-1">
                                                            {item.subItems?.map((subItem: SubMenuItem) => {
                                                                const hasNestedItems = subItem.subItems && subItem.subItems.length > 0;
                                                                const isNestedExpanded = expandedMenus.includes(subItem.name);

                                                                return hasNestedItems ? (
                                                                    <div key={subItem.name}>
                                                                        <button
                                                                            onClick={() => toggleSubmenu(subItem.name)}
                                                                            className={`w-full flex items-center justify-between ${subLinkClass(!!isActive(subItem.href))}`}
                                                                        >
                                                                            <span>{subItem.name}</span>
                                                                            <ChevronRight
                                                                                className={`w-3 h-3 transition-transform ${isNestedExpanded ? "rotate-90" : ""}`}
                                                                            />
                                                                        </button>
                                                                        {isNestedExpanded && (
                                                                            <div className="ml-6 mt-1 space-y-1">
                                                                                {subItem.subItems?.map((nestedItem: NestedMenuItem) => (
                                                                                    <Link
                                                                                        key={nestedItem.name}
                                                                                        href={nestedItem.href}
                                                                                        onClick={closeMobileMenu}
                                                                                        className={subLinkClass(!!isActive(nestedItem.href))}
                                                                                    >
                                                                                        {nestedItem.name}
                                                                                    </Link>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <Link
                                                                        key={subItem.name}
                                                                        href={subItem.href}
                                                                        onClick={closeMobileMenu}
                                                                        className={subLinkClass(!!isActive(subItem.href))}
                                                                    >
                                                                        {subItem.name}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    onClick={closeMobileMenu}
                                                    aria-current={active ? "page" : undefined}
                                                    className={linkClass(!!active)}
                                                >
                                                    <Icon className={iconClass(!!active)}/>
                                                    <span>{item.name}</span>
                                                    {item.name === "Notifications" && unreadCount > 0 && (
                                                        <span className={`ml-auto flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-xs font-bold rounded-full ${active ? "bg-white text-[#1E3A8A]" : "bg-red-500 text-white"}`}>
                                                            {unreadCount > 99 ? "99+" : unreadCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </nav>

                        {/* User Section */}
                        <div className="border-t border-gray-100 p-3">
                            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-sm font-bold text-[#1E3A8A]">
                                    {autoEcoleName.charAt(0).toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900">{autoEcoleName}</p>
                                    <p className="truncate text-xs text-gray-500">{isSuperAdmin ? "Super Admin" : accountEmail}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4"/>
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Content column (one <main> for every screen size, so each page mounts once) */}
                <div className="flex min-w-0 flex-1 flex-col lg:h-screen">
                    {/* Desktop Header */}
                    <header className="hidden lg:flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8">
                        <h2 className="text-lg font-semibold text-gray-900">{currentPage?.name ?? ""}</h2>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
                                aria-label="Menu utilisateur"
                                aria-expanded={isUserMenuOpen}
                            >
                                {autoEcoleLogo ? (
                                    <Image
                                        src={autoEcoleLogo}
                                        alt=""
                                        width={36}
                                        height={36}
                                        className="h-9 w-9 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3A8A] text-sm font-bold text-white">
                                        {autoEcoleName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-900">{autoEcoleName}</p>
                                    {accountEmail && (
                                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{accountEmail}</p>
                                    )}
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <Settings className="w-4 h-4"/>
                                        <span>Paramètres</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            handleSignOut();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4"/>
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 pt-16 lg:pt-0 lg:overflow-y-auto">
                        <div className="max-w-7xl mx-auto">{children}</div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
