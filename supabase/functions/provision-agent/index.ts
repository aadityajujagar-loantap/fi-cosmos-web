import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

type AgentInput = {
  name?: string;
  phone?: string;
  email?: string;
  branchId?: string;
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authorization || !supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Supabase function configuration is incomplete." }, 401);
  }

  const token = authorization.replace(/^Bearer\s+/i, "");
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Authentication required." }, 401);

  const { data: adminProfile } = await adminClient
    .from("profiles")
    .select("role, active")
    .eq("id", authData.user.id)
    .single();
  if (adminProfile?.role !== "ADMIN" || !adminProfile.active) {
    return json({ error: "ADMIN role required." }, 403);
  }

  const input = await request.json() as AgentInput;
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const branchId = input.branchId?.trim() ?? "";
  if (!name || !email.includes("@") || phone.replace(/\D/g, "").length < 10 || !branchId) {
    return json({ error: "Valid name, email, phone number, and branch are required." }, 400);
  }

  let createdAuthUserId: string | null = null;
  const { data: existingProfile } = await adminClient.from("profiles").select("id").ilike("email", email).maybeSingle();
  if (!existingProfile) {
    const { data: createdAuth, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password: Deno.env.get("AGENT_COMMON_PASSWORD") ?? "FiAgent@123",
      email_confirm: true,
      user_metadata: { display_name: name },
    });
    if (createAuthError || !createdAuth.user) {
      return json({ error: createAuthError?.message ?? "Supabase Auth user could not be created." }, 409);
    }
    createdAuthUserId = createdAuth.user.id;
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: agentId, error: provisionError } = await callerClient.rpc("provision_agent", {
    p_email: email,
    p_display_name: name,
    p_phone: phone,
    p_branch_id: branchId,
  });

  if (provisionError || typeof agentId !== "string") {
    if (createdAuthUserId) await adminClient.auth.admin.deleteUser(createdAuthUserId);
    return json({ error: provisionError?.message ?? "Field Agent could not be provisioned." }, 400);
  }

  return json({ agentId });
});
