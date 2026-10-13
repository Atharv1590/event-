import React, { useState, useEffect } from 'react';
import { ActiveTab, EventItem, CurrentUserSession } from '../types';
import { 
  QrCode, 
  ScanLine, 
  Users, 
  Palette,
  Sparkles,
  Printer,
  Mail,
  Send,
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  Calendar, 
  Lock, 
  Eye, 
  Key, 
  Search,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkle
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  assignedCount: number;
  unassignedCount: number;
  eventsCount: number;
  events: EventItem[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  currentUserEmail: string | null;
  currentSession: CurrentUserSession | null;
  onOpenGmailModal: () => void;
  activeDevicesCount?: number;
  onSearchAttendees?: (query: string) => void;
  isCameraActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  assignedCount,
  unassignedCount,
  eventsCount,
  events,
  selectedEventId,
  onSelectEvent,
  currentUserEmail,
  currentSession,
  onOpenGmailModal,
  activeDevicesCount = 1,
  onSearchAttendees,
  isCameraActive = false,
}) => {
  const [quickSearch, setQuickSearch] = useState('');

  const isGateOperator = currentSession?.role === 'gate_operator';
  const isClientViewer = currentSession?.role === 'client_viewer';
  const isOwner = !currentSession || currentSession.isOwner || currentSession.role === 'owner';
  const isScopedEvent = Boolean(currentSession?.allowedEventId && currentSession.allowedEventId !== 'all');

  // Filter active events respecting allowedEventId if scoped
  const activeEvents = events.filter(e => {
    if (e.status === 'ended') return false;
    if (isScopedEvent) {
      const idMatch = currentSession?.allowedEventId && e.id === currentSession.allowedEventId;
      const titleMatch = currentSession?.allowedEventTitle && e.title.toLowerCase().trim() === currentSession.allowedEventTitle.toLowerCase().trim();
      return idMatch || titleMatch;
    }
    return true;
  });

  const currentSelectedEvent = events.find(e => e.id === selectedEventId) || activeEvents[0];
  const totalPasses = assignedCount + unassignedCount;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchAttendees) {
      onSearchAttendees(quickSearch);
    }
    setActiveTab('passes');
  };

  return (
    <header className="sticky top-0 z-40 w-full select-none bg-slate-950/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl transition-all">

      {/* MAIN HEADER BAR: Brand, Amazon/Flipkart Quick Search, & Apple Profile Dock */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo & Tagline (Apple Sleek Typography) */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('passes')}>
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white font-black flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-600/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white font-display">
                    PASS<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-light italic">CRAFT</span>
                  </h1>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
                    PRO
                  </span>
                  {isGateOperator && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full font-mono flex items-center gap-1">
                      <ScanLine className="w-3 h-3" />
                      Gate Security
                    </span>
                  )}
                  {isClientViewer && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-mono flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Client Live
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-medium tracking-wide text-slate-400 mt-0.5">
                  Universal Event Operations &amp; QR Pass Ecosystem
                </p>
              </div>
            </div>

            {/* Mobile-only quick account button */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={onOpenGmailModal}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300"
                aria-label="Account Settings"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
          </div>

          {/* Amazon / Flipkart Style Quick Search & Jump Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="header-universal-search"
                type="text"
                value={quickSearch}
                onChange={e => {
                  setQuickSearch(e.target.value);
                  if (onSearchAttendees) onSearchAttendees(e.target.value);
                }}
                placeholder="Search attendee name, phone, 16-digit code..."
                className="w-full pl-10 pr-24 py-2 bg-slate-900/90 hover:bg-slate-900 text-xs text-white placeholder-slate-400 border border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute inset-y-1 right-1 px-3 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm"
              >
                <span>Find</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </form>
          </div>

          {/* Tata Motors Cockpit Event Selector & Apple Profile Pill */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            
            {/* Global Event Selector (Vehicle / Cockpit Mode Selector) */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-2xl shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap hidden lg:inline">
                Event:
              </span>
              {isScopedEvent ? (
                <div className="text-xs font-bold text-white max-w-[160px] truncate flex items-center gap-1.5 font-mono">
                  <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{activeEvents[0]?.title || currentSession?.allowedEventTitle || 'Assigned Event'}</span>
                </div>
              ) : (
                <select
                  id="header-event-selector"
                  value={selectedEventId}
                  onChange={e => onSelectEvent(e.target.value)}
                  className="bg-slate-950 text-white font-semibold text-xs border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-indigo-500 max-w-[150px] sm:max-w-[200px] truncate cursor-pointer hover:border-white/20 transition-colors"
                >
                  <option value="all">⚡ All Events ({activeEvents.length})</option>
                  {activeEvents.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      📅 {ev.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Apple / Google Identity Pill & Device Beacon */}
            <button
              id="header-btn-auth-profile"
              type="button"
              onClick={onOpenGmailModal}
              className={`px-3 py-1.5 border rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                currentUserEmail
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-500/50'
                  : 'bg-slate-900/90 border-white/10 text-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-500'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              {currentUserEmail ? (
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                  <span className="max-w-[100px] sm:max-w-[140px] truncate">{currentUserEmail}</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] uppercase font-sans flex items-center gap-1 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {activeDevicesCount > 1 ? `${activeDevicesCount} Devices` : '1 Sync'}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  CONNECT CLOUD
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Selected Event Indicator Banner if filtered */}
        {selectedEventId !== 'all' && currentSelectedEvent && (
          <div className="bg-indigo-950/40 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-1.5 py-0.5 bg-indigo-500/20 rounded">
                FOCUS EVENT
              </span>
              <span className="font-bold text-white truncate max-w-[200px] sm:max-w-none">{currentSelectedEvent.title}</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({currentSelectedEvent.date})</span>
            </div>
            {!isScopedEvent && (
              <button
                type="button"
                onClick={() => onSelectEvent('all')}
                className="text-[10px] font-semibold text-indigo-300 hover:text-white hover:underline uppercase cursor-pointer"
              >
                Reset to All
              </button>
            )}
          </div>
        )}

      </div>

      {/* 3. SAMSUNG ONE UI / APPLE SEGMENTED FLOATING DOCK: Sleek Organized Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
        <div className="p-1 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] shadow-inner">
          <nav 
            id="main-app-navigation-tabs"
            className="flex items-center overflow-x-auto no-scrollbar gap-1 text-xs font-semibold"
            aria-label="Application Tabs"
          >
            
            {/* GROUP 1: Gate & Turnstiles */}
            <div className="flex items-center gap-1 shrink-0">
              
              {/* Gate Scanner Tab */}
              <button
                id="tab-gate-scanner"
                type="button"
                onClick={() => setActiveTab('gate_scanner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'gate_scanner'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/30 font-bold border border-emerald-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <ScanLine className={`h-3.5 w-3.5 ${activeTab === 'gate_scanner' ? 'text-white' : 'text-emerald-400'}`} />
                <span className="text-[11px] font-semibold tracking-tight">Gate Scanner</span>
                {isCameraActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.9)]"></span>
                )}
              </button>

              {/* Scan & Assign Tab */}
              <button
                id="tab-scanner"
                type="button"
                onClick={() => setActiveTab('scanner')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'scanner'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold border border-indigo-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <QrCode className="h-4 w-4" />
                <span>Scan &amp; Assign</span>
                {unassignedCount > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                    activeTab === 'scanner'
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {unassignedCount}
                  </span>
                )}
              </button>

            </div>

            {/* Subtle Group Divider */}
            <div className="h-4 w-[1px] bg-white/10 mx-1 shrink-0 hidden sm:block"></div>

            {/* GROUP 2: Registry & Events */}
            <div className="flex items-center gap-1 shrink-0">
              
              {/* Passes Tab */}
              <button
                id="tab-passes"
                type="button"
                onClick={() => setActiveTab('passes')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'passes' || activeTab === 'assigned' || activeTab === 'unassigned'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold border border-indigo-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Passes</span>
                {totalPasses > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                    activeTab === 'passes' || activeTab === 'assigned' || activeTab === 'unassigned'
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-slate-800 text-slate-300 border-white/10'
                  }`}>
                    {totalPasses}
                  </span>
                )}
              </button>

              {/* Events & Creation Tab (Non-Gate Operator) */}
              {!isGateOperator && (
                <button
                  id="tab-events"
                  type="button"
                  onClick={() => setActiveTab('events')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'events' || activeTab === 'generator'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold border border-indigo-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Events &amp; Creation</span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                    activeTab === 'events' || activeTab === 'generator'
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-slate-800 text-slate-300 border-white/10'
                  }`}>
                    {events.length}
                  </span>
                </button>
              )}

            </div>

            {/* Non-Gate Operator Pro Modules */}
            {!isGateOperator && (
              <>
                {/* Subtle Group Divider */}
                <div className="h-4 w-[1px] bg-white/10 mx-1 shrink-0 hidden sm:block"></div>

                {/* GROUP 3: Outreach & Communication */}
                <div className="flex items-center gap-1 shrink-0">
                  
                  {/* Pass Bomber */}
                  <button
                    id="tab-email-tickets"
                    type="button"
                    onClick={() => setActiveTab('email_tickets')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === 'email_tickets'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold border border-indigo-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Send className="h-4 w-4" />
                    <span>Pass Bomber</span>
                  </button>

                  {/* Recap & Rules */}
                  <button
                    id="tab-rules-bomber"
                    type="button"
                    onClick={() => setActiveTab('rules_bomber')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === 'rules_bomber'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold border border-indigo-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Recap &amp; Rules</span>
                  </button>

                </div>

                {/* Subtle Group Divider */}
                <div className="h-4 w-[1px] bg-white/10 mx-1 shrink-0 hidden sm:block"></div>

                {/* GROUP 4: Studio & Finance */}
                <div className="flex items-center gap-1 shrink-0">
                  
                  {/* QR Print Lab */}
                  <button
                    id="tab-docs"
                    type="button"
                    onClick={() => setActiveTab('docs')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === 'docs'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold border border-indigo-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Printer className="h-4 w-4" />
                    <span>QR Print Lab</span>
                  </button>

                  {/* FLAP Desk (Financials) */}
                  <button
                    id="tab-financials"
                    type="button"
                    onClick={() => setActiveTab('financials')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === 'financials'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold border border-indigo-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>FLAP Desk</span>
                  </button>

                  {/* Pass Studio & Export */}
                  <button
                    id="tab-designer"
                    type="button"
                    onClick={() => setActiveTab('designer')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === 'designer' || activeTab === 'google_docs' || activeTab === 'google_forms'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-bold border border-purple-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Palette className="h-4 w-4 text-purple-400" />
                    <span>Pass Studio</span>
                    <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                  </button>

                </div>
              </>
            )}

          </nav>
        </div>
      </div>

    </header>
  );
};
