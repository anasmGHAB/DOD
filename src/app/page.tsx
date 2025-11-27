"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Activity, Cookie, Database, Calendar, TrendingUp, Eye } from "lucide-react";
import { getAllScans, getScansInDateRange } from "@/utils/storage";
import { motion } from "framer-motion";
import Link from "next/link";

type DateFilter = '7d' | '30d' | 'all';

export default function Home() {
  const [scans, setScans] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  useEffect(() => {
    loadScans();
  }, [dateFilter]);

  const loadScans = () => {
    if (dateFilter === 'all') {
      setScans(getAllScans());
    } else {
      const days = dateFilter === '7d' ? 7 : 30;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      setScans(getScansInDateRange(startDate, endDate));
    }
  };

  // Calculate stats
  const cookiesScans = scans.filter(s => s.type === 'cookies');
  const datalayerScans = scans.filter(s => s.type === 'datalayer');
  const ga4Scans = scans.filter(s => s.type === 'ga4');

  const totalCookies = cookiesScans.reduce((sum, scan) => sum + (scan.data?.length || 0), 0);
  const totalDataLayerEvents = datalayerScans.reduce((sum, scan) => sum + (scan.data?.length || 0), 0);
  const totalGA4Hits = ga4Scans.reduce((sum, scan) => sum + (scan.data?.length || 0), 0);

  // Cookie categories
  const cookiesByCategory = cookiesScans.flatMap(scan => scan.data || []).reduce((acc: any, cookie: any) => {
    const cat = cookie.category || 'Unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // GA4 event types
  const ga4EventTypes = ga4Scans.flatMap(scan => scan.data || []).reduce((acc: any, hit: any) => {
    const event = hit.eventName || 'unknown';
    acc[event] = (acc[event] || 0) + 1;
    return acc;
  }, {});

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Necessary": return "bg-emerald-500";
      case "Analytics": return "bg-blue-500";
      case "Marketing": return "bg-orange-500";
      case "Preferences": return "bg-purple-500";
      default: return "bg-slate-500";
    }
  };

  const getEventColor = (eventName: string) => {
    if (eventName.includes("page_view")) return "bg-blue-500";
    if (eventName.includes("scroll")) return "bg-purple-500";
    if (eventName.includes("click")) return "bg-orange-500";
    if (eventName.includes("user_engagement")) return "bg-emerald-500";
    if (eventName.includes("session")) return "bg-yellow-500";
    return "bg-slate-500";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">Real-time analytics from your scans</p>
        </div>

        {/* Date Filter */}
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as DateFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${dateFilter === filter
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              {filter === '7d' ? 'Last 7 Days' : filter === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Scans"
          value={scans.length.toString()}
          change={scans.length > 0 ? "+100%" : "0%"}
          trend="up"
          icon={Activity}
        />
        <StatsCard
          title="Total Cookies"
          value={totalCookies.toString()}
          change={cookiesScans.length > 0 ? `${cookiesScans.length} scans` : "No data"}
          trend="up"
          icon={Cookie}
        />
        <StatsCard
          title="DataLayer Events"
          value={totalDataLayerEvents.toString()}
          change={datalayerScans.length > 0 ? `${datalayerScans.length} scans` : "No data"}
          trend="up"
          icon={Database}
        />
        <StatsCard
          title="GA4 Hits"
          value={totalGA4Hits.toString()}
          change={ga4Scans.length > 0 ? `${ga4Scans.length} scans` : "No data"}
          trend="up"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cookie Distribution */}
        <div className="glass-panel rounded-2xl p-6 min-h-[300px]">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            Cookie Distribution
          </h3>
          {Object.keys(cookiesByCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(cookiesByCategory).map(([category, count]: [string, any]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{category}</span>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / totalCookies) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`h-full ${getCategoryColor(category)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No cookie data yet</p>
                <Link href="/cookies" className="text-primary text-sm hover:underline mt-2 inline-block">
                  Run a scan →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* GA4 Event Types */}
        <div className="glass-panel rounded-2xl p-6 min-h-[300px]">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            GA4 Event Types
          </h3>
          {Object.keys(ga4EventTypes).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(ga4EventTypes).slice(0, 6).map(([event, count]: [string, any]) => (
                <div key={event} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300 truncate max-w-[200px]">{event}</span>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / totalGA4Hits) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`h-full ${getEventColor(event)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No GA4 data yet</p>
                <Link href="/ga4-collection" className="text-primary text-sm hover:underline mt-2 inline-block">
                  Start tracking →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Scans
        </h3>
        {scans.length > 0 ? (
          <div className="space-y-3">
            {scans.slice(0, 5).reverse().map((scan, i) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${scan.type === 'cookies' ? 'from-orange-400 to-red-400' :
                      scan.type === 'datalayer' ? 'from-blue-400 to-cyan-400' :
                        'from-purple-400 to-pink-400'
                    } flex items-center justify-center`}>
                    {scan.type === 'cookies' ? <Cookie className="h-5 w-5 text-white" /> :
                      scan.type === 'datalayer' ? <Database className="h-5 w-5 text-white" /> :
                        <Activity className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <div className="text-white font-medium capitalize">{scan.type} Scan</div>
                    <div className="text-xs text-slate-400">{new Date(scan.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{scan.data?.length || 0}</div>
                  <div className="text-xs text-slate-400">items</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg mb-2">No scans yet</p>
            <p className="text-sm">Start by running a scan on any tab</p>
          </div>
        )}
      </div>
    </div>
  );
}
