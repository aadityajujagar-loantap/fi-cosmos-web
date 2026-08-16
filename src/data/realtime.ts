import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Profile } from "../domain/types";
import { supabase } from "../lib/supabase";

export class SupabaseRealtimeAdapter {
  private channel: RealtimeChannel | null = null;
  private cleanupListeners: Array<() => void> = [];

  subscribe(profile: Profile, agentId: string | null, invalidate: () => void) {
    this.unsubscribe();

    console.log(`[Realtime] Subscribing for profile: ${profile.email} (${profile.role})`);
    
    // Create a single main channel for all realtime events to avoid multiple connection handshakes
    const mainChannel = supabase.channel(`iflow-sync:${profile.id}`);

    const tables = profile.role === "ADMIN"
      ? ["profiles", "branches", "loan_products", "product_questions", "tasks", "task_assignments", "investigations", "task_evidence", "notifications", "task_activity", "agents"]
      : ["task_assignments", "investigations", "task_evidence", "agents"];

    // 1. Add listeners for general tables
    for (const table of tables) {
      mainChannel.on("postgres_changes", { event: "*", schema: "public", table }, invalidate);
    }

    // 2. Add filtered listeners for AGENTS only
    if (profile.role === "AGENT" && agentId) {
      mainChannel
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `assigned_agent_id=eq.${agentId}` }, invalidate)
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_profile_id=eq.${profile.id}` }, invalidate);
    }

    // 3. Fire a single subscribe request for the entire channel
    mainChannel.subscribe((status) => {
      console.log(`[Realtime] Subscription status for ${profile.role}:`, status);
    });
    
    this.channel = mainChannel;

    const reconcile = () => {
      console.log("[Realtime] Focus/network reconnect trigger, refreshing data...");
      invalidate();
    };
    const onVisibility = () => { if (document.visibilityState === "visible") reconcile(); };
    const onNativeNetwork = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string; payload?: { isConnected?: boolean } }>).detail;
      if (detail?.type === "NETWORK_STATUS_CHANGED" && detail.payload?.isConnected !== false) reconcile();
    };
    window.addEventListener("online", reconcile);
    window.addEventListener("focus", reconcile);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("nativeBridgeMessage", onNativeNetwork);
    
    this.cleanupListeners = [
      () => window.removeEventListener("online", reconcile),
      () => window.removeEventListener("focus", reconcile),
      () => document.removeEventListener("visibilitychange", onVisibility),
      () => window.removeEventListener("nativeBridgeMessage", onNativeNetwork),
    ];
    
    return () => this.unsubscribe();
  }

  unsubscribe() {
    if (this.channel) {
      console.log("[Realtime] Unsubscribing channel...");
      void supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.cleanupListeners.forEach((cleanup) => cleanup());
    this.cleanupListeners = [];
  }
}
