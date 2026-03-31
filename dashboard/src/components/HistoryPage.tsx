import React, { useState, useEffect } from "react";
import { Search, History, Trash2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrafficLog {
  id: string;
  method: string;
  url: string;
  status: number;
  content_type: string;
  latency: number;
  timestamp: string;
  rule_id?: string;
  overhead?: number;
}

const HistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [filterMethod, setFilterMethod] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchUrl, setSearchUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterMethod !== "ALL") params.append("method", filterMethod);
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (searchUrl) params.append("url", searchUrl);

      const res = await fetch(`http://localhost:8000/logs?limit=50&${params.toString()}`);
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterMethod, filterStatus, searchUrl]);

  const clearHistory = async () => {
    if (!confirm("Wipe all historical traffic?")) return;
    try {
      await fetch("http://localhost:8000/logs", { method: "DELETE" });
      setLogs([]);
    } catch (e) {
      console.error("Failed to clear history");
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-low p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-sm">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight uppercase">Traffic Analytics</h2>
            <p className="text-xs text-muted-foreground font-mono">Historical request forensics and audit logs</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={clearHistory}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Clear All
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6 bg-surface-base/50 p-4 rounded-sm border border-surface-high/20">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search URL pattern..." 
            value={searchUrl}
            onChange={(e) => setSearchUrl(e.target.value)}
            className="pl-10 bg-surface-lowest border-none"
          />
        </div>
        <Select value={filterMethod} onValueChange={(val) => setFilterMethod(val || "ALL")}>
          <SelectTrigger className="bg-surface-lowest border-none">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent className="bg-surface-high border-none">
            <SelectItem value="ALL">ALL METHODS</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "ALL")}>
          <SelectTrigger className="bg-surface-lowest border-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-surface-high border-none">
            <SelectItem value="ALL">ALL STATUS</SelectItem>
            <SelectItem value="200">200 OK</SelectItem>
            <SelectItem value="201">201 CREATED</SelectItem>
            <SelectItem value="400">400 BAD REQ</SelectItem>
            <SelectItem value="401">401 UNAUTHORIZED</SelectItem>
            <SelectItem value="404">404 NOT FOUND</SelectItem>
            <SelectItem value="500">500 SERVER ERR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 bg-surface-base rounded-sm overflow-hidden border border-surface-high/20 shadow-2xl">
        <Table>
          <TableHeader className="bg-surface-lowest/50 sticky top-0 z-10">
            <TableRow className="border-surface-high/20 hover:bg-transparent">
              <TableHead className="w-[100px] text-[10px] uppercase font-mono tracking-widest text-muted-foreground">Method</TableHead>
              <TableHead className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">URL Target</TableHead>
              <TableHead className="w-[100px] text-[10px] uppercase font-mono tracking-widest text-muted-foreground text-center">Status</TableHead>
              <TableHead className="w-[100px] text-[10px] uppercase font-mono tracking-widest text-muted-foreground text-center">Proxy Tax</TableHead>
              <TableHead className="w-[150px] text-[10px] uppercase font-mono tracking-widest text-muted-foreground text-right">Time</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground animate-pulse">Analyzing traffic store...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No historical records found for current filters</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-surface-high/10 hover:bg-primary/5 transition-colors group">
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-mono tracking-tighter border-none bg-surface-lowest uppercase",
                      log.method === "GET" && "text-blue-400",
                      log.method === "POST" && "text-green-400",
                      log.method === "PUT" && "text-amber-400",
                      log.method === "DELETE" && "text-red-400"
                    )}>
                      {log.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate font-mono text-xs opacity-80 group-hover:opacity-100">
                    {log.url}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    <span className={cn(
                      log.status >= 200 && log.status < 300 ? "text-green-500" :
                      log.status >= 400 ? "text-red-500" : "text-amber-500"
                    )}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono text-[10px]">
                    {log.overhead !== undefined && (
                      <Badge variant="outline" className={cn(
                        "border-none bg-surface-lowest",
                        log.overhead < 5 ? "text-green-500/60" :
                        log.overhead < 50 ? "text-amber-500" : "text-red-500"
                      )}>
                        {log.overhead.toFixed(2)}ms
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-[10px] font-mono text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HistoryPage;
