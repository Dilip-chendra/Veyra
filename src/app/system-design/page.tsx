"use client";

import React, { useState } from "react";
import { SystemDesignCanvas } from "@/components/whiteboard/SystemDesignCanvas";
import { Layers, Sparkles, Zap, AlertTriangle } from "lucide-react";
import { WhiteboardGraph } from "@/types";

export default function SystemDesignPage() {
  const [interviewerInsight, setInterviewerInsight] = useState<string | null>(
    "Design an architecture capable of handling 50,000 requests per second with high availability. Add components, connect them, and run stress tests to evaluate resilience."
  );

  const handleArchitectureSubmitted = (graph: WhiteboardGraph) => {
    const hasCache = graph.nodes.some(n => n.type === "cache");
    const hasQueue = graph.nodes.some(n => n.type === "queue");
    const hasDB = graph.nodes.some(n => n.type === "database");

    let review = `Architecture received with ${graph.nodes.length} nodes and ${graph.edges.length} connections. `;
    if (!hasCache) {
      review += "Observation: No caching layer detected. Read throughput will bottleneck directly on primary database IOPS.";
    } else if (!hasQueue) {
      review += "Observation: Direct synchronous coupling between services. Consider an asynchronous message queue (Kafka/RabbitMQ) for write spikes.";
    } else {
      review += "Strong decoupling observed with both caching and event streaming. Walk through how you mitigate cache invalidation race conditions.";
    }
    setInterviewerInsight(review);
  };

  const handleSimulation = (scenario: "10x_traffic" | "regional_outage") => {
    if (scenario === "10x_traffic") {
      setInterviewerInsight("⚠️ 10x Traffic Stress Test: Traffic surged to 500,000 RPS. What horizontal pod autoscaling and connection pool limits protect the database?");
    } else {
      setInterviewerInsight("🚨 Regional Outage Stress Test: Primary database zone offline. How do you handle write availability without risking split-brain inconsistency?");
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-800/80 text-[11px] font-mono text-purple-300">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive Architecture Canvas</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Design Whiteboard</h1>
        <p className="text-xs text-slate-400">
          Construct distributed systems, configure inter-service protocols, and run real-time scaling and failover simulations.
        </p>
      </div>

      {interviewerInsight && (
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3 text-xs text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-purple-300">Interviewer Challenge: </span>
            <span className="text-slate-300">{interviewerInsight}</span>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-[500px]">
        <SystemDesignCanvas
          onArchitectureSubmitted={handleArchitectureSubmitted}
          onSimulationTriggered={handleSimulation}
        />
      </div>
    </div>
  );
}
