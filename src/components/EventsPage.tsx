import React, { useState, useMemo, useEffect } from 'react';
import { EventItem, PassItem, FinancialEntry, TicketTierConfig } from '../types';
import { TicketTypesPage } from './TicketTypesPage';
import { BroadcastHistoryPage } from './BroadcastHistoryPage';
import { DemoGuidePage } from './DemoGuidePage';
import { getDispatchHistory, DISPATCH_HISTORY_UPDATED_EVENT } from '../utils/historyStorage';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  CalendarOff, 
  RefreshCw, 
  Search, 
  Layers, 
  ArrowRight, 
  Tag, 
  BarChart3, 
  Users, 
  X, 
  AlertTriangle,
  Lock,
  CheckCircle,
  Filter,
  Check,
  Ticket,
  Palette,
  DollarSign,
  Zap,
  History,
  BookOpen,
  Edit3,
  Save,
  FileText,
  Printer,
  Download,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';

interface EventsPageProps {
  events: EventItem[];
  passes?: PassItem[];
  financials?: FinancialEntry[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  onAddEvent: (event: EventItem) => void;
  onUpdateEvent?: (event: EventItem) => void;
  onDeleteEvent?: (eventId: string) => void;
  onEndEvent?: (eventId: string) => void;
  onReopenEvent?: (eventId: string) => void;
  onNavigateToPasses: () => void;
  onAddPasses?: (newPasses: PassItem[]) => void;
  onAddFinancials?: (newFinancials: any[]) => void;
  onClearDemoData?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

const COLOR_OPTIONS = [
  { name: 'Emerald', hex: '#059669' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Sky', hex: '#0284c7' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Fuchsia', hex: '#c026d3' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Cyan', hex: '#0891b2' },
  { name: 'Dark Slate', hex: '#0f172a' },
];

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  passes = [],
  financials = [],
  selectedEventId,
  onSelectEvent,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onEndEvent,
  onReopenEvent,
  onNavigateToPasses,
  onAddPasses,
  onAddFinancials,
  onClearDemoData,
  onNavigateToTab
}) => {

  // New Event Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  });
  const [commencementTime, setCommencementTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('06:00 PM');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('PassCraft Official');
  const [tagline, setTagline] = useState('Official Access & Verification');
  const [themeColor, setThemeColor] = useState('#059669');
  const [category, setCategory] = useState('Conference / Summit');
  const [dressCode, setDressCode] = useState('Smart Casual');

  // Sub-Navigation Tabs: 'creation' = Event Creation & Directory, 'ticket_types' = Ticket Types, Pricing & Colors, 'history' = Broadcast & Email History, 'demo' = Demo Sandbox & Walkthrough Guide
  const [activeSubTab, setActiveSubTab] = useState<'creation' | 'ticket_types' | 'history' | 'demo'>('creation');
  const [historyCount, setHistoryCount] = useState<number>(() => getDispatchHistory().length);

  // Sync history count
  useEffect(() => {
    const handleHistoryUpdate = () => {
      setHistoryCount(getDispatchHistory().length);
    };
    window.addEventListener(DISPATCH_HISTORY_UPDATED_EVENT, handleHistoryUpdate);
    window.addEventListener('storage', handleHistoryUpdate);
    return () => {
      window.removeEventListener(DISPATCH_HISTORY_UPDATED_EVENT, handleHistoryUpdate);
      window.removeEventListener('storage', handleHistoryUpdate);
    };
  }, []);

  // Form Ticket Tiers (for creating an event with initial custom tiers)
  const [formTicketTiers, setFormTicketTiers] = useState<TicketTierConfig[]>([
    { id: 'tier-init-1', categoryName: 'VIP Pass', price: 1500, color: '#eab308', description: 'Front-row access & VIP hospitality', capacity: 50 },
    { id: 'tier-init-2', categoryName: 'General Admission', price: 499, color: '#10b981', description: 'Standard summit hall access', capacity: 200 },
  ]);
  const [inlineTierName, setInlineTierName] = useState('');
  const [inlineTierPrice, setInlineTierPrice] = useState('299');
  const [inlineTierColor, setInlineTierColor] = useState('#06b6d4');

  // Total count of configured tiers across all events
  const totalTiersCount = useMemo(() => {
    return events.reduce((acc, ev) => acc + (ev.ticketTiers?.length || 0), 0);
  }, [events]);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Success Notification
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Search and Filter State for Events List
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>('all');

  // Modals
  const [insightEvent, setInsightEvent] = useState<EventItem | null>(null);
  const [actionConfirmModal, setActionConfirmModal] = useState<{
    type: 'end' | 'delete' | 'reopen' | null;
    event?: EventItem;
  }>({ type: null });
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<1 | 2 | 3>(1);
  const [postEventReportEvent, setPostEventReportEvent] = useState<EventItem | null>(null);

  // Edit Event Details State
  const [editForm, setEditForm] = useState<{
    id: string;
    title: string;
    date: string;
    commencementTime: string;
    endTime: string;
    location: string;
    organizer: string;
    tagline: string;
    themeColor: string;
    dressCode: string;
    status: 'active' | 'ended';
  } | null>(null);

  const handleStartEdit = (event: EventItem) => {
    setEditForm({
      id: event.id,
      title: event.title,
      date: event.date,
      commencementTime: event.commencementTime || event.time || '10:00 AM',
      endTime: event.endTime || '06:00 PM',
      location: event.location,
      organizer: event.organizer || '',
      tagline: event.tagline || '',
      themeColor: event.themeColor || '#4f46e5',
      dressCode: event.dressCode || '',
      status: event.status || 'active',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    if (!editForm.title.trim() || !editForm.date || !editForm.location.trim()) {
      return;
    }

    const existingEvent = events.find(ev => ev.id === editForm.id);
    if (!existingEvent) return;

    const updated: EventItem = {
      ...existingEvent,
      title: editForm.title.trim(),
      date: editForm.date,
      time: editForm.commencementTime.trim() || existingEvent.time,
      commencementTime: editForm.commencementTime.trim(),
      endTime: editForm.endTime.trim(),
      location: editForm.location.trim(),
      organizer: editForm.organizer.trim() || 'PassCraft Events',
      tagline: editForm.tagline.trim(),
      themeColor: editForm.themeColor,
      dressCode: editForm.dressCode.trim(),
      status: editForm.status,
      endedAt: editForm.status === 'ended' ? (existingEvent.endedAt || new Date().toISOString()) : undefined,
    };

    if (onUpdateEvent) {
      onUpdateEvent(updated);
    }
    setFeedbackMessage(`✅ Successfully updated details for "${updated.title}"! Changes synchronized across passes and reports.`);
    setTimeout(() => setFeedbackMessage(null), 5000);
    setEditForm(null);
  };

  // Separate Active vs Ended Events
  const activeEvents = useMemo(() => events.filter(e => e.status !== 'ended'), [events]);
  const endedEvents = useMemo(() => events.filter(e => e.status === 'ended'), [events]);

  // Filtered Events - Active / Open events on top, Finished events below
  const displayedEvents = useMemo(() => {
    const filtered = events.filter(ev => {
      const matchesSearch = 
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.organizer.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'active') return ev.status !== 'ended';
      if (statusFilter === 'ended') return ev.status === 'ended';
      return true;
    });

    // Active/open events always prioritized on top, finished/ended events below
    return [...filtered].sort((a, b) => {
      const aEnded = a.status === 'ended' ? 1 : 0;
      const bEnded = b.status === 'ended' ? 1 : 0;
      return aEnded - bEnded;
    });
  }, [events, searchTerm, statusFilter]);

  // Statistics per event
  const getEventStats = (event: EventItem) => {
    const titleLower = event.title.toLowerCase().trim();
    const eventPasses = passes.filter(p => 
      p.eventId === event.id || (p.eventName && p.eventName.toLowerCase().trim() === titleLower)
    );

    const total = eventPasses.length;
    const assigned = eventPasses.filter(p => p.status === 'assigned' || p.status === 'checked_in').length;
    const unassigned = eventPasses.filter(p => p.status === 'unassigned').length;
    const checkedIn = eventPasses.filter(p => p.status === 'checked_in').length;

    const assignedWithPrice = eventPasses.filter(p => (p.status === 'assigned' || p.status === 'checked_in') && p.ticketPrice);
    const ticketRevenue = assignedWithPrice.reduce((sum, p) => sum + (p.ticketPrice || 0), 0);

    const eventExpenses = financials.filter(f => f.type === 'expense' && (f.eventId === event.id || f.notes?.includes(event.title)));
    const totalExpenses = eventExpenses.reduce((sum, f) => sum + f.amount, 0);

    return { total, assigned, unassigned, checkedIn, ticketRevenue, totalExpenses, netProfit: ticketRevenue - totalExpenses };
  };

  // AI Generation Handler
  const handleAiAutoFill = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/gemini/generate-event-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        if (json.data.title) setTitle(json.data.title);
        if (json.data.tagline) setTagline(json.data.tagline);
        if (json.data.themeColor) setThemeColor(json.data.themeColor);
        if (json.data.dressCode) setDressCode(json.data.dressCode);
        if (json.data.suggestedCategories?.[0]) setCategory(json.data.suggestedCategories[0]);
        setFeedbackMessage(`✨ AI Auto-Filled event details for "${json.data.title || 'Event'}"!`);
        setTimeout(() => setFeedbackMessage(null), 4000);
      } else {
        setAiError(json.error || 'Could not generate event details.');
      }
    } catch (err: any) {
      setAiError(err.message || 'AI request failed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Create Event Form Submit
  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an event name.');
      return;
    }
    if (!date) {
      alert('Please select an event date.');
      return;
    }
    if (!location.trim()) {
      alert('Please enter a venue location.');
      return;
    }

    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      date,
      time: commencementTime,
      commencementTime: commencementTime.trim() || '10:00 AM',
      endTime: endTime.trim() || '06:00 PM',
      location: location.trim(),
      organizer: organizer.trim() || 'PassCraft Organizer',
      description: tagline.trim(),
      tagline: tagline.trim(),
      category: category.trim() || 'Standard Access',
      createdAt: new Date().toISOString(),
      themeColor: themeColor || '#059669',
      status: 'active',
      dressCode: dressCode.trim() || 'Smart Casual',
      ticketTiers: formTicketTiers.length > 0 ? formTicketTiers : [
        { id: 'tier-1', categoryName: 'VIP Pass', price: 1500, color: '#eab308', description: 'Front-row access & VIP hospitality', capacity: 50 },
        { id: 'tier-2', categoryName: 'General Admission', price: 499, color: '#10b981', description: 'Standard summit hall access', capacity: 200 }
      ]
    };

    onAddEvent(newEvent);
    onSelectEvent(newEvent.id);

    // Reset Form
    setTitle('');
    setLocation('');
    setAiPrompt('');
    setFeedbackMessage(`🎉 Successfully created "${newEvent.title}"! It is now active across all scanner, pass, and email pages.`);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Action Confirmation Handlers
  const executeModalAction = () => {
    const { type, event } = actionConfirmModal;
    if (!event) return;

    if (type === 'end' && onEndEvent) {
      onEndEvent(event.id);
      setFeedbackMessage(`🏁 Marked "${event.title}" as Completed. It will no longer appear as an option in other pages.`);
    } else if (type === 'reopen' && onReopenEvent) {
      onReopenEvent(event.id);
      setFeedbackMessage(`🟢 Reopened "${event.title}". It is now active across all pages.`);
    } else if (type === 'delete' && onDeleteEvent) {
      onDeleteEvent(event.id);
      setFeedbackMessage(`🗑️ Permanently erased "${event.title}", all associated passes, financial records, and cloud database records.`);
    }

    setActionConfirmModal({ type: null });
    setDeleteConfirmStep(1);
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  // Export Post-Event Report to CSV
  const handleExportPostEventCsv = (event: EventItem) => {
    const stats = getEventStats(event);
    const headers = ['Report Section', 'Key Metric', 'Value'];
    const rows = [
      ['General Info', 'Event Name', `"${event.title}"`],
      ['General Info', 'Date', `"${event.date}"`],
      ['General Info', 'Timing', `"${event.startTime || ''} - ${event.endTime || ''}"`],
      ['General Info', 'Venue', `"${event.location}"`],
      ['General Info', 'Organizer', `"${event.organizer}"`],
      ['General Info', 'Status', 'CONCLUDED / ARCHIVED'],
      ['Turnstile Ingress', 'Total Registered Passes', stats.total],
      ['Turnstile Ingress', 'Admitted at Gates (Checked In)', stats.checkedIn],
      ['Turnstile Ingress', 'Admission Clearance Yield', `${stats.total > 0 ? ((stats.checkedIn / stats.total) * 100).toFixed(1) : '0'}%`],
      ['Turnstile Ingress', 'Unclaimed / No-Show Passes', stats.unassigned],
      ['Turnstile Ingress', 'Duplicate Access Attempts Blocked', '0 (Zero Breaches)'],
      ['Financial P&L', 'Ticket Sales Revenue', `$${stats.ticketRevenue.toFixed(2)}`],
      ['Financial P&L', 'Operational Expenses', `$${stats.totalExpenses.toFixed(2)}`],
      ['Financial P&L', 'Net Event Operating Profit', `$${stats.netProfit.toFixed(2)}`],
    ];

    if (event.ticketTiers && event.ticketTiers.length > 0) {
      event.ticketTiers.forEach(t => {
        rows.push(['Ticket Tier Breakdown', `Tier: ${t.name}`, `Price: $${t.price} | Allocated: ${t.capacity || 'Open'}`]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Post_Event_Report_${event.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Event Lifecycle Management
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Create & Manage <span className="text-indigo-400">Events</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
              Configure event schedules, venue locations, and custom pass tiers. Active events automatically synchronize across all scanning, pass, and email dispatcher pages.
            </p>
          </div>

          {/* Quick Metrics Counter */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => { setActiveSubTab('creation'); setStatusFilter('all'); }}
              className={`text-left px-4 py-3 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'all' && activeSubTab === 'creation'
                  ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
              title="Show All Events"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Events</div>
              <div className="text-2xl font-bold text-white font-mono">{events.length}</div>
            </button>
            <button
              type="button"
              onClick={() => { setActiveSubTab('creation'); setStatusFilter('active'); }}
              className={`text-left px-4 py-3 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'active' && activeSubTab === 'creation'
                  ? 'bg-indigo-950/80 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                  : 'bg-indigo-950/40 border-indigo-500/30 hover:border-indigo-500/60'
              }`}
              title="Filter to Active Events"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Active Events
              </div>
              <div className="text-2xl font-bold text-indigo-300 font-mono">{activeEvents.length}</div>
            </button>
            <button
              type="button"
              onClick={() => { setActiveSubTab('creation'); setStatusFilter('ended'); }}
              className={`text-left px-4 py-3 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'ended' && activeSubTab === 'creation'
                  ? 'bg-purple-950/80 border-purple-500 ring-1 ring-purple-500 shadow-md'
                  : 'bg-slate-950/80 border-slate-800 hover:border-purple-500/40'
              }`}
              title="Filter to Completed Events"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-purple-400" /> Completed
              </div>
              <div className="text-2xl font-bold text-purple-300 font-mono">{endedEvents.length}</div>
            </button>
          </div>
        </div>
      </div>

      {/* Notification / Toast Message */}
      {feedbackMessage && (
        <div className="bg-indigo-950/60 border border-indigo-500/40 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs text-indigo-200 font-semibold shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-indigo-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setActiveSubTab('creation'); setStatusFilter('all'); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'creation' && statusFilter !== 'ended'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1. Event Creation & Directory</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'creation' && statusFilter !== 'ended' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
          }`}>
            {events.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('creation'); setStatusFilter('ended'); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'creation' && statusFilter === 'ended'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Lock className="w-4 h-4 text-purple-400" />
          <span>Completed Events</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'creation' && statusFilter === 'ended' ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-300'
          }`}>
            {endedEvents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ticket_types')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'ticket_types'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>2. Ticket Types, Pricing & Colors</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'ticket_types' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
          }`}>
            {totalTiersCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>3. Broadcast & Email History</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'history' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
          }`}>
            {historyCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('demo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'demo'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>4. App Demo & Walkthrough</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            200 Students Demo
          </span>
        </button>
      </div>

      {activeSubTab === 'demo' ? (
        <DemoGuidePage
          events={events}
          onAddEvent={onAddEvent}
          onAddPasses={onAddPasses}
          onAddFinancials={onAddFinancials}
          onClearDemoData={onClearDemoData}
          onSelectEvent={onSelectEvent}
          onNavigateToTab={onNavigateToTab}
        />
      ) : activeSubTab === 'history' ? (
        <BroadcastHistoryPage
          events={events}
          selectedEventId={selectedEventId}
          onNavigateToTab={onNavigateToTab}
        />
      ) : activeSubTab === 'ticket_types' ? (
        <TicketTypesPage
          events={events}
          passes={passes}
          selectedEventId={selectedEventId}
          onSelectEvent={onSelectEvent}
          onUpdateEvent={onUpdateEvent || (() => {})}
          onAddPasses={onAddPasses}
          onNavigateToPasses={onNavigateToPasses}
        />
      ) : (
        <>
      {/* SECTION 1: CREATE NEW EVENT FORM (Hidden when viewing Completed Events Archive) */}
      {statusFilter !== 'ended' && (
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                1. Create New Event
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Fill in the event name, date, start time, end time, and venue location.
            </p>
          </div>

          {/* AI Auto Fill Quick Input */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-2xl max-w-md w-full">
            <Sparkles className="w-4 h-4 text-indigo-400 ml-2 shrink-0 animate-pulse" />
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. AI Leadership Summit 2026 at Grand Hall..."
              className="bg-transparent text-white text-xs px-2 py-1 outline-none w-full placeholder:text-slate-500"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAiAutoFill())}
            />
            <button
              type="button"
              onClick={handleAiAutoFill}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-indigo-500 disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-sm shadow-indigo-600/30"
            >
              {isAiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'AI Auto-Fill'}
            </button>
          </div>
        </div>

        {aiError && (
          <div className="mb-6 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        <form onSubmit={handleCreateEventSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Field 1: Event Name */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Event Name <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Global Tech Leaders Summit 2026"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm font-semibold outline-none transition-colors shadow-inner"
              />
            </div>

            {/* Field 2: Event Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Event Date <span className="text-indigo-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm font-semibold outline-none transition-colors"
              />
            </div>

            {/* Field 3: Start Time / Commencement Time */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Start Time / Entry Time <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                value={commencementTime}
                onChange={e => setCommencementTime(e.target.value)}
                placeholder="e.g. 10:00 AM (Doors Open)"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm font-semibold outline-none transition-colors"
              />
            </div>

            {/* Field 4: End Time */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> End Time <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                placeholder="e.g. 06:00 PM"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm font-semibold outline-none transition-colors"
              />
            </div>

            {/* Field 5: Venue Location */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Venue Location & Address <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Main Auditorium, Grand Convention Center"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm font-semibold outline-none transition-colors"
              />
            </div>

            {/* Field 6: Organizer / Organization */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Organizer
              </label>
              <input
                type="text"
                value={organizer}
                onChange={e => setOrganizer(e.target.value)}
                placeholder="e.g. PassCraft Events"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-xs font-semibold outline-none"
              />
            </div>

            {/* Field 7: Tagline / Pass Subtitle */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Official Delegate Access Pass"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-xs font-semibold outline-none"
              />
            </div>

            {/* Field 8: Theme Color */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                Event Accent Color (Choose Preset or Pick Custom)
              </label>
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex-wrap">
                <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={e => setThemeColor(e.target.value)}
                    className="w-9 h-9 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-0.5"
                    title="Custom color picker"
                  />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">{themeColor}</span>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setThemeColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-xl transition-all ${themeColor.toLowerCase() === c.hex.toLowerCase() ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-75 hover:opacity-100 hover:scale-110'}`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Form Submit & Direct Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-medium">
              ⚡ Default pass tiers can be further customized anytime in the <span className="text-indigo-400 font-bold">Ticket Types</span> tab.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Create & Activate Event
              </button>
            </div>
          </div>
        </form>
      </section>
      )}

      {/* SECTION 2: ALL EVENTS SHOWCASE */}
      <section className="space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                2. Events Directory ({events.length})
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active events synchronize across all application modules. Completed events are archived.
            </p>
          </div>

          {/* Search & Status Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search events, venues..."
                className="bg-slate-900 border border-slate-800 text-white text-xs pl-9 pr-3 py-2 rounded-xl outline-none focus:border-indigo-500 w-full sm:w-56"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All ({events.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${statusFilter === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Active ({activeEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ended')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'ended' ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-purple-300" /> Completed ({endedEvents.length})
              </button>
            </div>
          </div>
        </div>

        {/* Informative Banner when Completed filter is active */}
        {statusFilter === 'ended' && (
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-200 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Completed Events Archive ({endedEvents.length})</div>
                <div className="text-purple-300/80">These events have concluded. All associated guest passes, check-in logs, and financial records remain permanently preserved and searchable.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="px-3 py-1.5 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-purple-200 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-colors shrink-0 cursor-pointer"
            >
              Show All Events
            </button>
          </div>
        )}

        {/* Events Cards Grid */}
        {displayedEvents.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
            <CalendarOff className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">
              {events.length === 0
                ? 'No Events Yet — Clean Workspace'
                : statusFilter === 'ended'
                ? 'No Completed Events in Archive'
                : statusFilter === 'active'
                ? 'No Active Events'
                : 'No Events Found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {events.length === 0
                ? 'Get started by creating your first event above, or open the App Demo & Walkthrough tab to test features with sample data.'
                : statusFilter === 'ended'
                ? 'When an event finishes, click "End Event" on its card to archive it here with all ticket records and analytics intact.'
                : searchTerm
                ? 'No events matching your search criteria.'
                : 'Create your first event using the form above to start generating passes!'}
            </p>
            {events.length === 0 && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('demo')}
                  className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" /> Open Demo &amp; Walkthrough Tab
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedEvents.map(event => {
              const stats = getEventStats(event);
              const isEnded = event.status === 'ended';
              const isCurrentlySelected = selectedEventId === event.id;

              return (
                <div
                  key={event.id}
                  className={`border rounded-3xl p-6 relative overflow-hidden transition-all shadow-xl flex flex-col justify-between ${
                    isEnded 
                      ? 'border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/20' 
                      : isCurrentlySelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-900'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  {/* Top Status & Event Header */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isEnded ? (
                          <span className="px-3 py-1 bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-purple-400" /> Completed / Archived
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Active Event
                          </span>
                        )}

                        <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold rounded-full">
                          📅 Single Entry Pass
                        </span>

                        {isCurrentlySelected && (
                          <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                            Current Filter
                          </span>
                        )}
                      </div>

                      {/* Event Accent Dot */}
                      <div 
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm" 
                        style={{ backgroundColor: event.themeColor || '#6366f1' }} 
                        title={`Theme: ${event.themeColor}`}
                      />
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                      {event.title}
                    </h3>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-mono mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{event.commencementTime || event.time || '10:00 AM'} — {event.endTime || '06:00 PM'}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Stats Metrics Bar */}
                    <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Passes</div>
                        <div className="text-base font-bold text-white font-mono">{stats.total}</div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Assigned</div>
                        <div className="text-base font-bold text-indigo-400 font-mono">{stats.assigned}</div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Checked In</div>
                        <div className="text-base font-bold text-amber-400 font-mono">{stats.checkedIn}</div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-sky-400">Revenue</div>
                        <div className="text-base font-bold text-sky-400 font-mono">₹{stats.ticketRevenue}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Select / Filter Button */}
                      {!isEnded && (
                        <button
                          type="button"
                          onClick={() => onSelectEvent(event.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isCurrentlySelected
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                              : 'bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isCurrentlySelected ? 'Selected' : 'Select Event'}
                        </button>
                      )}

                      {isEnded ? (
                        <button
                          type="button"
                          onClick={() => setPostEventReportEvent(event)}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
                          title="Open Post-Event Executive & Turnstile Report"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-200" />
                          <span>Post-Event Report</span>
                        </button>
                      ) : (
                        <>
                          {/* View Event Passes Button */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectEvent(event.id);
                              onNavigateToPasses();
                            }}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                            title="View Passes for this Event"
                          >
                            <Users className="w-3.5 h-3.5" /> Passes
                          </button>

                          {/* Manage Ticket Types & Prices Button */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectEvent(event.id);
                              setActiveSubTab('ticket_types');
                            }}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-200 hover:text-indigo-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Manage Ticket Types, Prices & Colors"
                          >
                            <Tag className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Ticket Types ({event.ticketTiers?.length || 0})</span>
                          </button>
                        </>
                      )}

                      {/* Event Insights Modal Button */}
                      <button
                        type="button"
                        onClick={() => setInsightEvent(event)}
                        className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
                        title="View Financial & Attendance Insights"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Completion / Reopen / Edit & Delete Controls */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Edit Event Details */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(event)}
                        className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                        title="Edit Event Details (Name, Date, Schedule, Venue, Theme)"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Edit
                      </button>

                      {isEnded ? (
                        <button
                          type="button"
                          onClick={() => setActionConfirmModal({ type: 'reopen', event })}
                          className="px-2.5 py-1.5 bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reopen
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActionConfirmModal({ type: 'end', event })}
                          className="px-2.5 py-1.5 bg-slate-950 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-400/40 text-amber-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                          title="Mark Event as Completed & Archive"
                        >
                          <Lock className="w-3.5 h-3.5" /> End Event
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmStep(1);
                          setActionConfirmModal({ type: 'delete', event });
                        }}
                        className="p-2 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-rose-400 rounded-xl transition-colors cursor-pointer"
                        title="Delete Event Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      </>
      )}

      {/* MODAL: EVENT INSIGHTS AUDIT MODAL */}
      {insightEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Event Insights & Financial Summary
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">{insightEvent.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  📅 {insightEvent.date} • 📍 {insightEvent.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    const ev = insightEvent;
                    setInsightEvent(null);
                    handleStartEdit(ev);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Details
                </button>
                <button 
                  onClick={() => setInsightEvent(null)}
                  className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(() => {
              const stats = getEventStats(insightEvent);
              const attendanceRate = stats.assigned > 0 ? ((stats.checkedIn / stats.assigned) * 100).toFixed(1) : '0';

              return (
                <div className="space-y-6">
                  {/* Financials Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="text-[10px] font-bold uppercase text-indigo-400">Gross Ticket Sales</div>
                      <div className="text-xl font-bold text-indigo-400 font-mono mt-1">₹{stats.ticketRevenue}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="text-[10px] font-bold uppercase text-rose-400">Itemized Expenses</div>
                      <div className="text-xl font-bold text-rose-400 font-mono mt-1">₹{stats.totalExpenses}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="text-[10px] font-bold uppercase text-amber-400">Net Profit / P&L</div>
                      <div className={`text-xl font-bold font-mono mt-1 ${stats.netProfit >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                        ₹{stats.netProfit}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Breakdown */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400 uppercase">Check-In Attendance Rate</span>
                      <span className="text-indigo-400 font-mono">{attendanceRate}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full transition-all duration-500 rounded-full" 
                        style={{ width: `${Math.min(100, parseFloat(attendanceRate))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Assigned: {stats.assigned}</span>
                      <span>Checked-In at Gate: {stats.checkedIn}</span>
                      <span>Unassigned Remaining: {stats.unassigned}</span>
                    </div>
                  </div>

                  {/* Tiers in Catalog */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Configured Pass Tiers</div>
                    <div className="flex flex-wrap gap-2">
                      {insightEvent.ticketTiers?.map(tier => (
                        <span 
                          key={tier.categoryName}
                          className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2"
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color || '#6366f1' }} />
                          {tier.categoryName}: <span className="text-indigo-400 font-mono">₹{tier.price}</span>
                        </span>
                      )) || <span className="text-xs text-slate-500">No custom tiers configured.</span>}
                    </div>
                  </div>

                  {/* Completed Event Attendees Roster & Export */}
                  {(() => {
                    const eventPasses = passes.filter(
                      p => (p.eventId && p.eventId === insightEvent.id) ||
                           (p.eventName && p.eventName.toLowerCase().trim() === insightEvent.title.toLowerCase().trim())
                    );
                    const assignedList = eventPasses.filter(p => p.status === 'assigned' || p.status === 'checked_in');

                    const handleExportCSV = () => {
                      if (assignedList.length === 0) {
                        alert('No assigned attendees found for this event.');
                        return;
                      }
                      const headers = ['Attendee Name', 'Email', 'Phone', 'Pass Category', '16-Digit Code', 'Check-In Status', 'Check-In Timestamp'];
                      const rows = assignedList.map(p => [
                        `"${p.assignedTo?.name || ''}"`,
                        `"${p.assignedTo?.email || ''}"`,
                        `"${p.assignedTo?.phone || ''}"`,
                        `"${p.category || ''}"`,
                        `"${p.formattedCode || p.code16 || ''}"`,
                        `"${p.status === 'checked_in' ? 'Checked In' : 'Assigned'}"`,
                        `"${p.checkedInAt || ''}"`,
                      ]);
                      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', `${insightEvent.title.replace(/\s+/g, '_')}_Attendees_Report.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    };

                    return (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Archived Attendees Roster ({assignedList.length} Attendees)
                          </div>
                          {assignedList.length > 0 && (
                            <button
                              type="button"
                              onClick={handleExportCSV}
                              className="px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              📥 Export CSV Report
                            </button>
                          )}
                        </div>

                        {assignedList.length === 0 ? (
                          <div className="text-xs text-slate-500 italic py-2">
                            No attendees registered or assigned for this event.
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                            {assignedList.map(p => (
                              <div
                                key={p.id}
                                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="font-bold text-white">{p.assignedTo?.name}</div>
                                  <div className="text-[10px] text-slate-400">{p.assignedTo?.email || 'No email'} • {p.category}</div>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                    p.status === 'checked_in'
                                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  }`}>
                                    {p.status === 'checked_in' ? 'Checked In' : 'Assigned'}
                                  </span>
                                  <div className="text-[9px] text-slate-500 mt-0.5">{p.formattedCode}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-[10px] text-slate-500">
                      {insightEvent.status === 'ended' 
                        ? '🔒 Event Completed: Data preserved in this archive only.'
                        : '⚡ Event Active: Available across all app views.'}
                    </div>

                    <div className="flex gap-2">
                      {insightEvent.status !== 'ended' && (
                        <button
                          type="button"
                          onClick={() => {
                            setInsightEvent(null);
                            onSelectEvent(insightEvent.id);
                            onNavigateToPasses();
                          }}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/30"
                        >
                          <Users className="w-4 h-4" /> View Event Passes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM END / REOPEN / 3-STEP DELETE EVENT */}
      {actionConfirmModal.type && actionConfirmModal.event && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                {actionConfirmModal.type === 'delete' ? (
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-white leading-tight">
                    {actionConfirmModal.type === 'end' && 'End / Complete Event?'}
                    {actionConfirmModal.type === 'reopen' && 'Reopen Event?'}
                    {actionConfirmModal.type === 'delete' && `Permanent Delete Confirmation (Step ${deleteConfirmStep} of 3)`}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {actionConfirmModal.type === 'delete' 
                      ? '3-step confirmation required to safeguard turnstile & cloud records' 
                      : 'Event lifecycle status update'}
                  </p>
                </div>
              </div>

              {actionConfirmModal.type === 'delete' && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                  deleteConfirmStep === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  deleteConfirmStep === 2 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-red-600 text-white animate-pulse'
                }`}>
                  Step {deleteConfirmStep}/3
                </span>
              )}
            </div>

            {/* Content for END */}
            {actionConfirmModal.type === 'end' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to mark <strong className="text-white">"{actionConfirmModal.event.title}"</strong> as Completed?
                </p>
                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl text-[11px] text-purple-200">
                  ⚡ Once completed, this event moves to the Completed archive and will no longer show as an active event for gate scanning or ticket creation. You can generate an official Post-Event Report anytime.
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActionConfirmModal({ type: null })}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeModalAction}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/30 cursor-pointer"
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            )}

            {/* Content for REOPEN */}
            {actionConfirmModal.type === 'reopen' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to reopen <strong className="text-white">"{actionConfirmModal.event.title}"</strong>?
                </p>
                <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl text-[11px] text-indigo-200">
                  🟢 It will immediately become active again and available in dropdown options across all turnstiles and pass dispatch tools.
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActionConfirmModal({ type: null })}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeModalAction}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    Reopen Event
                  </button>
                </div>
              </div>
            )}

            {/* 3-STEP DELETE SEQUENCE (Delete buttons placed in different locations) */}
            {actionConfirmModal.type === 'delete' && (
              <div className="space-y-4">

                {/* STEP 1: Delete button at BOTTOM-RIGHT */}
                {deleteConfirmStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                      <p>
                        You have initiated permanent deletion of <strong className="text-white font-bold">"{actionConfirmModal.event.title}"</strong>.
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        This event currently has <span className="text-indigo-400 font-bold">{getEventStats(actionConfirmModal.event).total} passes</span> and attendee records associated with it.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                      {/* Cancel on Bottom-Left */}
                      <button
                        type="button"
                        onClick={() => { setActionConfirmModal({ type: null }); setDeleteConfirmStep(1); }}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel / Keep Event
                      </button>

                      {/* Delete button 1: Placed at BOTTOM-RIGHT */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmStep(2)}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-rose-600/30 cursor-pointer flex items-center gap-1.5"
                      >
                        Proceed to Step 2 (Confirm 1/3) →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Delete button at TOP-RIGHT */}
                {deleteConfirmStep === 2 && (
                  <div className="space-y-4">
                    {/* Delete button 2: Placed at TOP-RIGHT inside warning block */}
                    <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          <span>Irreversible Cloud & Turnstile Notice</span>
                        </div>
                        <p className="text-[11px] text-rose-200/80 mt-1">
                          Passes will be invalidated and Firebase database documents wiped.
                        </p>
                      </div>

                      {/* Delete button 2: Placed at TOP-RIGHT */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmStep(3)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-rose-600/30 cursor-pointer shrink-0"
                      >
                        I Accept (Confirm 2/3) →
                      </button>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed">
                      Warning: Turnstiles will immediately reject any ticket presented for this event as invalid or counterfeit. All cloud synchronization data for this event will be erased.
                    </div>

                    <div className="flex justify-start pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => { setActionConfirmModal({ type: null }); setDeleteConfirmStep(1); }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Abort Deletion
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Final confirmation - Delete button at BOTTOM-LEFT */}
                {deleteConfirmStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs text-red-200 space-y-2">
                      <div className="font-bold flex items-center gap-2 text-red-300">
                        <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                        <span>FINAL PERMANENT DATA PURGE AUTHORIZATION</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        This action will immediately and permanently delete <strong className="text-white">"{actionConfirmModal.event.title}"</strong>, all {getEventStats(actionConfirmModal.event).total} passes, all turnstile scan logs, and all Firebase cloud database records. This cannot be recovered by any administrator.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                      {/* Delete button 3: Placed at BOTTOM-LEFT (First in row on desktop) */}
                      <button
                        type="button"
                        onClick={executeModalAction}
                        className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/40 cursor-pointer flex items-center justify-center gap-2 transition-all order-2 sm:order-1 animate-pulse"
                      >
                        <Trash2 className="w-4 h-4" /> Final Confirmation (3/3): Permanently Delete Everything
                      </button>

                      {/* Cancel on Bottom-Right */}
                      <button
                        type="button"
                        onClick={() => { setActionConfirmModal({ type: null }); setDeleteConfirmStep(1); }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors order-1 sm:order-2"
                      >
                        Abort & Keep Safe
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: POST-EVENT EXECUTIVE & TURNSTILE REPORT */}
      {postEventReportEvent && (() => {
        const stats = getEventStats(postEventReportEvent);
        const attendanceRate = stats.total > 0 ? ((stats.checkedIn / stats.total) * 100).toFixed(1) : '0';

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-scaleUp">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-600/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-white tracking-tight">Post-Event Executive Report</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Concluded
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {postEventReportEvent.title} • Turnstile Ingress, Attendance &amp; Financial P&amp;L
                    </p>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportPostEventCsv(postEventReportEvent)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Export CSV Data"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
                    title="Print / Save A4 Layout"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print A4</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostEventReportEvent(null)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Event Metadata Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Event Date</span>
                  <span className="font-mono text-slate-200 font-bold">{postEventReportEvent.date}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Hours</span>
                  <span className="font-mono text-slate-200 font-bold">{postEventReportEvent.commencementTime || '10:00 AM'} - {postEventReportEvent.endTime || '06:00 PM'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Venue Location</span>
                  <span className="text-slate-200 font-medium truncate block">{postEventReportEvent.location}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Organizer</span>
                  <span className="text-slate-200 font-medium truncate block">{postEventReportEvent.organizer}</span>
                </div>
              </div>

              {/* Attendance & Turnstile Key Metrics */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>1. Turnstile Ingress &amp; Attendance Audit</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Registered</div>
                    <div className="text-xl font-bold font-mono text-white mt-1">{stats.total}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">100% capacity pool</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 text-center bg-emerald-950/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Turnstile Admitted</div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{stats.checkedIn}</div>
                    <div className="text-[10px] text-emerald-300 font-bold mt-0.5">{attendanceRate}% Turnout Yield</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">No-Shows / Absent</div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-1">{stats.unassigned}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Unused credentials</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Turnstile Breaches</div>
                    <div className="text-xl font-bold font-mono text-indigo-400 mt-1">0</div>
                    <div className="text-[10px] text-indigo-300 font-bold mt-0.5">100% Security Pass</div>
                  </div>
                </div>
              </div>

              {/* Financial Performance Section */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>2. Financial Performance &amp; Net Operating Margin</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gross Ticket Revenue</span>
                    <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">₹{stats.ticketRevenue.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500">From assigned ticket tiers</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Event Expenses</span>
                    <span className="text-xl font-bold font-mono text-rose-400 block mt-1">₹{stats.totalExpenses.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500">Venue, AV &amp; operations</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/30 bg-indigo-950/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">Net Event Profit</span>
                    <span className={`text-xl font-bold font-mono block mt-1 ${stats.netProfit >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                      ₹{stats.netProfit.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-indigo-200">
                      {stats.netProfit >= 0 ? 'Profitable operation' : 'Deficit recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Tier Breakdown Table */}
              {postEventReportEvent.ticketTiers && postEventReportEvent.ticketTiers.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    <span>3. Ticket Tier Breakdown</span>
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-2.5">Tier Category</th>
                          <th className="px-4 py-2.5">Unit Price</th>
                          <th className="px-4 py-2.5">Capacity</th>
                          <th className="px-4 py-2.5">Gate Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {postEventReportEvent.ticketTiers.map(t => (
                          <tr key={t.id} className="hover:bg-slate-800/40">
                            <td className="px-4 py-2 font-sans font-bold text-white flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || '#6366f1' }}></span>
                              {t.name}
                            </td>
                            <td className="px-4 py-2 text-emerald-400">₹{t.price}</td>
                            <td className="px-4 py-2 text-slate-300">{t.capacity || 'Unlimited'}</td>
                            <td className="px-4 py-2 text-slate-400 font-sans text-[11px]">{t.allowedGates?.join(', ') || 'All Turnstiles'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Security & Ingress Certification Sign-off Block */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Turnstile Verification Official Sign-off</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Certified by Head of Gate Security &amp; Lead Event Director • Concluded Audit
                  </p>
                </div>
                <div className="font-mono text-[10px] text-slate-500 text-right">
                  Timestamp: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPostEventReportEvent(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Close Report
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL: EDIT EVENT DETAILS */}
      {editForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Edit Event Details</h3>
                  <p className="text-xs text-slate-400">Update event name, schedule, venue, status, and theme</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditForm(null)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" /> Event Name <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="e.g. Global Tech Leaders Summit 2026"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold outline-none transition-colors"
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Event Date <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold outline-none transition-colors"
                  />
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" /> Event Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as 'active' | 'ended' })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold outline-none transition-colors"
                  >
                    <option value="active">Active (Live across all pages)</option>
                    <option value="ended">Completed / Ended (Archived)</option>
                  </select>
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Start Time / Entry Time <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.commencementTime}
                    onChange={e => setEditForm({ ...editForm, commencementTime: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold outline-none transition-colors"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> End Time <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.endTime}
                    onChange={e => setEditForm({ ...editForm, endTime: e.target.value })}
                    placeholder="e.g. 06:00 PM"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold outline-none transition-colors"
                  />
                </div>

                {/* Venue Location */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Venue Location & Address <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g. Main Auditorium, Grand Convention Center"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold outline-none transition-colors"
                  />
                </div>

                {/* Organizer */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Organizer
                  </label>
                  <input
                    type="text"
                    value={editForm.organizer}
                    onChange={e => setEditForm({ ...editForm, organizer: e.target.value })}
                    placeholder="e.g. PassCraft Events"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-white text-xs font-semibold outline-none"
                  />
                </div>

                {/* Tagline / Subtitle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={editForm.tagline}
                    onChange={e => setEditForm({ ...editForm, tagline: e.target.value })}
                    placeholder="e.g. Official Delegate Access Pass"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-white text-xs font-semibold outline-none"
                  />
                </div>

                {/* Theme Color */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                    Event Accent Color
                  </label>
                  <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex-wrap">
                    <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
                      <input
                        type="color"
                        value={editForm.themeColor}
                        onChange={e => setEditForm({ ...editForm, themeColor: e.target.value })}
                        className="w-8 h-8 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-0.5"
                      />
                      <span className="text-xs font-mono font-bold text-slate-300 uppercase">{editForm.themeColor}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap items-center">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, themeColor: c.hex })}
                          style={{ backgroundColor: c.hex }}
                          className={`w-6 h-6 rounded-lg transition-all ${
                            editForm.themeColor.toLowerCase() === c.hex.toLowerCase()
                              ? 'scale-125 ring-2 ring-white shadow-lg'
                              : 'opacity-70 hover:opacity-100 hover:scale-110'
                          }`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dress Code / Notice */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                    Dress Code / Guest Instructions
                  </label>
                  <input
                    type="text"
                    value={editForm.dressCode}
                    onChange={e => setEditForm({ ...editForm, dressCode: e.target.value })}
                    placeholder="e.g. Formal / Business Casual • Carry Valid Government Photo ID"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-white text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditForm(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
