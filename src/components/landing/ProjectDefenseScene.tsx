"use client";

import React, { useState } from "react";

export function ProjectDefenseScene() {
  const [activeFile, setActiveFile] = useState("consumer.py");

  return (
    <section className="py-32 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full bg-[#06070d]">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          10 / Real Repository Defense
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          DEFEND YOUR ACTUAL GITHUB REPOSITORIES.
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Connect your GitHub or paste a repo URL. Veyra inspects your actual commits, framework choices, and edge cases, testing if you wrote and understand the code you claim.
        </p>
      </div>

      {/* Code Defense Mockup */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d14] overflow-hidden shadow-2xl relative">
        {/* Editor Tab Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-black/40 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-200">dilip-chendra/distributed-stream-sync</span>
          </div>
          <div className="flex items-center gap-2">
            {["consumer.py", "partitioner.go", "docker-compose.yml"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFile(f)}
                className={`px-3 py-1 rounded-md text-[11px] transition-colors ${
                  activeFile === f ? "bg-white/10 text-white font-bold" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Code + Overlaid Inquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
          {/* Syntax Code Column */}
          <div className="lg:col-span-7 p-6 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto bg-black/30 border-r border-white/[0.04]">
            <pre className="space-y-1">
              <span className="text-slate-600">01</span>  <span className="text-indigo-400">from</span> kafka <span className="text-indigo-400">import</span> KafkaConsumer, TopicPartition<br />
              <span className="text-slate-600">02</span>  <span className="text-indigo-400">import</span> asyncio, json, logging<br />
              <span className="text-slate-600">03</span><br />
              <span className="text-slate-600">04</span>  <span className="text-purple-400">class</span> <span className="text-yellow-300">AsyncTelemetryIngestor</span>:<br />
              <span className="text-slate-600">05</span>      <span className="text-purple-400">def</span> <span className="text-blue-400">__init__</span>(self, bootstrap_servers, group_id):<br />
              <span className="text-slate-600">06</span>          self.consumer = KafkaConsumer(<br />
              <span className="text-slate-600">07</span>              <span className="text-emerald-300">&quot;telemetry-events&quot;</span>,<br />
              <span className="text-slate-600">08</span>              bootstrap_servers=bootstrap_servers,<br />
              <span className="text-slate-600">09</span>              group_id=group_id,<br />
              <span className="text-slate-600">10</span>              enable_auto_commit=<span className="text-orange-400">False</span>,  <span className="text-slate-500"># Manual commit for exactly-once</span><br />
              <span className="text-slate-600">11</span>              auto_offset_reset=<span className="text-emerald-300">&quot;earliest&quot;</span>,<br />
              <span className="text-slate-600">12</span>              max_poll_records=<span className="text-cyan-300">500</span><br />
              <span className="text-slate-600">13</span>          )<br />
              <span className="text-slate-600">14</span><br />
              <span className="text-slate-600">15</span>      <span className="text-purple-400">async def</span> <span className="text-blue-400">process_batch</span>(self):<br />
              <span className="text-slate-600">16</span>          <span className="text-purple-400">for</span> msg <span className="text-purple-400">in</span> self.consumer:<br />
              <span className="text-slate-600">17</span>              payload = json.loads(msg.value)<br />
              <span className="text-slate-600">18</span>              <span className="text-purple-400">await</span> self.sink.write_idempotent(payload)<br />
              <span className="text-slate-600">19</span>              self.consumer.commit()<br />
            </pre>
          </div>

          {/* Overlaid Contextual Questions Column */}
          <div className="lg:col-span-5 p-6 bg-indigo-950/15 flex flex-col justify-between space-y-4">
            <div className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">
              Live Contextual Question Overlays
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-black/60 border border-indigo-500/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300">
                  <span>LINE 10 • COMMITS</span>
                  <span className="text-emerald-400">CONFIDENCE: 94%</span>
                </div>
                <p className="text-slate-200">
                  &quot;You set <code className="text-indigo-300 font-mono">enable_auto_commit=False</code> here. If the worker process panics before line 19 commits the offset, what prevents duplicate execution on restart?&quot;
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-purple-500/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-300">
                  <span>LINE 12 • THROUGHPUT</span>
                  <span className="text-emerald-400">TARGET: P99</span>
                </div>
                <p className="text-slate-200">
                  &quot;Why did you choose <code className="text-purple-300 font-mono">max_poll_records=500</code>? What happens during a rebalance timeout if processing 500 records takes longer than the max poll interval?&quot;
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
              VERIFIED: AUTHENTIC ARCHITECTURE REASONING REQUIRED
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
