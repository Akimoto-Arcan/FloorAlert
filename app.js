/* FloorAlert — Maintenance Communication & Ticketing System
 * Demo: Self-hosted, browser-only, localStorage persistence
 * Author: Chris Carpenter (Maintenance Manager)
 */

(function() {
    'use strict';

    // ─── Constants ────────────────────────────────────────────────────────────
    const STORAGE_KEY = 'flooralert_data_v1';
    const NOTIF_KEY = 'flooralert_notifs_v1';
    const ROLE_KEY = 'flooralert_role';

    const ROLES = {
        floor_worker: { label: 'Floor Worker', canReport: true, canViewOwn: true, canUpdateWO: false, canManage: false, canAdmin: false },
        technician:   { label: 'Technician',   canReport: true, canViewOwn: true, canUpdateWO: true,  canManage: false, canAdmin: false },
        manager:      { label: 'Manager',      canReport: true, canViewOwn: true, canUpdateWO: true,  canManage: true,  canAdmin: false },
        admin:        { label: 'Admin',        canReport: true, canViewOwn: true, canUpdateWO: true,  canManage: true,  canAdmin: true  },
    };

    const CATEGORIES = ['Mechanical', 'Electrical', 'Safety', 'IT', 'Supply', 'Other'];
    const SEVERITIES = ['Low', 'Medium', 'High'];
    const WO_STATUSES = ['Open', 'In Progress', 'Resolved'];
    const ASSET_STATUSES = ['operational', 'maintenance', 'down'];
    const PM_STATUSES = ['scheduled', 'overdue', 'due_this_week', 'completed'];

    // ─── Sample Data ──────────────────────────────────────────────────────────
    function getSampleData() {
        const now = Date.now();
        const day = 86400000;
        return {
            assets: [
                { id: 'AST-001', name: 'CNC Mill #1', location: 'Building A — Floor 1', status: 'operational', lastMaintenance: new Date(now - 14 * day).toISOString(), model: 'Haas VF-2', serial: 'HVF2-2019-0042' },
                { id: 'AST-002', name: 'CNC Mill #2', location: 'Building A — Floor 1', status: 'maintenance', lastMaintenance: new Date(now - 45 * day).toISOString(), model: 'Haas VF-2', serial: 'HVF2-2019-0043' },
                { id: 'AST-003', name: 'Lathe #1', location: 'Building A — Floor 2', status: 'operational', lastMaintenance: new Date(now - 7 * day).toISOString(), model: 'Okuma L370', serial: 'OL37-2020-0011' },
                { id: 'AST-004', name: 'Forklift #3', location: 'Warehouse', status: 'down', lastMaintenance: new Date(now - 60 * day).toISOString(), model: 'Toyota 8FGU25', serial: 'T8F-2018-0007' },
                { id: 'AST-005', name: 'HVAC Unit — Roof', location: 'Building A — Roof', status: 'operational', lastMaintenance: new Date(now - 30 * day).toISOString(), model: 'Trane XR15', serial: 'TXR-2021-0003' },
                { id: 'AST-006', name: 'Air Compressor', location: 'Utility Room', status: 'operational', lastMaintenance: new Date(now - 21 * day).toISOString(), model: 'Atlas Copco GA15', serial: 'ACG-2020-0015' },
            ],
            workOrders: [
                { id: 'WO-1001', title: 'Spindle vibration on CNC Mill #2', assetId: 'AST-002', assignee: 'Mike Torres', priority: 'High', status: 'In Progress', created: new Date(now - 2 * day).toISOString(), description: 'Excessive vibration detected during roughing cuts. Possible bearing wear.', notes: [{ author: 'Mike Torres', text: 'Ordered replacement spindle bearings, arriving Thursday.', date: new Date(now - 1 * day).toISOString() }] },
                { id: 'WO-1002', title: 'Replace hydraulic hose — Forklift #3', assetId: 'AST-004', assignee: 'Unassigned', priority: 'High', status: 'Open', created: new Date(now - 1 * day).toISOString(), description: 'Hydraulic hose leaking near mast. Forklift grounded until repaired.', notes: [] },
                { id: 'WO-1003', title: 'Quarterly PM — HVAC filter change', assetId: 'AST-005', assignee: 'Sarah Chen', priority: 'Medium', status: 'Resolved', created: new Date(now - 10 * day).toISOString(), description: 'Replace air filters and inspect belts on roof HVAC unit.', notes: [{ author: 'Sarah Chen', text: 'Completed. All filters replaced, belts in good condition.', date: new Date(now - 8 * day).toISOString() }] },
                { id: 'WO-1004', title: 'Lathe coolant pump intermittent', assetId: 'AST-003', assignee: 'Mike Torres', priority: 'Medium', status: 'Open', created: new Date(now - 3 * hour(now)).toISOString(), description: 'Coolant pump cuts out randomly. Suspect electrical connection.', notes: [] },
            ],
            incidents: [
                { id: 'INC-2001', assetId: 'AST-004', category: 'Mechanical', severity: 'High', description: 'Forklift #3 hydraulic leak — fluid on floor near mast.', photo: null, voiceNote: null, reportedBy: 'John Davis', status: 'Open', created: new Date(now - 1 * day).toISOString() },
                { id: 'INC-2002', assetId: 'AST-002', category: 'Mechanical', severity: 'Medium', description: 'Unusual vibration during operation, getting worse.', photo: null, voiceNote: null, reportedBy: 'Lisa Park', status: 'Open', created: new Date(now - 2 * day).toISOString() },
                { id: 'INC-2003', assetId: 'AST-005', category: 'Electrical', severity: 'Low', description: 'HVAC making humming noise but still working.', photo: null, voiceNote: null, reportedBy: 'Tom Bradley', status: 'Resolved', created: new Date(now - 5 * day).toISOString() },
            ],
            pms: [
                { id: 'PM-3001', assetId: 'AST-001', task: 'Lubricate ball screws and check coolant level', frequency: 'Weekly', dueDate: new Date(now + 2 * day).toISOString(), assignee: 'Mike Torres', status: 'scheduled' },
                { id: 'PM-3002', assetId: 'AST-004', task: 'Full hydraulic system inspection', frequency: 'Monthly', dueDate: new Date(now - 1 * day).toISOString(), assignee: 'Sarah Chen', status: 'overdue' },
                { id: 'PM-3003', assetId: 'AST-005', task: 'Replace air filters and inspect belts', frequency: 'Quarterly', dueDate: new Date(now + 5 * day).toISOString(), assignee: 'Sarah Chen', status: 'scheduled' },
                { id: 'PM-3004', assetId: 'AST-006', task: 'Check belt tension and drain condensate', frequency: 'Weekly', dueDate: new Date(now + 1 * day).toISOString(), assignee: 'Mike Torres', status: 'due_this_week' },
            ],
            users: [
                { id: 'USR-001', name: 'John Davis', role: 'floor_worker' },
                { id: 'USR-002', name: 'Lisa Park', role: 'floor_worker' },
                { id: 'USR-003', name: 'Mike Torres', role: 'technician' },
                { id: 'USR-004', name: 'Sarah Chen', role: 'technician' },
                { id: 'USR-005', name: 'Chris Carpenter', role: 'manager' },
                { id: 'USR-006', name: 'Admin User', role: 'admin' },
            ],
            activity: [
                { id: 'ACT-001', type: 'incident_reported', message: 'INC-2001 reported by John Davis — Forklift #3 hydraulic leak', date: new Date(now - 1 * day).toISOString() },
                { id: 'ACT-002', type: 'wo_created', message: 'WO-1002 created — Replace hydraulic hose Forklift #3', date: new Date(now - 1 * day).toISOString() },
                { id: 'ACT-003', type: 'wo_updated', message: 'WO-1001 status changed to In Progress by Mike Torres', date: new Date(now - 1 * day).toISOString() },
                { id: 'ACT-004', type: 'pm_completed', message: 'PM-3003 completed — HVAC filter change by Sarah Chen', date: new Date(now - 8 * day).toISOString() },
                { id: 'ACT-005', type: 'incident_resolved', message: 'INC-2003 resolved — HVAC humming noise', date: new Date(now - 4 * day).toISOString() },
            ],
        };
    }

    function hour(timestamp) { return timestamp; } // helper for readability

    // ─── State Management ─────────────────────────────────────────────────────
    let state = {
        currentView: 'dashboard',
        currentRole: 'manager',
        data: null,
        notifications: [],
        notifPanelOpen: false,
        woFilter: 'All',
        expandedWO: null,
        expandedAsset: null,
        expandedPM: null,
        reportForm: {
            assetId: '',
            category: '',
            severity: '',
            photo: null,
            voiceNote: null,
            description: '',
        },
        pmView: 'list', // 'list' or 'calendar'
        showRoleModal: false,
    };

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                state.data = JSON.parse(raw);
            } else {
                state.data = getSampleData();
                saveData();
            }
        } catch (e) {
            console.warn('Failed to load data, using sample:', e);
            state.data = getSampleData();
        }

        try {
            const notifRaw = localStorage.getItem(NOTIF_KEY);
            if (notifRaw) {
                state.notifications = JSON.parse(notifRaw);
            }
        } catch (e) {
            state.notifications = [];
        }

        const savedRole = localStorage.getItem(ROLE_KEY);
        if (savedRole && ROLES[savedRole]) {
            state.currentRole = savedRole;
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    }

    function saveNotifications() {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(state.notifications));
    }

    function saveRole() {
        localStorage.setItem(ROLE_KEY, state.currentRole);
    }

    // ─── Utility Functions ────────────────────────────────────────────────────
    function $(sel) { return document.querySelector(sel); }
    function $$(sel) { return document.querySelectorAll(sel); }

    function generateId(prefix) {
        const existing = state.data;
        let max = 0;
        const items = existing[prefix.toLowerCase() + 's'] || existing.workOrders || [];
        // Generic: find highest numeric suffix across all arrays
        const allItems = [
            ...(existing.assets || []),
            ...(existing.workOrders || []),
            ...(existing.incidents || []),
            ...(existing.pms || []),
            ...(existing.activity || []),
        ];
        allItems.forEach(item => {
            const num = parseInt(item.id.replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > max) max = num;
        });
        return prefix + '-' + (max + 1);
    }

    function formatDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        const now = new Date();
        const diff = now - d;
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return days + ' days ago';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function formatDateFull(iso) {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    function timeAgo(iso) {
        if (!iso) return '';
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return mins + 'm ago';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        const days = Math.floor(hrs / 24);
        return days + 'd ago';
    }

    function getAsset(id) {
        return state.data.assets.find(a => a.id === id);
    }

    function getAssetName(id) {
        const a = getAsset(id);
        return a ? a.name : id;
    }

    function getStatusColor(status) {
        switch(status) {
            case 'operational': return 'text-accent-400';
            case 'maintenance': return 'text-warn-400';
            case 'down': return 'text-danger-400';
            case 'Open': return 'text-danger-400';
            case 'In Progress': return 'text-warn-400';
            case 'Resolved': return 'text-accent-400';
            case 'overdue': return 'text-danger-400';
            case 'due_this_week': return 'text-warn-400';
            case 'scheduled': return 'text-info-400';
            case 'completed': return 'text-accent-400';
            default: return 'text-surface-400';
        }
    }

    function getStatusBg(status) {
        switch(status) {
            case 'operational': return 'bg-accent-500';
            case 'maintenance': return 'bg-warn-500';
            case 'down': return 'bg-danger-500';
            case 'Open': return 'bg-danger-500/20 text-danger-400 border-danger-500/30';
            case 'In Progress': return 'bg-warn-500/20 text-warn-400 border-warn-500/30';
            case 'Waiting on Parts': return 'bg-danger-500/20 text-danger-400 border-danger-500/30';
            case 'Resolved': return 'bg-accent-500/20 text-accent-400 border-accent-500/30';
            case 'overdue': return 'bg-danger-500/20 text-danger-400 border-danger-500/30';
            case 'due_this_week': return 'bg-warn-500/20 text-warn-400 border-warn-500/30';
            case 'scheduled': return 'bg-info-500/20 text-info-400 border-info-500/30';
            case 'completed': return 'bg-accent-500/20 text-accent-400 border-accent-500/30';
            default: return 'bg-surface-700/50 text-surface-300 border-surface-600';
        }
    }

    function getPriorityColor(priority) {
        switch(priority) {
            case 'High': return 'text-danger-400';
            case 'Medium': return 'text-warn-400';
            case 'Low': return 'text-accent-400';
            default: return 'text-surface-400';
        }
    }

    function getSeverityColor(severity) {
        switch(severity) {
            case 'High': return 'text-danger-400';
            case 'Medium': return 'text-warn-400';
            case 'Low': return 'text-accent-400';
            default: return 'text-surface-400';
        }
    }

    function addNotification(type, message, link = null) {
        const notif = {
            id: 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            type,
            message,
            read: false,
            date: new Date().toISOString(),
            link,
        };
        state.notifications.unshift(notif);
        if (state.notifications.length > 50) state.notifications = state.notifications.slice(0, 50);
        saveNotifications();
        updateNotifBadge();
    }

    function addActivity(type, message) {
        state.data.activity.unshift({
            id: 'ACT-' + Date.now(),
            type,
            message,
            date: new Date().toISOString(),
        });
        if (state.data.activity.length > 100) state.data.activity = state.data.activity.slice(0, 100);
    }

    function updateNotifBadge() {
        const unread = state.notifications.filter(n => !n.read).length;
        const badge = $('#notifBadge');
        if (unread > 0) {
            badge.textContent = unread > 9 ? '9+' : unread;
            badge.classList.remove('hidden');
            badge.classList.add('pulse-badge');
        } else {
            badge.classList.add('hidden');
            badge.classList.remove('pulse-badge');
        }
    }

    function getEstimatedResponse(severity) {
        switch(severity) {
            case 'High': return '15 minutes';
            case 'Medium': return '1 hour';
            case 'Low': return '4 hours';
            default: return '24 hours';
        }
    }

    // ─── Toast Notifications ──────────────────────────────────────────────────
    function showToast(message, type = 'info') {
        const container = $('#toastContainer');
        const colors = {
            success: 'bg-accent-600',
            error: 'bg-danger-600',
            warning: 'bg-warn-600',
            info: 'bg-info-600',
        };
        const toast = document.createElement('div');
        toast.className = `toast-in ${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-xs`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ─── Modal ────────────────────────────────────────────────────────────────
    function showModal(html) {
        const container = $('#modalContainer');
        container.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60" onclick="App.closeModal()"></div>
                <div class="relative bg-surface-900 border border-surface-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
                    ${html}
                </div>
            </div>
        `;
    }

    function closeModal() {
        $('#modalContainer').innerHTML = '';
    }

    // ─── Navigation ───────────────────────────────────────────────────────────
    function navigate(view) {
        state.currentView = view;
        // Update nav buttons
        $$('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === view);
        });
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    function render() {
        const main = $('#mainContent');
        switch(state.currentView) {
            case 'dashboard': main.innerHTML = renderDashboard(); break;
            case 'report': main.innerHTML = renderReportForm(); break;
            case 'workorders': main.innerHTML = renderWorkOrders(); break;
            case 'assets': main.innerHTML = renderAssets(); break;
            case 'pm': main.innerHTML = renderPM(); break;
            case 'more': main.innerHTML = renderMore(); break;
            default: main.innerHTML = renderDashboard();
        }
        // Re-attach any needed listeners
        attachViewListeners();
    }

    // ─── Dashboard View ───────────────────────────────────────────────────────
    function renderDashboard() {
        const role = ROLES[state.currentRole];
        const d = state.data;
        const openIncidents = d.incidents.filter(i => i.status === 'Open').length;
        const activeWOs = d.workOrders.filter(w => w.status !== 'Resolved').length;
        const assetsDown = d.assets.filter(a => a.status === 'down').length;
        const pmsDue = d.pms.filter(p => p.status === 'overdue' || p.status === 'due_this_week').length;

        const recentActivity = d.activity.slice(0, 8);

        return `
            <div class="fade-in">
                <!-- Welcome Section -->
                <div class="mb-6">
                    <h1 class="text-2xl sm:text-3xl font-bold text-white">Welcome back</h1>
                    <p class="text-surface-400 mt-1">Here's what's happening on the floor today.</p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div class="bg-surface-900 border border-surface-800 rounded-xl p-4 card-hover">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs text-surface-400 font-medium uppercase tracking-wide">Open Incidents</span>
                            <svg class="w-5 h-5 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                        </div>
                        <span class="text-2xl sm:text-3xl font-bold text-white">${openIncidents}</span>
                    </div>
                    <div class="bg-surface-900 border border-surface-800 rounded-xl p-4 card-hover">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs text-surface-400 font-medium uppercase tracking-wide">Active WOs</span>
                            <svg class="w-5 h-5 text-warn-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                        </div>
                        <span class="text-2xl sm:text-3xl font-bold text-white">${activeWOs}</span>
                    </div>
                    <div class="bg-surface-900 border border-surface-800 rounded-xl p-4 card-hover">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs text-surface-400 font-medium uppercase tracking-wide">Assets Down</span>
                            <svg class="w-5 h-5 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                        </div>
                        <span class="text-2xl sm:text-3xl font-bold ${assetsDown > 0 ? 'text-danger-400' : 'text-white'}">${assetsDown}</span>
                    </div>
                    <div class="bg-surface-900 border border-surface-800 rounded-xl p-4 card-hover">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs text-surface-400 font-medium uppercase tracking-wide">PMs Due</span>
                            <svg class="w-5 h-5 text-info-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                        <span class="text-2xl sm:text-3xl font-bold ${pmsDue > 0 ? 'text-warn-400' : 'text-white'}">${pmsDue}</span>
                    </div>
                </div>

                <!-- Quick Actions -->
                ${role.canReport ? `
                <div class="mb-6">
                    <h2 class="text-sm font-semibold text-surface-400 uppercase tracking-wide mb-3">Quick Actions</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button onclick="App.navigate('report')" class="btn-press bg-accent-600 hover:bg-accent-700 text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <span class="text-sm font-medium">Report Issue</span>
                        </button>
                        ${role.canManage ? `
                        <button onclick="App.navigate('workorders');setTimeout(()=>App.showCreateWO(),100)" class="btn-press bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-200 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                            <span class="text-sm font-medium">New Work Order</span>
                        </button>
                        <button onclick="App.navigate('pm')" class="btn-press bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-200 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            <span class="text-sm font-medium">View PMs</span>
                        </button>
                        ` : ''}
                        <button onclick="App.navigate('assets')" class="btn-press bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-200 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            <span class="text-sm font-medium">View Assets</span>
                        </button>
                    </div>
                </div>
                ` : ''}

                <!-- Two Column: Activity + Recent Incidents -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Activity Feed -->
                    <div class="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
                        <div class="px-4 py-3 border-b border-surface-800 flex items-center justify-between">
                            <h2 class="font-semibold text-white">Recent Activity</h2>
                            <span class="text-xs text-surface-500">${d.activity.length} events</span>
                        </div>
                        <div class="divide-y divide-surface-800/50 max-h-96 overflow-y-auto">
                            ${recentActivity.length === 0 ? '<p class="p-4 text-surface-500 text-sm">No recent activity</p>' : ''}
                            ${recentActivity.map(act => `
                                <div class="px-4 py-3 flex items-start gap-3">
                                    <div class="mt-0.5">${getActivityIcon(act.type)}</div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm text-surface-200">${act.message}</p>
                                        <span class="text-xs text-surface-500">${timeAgo(act.date)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Recent Incidents -->
                    <div class="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
                        <div class="px-4 py-3 border-b border-surface-800 flex items-center justify-between">
                            <h2 class="font-semibold text-white">Recent Incidents</h2>
                            <button onclick="App.navigate('workorders')" class="text-xs text-accent-400 hover:text-accent-300">View All</button>
                        </div>
                        <div class="divide-y divide-surface-800/50 max-h-96 overflow-y-auto">
                            ${d.incidents.length === 0 ? '<p class="p-4 text-surface-500 text-sm">No incidents reported</p>' : ''}
                            ${d.incidents.slice(0, 8).map(inc => `
                                <div class="px-4 py-3 flex items-start gap-3">
                                    <span class="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusBg(inc.status)}">${inc.status}</span>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-surface-200 truncate">${inc.id} — ${getAssetName(inc.assetId)}</p>
                                        <p class="text-xs text-surface-500">${inc.category} · ${inc.severity} · ${timeAgo(inc.date)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function getActivityIcon(type) {
        const icons = {
            incident_reported: '<svg class="w-4 h-4 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
            wo_created: '<svg class="w-4 h-4 text-info-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
            wo_updated: '<svg class="w-4 h-4 text-warn-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>',
            pm_completed: '<svg class="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            incident_resolved: '<svg class="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
        };
        return icons[type] || '<svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
    }

    // ─── Report Incident View ─────────────────────────────────────────────────
    function renderReportForm() {
        const form = state.reportForm;
        const role = ROLES[state.currentRole];

        if (!role.canReport) {
            return `
                <div class="fade-in text-center py-12">
                    <svg class="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                    <h2 class="text-xl font-semibold text-white mb-2">Access Restricted</h2>
                    <p class="text-surface-400">Your role (${role.label}) doesn't have permission to report incidents.</p>
                </div>
            `;
        }

        return `
            <div class="fade-in max-w-lg mx-auto">
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-white">Report an Issue</h1>
                    <p class="text-surface-400 mt-1 text-sm">Takes less than 30 seconds. Just the essentials.</p>
                </div>

                <form id="incidentForm" class="space-y-5" onsubmit="App.submitIncident(event)">
                    <!-- Asset ID -->
                    <div>
                        <label class="block text-sm font-medium text-surface-300 mb-2">Asset ID *</label>
                        <div class="flex gap-2">
                            <input type="text" id="assetIdInput" value="${form.assetId}" placeholder="e.g. AST-001" class="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" required>
                            <button type="button" onclick="App.simulateScan()" class="btn-press bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg px-4 py-3 text-surface-300 hover:text-white transition-colors flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
                                <span class="hidden sm:inline text-sm">Scan</span>
                            </button>
                        </div>
                        <div id="scanResult" class="mt-2 text-sm hidden"></div>
                    </div>

                    <!-- Category -->
                    <div>
                        <label class="block text-sm font-medium text-surface-300 mb-2">Category *</label>
                        <select id="categorySelect" class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" required>
                            <option value="">Select a category...</option>
                            ${CATEGORIES.map(c => `<option value="${c}" ${form.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Severity -->
                    <div>
                        <label class="block text-sm font-medium text-surface-300 mb-2">Severity *</label>
                        <div class="grid grid-cols-3 gap-2">
                            <button type="button" onclick="App.setSeverity('Low')" id="sevLow" class="severity-btn btn-press border-2 border-accent-500/50 bg-surface-800 text-accent-400 rounded-lg py-3 font-semibold text-sm hover:bg-accent-500/10 ${form.severity === 'Low' ? 'severity-selected-low' : ''}">Low</button>
                            <button type="button" onclick="App.setSeverity('Medium')" id="sevMedium" class="severity-btn btn-press border-2 border-warn-500/50 bg-surface-800 text-warn-400 rounded-lg py-3 font-semibold text-sm hover:bg-warn-500/10 ${form.severity === 'Medium' ? 'severity-selected-medium' : ''}">Medium</button>
                            <button type="button" onclick="App.setSeverity('High')" id="sevHigh" class="severity-btn btn-press border-2 border-danger-500/50 bg-surface-800 text-danger-400 rounded-lg py-3 font-semibold text-sm hover:bg-danger-500/10 ${form.severity === 'High' ? 'severity-selected-high' : ''}">High</button>
                        </div>
                    </div>

                    <!-- Photo Attachment -->
                    <div>
                        <label class="block text-sm font-medium text-surface-300 mb-2">Photo (optional)</label>
                        <div class="relative">
                            <input type="file" id="photoInput" accept="image/*" class="hidden" onchange="App.handlePhoto(this)">
                            <label for="photoInput" class="btn-press flex items-center justify-center gap-2 w-full bg-surface-800 border-2 border-dashed border-surface-700 hover:border-surface-600 rounded-lg py-4 text-surface-400 hover:text-surface-300 cursor-pointer transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                <span class="text-sm" id="photoLabel">${form.photo ? 'Photo attached' : 'Tap to attach photo'}</span>
                            </label>
                        </div>
                    </div>

                    <!-- Voice Note -->
                    <div>
                        <label class="block text-sm font-medium text-surface-300 mb-2">Voice Note (optional)</label>
                        <button type="button" onclick="App.simulateVoice()" id="voiceBtn" class="btn-press flex items-center justify-center gap-2 w-full bg-surface-800 border border-surface-700 hover:border-surface-600 rounded-lg py-4 text-surface-400 hover:text-surface-300 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                            <span class="text-sm" id="voiceLabel">${form.voiceNote ? 'Voice note recorded' : 'Hold to record voice note'}</span>
                        </button>
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="block text-sm font-medium text-surface-300 mb-2">Description (optional)</label>
                        <textarea id="descInput" rows="3" placeholder="Briefly describe the issue..." class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none">${form.description}</textarea>
                    </div>

                    <!-- Submit -->
                    <button type="submit" class="btn-press w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-accent-600/20 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                        Submit Report
                    </button>
                </form>
            </div>
        `;
    }

    // ─── Work Orders View ─────────────────────────────────────────────────────
    function renderWorkOrders() {
        const role = ROLES[state.currentRole];
        const filter = state.woFilter;
        let wos = [...state.data.workOrders];

        // Floor workers see only their own (simplified — in real app would filter by user)
        if (state.currentRole === 'floor_worker') {
            wos = wos.filter(w => w.assignee === 'John Davis' || w.assignee === 'Lisa Park');
        }

        if (filter !== 'All') {
            wos = wos.filter(w => w.status === filter);
        }

        return `
            <div class="fade-in">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-white">Work Orders</h1>
                        <p class="text-surface-400 mt-1 text-sm">${wos.length} work order${wos.length !== 1 ? 's' : ''}</p>
                    </div>
                    ${role.canManage ? `
                    <button onclick="App.showCreateWO()" class="btn-press bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        New Work Order
                    </button>
                    ` : ''}
                </div>

                <!-- Filter Tabs -->
                <div class="flex gap-1 mb-4 bg-surface-900 border border-surface-800 rounded-lg p-1 overflow-x-auto">
                    ${['All', 'Open', 'In Progress', 'Waiting on Parts', 'Resolved'].map(s => `
                        <button onclick="App.setWOFilter('${s}')" class="flex-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${filter === s ? 'bg-surface-700 text-white' : 'text-surface-400 hover:text-surface-200'}">${s}</button>
                    `).join('')}
                </div>

                <!-- Work Order Cards -->
                <div class="space-y-3">
                    ${wos.length === 0 ? `
                        <div class="text-center py-12 bg-surface-900 border border-surface-800 rounded-xl">
                            <svg class="w-12 h-12 text-surface-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                            <p class="text-surface-400">No work orders found</p>
                        </div>
                    ` : ''}
                    ${wos.map(wo => {
                        const asset = getAsset(wo.assetId);
                        const isExpanded = state.expandedWO === wo.id;
                        return `
                            <div class="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden card-hover">
                                <div class="p-4 cursor-pointer" onclick="App.toggleWO('${wo.id}')">
                                    <div class="flex items-start justify-between gap-3">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="text-xs font-mono text-surface-500">${wo.id}</span>
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusBg(wo.status)}">${wo.status}</span>
                                                <span class="text-xs font-medium ${getPriorityColor(wo.priority)}">${wo.priority}</span>
                                            </div>
                                            <h3 class="font-semibold text-white truncate">${wo.title}</h3>
                                            <p class="text-sm text-surface-400 mt-0.5">${asset ? asset.name : wo.assetId} · ${wo.assignee}</p>
                                        </div>
                                        <svg class="w-5 h-5 text-surface-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                </div>
                                <div class="expandable-content ${isExpanded ? 'expanded' : ''}" id="wo-${wo.id}">
                                    <div class="px-4 pb-4 border-t border-surface-800 pt-3">
                                        <p class="text-sm text-surface-300 mb-3">${wo.description}</p>
                                        <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                                            <div><span class="text-surface-500">Created:</span> <span class="text-surface-300">${formatDateFull(wo.created)}</span></div>
                                            <div><span class="text-surface-500">Asset:</span> <span class="text-surface-300">${asset ? asset.name + ' (' + asset.id + ')' : wo.assetId}</span></div>
                                        </div>
                                        ${wo.notes && wo.notes.length > 0 ? `
                                            <div class="mb-3">
                                                <span class="text-xs font-medium text-surface-500 uppercase tracking-wide">Notes</span>
                                                <div class="mt-1 space-y-2">
                                                    ${wo.notes.map(n => `
                                                        <div class="bg-surface-800 rounded-lg p-2 text-sm">
                                                            <p class="text-surface-300">${n.text}</p>
                                                            <p class="text-xs text-surface-500 mt-1">${n.author} · ${timeAgo(n.date)}</p>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        <div class="flex flex-wrap gap-2">
                                            ${role.canUpdateWO ? `
                                                ${wo.status === 'Open' ? `<button onclick="App.updateWOStatus('${wo.id}', 'In Progress')" class="btn-press bg-warn-600 hover:bg-warn-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Start Work</button>` : ''}
                                                ${wo.status === 'In Progress' ? `<button onclick="App.updateWOStatus('${wo.id}', 'Resolved')" class="btn-press bg-accent-600 hover:bg-accent-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Mark Resolved</button>` : ''}
                                                ${wo.status === 'In Progress' ? `<button onclick="App.updateWOStatus('${wo.id}', 'Waiting on Parts')" class="btn-press bg-danger-600 hover:bg-danger-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Waiting on Parts</button>` : ''}
                                                ${wo.status === 'Waiting on Parts' ? `<button onclick="App.updateWOStatus('${wo.id}', 'In Progress')" class="btn-press bg-warn-600 hover:bg-warn-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Parts Received</button>` : ''}
                                                ${wo.status === 'Resolved' ? `<button onclick="App.updateWOStatus('${wo.id}', 'Open')" class="btn-press bg-surface-700 hover:bg-surface-600 text-surface-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Reopen</button>` : ''}
                                                <button onclick="App.showAddNote('${wo.id}')" class="btn-press bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Add Note</button>
                                                <button onclick="App.showAssignWO('${wo.id}')" class="btn-press bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Assign</button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // ─── Assets View ──────────────────────────────────────────────────────────
    function renderAssets() {
        const role = ROLES[state.currentRole];
        const assets = state.data.assets;

        return `
            <div class="fade-in">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-white">Asset Registry</h1>
                        <p class="text-surface-400 mt-1 text-sm">${assets.length} assets tracked</p>
                    </div>
                    ${role.canAdmin ? `
                    <button onclick="App.showCreateAsset()" class="btn-press bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        Add Asset
                    </button>
                    ` : ''}
                </div>

                <!-- Status Summary -->
                <div class="flex gap-4 mb-4 text-sm">
                    <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-accent-500"></span><span class="text-surface-300">${assets.filter(a => a.status === 'operational').length} Operational</span></span>
                    <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-warn-500"></span><span class="text-surface-300">${assets.filter(a => a.status === 'maintenance').length} Maintenance</span></span>
                    <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-danger-500"></span><span class="text-surface-300">${assets.filter(a => a.status === 'down').length} Down</span></span>
                </div>

                <!-- Asset Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${assets.map(asset => {
                        const isExpanded = state.expandedAsset === asset.id;
                        const assetWOs = state.data.workOrders.filter(w => w.assetId === asset.id);
                        const assetPMs = state.data.pms.filter(p => p.assetId === asset.id);
                        return `
                            <div class="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden card-hover">
                                <div class="p-4 cursor-pointer" onclick="App.toggleAsset('${asset.id}')">
                                    <div class="flex items-start justify-between mb-2">
                                        <div>
                                            <span class="text-xs font-mono text-surface-500">${asset.id}</span>
                                            <h3 class="font-semibold text-white">${asset.name}</h3>
                                        </div>
                                        <span class="flex items-center gap-1.5">
                                            <span class="w-2.5 h-2.5 rounded-full ${asset.status === 'operational' ? 'bg-accent-500' : asset.status === 'maintenance' ? 'bg-warn-500' : 'bg-danger-500'} ${asset.status === 'down' ? 'status-dot-pulse' : ''}"></span>
                                            <span class="text-xs font-medium capitalize ${getStatusColor(asset.status)}">${asset.status.replace('_', ' ')}</span>
                                        </span>
                                    </div>
                                    <p class="text-sm text-surface-400 mb-1">${asset.location}</p>
                                    <p class="text-xs text-surface-500">Last PM: ${formatDate(asset.lastMaintenance)}</p>
                                </div>
                                <div class="expandable-content ${isExpanded ? 'expanded' : ''}" id="asset-${asset.id}">
                                    <div class="px-4 pb-4 border-t border-surface-800 pt-3">
                                        <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                                            <div><span class="text-surface-500">Model:</span> <span class="text-surface-300">${asset.model || '—'}</span></div>
                                            <div><span class="text-surface-500">Serial:</span> <span class="text-surface-300">${asset.serial || '—'}</span></div>
                                        </div>
                                        ${role.canUpdateWO ? `
                                        <div class="flex gap-2 mb-3">
                                            <button onclick="App.updateAssetStatus('${asset.id}', 'operational')" class="btn-press flex-1 bg-accent-600/20 hover:bg-accent-600/30 text-accent-400 border border-accent-500/30 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors">Mark Operational</button>
                                            <button onclick="App.updateAssetStatus('${asset.id}', 'maintenance')" class="btn-press flex-1 bg-warn-600/20 hover:bg-warn-600/30 text-warn-400 border border-warn-500/30 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors">Maintenance</button>
                                            <button onclick="App.updateAssetStatus('${asset.id}', 'down')" class="btn-press flex-1 bg-danger-600/20 hover:bg-danger-600/30 text-danger-400 border border-danger-500/30 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors">Down</button>
                                        </div>
                                        ` : ''}
                                        ${assetWOs.length > 0 ? `
                                            <div>
                                                <span class="text-xs font-medium text-surface-500 uppercase tracking-wide">Work Orders (${assetWOs.length})</span>
                                                <div class="mt-1 space-y-1">
                                                    ${assetWOs.slice(0, 3).map(wo => `
                                                        <div class="flex items-center justify-between text-sm bg-surface-800 rounded px-2 py-1.5">
                                                            <span class="text-surface-300 truncate">${wo.id} — ${wo.title}</span>
                                                            <span class="text-xs ${getStatusColor(wo.status)}">${wo.status}</span>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        ${assetPMs.length > 0 ? `
                                            <div class="mt-2">
                                                <span class="text-xs font-medium text-surface-500 uppercase tracking-wide">Scheduled PMs (${assetPMs.length})</span>
                                                <div class="mt-1 space-y-1">
                                                    ${assetPMs.slice(0, 2).map(pm => `
                                                        <div class="flex items-center justify-between text-sm bg-surface-800 rounded px-2 py-1.5">
                                                            <span class="text-surface-300 truncate">${pm.task}</span>
                                                            <span class="text-xs ${getStatusColor(pm.status)}">${pm.status.replace('_', ' ')}</span>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // ─── Preventive Maintenance View ──────────────────────────────────────────
    function renderPM() {
        const role = ROLES[state.currentRole];
        const pms = state.data.pms;
        const overdue = pms.filter(p => p.status === 'overdue');
        const dueThisWeek = pms.filter(p => p.status === 'due_this_week');
        const upcoming = pms.filter(p => p.status === 'scheduled');
        const completed = pms.filter(p => p.status === 'completed');

        return `
            <div class="fade-in">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-white">Preventive Maintenance</h1>
                        <p class="text-surface-400 mt-1 text-sm">${pms.length} scheduled tasks</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="App.setPMView('list')" class="btn-press px-3 py-1.5 rounded-lg text-sm font-medium ${state.pmView === 'list' ? 'bg-surface-700 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'} transition-colors">List</button>
                        <button onclick="App.setPMView('calendar')" class="btn-press px-3 py-1.5 rounded-lg text-sm font-medium ${state.pmView === 'calendar' ? 'bg-surface-700 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'} transition-colors">Calendar</button>
                    </div>
                </div>

                ${state.pmView === 'list' ? `
                    <!-- Status Summary -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <div class="bg-surface-900 border border-danger-500/30 rounded-xl p-3 text-center">
                            <span class="text-2xl font-bold text-danger-400">${overdue.length}</span>
                            <p class="text-xs text-surface-400 mt-1">Overdue</p>
                        </div>
                        <div class="bg-surface-900 border border-warn-500/30 rounded-xl p-3 text-center">
                            <span class="text-2xl font-bold text-warn-400">${dueThisWeek.length}</span>
                            <p class="text-xs text-surface-400 mt-1">Due This Week</p>
                        </div>
                        <div class="bg-surface-900 border border-info-500/30 rounded-xl p-3 text-center">
                            <span class="text-2xl font-bold text-info-400">${upcoming.length}</span>
                            <p class="text-xs text-surface-400 mt-1">Upcoming</p>
                        </div>
                        <div class="bg-surface-900 border border-accent-500/30 rounded-xl p-3 text-center">
                            <span class="text-2xl font-bold text-accent-400">${completed.length}</span>
                            <p class="text-xs text-surface-400 mt-1">Completed</p>
                        </div>
                    </div>

                    <!-- PM List -->
                    <div class="space-y-3">
                        ${pms.length === 0 ? `
                            <div class="text-center py-12 bg-surface-900 border border-surface-800 rounded-xl">
                                <p class="text-surface-400">No preventive maintenance scheduled</p>
                            </div>
                        ` : ''}
                        ${pms.map(pm => {
                            const asset = getAsset(pm.assetId);
                            const isExpanded = state.expandedPM === pm.id;
                            return `
                                <div class="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden card-hover">
                                    <div class="p-4 cursor-pointer" onclick="App.togglePM('${pm.id}')">
                                        <div class="flex items-start justify-between gap-3">
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center gap-2 mb-1">
                                                    <span class="text-xs font-mono text-surface-500">${pm.id}</span>
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusBg(pm.status)}">${pm.status.replace('_', ' ')}</span>
                                                    <span class="text-xs text-surface-500">${pm.frequency}</span>
                                                </div>
                                                <h3 class="font-semibold text-white truncate">${pm.task}</h3>
                                                <p class="text-sm text-surface-400 mt-0.5">${asset ? asset.name : pm.assetId} · Due: ${formatDateFull(pm.dueDate)}</p>
                                            </div>
                                            <svg class="w-5 h-5 text-surface-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                        </div>
                                    </div>
                                    <div class="expandable-content ${isExpanded ? 'expanded' : ''}" id="pm-${pm.id}">
                                        <div class="px-4 pb-4 border-t border-surface-800 pt-3">
                                            <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                                                <div><span class="text-surface-500">Asset:</span> <span class="text-surface-300">${asset ? asset.name + ' (' + asset.id + ')' : pm.assetId}</span></div>
                                                <div><span class="text-surface-500">Assignee:</span> <span class="text-surface-300">${pm.assignee}</span></div>
                                                <div><span class="text-surface-500">Frequency:</span> <span class="text-surface-300">${pm.frequency}</span></div>
                                                <div><span class="text-surface-500">Due:</span> <span class="text-surface-300">${formatDateFull(pm.dueDate)}</span></div>
                                            </div>
                                            ${role.canUpdateWO ? `
                                            <div class="flex gap-2">
                                                <button onclick="App.updatePMStatus('${pm.id}', 'completed')" class="btn-press bg-accent-600 hover:bg-accent-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Mark Complete</button>
                                                ${pm.status !== 'scheduled' ? `<button onclick="App.updatePMStatus('${pm.id}', 'scheduled')" class="btn-press bg-surface-700 hover:bg-surface-600 text-surface-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Reschedule</button>` : ''}
                                            </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <!-- Calendar View -->
                    <div class="bg-surface-900 border border-surface-800 rounded-xl p-4">
                        <h3 class="font-semibold text-white mb-4">${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                        <div class="grid grid-cols-7 gap-1 text-center text-xs text-surface-500 mb-2">
                            ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div class="py-1">${d}</div>`).join('')}
                        </div>
                        <div class="grid grid-cols-7 gap-1">
                            ${generateCalendarDays().map(day => {
                                const dayPMs = pms.filter(pm => {
                                    const d = new Date(pm.dueDate);
                                    return d.getDate() === day.date && d.getMonth() === day.month && d.getFullYear() === day.year;
                                });
                                return `
                                    <div class="aspect-square p-1 rounded-lg ${day.isCurrentMonth ? 'bg-surface-800' : 'bg-surface-900'} ${day.isToday ? 'ring-1 ring-accent-500' : ''} flex flex-col">
                                        <span class="text-xs ${day.isToday ? 'text-accent-400 font-bold' : day.isCurrentMonth ? 'text-surface-300' : 'text-surface-600'}">${day.date}</span>
                                        <div class="flex-1 flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                                            ${dayPMs.map(pm => `
                                                <div class="w-full h-1.5 rounded-full ${pm.status === 'overdue' ? 'bg-danger-500' : pm.status === 'due_this_week' ? 'bg-warn-500' : pm.status === 'completed' ? 'bg-accent-500' : 'bg-info-500'}" title="${pm.task}"></div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="flex flex-wrap gap-3 mt-4 text-xs">
                            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-danger-500"></span> Overdue</span>
                            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-warn-500"></span> Due This Week</span>
                            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-info-500"></span> Scheduled</span>
                            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-accent-500"></span> Completed</span>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    function generateCalendarDays() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPad = firstDay.getDay();
        const days = [];

        // Previous month padding
        const prevMonthLast = new Date(year, month, 0).getDate();
        for (let i = startPad - 1; i >= 0; i--) {
            days.push({ date: prevMonthLast - i, month: month - 1, year, isCurrentMonth: false, isToday: false });
        }
        // Current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const isToday = i === now.getDate();
            days.push({ date: i, month, year, isCurrentMonth: true, isToday });
        }
        // Next month padding
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: i, month: month + 1, year, isCurrentMonth: false, isToday: false });
        }
        return days;
    }

    // ─── More View ────────────────────────────────────────────────────────────
    function renderMore() {
        const role = ROLES[state.currentRole];
        return `
            <div class="fade-in max-w-lg mx-auto">
                <h1 class="text-2xl font-bold text-white mb-6">More</h1>

                <div class="space-y-3">
                    <!-- User Management (Admin only) -->
                    ${role.canAdmin ? `
                    <button onclick="App.showUserManagement()" class="w-full bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between card-hover text-left">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">User Management</h3>
                                <p class="text-sm text-surface-400">Manage users and roles</p>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                    ` : ''}

                    <!-- Settings (Admin only) -->
                    ${role.canAdmin ? `
                    <button onclick="App.showSettings()" class="w-full bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between card-hover text-left">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Settings</h3>
                                <p class="text-sm text-surface-400">System configuration</p>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                    ` : ''}

                    <!-- Reports (Manager/Admin) -->
                    ${role.canManage ? `
                    <button onclick="App.showReports()" class="w-full bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between card-hover text-left">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Reports</h3>
                                <p class="text-sm text-surface-400">Maintenance analytics</p>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                    ` : ''}

                    <!-- Export Data (Admin) -->
                    ${role.canAdmin ? `
                    <button onclick="App.exportData()" class="w-full bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between card-hover text-left">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-white">Export Data</h3>
                                <p class="text-sm text-surface-400">Download all data as JSON</p>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                    ` : ''}

                    <!-- Reset Demo Data (Admin) -->
                    ${role.canAdmin ? `
                    <button onclick="App.resetData()" class="w-full bg-surface-900 border border-danger-500/30 rounded-xl p-4 flex items-center justify-between card-hover text-left">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-danger-500/10 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-danger-400">Reset Demo Data</h3>
                                <p class="text-sm text-surface-400">Restore to sample data</p>
                            </div>
                        </div>
                    </button>
                    ` : ''}

                    <!-- About -->
                    <div class="bg-surface-900 border border-surface-800 rounded-xl p-4 mt-6">
                        <h3 class="font-semibold text-white mb-2">About FloorAlert</h3>
                        <p class="text-sm text-surface-400 mb-2">Version 1.0.0 — Demo Build</p>
                        <p class="text-sm text-surface-400">A maintenance communication and ticketing system designed for small manufacturers, law firms, and dental practices. Self-hosted, browser-based, no server required.</p>
                        <p class="text-xs text-surface-500 mt-3">Built by Chris Carpenter — Maintenance Manager</p>
                    </div>
                </div>
            </div>
        `;
    }

    // ─── Notification Panel ───────────────────────────────────────────────────
    function renderNotifications() {
        const list = $('#notifList');
        if (!list) return;

        if (state.notifications.length === 0) {
            list.innerHTML = '<p class="p-4 text-surface-500 text-sm text-center">No notifications yet</p>';
            return;
        }

        list.innerHTML = state.notifications.map(n => `
            <div class="px-4 py-3 flex items-start gap-3 ${n.read ? 'opacity-60' : ''} cursor-pointer hover:bg-surface-800/50 transition-colors" onclick="App.handleNotifClick('${n.id}')">
                <div class="mt-0.5">${getNotifIcon(n.type)}</div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-surface-200">${n.message}</p>
                    <span class="text-xs text-surface-500">${timeAgo(n.date)}</span>
                </div>
                ${!n.read ? '<span class="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0 mt-2"></span>' : ''}
            </div>
        `).join('');
    }

    function getNotifIcon(type) {
        const icons = {
            incident: '<svg class="w-4 h-4 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
            wo: '<svg class="w-4 h-4 text-info-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
            pm: '<svg class="w-4 h-4 text-warn-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
            asset: '<svg class="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h-5m10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
            system: '<svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        };
        return icons[type] || icons.system;
    }

    function handleNotifClick(notifId) {
        const notif = state.notifications.find(n => n.id === notifId);
        if (!notif) return;

        // Mark as read
        notif.read = true;
        saveNotifications();
        updateNotifBadge();
        renderNotifications();

        // Close notification panel
        state.notifPanelOpen = false;
        const panel = $('#notifPanel');
        if (panel) panel.classList.add('hidden');

        // Navigate to the linked view
        if (notif.link && notif.link.view) {
            navigate(notif.link.view);
            // If the notification links to a specific work order, expand it
            if (notif.link.view === 'workorders' && notif.link.id) {
                state.expandedWO = notif.link.id;
                render();
            }
        }
    }

    // ─── Event Handlers ───────────────────────────────────────────────────────
    function attachViewListeners() {
        // Update role switcher
        const roleSelect = $('#roleSwitcher');
        if (roleSelect) {
            roleSelect.value = state.currentRole;
        }
    }

    // ─── Public API ───────────────────────────────────────────────────────────
    window.App = {
        // Navigation
        navigate,

        // Role
        setRole(role) {
            if (ROLES[role]) {
                state.currentRole = role;
                state.currentView = 'dashboard';
                saveRole();
                showToast(`Switched to ${ROLES[role].label} view`, 'info');
                render();
            }
        },

        // Notifications
        toggleNotifications() {
            state.notifPanelOpen = !state.notifPanelOpen;
            const panel = $('#notifPanel');
            if (state.notifPanelOpen) {
                panel.classList.remove('hidden');
                panel.querySelector('.absolute.right-0').classList.add('slide-in-right');
                renderNotifications();
            } else {
                panel.classList.add('hidden');
            }
        },

        markNotifRead(id) {
            const notif = state.notifications.find(n => n.id === id);
            if (notif) {
                notif.read = true;
                saveNotifications();
                updateNotifBadge();
                renderNotifications();
            }
        },

        handleNotifClick(notifId) {
            handleNotifClick(notifId);
        },

        // Report Form
        setSeverity(severity) {
            state.reportForm.severity = severity;
            ['Low', 'Medium', 'High'].forEach(s => {
                const btn = document.getElementById('sev' + s);
                if (btn) {
                    btn.classList.remove('severity-selected-low', 'severity-selected-medium', 'severity-selected-high');
                }
            });
            const btn = document.getElementById('sev' + severity);
            if (btn) {
                btn.classList.add('severity-selected-' + severity.toLowerCase());
            }
        },

        simulateScan() {
            const assets = state.data.assets;
            const randomAsset = assets[Math.floor(Math.random() * assets.length)];
            const input = document.getElementById('assetIdInput');
            const result = document.getElementById('scanResult');

            // Simulate scanning animation
            result.classList.remove('hidden');
            result.innerHTML = '<span class="text-warn-400">Scanning...</span>';
            input.disabled = true;

            setTimeout(() => {
                input.value = randomAsset.id;
                input.disabled = false;
                result.innerHTML = `<span class="text-accent-400">Detected: ${randomAsset.name} (${randomAsset.id})</span>`;
                setTimeout(() => result.classList.add('hidden'), 3000);
            }, 1200);
        },

        handlePhoto(input) {
            if (input.files && input.files[0]) {
                state.reportForm.photo = input.files[0].name;
                document.getElementById('photoLabel').textContent = 'Photo attached: ' + input.files[0].name;
            }
        },

        simulateVoice() {
            const btn = document.getElementById('voiceBtn');
            const label = document.getElementById('voiceLabel');

            if (state.reportForm.voiceNote) {
                // Clear
                state.reportForm.voiceNote = null;
                label.textContent = 'Hold to record voice note';
                btn.classList.remove('border-danger-500', 'text-danger-400');
                return;
            }

            // Simulate recording
            label.textContent = 'Recording... (simulated)';
            btn.classList.add('border-danger-500', 'text-danger-400');

            setTimeout(() => {
                state.reportForm.voiceNote = 'voice_note_' + Date.now() + '.m4a';
                label.textContent = 'Voice note recorded ✓';
                btn.classList.remove('border-danger-500', 'text-danger-400');
                btn.classList.add('border-accent-500', 'text-accent-400');
            }, 2000);
        },

        submitIncident(event) {
            event.preventDefault();

            const assetId = document.getElementById('assetIdInput').value.trim();
            const category = document.getElementById('categorySelect').value;
            const description = document.getElementById('descInput').value.trim();

            if (!assetId || !category || !state.reportForm.severity) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            const asset = getAsset(assetId);
            if (!asset) {
                showToast('Asset not found. Please check the ID.', 'error');
                return;
            }

            const incidentId = generateId('INC');
            const incident = {
                id: incidentId,
                assetId,
                category,
                severity: state.reportForm.severity,
                description,
                photo: state.reportForm.photo,
                voiceNote: state.reportForm.voiceNote,
                reportedBy: ROLES[state.currentRole].label === 'Floor Worker' ? 'John Davis' : 'Current User',
                status: 'Open',
                created: new Date().toISOString(),
            };

            state.data.incidents.unshift(incident);
            addActivity('incident_reported', `${incidentId} reported — ${asset.name} (${category}, ${state.reportForm.severity})`);
            addNotification('incident', `New incident ${incidentId}: ${asset.name} — ${category} (${state.reportForm.severity})`, { view: 'dashboard' });

            // Auto-create work order for high severity
            if (state.reportForm.severity === 'High') {
                const woId = generateId('WO');
                state.data.workOrders.unshift({
                    id: woId,
                    title: `${category} issue on ${asset.name}`,
                    assetId,
                    assignee: 'Unassigned',
                    priority: 'High',
                    status: 'Open',
                    created: new Date().toISOString(),
                    description: `Auto-created from incident ${incidentId}. ${description}`,
                    notes: [],
                });
                addActivity('wo_created', `${woId} auto-created from ${incidentId}`);
                addNotification('wo', `Work order ${woId} auto-created for high-severity incident`, { view: 'workorders', id: woId });
            }

            saveData();

            // Show confirmation
            const responseTime = getEstimatedResponse(state.reportForm.severity);
            showModal(`
                <div class="p-6 text-center">
                    <div class="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h2 class="text-xl font-bold text-white mb-2">Incident Reported!</h2>
                    <p class="text-surface-400 mb-4">Your incident has been submitted successfully.</p>
                    <div class="bg-surface-800 rounded-lg p-4 mb-4">
                        <p class="text-sm text-surface-400">Incident ID</p>
                        <p class="text-lg font-mono font-bold text-white">${incidentId}</p>
                    </div>
                    <div class="bg-surface-800 rounded-lg p-4 mb-6">
                        <p class="text-sm text-surface-400">Estimated Response Time</p>
                        <p class="text-lg font-bold ${state.reportForm.severity === 'High' ? 'text-danger-400' : state.reportForm.severity === 'Medium' ? 'text-warn-400' : 'text-accent-400'}">${responseTime}</p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="App.closeModal();App.resetReportForm()" class="flex-1 bg-surface-800 hover:bg-surface-700 text-surface-200 py-3 rounded-lg font-medium transition-colors">Report Another</button>
                        <button onclick="App.closeModal();App.navigate('dashboard')" class="flex-1 bg-accent-600 hover:bg-accent-700 text-white py-3 rounded-lg font-medium transition-colors">Go to Dashboard</button>
                    </div>
                </div>
            `);

            updateNotifBadge();
        },

        resetReportForm() {
            state.reportForm = { assetId: '', category: '', severity: '', photo: null, voiceNote: null, description: '' };
            setTimeout(() => navigate('report'), 100);
        },

        // Work Orders
        setWOFilter(filter) {
            state.woFilter = filter;
            render();
        },

        toggleWO(id) {
            state.expandedWO = state.expandedWO === id ? null : id;
            render();
        },

        updateWOStatus(id, status) {
            const wo = state.data.workOrders.find(w => w.id === id);
            if (wo) {
                wo.status = status;
                saveData();
                addActivity('wo_updated', `${id} status changed to ${status}`);
                addNotification('wo', `Work order ${id} status changed to ${status}`, { view: 'workorders', id: '${id}' });
                showToast(`${id} updated to ${status}`, 'success');
                render();
            }
        },

        showAddNote(woId) {
            showModal(`
                <div class="p-6">
                    <h2 class="text-lg font-bold text-white mb-4">Add Note — ${woId}</h2>
                    <textarea id="noteText" rows="4" placeholder="Enter your note..." class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none mb-4"></textarea>
                    <div class="flex gap-3">
                        <button onclick="App.closeModal()" class="flex-1 bg-surface-800 hover:bg-surface-700 text-surface-200 py-2.5 rounded-lg font-medium transition-colors">Cancel</button>
                        <button onclick="App.submitNote('${woId}')" class="flex-1 bg-accent-600 hover:bg-accent-700 text-white py-2.5 rounded-lg font-medium transition-colors">Add Note</button>
                    </div>
                </div>
            `);
        },

        submitNote(woId) {
            const text = document.getElementById('noteText').value.trim();
            if (!text) {
                showToast('Please enter a note', 'error');
                return;
            }
            const wo = state.data.workOrders.find(w => w.id === woId);
            if (wo) {
                if (!wo.notes) wo.notes = [];
                wo.notes.push({
                    author: ROLES[state.currentRole].label,
                    text,
                    date: new Date().toISOString(),
                });
                saveData();
                addActivity('wo_updated', `Note added to ${woId}`);
                closeModal();
                showToast('Note added', 'success');
                render();
            }
        },

        showAssignWO(woId) {
            const techs = state.data.users.filter(u => u.role === 'technician' || u.role === 'admin');
            showModal(`
                <div class="p-6">
                    <h2 class="text-lg font-bold text-white mb-4">Assign Work Order — ${woId}</h2>
                    <div class="space-y-2 mb-4">
                        ${techs.map(t => `
                            <button onclick="App.assignWO('${woId}', '${t.name}')" class="w-full bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg px-4 py-3 text-left text-surface-200 transition-colors flex items-center justify-between">
                                <span>${t.name}</span>
                                <span class="text-xs text-surface-500">${ROLES[t.role].label}</span>
                            </button>
                        `).join('')}
                    </div>
                    <button onclick="App.closeModal()" class="w-full bg-surface-800 hover:bg-surface-700 text-surface-200 py-2.5 rounded-lg font-medium transition-colors">Cancel</button>
                </div>
            `);
        },

        assignWO(woId, assignee) {
            const wo = state.data.workOrders.find(w => w.id === woId);
            if (wo) {
                wo.assignee = assignee;
                saveData();
                addActivity('wo_updated', `${woId} assigned to ${assignee}`);
                addNotification('wo', `Work order ${woId} assigned to ${assignee}`, { view: 'workorders', id: woId });
                closeModal();
                showToast(`Assigned to ${assignee}`, 'success');
                render();
            }
        },

        showCreateWO() {
            const role = ROLES[state.currentRole];
            if (!role.canManage) {
                showToast('You do not have permission to create work orders', 'error');
                return;
            }

            showModal(`
                <div class="p-6">
                    <h2 class="text-lg font-bold text-white mb-4">New Work Order</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-surface-300 mb-1">Title *</label>
                            <input type="text" id="woTitle" placeholder="Brief description of the work" class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2.5 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-surface-300 mb-1">Asset *</label>
                            <select id="woAsset" class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
                                <option value="">Select asset...</option>
                                ${state.data.assets.map(a => `<option value="${a.id}">${a.name} (${a.id})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-surface-300 mb-1">Priority *</label>
                            <div class="grid grid-cols-3 gap-2">
                                <select id="woPriority" class="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
                                    <option value="Low">Low</option>
                                    <option value="Medium" selected>Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-surface-300 mb-1">Assignee</label>
                            <select id="woAssignee" class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
                                <option value="Unassigned">Unassigned</option>
                                ${state.data.users.filter(u => u.role === 'technician' || u.role === 'admin').map(u => `<option value="${u.name}">${u.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-surface-300 mb-1">Description</label>
                            <textarea id="woDesc" rows="3" placeholder="Detailed description..." class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2.5 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"></textarea>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button onclick="App.closeModal()" class="flex-1 bg-surface-800 hover:bg-surface-700 text-surface-200 py-2.5 rounded-lg font-medium transition-colors">Cancel</button>
                        <button onclick="App.submitCreateWO()" class="flex-1 bg-accent-600 hover:bg-accent-700 text-white py-2.5 rounded-lg font-medium transition-colors">Create</button>
                    </div>
                </div>
            `);
        },

        submitCreateWO() {
            const title = document.getElementById('woTitle').value.trim();
            const assetId = document.getElementById('woAsset').value;
            const priority = document.getElementById('woPriority').value;
            const assignee = document.getElementById('woAssignee').value;
            const description = document.getElementById('woDesc').value.trim();

            if (!title || !assetId) {
                showToast('Please fill in title and asset', 'error');
                return;
            }

            const woId = generateId('WO');
            state.data.workOrders.unshift({
                id: woId,
                title,
                assetId,
                assignee,
                priority,
                status: 'Open',
                created: new Date().toISOString(),
                description,
                notes: [],
            });

            saveData();
            addActivity('wo_created', `${woId} created — ${title}`);
            addNotification('wo', `New work order ${woId}: ${title}`, { view: 'workorders', id: woId });
            closeModal();
            showToast(`Work order ${woId} created`, 'success');
            render();
        },

        // Assets
        toggleAsset(id) {
            state.expandedAsset = state.expandedAsset === id ? null : id;
            render();
        },

        updateAssetStatus(id, status) {
            const asset = state.data.assets.find(a => a.id === id);
            if (asset) {
                asset.status = status;
                saveData();
                addActivity('asset_update', `${asset.name} status changed to ${status}`);
                addNotification('asset', `${asset.name} is now ${status.replace('_', ' ')}`, { view: 'assets' });
                showToast(`${asset.name} marked as ${status.replace('_', ' ')}`, 'success');
                render();
            }
        },

        showCreateAsset() {
            showModal(`
                <div class="p-6">
                    <h2 class="text-lg font-bold text-white mb-4">Add New Asset</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-surface-300 mb-1">Asset Name *</label>
                            <input type="text" id="assetName" placeholder="e.g. CNC Mill #3" class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2.5 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-surface-300 mb-1">Location *</label>
                            <input type="text" id="assetLocation" placeholder="e.g. Building A — Floor 1" class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2.5 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-surface-300 mb-1">Model</label>
                                <input type="text" id="assetModel" placeholder="e.g. Haas VF-2" class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2.5 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-surface-300 mb-1">Serial Number</label>
                                <input type="text" id="assetSerial" placeholder="e.g. HVF2-2024-0001" class="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2.5 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500">
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button onclick="App.closeModal()" class="flex-1 bg-surface-800 hover:bg-surface-700 text-surface-200 py-2.5 rounded-lg font-medium transition-colors">Cancel</button>
                        <button onclick="App.submitCreateAsset()" class="flex-1 bg-accent-600 hover:bg-accent-700 text-white py-2.5 rounded-lg font-medium transition-colors">Add Asset</button>
                    </div>
                </div>
            `);
        },

        submitCreateAsset() {
            const name = document.getElementById('assetName').value.trim();
            const location = document.getElementById('assetLocation').value.trim();
            const model = document.getElementById('assetModel').value.trim();
            const serial = document.getElementById('assetSerial').value.trim();

            if (!name || !location) {
                showToast('Please fill in name and location', 'error');
                return;
            }

            const id = 'AST-' + String(state.data.assets.length + 1).padStart(3, '0');
            state.data.assets.push({
                id,
                name,
                location,
                status: 'operational',
                lastMaintenance: new Date().toISOString(),
                model,
                serial,
            });

            saveData();
            addActivity('asset_update', `New asset added: ${name} (${id})`);
            addNotification('asset', `New asset registered: ${name}`, { view: 'assets' });
            closeModal();
            showToast(`Asset ${name} added`, 'success');
            render();
        },

        // PM
        setPMView(view) {
            state.pmView = view;
            render();
        },

        togglePM(id) {
            state.expandedPM = state.expandedPM === id ? null : id;
            render();
        },

        updatePMStatus(id, status) {
            const pm = state.data.pms.find(p => p.id === id);
            if (pm) {
                pm.status = status;
                saveData();
                addActivity('pm_update', `${pm.id} status changed to ${status}`);
                addNotification('pm', `PM ${pm.id} ${status.replace('_', ' ')}`, { view: 'pm' });
                showToast(`PM ${id} updated`, 'success');
                render();
            }
        },

        // More
        showUserManagement() {
            const users = state.data.users;
            showModal(`
                <div class="p-6">
                    <h2 class="text-lg font-bold text-white mb-4">User Management</h2>
                    <div class="space-y-2 mb-4 max-h-96 overflow-y-auto">
                        ${users.map(u => `
                            <div class="bg-surface-800 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                    <p class="font-medium text-white">${u.name}</p>
                                    <p class="text-xs text-surface-500">${u.id}</p>
                                </div>
                                <select onchange="App.updateUserRole('${u.id}', this.value)" class="bg-surface-700 border border-surface-600 rounded px-2 py-1 text-sm text-surface-200 focus:outline-none focus:ring-2 focus:ring-accent-500">
                                    ${Object.entries(ROLES).map(([key, r]) => `<option value="${key}" ${u.role === key ? 'selected' : ''}>${r.label}</option>`).join('')}
                                </select>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="App.closeModal()" class="w-full bg-surface-800 hover:bg-surface-700 text-surface-200 py-2.5 rounded-lg font-medium transition-colors">Close</button>
                </div>
            `);
        },

        updateUserRole(userId, newRole) {
            const user = state.data.users.find(u => u.id === userId);
            if (user && ROLES[newRole]) {
                user.role = newRole;
                saveData();
                showToast(`${user.name} is now ${ROLES[newRole].label}`, 'success');
            }
        },

        showSettings() {
            showModal(`
                <div class="p-6">
                    <h2 class="text-lg font-bold text-white mb-4">Settings</h2>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-surface-300">Self-Hosted Mode</span>
                            <span class="text-accent-400 text-sm font-medium">Active</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-surface-300">Data Storage</span>
                            <span class="text-surface-400 text-sm">Local Browser</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-surface-300">Total Records</span>
                            <span class="text-surface-400 text-sm">${state.data.assets.length + state.data.workOrders.length + state.data.incidents.length + state.data.pms.length}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-surface-300">Storage Used</span>
                            <span class="text-surface-400 text-sm">${(JSON.stringify(state.data).length / 1024).toFixed(1)} KB</span>
                        </div>
                    </div>
                    <button onclick="App.closeModal()" class="w-full bg-surface-800 hover:bg-surface-700 text-surface-200 py-2.5 rounded-lg font-medium transition-colors mt-6">Close</button>
                </div>
            `);
        },

        showReports() {
            const d = state.data;
            const totalIncidents = d.incidents.length;
            const resolvedIncidents = d.incidents.filter(i => i.status === 'Resolved').length;
            const totalWOs = d.workOrders.length;
            const resolvedWOs = d.workOrders.filter(w => w.status === 'Resolved').length;
            const assetsDown = d.assets.filter(a => a.status === 'down').length;
            const pmsOverdue = d.pms.filter(p => p.status === 'overdue').length;

            showModal(`
                <div class="p-6">
                    <h2 class="text-lg font-bold text-white mb-4">Maintenance Report</h2>
                    <div class="space-y-3">
                        <div class="bg-surface-800 rounded-lg p-3">
                            <p class="text-sm text-surface-400">Incident Resolution Rate</p>
                            <p class="text-xl font-bold text-white">${totalIncidents > 0 ? Math.round(resolvedIncidents / totalIncidents * 100) : 0}%</p>
                            <p class="text-xs text-surface-500">${resolvedIncidents} of ${totalIncidents} resolved</p>
                        </div>
                        <div class="bg-surface-800 rounded-lg p-3">
                            <p class="text-sm text-surface-400">Work Order Completion</p>
                            <p class="text-xl font-bold text-white">${totalWOs > 0 ? Math.round(resolvedWOs / totalWOs * 100) : 0}%</p>
                            <p class="text-xs text-surface-500">${resolvedWOs} of ${totalWOs} completed</p>
                        </div>
                        <div class="bg-surface-800 rounded-lg p-3">
                            <p class="text-sm text-surface-400">Asset Uptime</p>
                            <p class="text-xl font-bold text-white">${d.assets.length > 0 ? Math.round((d.assets.length - assetsDown) / d.assets.length * 100) : 0}%</p>
                            <p class="text-xs text-surface-500">${assetsDown} of ${d.assets.length} assets down</p>
                        </div>
                        <div class="bg-surface-800 rounded-lg p-3">
                            <p class="text-sm text-surface-400">PM Compliance</p>
                            <p class="text-xl font-bold text-white">${d.pms.length > 0 ? Math.round((d.pms.length - pmsOverdue) / d.pms.length * 100) : 0}%</p>
                            <p class="text-xs text-surface-500">${pmsOverdue} overdue</p>
                        </div>
                    </div>
                    <button onclick="App.closeModal()" class="w-full bg-surface-800 hover:bg-surface-700 text-surface-200 py-2.5 rounded-lg font-medium transition-colors mt-6">Close</button>
                </div>
            `);
        },

        exportData() {
            const dataStr = JSON.stringify(state.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flooralert_export_' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Data exported successfully', 'success');
        },

        resetData() {
            showModal(`
                <div class="p-6">
                    <h2 class="text-lg font-bold text-white mb-2">Reset Demo Data?</h2>
                    <p class="text-surface-400 text-sm mb-4">This will restore all data to the original sample data. Any changes you've made will be lost.</p>
                    <div class="flex gap-3">
                        <button onclick="App.closeModal()" class="flex-1 bg-surface-800 hover:bg-surface-700 text-surface-200 py-2.5 rounded-lg font-medium transition-colors">Cancel</button>
                        <button onclick="App.confirmReset()" class="flex-1 bg-danger-600 hover:bg-danger-700 text-white py-2.5 rounded-lg font-medium transition-colors">Reset</button>
                    </div>
                </div>
            `);
        },

        confirmReset() {
            state.data = getSampleData();
            saveData();
            state.notifications = [];
            saveNotifications();
            updateNotifBadge();
            closeModal();
            showToast('Demo data has been reset', 'success');
            render();
        },

        closeModal,

        // Landing page
        showLanding,
        enterAsRole,
    };

    // ─── Landing Page ─────────────────────────────────────────────────────────
    function showLanding() {
        $('#landingPage').classList.remove('hidden');
        $('#mainApp').classList.add('hidden');
        // Reset nav active states
        $$('.nav-btn').forEach(btn => btn.classList.remove('active'));
    }

    function enterAsRole(role) {
        if (!ROLES[role]) return;
        state.currentRole = role;
        state.currentView = 'dashboard';
        saveRole();

        // Update role switcher
        const roleSelect = $('#roleSwitcher');
        if (roleSelect) roleSelect.value = role;

        // Show main app
        $('#landingPage').classList.add('hidden');
        const mainApp = $('#mainApp');
        mainApp.classList.remove('hidden');

        // Set nav active state
        $$('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === state.currentView);
        });

        render();
        updateNotifBadge();
        showToast(`Welcome! You're now viewing as ${ROLES[role].label}`, 'success');
    }

    // ─── Initialization ───────────────────────────────────────────────────────
    function init() {
        loadState();

        // Set initial role in switcher
        const roleSelect = $('#roleSwitcher');
        if (roleSelect) {
            roleSelect.value = state.currentRole;
            roleSelect.addEventListener('change', (e) => {
                App.setRole(e.target.value);
            });
        }

        // Show landing page first
        showLanding();

        // Add welcome notification if first time
        if (state.notifications.length === 0) {
            addNotification('system', 'Welcome to FloorAlert! Select a role above to explore the demo.');
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
