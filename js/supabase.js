const SUPABASE_URL = 'https://htvjyfxyegzoolowlupk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dmp5Znh5ZWd6b29sb3dsdXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDQyMTksImV4cCI6MjA2NTQ4MDIxOX0.vRqX29AzZ6gDGGo-iIUlDcuXITdXihcAAXEdMai2I0Q';

// Using the global 'supabase' object provided by the CDN script
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper for Auth
window.sb_auth = {
    async signUp(email, password) {
        return await sb.auth.signUp({ email, password });
    },
    async signIn(email, password) {
        return await sb.auth.signInWithPassword({ email, password });
    },
    async signOut() {
        return await sb.auth.signOut();
    },
    async getUser() {
        const { data: { user } } = await sb.auth.getUser();
        return user;
    }
};

// Global accessor for direct DB access
window.sb = sb;
