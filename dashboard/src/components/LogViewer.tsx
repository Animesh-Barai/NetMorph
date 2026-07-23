import React, { useEffect, useState, useRef } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pause, Play, Trash2, Search, CircleDot, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import LogDetailsDrawer, { SelectedLogDetails } from "./LogDetailsDrawer";

export interface LogEntry {
  id: string;
  method: string;
  url: string;
  path: string;
  status?: number;
  type?: string;
  timestamp: string;
  overhead?: number;
  request_headers?: Record<string, string>;
  response_headers?: Record<string, string>;
  request_body?: string;
  response_body?: string;
}

const MOCK_FALLBACK_LOGS: LogEntry[] = [
  {
    id: "flow-91a2-4401",
    method: "GET",
    url: "https://api.stripe.com/v1/payment_intents/pi_3MtwB2Lkd891",
    path: "/v1/payment_intents/pi_3MtwB2Lkd891",
    status: 200,
    type: "application/json",
    timestamp: "22:45:12",
    overhead: 1.42,
    request_headers: {
      "Authorization": "Bearer sk_test_51Mz...",
      "User-Agent": "NetMorph-Proxy/1.1.0",
      "Accept": "application/json"
    },
    response_headers: {
      "Content-Type": "application/json",
      "Stripe-Version": "2022-11-15",
      "X-NetMorph-Intercept": "PASSTHROUGH"
    },
    request_body: "{}",
    response_body: JSON.stringify({ id: "pi_3MtwB2Lkd891", object: "payment_intent", amount: 4500, currency: "usd", status: "succeeded" }, null, 2)
  },
  {
    id: "flow-91a2-4402",
    method: "POST",
    url: "https://auth.netmorph.dev/v2/oauth/token",
    path: "/v2/oauth/token",
    status: 200,
    type: "application/json",
    timestamp: "22:45:08",
    overhead: 3.85,
    request_headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Host": "auth.netmorph.dev"
    },
    response_headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    request_body: "grant_type=client_credentials&client_id=netmorph_dev_881",
    response_body: JSON.stringify({ access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", token_type: "Bearer", expires_in: 3600 }, null, 2)
  },
  {
    id: "flow-91a2-4403",
    method: "PUT",
    url: "https://api.internal/v1/user/preferences",
    path: "/v1/user/preferences",
    status: 204,
    type: "application/json",
    timestamp: "22:44:59",
    overhead: 0.95,
    request_headers: {
      "Content-Type": "application/json",
      "X-User-Id": "usr_77192"
    },
    response_headers: {
      "X-NetMorph-Rule": "Inject-Telemetry-Header"
    },
    request_body: JSON.stringify({ theme: "obsidian_dark", notifications: true }, null, 2),
    response_body: ""
  },
  {
    id: "flow-91a2-4404",
    method: "DELETE",
    url: "https://api.internal/v1/sessions/sess_88129",
    path: "/v1/sessions/sess_88129",
    status: 404,
    type: "application/json",
    timestamp: "22:44:45",
    overhead: 12.40,
    request_headers: {
      "Authorization": "Bearer expired_session_token"
    },
    response_headers: {
      "Content-Type": "application/json"
    },
    request_body: "",
    response_body: JSON.stringify({ error: "Session not found", code: "SESSION_EXPIRED" }, null, 2)
  },
  {
    id: "flow-91a2-4405",
    method: "GET",
    url: "https://cdn.netmorph.io/assets/dashboard-bundle.js",
    path: "/assets/dashboard-bundle.js",
    status: 304,
    type: "application/javascript",
    timestamp: "22:44:30",
    overhead: 0.45,
    request_headers: {
      "If-None-Match": '"64c2-99a1"'
    },
    response_headers: {
      "ETag": '"64c2-99a1"',
      "Cache-Control": "max-age=31536000"
    },
    request_body: "",
    response_body: ""
  }
];

interface LogViewerProps {
  searchFilter?: string;
  onCreateRule?: (pattern: string) => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ searchFilter = "", onCreateRule }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<SelectedLogDetails | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:8000/logs?limit=50");
        if (!response.ok) throw new Error("API Offline");
        const history = await response.json();
        if (Array.isArray(history) && history.length > 0) {
          setLogs(history.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp).toLocaleTimeString()
          })));
          return;
        }
        setLogs(MOCK_FALLBACK_LOGS);
      } catch (error) {
        setLogs(MOCK_FALLBACK_LOGS);
      }
    };

    fetchHistory();

    try {
      const ws = new WebSocket("ws://localhost:8000/ws/logs");
      ws.onmessage = (event) => {
        if (isPausedRef.current) return;
        const data = JSON.parse(event.data);
        const newEntry: LogEntry = {
          ...data,
          timestamp: new Date().toLocaleTimeString()
        };
        setLogs((prev) => {
          if (prev.find(p => p.id === data.id && p.status === data.status)) {
            return prev;
          }
          return [newEntry, ...prev].slice(0, 150);
        });
      };
      return () => ws.close();
    } catch {
      // WS Offline
    }
  }, []);

  const copyUrl = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const effectiveSearch = searchFilter || localSearch;

  const filteredLogs = logs.filter((log) => {
    if (methodFilter !== "ALL" && log.method !== methodFilter) return false;
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      return (
        log.url.toLowerCase().includes(q) ||
        log.path.toLowerCase().includes(q) ||
        log.method.toLowerCase().includes(q) ||
        (log.status && log.status.toString().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status?: number) => {
    if (!status) return <span className="text-zinc-500 font-mono text-xs">-</span>;
    let label = `${status}`;
    if (status === 200) label = "200 OK";
    else if (status === 201) label = "201 Created";
    else if (status === 204) label = "204 No Content";
    else if (status === 304) label = "304 Not Modified";
    else if (status === 400) label = "400 Bad Request";
    else if (status === 401) label = "401 Unauthorized";
    else if (status === 404) label = "404 Not Found";
    else if (status === 500) label = "500 Server Error";

    return (
      <span className={cn(
        "font-mono text-xs sm:text-sm font-bold whitespace-nowrap",
        status >= 200 && status < 300 ? "text-emerald-400" :
        status >= 300 && status < 400 ? "text-zinc-300" :
        status >= 400 && status < 500 ? "text-amber-400" : "text-rose-400"
      )}>
        {label}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0c0c0e] rounded-md border border-[#27272a] shadow-sm overflow-hidden w-full min-w-0 font-mono text-xs sm:text-sm">
      {/* DevTool Filter & Control Toolbar */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#141417] border-b border-[#27272a] flex flex-wrap items-center justify-between gap-3 min-w-0 w-full text-xs">
        {/* Stream Controls */}
        <div className="flex items-center gap-2.5 shrink min-w-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              "h-8 px-3 text-xs font-mono font-bold rounded-md border transition-colors flex items-center gap-1.5 cursor-pointer",
              isPaused 
                ? "bg-amber-950/50 text-amber-400 border-amber-800/50 hover:bg-amber-900/40" 
                : "bg-[#18181b] text-emerald-400 border-[#27272a] hover:bg-[#27272a]"
            )}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? "Paused" : "Recording"}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#09090b] rounded-md border border-[#27272a] text-xs text-zinc-300 font-semibold">
            <CircleDot className={cn("w-3 h-3", isPaused ? "text-amber-400" : "text-emerald-400")} />
            <span>{filteredLogs.length} requests</span>
          </div>

          <button
            onClick={clearLogs}
            className="h-8 px-3 text-xs font-mono text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md border border-transparent hover:border-rose-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Clear Network Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Method Filter Chips & Search */}
        <div className="flex items-center gap-3 shrink min-w-0">
          <div className="flex items-center bg-[#09090b] p-1 rounded-md border border-[#27272a] overflow-x-auto no-scrollbar">
            {["ALL", "GET", "POST", "PUT", "DELETE"].map((m) => {
              const count = m === "ALL" ? logs.length : logs.filter(l => l.method === m).length;
              return (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={cn(
                    "px-3 py-1 text-xs font-mono font-bold rounded transition-colors uppercase whitespace-nowrap cursor-pointer",
                    methodFilter === m 
                      ? "bg-[#27272a] text-zinc-100 font-bold" 
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {m} ({count})
                </button>
              );
            })}
          </div>

          {!searchFilter && (
            <div className="relative shrink min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter..."
                className="h-8 w-36 sm:w-48 pl-8 bg-[#09090b] border-[#27272a] text-xs font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* DevTool Dense Network Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar w-full min-w-0">
        <Table className="border-none min-w-[700px] w-full text-xs sm:text-sm">
          <TableHeader className="bg-[#141417] sticky top-0 z-10 border-b border-[#27272a]">
            <TableRow className="border-none hover:bg-transparent">
              <th className="px-4 py-2.5 text-left text-xs font-mono text-zinc-400 w-24">Method</th>
              <th className="px-4 py-2.5 text-left text-xs font-mono text-zinc-400 w-36">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-mono text-zinc-400">Name / URL Target</th>
              <th className="px-4 py-2.5 text-left text-xs font-mono text-zinc-400 w-36">Type</th>
              <th className="px-4 py-2.5 text-right text-xs font-mono text-zinc-400 w-28">Latency</th>
              <th className="px-4 py-2.5 text-right text-xs font-mono text-zinc-400 w-28">Time</th>
              <th className="w-10"></th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow className="border-none">
                <TableCell colSpan={7} className="h-56 text-center text-zinc-500 font-mono text-xs sm:text-sm italic">
                  No network traffic recorded. Start proxy or adjust filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log, idx) => (
                <TableRow
                  key={`${log.id}-${idx}`}
                  onClick={() => setSelectedLog(log)}
                  className={cn(
                    "border-b border-[#18181b] cursor-pointer group transition-colors text-xs sm:text-sm font-mono",
                    idx % 2 === 0 ? "bg-[#0c0c0e]" : "bg-[#111114]",
                    "hover:bg-[#1c1c21]"
                  )}
                >
                  <TableCell className="px-4 py-2.5 whitespace-nowrap">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-mono font-bold uppercase",
                      log.method === "GET" && "badge-get",
                      log.method === "POST" && "badge-post",
                      log.method === "PUT" && "badge-put",
                      log.method === "DELETE" && "badge-delete"
                    )}>
                      {log.method}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2.5 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </TableCell>

                  <TableCell className="px-4 py-2.5 font-mono text-xs sm:text-sm text-zinc-200 truncate max-w-[160px] sm:max-w-[260px] md:max-w-[380px] lg:max-w-[500px] group-hover:text-indigo-400 transition-colors font-medium">
                    {log.url || log.path}
                  </TableCell>

                  <TableCell className="px-4 py-2.5 font-mono text-xs text-zinc-400 truncate max-w-[140px]">
                    {log.type || "application/json"}
                  </TableCell>

                  <TableCell className="px-4 py-2.5 text-right whitespace-nowrap text-zinc-300 font-mono text-xs sm:text-sm font-semibold">
                    {log.overhead !== undefined ? `${log.overhead.toFixed(2)} ms` : "-"}
                  </TableCell>

                  <TableCell className="px-4 py-2.5 text-right font-mono text-xs text-zinc-400 whitespace-nowrap">
                    {log.timestamp}
                  </TableCell>

                  <TableCell className="pr-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => copyUrl(e, log.id, log.url || log.path)}
                        className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-[#27272a]"
                        title="Copy Target URL"
                      >
                        {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* DevTool Log Inspector Drawer */}
      <LogDetailsDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onCreateRule={onCreateRule}
      />
    </div>
  );
};

export default LogViewer;
