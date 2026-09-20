"use client";

import React, { useState } from "react";
import { WhiteboardNode, WhiteboardEdge, WhiteboardGraph } from "@/types";
import {
  Server,
  Database,
  Layers,
  HardDrive,
  Share2,
  Zap,
  AlertTriangle,
  Plus,
  Trash2,
  Send,
  Download,
} from "lucide-react";

interface SystemDesignCanvasProps {
  onArchitectureSubmitted?: (graph: WhiteboardGraph) => void;
  onSimulationTriggered?: (scenario: "10x_traffic" | "regional_outage") => void;
  className?: string;
}

const INITIAL_NODES: WhiteboardNode[] = [
  { id: "1", type: "client", label: "Client Apps (iOS / Web)", x: 40, y: 150 },
  { id: "2", type: "load_balancer", label: "ALB (Round Robin)", x: 220, y: 150 },
  { id: "3", type: "gateway", label: "API Gateway (Auth/RateLimit)", x: 400, y: 150 },
  { id: "4", type: "service", label: "Core Order Service", x: 600, y: 80 },
  { id: "5", type: "cache", label: "Redis Cluster (Cache-Aside)", x: 800, y: 30 },
  { id: "6", type: "database", label: "PostgreSQL (Primary + Read Replicas)", x: 800, y: 160 },
  { id: "7", type: "queue", label: "Kafka Event Bus", x: 600, y: 250 },
];

const INITIAL_EDGES: WhiteboardEdge[] = [
  { id: "e1", source: "1", target: "2", protocol: "https", label: "HTTPS / TLS 1.3" },
  { id: "e2", source: "2", target: "3", protocol: "https", label: "Internal VPC" },
  { id: "e3", source: "3", target: "4", protocol: "grpc", label: "gRPC" },
  { id: "e4", source: "4", target: "5", protocol: "tcp", label: "p99 < 2ms" },
  { id: "e5", source: "4", target: "6", protocol: "sql", label: "ACID Transactions" },
  { id: "e6", source: "4", target: "7", protocol: "pubsub", label: "Async Events" },
];

export const SystemDesignCanvas: React.FC<SystemDesignCanvasProps> = ({
  onArchitectureSubmitted,
  onSimulationTriggered,
  className = "",
}) => {
  const [nodes, setNodes] = useState<WhiteboardNode[]>(INITIAL_NODES);
  const [edges] = useState<WhiteboardEdge[]>(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [simulationAlert, setSimulationAlert] = useState<string | null>(null);

  const handleAddNode = (type: WhiteboardNode["type"]) => {
    const labels: Record<WhiteboardNode["type"], string> = {
      client: "New Client App",
      gateway: "API Gateway",
      service: "New Microservice",
      database: "Postgres DB",
      cache: "Redis Cache",
      queue: "Kafka Queue",
      load_balancer: "Load Balancer",
      storage: "S3 Storage Bucket",
    };

    const newNode: WhiteboardNode = {
      id: String(Date.now()),
      type,
      label: labels[type],
      x: 350 + Math.random() * 100,
      y: 100 + Math.random() * 100,
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    setNodes(nodes.filter(n => n.id !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const handleSimulate10x = () => {
    setActiveSimulation("10x_traffic");
    setSimulationAlert("[LOAD SURGE] Simulation: Traffic surged by 10x (500k RPS). Redis hit 94% memory capacity. PostgreSQL connection pool saturated!");
    if (onSimulationTriggered) {
      onSimulationTriggered("10x_traffic");
    }
  };

  const handleSimulateOutage = () => {
    setActiveSimulation("regional_outage");
    setSimulationAlert("[FAILOVER] Simulation: Primary availability zone network severed. Auto-failover promoted Read Replica with 3.2s replication lag.");
    if (onSimulationTriggered) {
      onSimulationTriggered("regional_outage");
    }
  };

  const handleSubmitArchitecture = () => {
    if (onArchitectureSubmitted) {
      onArchitectureSubmitted({ nodes, edges });
    }
  };

  const getNodeIcon = (type: WhiteboardNode["type"]) => {
    switch (type) {
      case "database": return <Database className="w-4 h-4 text-emerald-400" />;
      case "cache": return <Zap className="w-4 h-4 text-amber-400" />;
      case "service": return <Server className="w-4 h-4 text-indigo-400" />;
      case "queue": return <Layers className="w-4 h-4 text-cyan-400" />;
      case "storage": return <HardDrive className="w-4 h-4 text-purple-400" />;
      default: return <Share2 className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-300 mr-1">Add Component:</span>
          <button onClick={() => handleAddNode("service")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1">
            <Plus className="w-3 h-3" /> Service
          </button>
          <button onClick={() => handleAddNode("cache")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1">
            <Plus className="w-3 h-3" /> Cache (Redis)
          </button>
          <button onClick={() => handleAddNode("database")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1">
            <Plus className="w-3 h-3" /> Database (Postgres)
          </button>
          <button onClick={() => handleAddNode("queue")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1">
            <Plus className="w-3 h-3" /> Queue (Kafka)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selectedNodeId && (
            <button
              onClick={handleDeleteSelected}
              className="px-2 py-1 bg-rose-950/80 text-rose-300 hover:bg-rose-900 rounded text-[11px] flex items-center gap-1 border border-rose-800/80"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}

          <button
            onClick={handleSimulate10x}
            className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-600/60 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Zap className="w-3 h-3 text-amber-400" /> Simulate 10x Traffic
          </button>

          <button
            onClick={handleSimulateOutage}
            className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-600/60 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Simulate Region Outage
          </button>

          <button
            onClick={handleSubmitArchitecture}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Send className="w-3 h-3" /> Submit Design
          </button>
        </div>
      </div>

      {/* Simulation Alert Banner */}
      {simulationAlert && (
        <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${activeSimulation === "10x_traffic" ? "bg-amber-950/80 border-b border-amber-800 text-amber-200" : "bg-rose-950/80 border-b border-rose-800 text-rose-200"}`}>
          <span>{simulationAlert}</span>
          <button onClick={() => setSimulationAlert(null)} className="text-slate-400 hover:text-slate-200 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Interactive System Design Diagram Canvas */}
      <div className="relative flex-1 min-h-[380px] bg-slate-950 p-6 overflow-auto bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Render Connected Edges (SVG overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {edges.map((edge) => {
            const src = nodes.find(n => n.id === edge.source);
            const tgt = nodes.find(n => n.id === edge.target);
            if (!src || !tgt) return null;

            const x1 = src.x + 85;
            const y1 = src.y + 35;
            const x2 = tgt.x + 85;
            const y2 = tgt.y + 35;

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray={edge.protocol === "pubsub" ? "4 4" : undefined}
                />
                <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="3" fill="#60a5fa" />
              </g>
            );
          })}
        </svg>

        {/* Render Architecture Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              style={{
                position: "absolute",
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: "170px",
              }}
              className={`z-10 p-3 rounded-xl cursor-pointer transition-all border shadow-lg ${
                isSelected
                  ? "bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-500/10"
                  : "bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getNodeIcon(node.type)}
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {node.type.replace("_", " ")}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-100 leading-snug">
                {node.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
