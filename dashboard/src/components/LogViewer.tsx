import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  method: string;
  url: string;
  path: string;
  status?: number;
  type?: string;
  timestamp: string;
  overhead?: number;
}

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // 1. Fetch initial historical logs
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:8000/logs?limit=50");
        const history = await response.json();
        setLogs(history.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp).toLocaleTimeString()
        })));
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();

    // 2. Setup WebSocket for live signals
    const ws = new WebSocket("ws://localhost:8000/ws/logs");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => {
        // Prevent duplicates if flow ID already exists in history
        if (prev.find(p => p.id === data.id && p.status === data.status)) {
          return prev;
        }
        
        return [
          { ...data, timestamp: new Date().toLocaleTimeString() },
          ...prev,
        ].slice(0, 100); // Increase buffer to 100
      });
    };

    return () => ws.close();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-surface-low rounded-sm overflow-hidden">
      <div className="flex-1 overflow-auto no-scrollbar">
        <Table className="border-none">
          <TableHeader className="bg-surface-lowest sticky top-0 z-10">
            <TableRow className="border-none hover:bg-transparent">
              <th className="px-5 py-4 text-left text-label-sm text-muted-foreground w-24">Method</th>
              <th className="px-5 py-4 text-left text-label-sm text-muted-foreground w-20">Status</th>
              <th className="px-5 py-4 text-left text-label-sm text-muted-foreground">Path</th>
              <th className="px-5 py-4 text-left text-label-sm text-muted-foreground">Type</th>
              <th className="px-5 py-4 text-center text-label-sm text-muted-foreground w-24">Overhead</th>
              <th className="px-5 py-4 text-right text-label-sm text-muted-foreground w-32">Time</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow className="border-none group">
                <TableCell colSpan={5} className="h-64 text-center text-muted-foreground/20 font-mono text-xs italic">
                  NO TRAFFIC DETECTED. START YOUR PROXY TO BEGIN.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, idx) => (
                <TableRow 
                  key={`${log.id}-${idx}`} 
                  className={cn(
                    "border-none cursor-pointer group transition-colors",
                    idx % 2 === 0 ? "bg-surface-dim" : "bg-surface-low",
                    "hover:bg-surface-high"
                  )}
                >
                  <TableCell className="px-5 py-4 font-mono text-sm tracking-[0.05rem] font-bold text-foreground opacity-90">{log.method}</TableCell>
                  <TableCell className="px-5 py-4">
                    {log.status && (
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          log.status >= 200 && log.status < 300 ? "bg-primary shadow-[0_0_4px_var(--color-primary)]" :
                          log.status >= 400 ? "bg-destructive shadow-[0_0_4px_var(--color-destructive)]" : "bg-muted-foreground"
                        )} />
                        <span className="font-mono text-xs tracking-[0.05rem] text-muted-foreground">{log.status}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-foreground truncate max-w-[400px]">{log.path}</TableCell>
                  <TableCell className="px-5 py-4 text-xs text-muted-foreground truncate">{log.type || "-"}</TableCell>
                  <TableCell className="px-5 py-4 text-center">
                    {log.overhead !== undefined && (
                      <span className={cn(
                        "text-xs font-mono tracking-[0.05rem]",
                        log.overhead < 5 ? "text-primary/60" :
                        log.overhead < 50 ? "text-primary" : "text-destructive font-bold"
                      )}>
                        {log.overhead.toFixed(2)}ms
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right font-mono text-xs tracking-[0.05rem] text-muted-foreground">{log.timestamp}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LogViewer;
