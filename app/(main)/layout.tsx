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
    CalendarDays,
    Sparkles,
    Star,
    ChevronRight,
    Archive,
    Bell,
    Headset,
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

    const navigation = [
        {
            name: "Tableau de bord",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Commercial",
            href: "/commercial",
            icon: Users,
            subItems: [
                {
                    name: "Auto-école",
                    href: "/commercial/auto-ecole",
                },
                {
                    name: "Candidat",
                    href: "/commercial/candidat",
                },
            ],
        },
        {
            name: "Juridique",
            href: "/juridique",
            icon: Receipt,
            subItems: [
                {
                    name: "Contrat",
                    href: "/juridique/contrat",
                    subItems: [
                        {
                            name: "Contrat Autoecole",
                            href: "/juridique/contrat/autoecole",
                        },
                        {
                            name: "Contrat Partenaire",
                            href: "/juridique/contrat/partenaire",
                        },
                        {
                            name: "Contrat de Convention",
                            href: "/juridique/contrat/convention",
                        },
                    ],
                },
            ],
        },
        {
            name: "Marketing",
            href: "/marketing",
            icon: Sparkles,
            subItems: [
                {
                    name: "Les Entreprises conventionnés",
                    href: "/marketing/entreprises-conventionnees",
                },
                {
                    name: "Strategie de Marketing",
                    href: "/marketing/strategie-de-marketing",
                },
            ],
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
            name: "Convention",
            href: "/convention",
            icon: CalendarDays,
        },
        {
            name: "Facture",
            href: "/facture",
            icon: Receipt,
        },
        {
            name: "Archive",
            href: "/archive",
            icon: Archive,
        },
        {
            name: "Cout a payer",
            href: "/total-cout-a-payer",
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
                {/* Mobile Header */}
                <header
                    className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-center px-4 py-4">
                        <Link
                            href="/dashboard"
                            className="flex items-start justify-center "
                        >
                            <Image
                                src="/logo.png"
                                alt="AutoEcoli"
                                width={100}
                                height={100}
                                className="object-contain h-20 w-auto"
                                priority
                            />
                        </Link>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6"/>
                                ) : (
                                    <Menu className="w-6 h-6"/>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeMobileMenu}
                    />
                )}

                {/* Sidebar Navigation */}
                <aside
                    className={`fixed lg:relative left-0 border-r top-0 h-full lg:h-screen w-64 shrink-0 bg-white border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo Section */}
                        <div className="relative border-b  border-gray-200">
                            <Link
                                href="/dashboard"
                                onClick={closeMobileMenu}
                                className="flex items-center  justify-center w-full"
                            >
                                <Image
                                    src="/logo.png"
                                    alt="AutoEcoli"
                                    width={100}
                                    height={100}
                                    className="object-contain h-28 w-auto"
                                    priority
                                />
                            </Link>

                            {/* Mobile Close Button */}
                            <button
                                onClick={closeMobileMenu}
                                className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto p-3 lg:p-4">
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
                                                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                                            ? "bg-[#1E3A8A]/10 text-[#1E3A8A] shadow-sm"
                                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Icon
                                                                className={`w-5 h-5 ${active ? "text-[#1E3A8A]" : "text-gray-500"}`}
                                                            />
                                                            <span>{item.name}</span>
                                                        </div>
                                                        <ChevronRight
                                                            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""
                                                            }`}
                                                        />
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="ml-8 mt-1 space-y-1">
                                                            {item.subItems.map((subItem: SubMenuItem) => {
                                                                const hasNestedItems = subItem.subItems && subItem.subItems.length > 0;
                                                                const isNestedExpanded = expandedMenus.includes(subItem.name);

                                                                return hasNestedItems ? (
                                                                    <div key={subItem.name}>
                                                                        <button
                                                                            onClick={() => toggleSubmenu(subItem.name)}
                                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${isActive(subItem.href)
                                                                                ? "bg-[#1E3A8A]/10 text-[#1E3A8A] font-medium"
                                                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                                            }`}
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
                                                                                        className={`block px-3 py-2 rounded-lg text-xs transition-all ${isActive(nestedItem.href)
                                                                                            ? "bg-[#1E3A8A]/10 text-[#1E3A8A] font-medium"
                                                                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                                                        }`}
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
                                                                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${isActive(subItem.href)
                                                                            ? "bg-[#1E3A8A]/10 text-[#1E3A8A] font-medium"
                                                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                                        }`}
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
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                                        ? "bg-[#1E3A8A]/10 text-[#1E3A8A] shadow-sm"
                                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                    }`}
                                                >
                                                    <div className="relative">
                                                        <Icon
                                                            className={`w-5 h-5 ${active ? "text-[#1E3A8A]" : "text-gray-500"}`}
                                                        />
                                                        {item.name === "Notifications" && unreadCount > 0 && (
                                                            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                                                {unreadCount > 9 ? '9+' : unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span>{item.name}</span>
                                                    {item.name === "Notifications" && unreadCount > 0 && (
                                                        <span className="ml-auto flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                                            {unreadCount}
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
                        <div className="p-4 border-t border-gray-200">


                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4"/>
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Desktop Layout Container */}
                <div className="hidden lg:flex flex-col flex-1 h-screen overflow-hidden">
                    {/* Desktop Header */}
                    <header className="h-16 bg-white border-b border-gray-200 z-40 shrink-0">
                        <div className="flex items-center justify-between h-full px-6">
                            {/* Pack Badge */}
                            {/* <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              autoEcole?.pack
                ? autoEcole.pack === 'gold'
                  ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#C4A030]/10 border-[#D4AF37]/30'
                  : autoEcole.pack === 'silver'
                  ? 'bg-gradient-to-r from-[#C0C0C0]/10 to-[#A8A8A8]/10 border-[#C0C0C0]/30'
                  : 'bg-gradient-to-r from-[#CD7F32]/10 to-[#B8702D]/10 border-[#CD7F32]/30'
                : 'bg-gray-50 border-gray-200 border-dashed'
            } ${isRTL ? 'flex-row-reverse' : ''}`}>
              {autoEcole?.pack ? (
                <>
                  {autoEcole.pack === 'gold' ? (
                    <Crown className="w-5 h-5 text-[#D4AF37]" />
                  ) : autoEcole.pack === 'silver' ? (
                    <Star className="w-5 h-5 text-[#C0C0C0]" />
                  ) : (
                    <Users className="w-5 h-5 text-[#CD7F32]" />
                  )}
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <p className={`text-xs font-semibold ${
                      autoEcole.pack === 'gold'
                        ? 'text-[#D4AF37]'
                        : autoEcole.pack === 'silver'
                        ? 'text-[#C0C0C0]'
                        : 'text-[#CD7F32]'
                    }`}>
                      {t(`dashboard.packs.${autoEcole.pack}`)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {autoEcole.pack === 'gold' ? t('dashboard.packs.premium') : autoEcole.pack === 'silver' ? t('dashboard.packs.advanced') : t('dashboard.packs.essential')}
                    </p>
                  </div>
                </>
              ) : (
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-xs font-medium text-gray-400">Aucun pack</p>
                  <p className="text-xs text-gray-400">En attente d'affectation</p>
                </div>
              )}
            </div> */}
                            <div>
                                {autoEcoleName}
                            </div>
                            {/* Right Side Actions */}
                            <div className="flex items-center gap-2">
                                {/* Search Bar - Removed */}
                                {/* <div className="hidden xl:block w-64">
                  <div className="relative">
                    <Search
                      className={`absolute ${
                        isRTL ? "right-3" : "left-3"
                      } top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                    />
                    <input
                      type="text"
                      placeholder={t("dashboard.header.search")}
                      className={`w-full ${
                        isRTL ? "pr-9 pl-4" : "pl-9 pr-4"
                      } py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors placeholder-gray-900 ${
                        isRTL ? "text-right" : ""
                      }`}
                    />
                  </div>
                </div> */}

                                {/* Settings - Removed */}

                                {/* User Profile Dropdown */}
                                <div
                                    className="relative pl-3 border-l border-gray-200"
                                    ref={userMenuRef}
                                >
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                        aria-label="User menu"
                                    >
                                        <Image
                                            src={autoEcoleLogo || "/logo.png"}
                                            alt="Profile"
                                            width={48}
                                            height={48}
                                            className="object-contain"
                                        />
                                        <div className="text-left hidden 2xl:block">
                                            <p className="text-sm font-medium text-gray-900">
                                                {autoEcoleName}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                                {user?.email || "admin@autoecoli.tn"}
                                            </p>
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                            <div className="px-4 py-3 border-b border-gray-200">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {autoEcoleName}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user?.email || "admin@autoecoli.tn"}
                                                </p>
                                            </div>
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
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="max-w-7xl mx-auto">{children}</div>
                    </main>
                </div>

                {/* Mobile Main Content */}
                <main className="lg:hidden pt-16 min-h-screen flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
