import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BACKEND_URL = "https://team-task-manager-redesigned-production.up.railway.app";

export default function Register() {
  const [form, setForm]       = useState({ name:"", email:"", password:"", role:"user" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon:"🚀", title:"Instant Onboarding",  desc:"Set up your workspace in under 2 minutes." },
    { icon:"🎯", title:"Role-Based Access",    desc:"Admin and User roles with precise controls." },
    { icon:"⏱️", title:"Time Tracking",         desc:"Automatic execution timers for every task." },
    { icon:"🟢", title:"Live Presence",         desc:"See who's online across your entire team." },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", background:"#F8F7FF", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .auth-input{width:100%;background:#fff;border:1.5px solid #E4DFFF;border-radius:8px;padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#1A1030;outline:none;transition:border-color .18s,box-shadow .18s}
        .auth-input:focus{border-color:#6C47FF;box-shadow:0 0 0 3px rgba(108,71,255,.12)}
        .auth-input::placeholder{color:#9994B8}
        .auth-btn{width:100%;background:#6C47FF;color:#fff;border:none;border-radius:12px;padding:14px;font-family:'DM Sans',sans-serif;font-size:16px;font-weight:600;cursor:pointer;transition:all .18s;box-shadow:0 4px 14px rgba(108,71,255,.35)}
        .auth-btn:hover{background:#4A28D4;transform:translateY(-1px)}
        .auth-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
        .blob{width:200px;height:200px;border-radius:60% 40% 70% 30%/50% 60% 40% 50%;background:rgba(255,255,255,.15);position:absolute;top:40%;left:20%;animation:blobMorph 8s ease-in-out infinite}
        @keyframes blobMorph{0%,100%{border-radius:60% 40% 70% 30%/50% 60% 40% 50%}33%{border-radius:40% 60% 30% 70%/60% 40% 60% 40%}66%{border-radius:70% 30% 50% 50%/30% 70% 30% 70%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .4s ease both}
        .spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){.auth-panel{display:none!important}.auth-root{grid-template-columns:1fr!important}}
      `}</style>

      {/* Left panel */}
      <div className="auth-panel" style={{ background:"linear-gradient(145deg,#6C47FF 0%,#A78BFF 50%,#FF5F40 100%)", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"48px", position:"relative", overflow:"hidden" }}>
        <div className="blob" />
        <div style={{ position:"relative", zIndex:1, color:"white", width:"100%", maxWidth:380 }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:34, fontWeight:800, lineHeight:1.15, marginBottom:12 }}>
            Everything your<br/>team needs ✨
          </h1>
          <p style={{ fontSize:15, opacity:.85, marginBottom:36, lineHeight:1.6 }}>
            Join thousands of teams who track, assign, and ship work together on TaskFlow.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {features.map(f => (
              <div key={f.title} style={{ display:"flex", alignItems:"flex-start", gap:14, background:"rgba(255,255,255,.12)", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(255,255,255,.18)", backdropFilter:"blur(8px)" }}>
                <span style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:2 }}>{f.title}</div>
                  <div style={{ fontSize:13, opacity:.75 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"48px 40px", overflowY:"auto" }}>
        <div className="fade-up" style={{ width:"100%", maxWidth:420 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36 }}>
            <div style={{ width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#6C47FF,#FF5F40)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20 }}>T</div>
            <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#1A1030" }}>TaskFlow</span>
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,marginBottom:6,color:"#1A1030" }}>Create your account</h2>
          <p style={{ color:"#5E5A7A",fontSize:14,marginBottom:28 }}>Join your team workspace today</p>

          {error && <div style={{ padding:"12px 16px",background:"#FFF0ED",color:"#FF5F40",border:"1px solid rgba(255,95,64,.2)",borderRadius:8,fontSize:13,fontWeight:500,marginBottom:16 }}>{error}</div>}

          <form onSubmit={onSubmit}>
            {[
              { name:"name",     label:"Full Name",  type:"text",     placeholder:"Alex Johnson" },
              { name:"email",    label:"Email",      type:"email",    placeholder:"you@company.com" },
              { name:"password", label:"Password",   type:"password", placeholder:"Minimum 6 characters" },
            ].map(f => (
              <div key={f.name} style={{ marginBottom:16 }}>
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#5E5A7A",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em" }}>{f.label}</label>
                <input className="auth-input" type={f.type} name={f.name} placeholder={f.placeholder} value={form[f.name]} onChange={onChange} required />
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#5E5A7A",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em" }}>Role</label>
              <select className="auth-input" name="role" value={form.role} onChange={onChange} style={{ cursor:"pointer" }}>
                <option value="user">User — Can manage assigned tasks</option>
                <option value="admin">Admin — Full team management access</option>
              </select>
            </div>
            <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop:8 }}>
              {loading ? <span className="spinner" /> : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign:"center",marginTop:24,fontSize:14,color:"#5E5A7A" }}>
            Already have an account?{" "}
            <Link to="/" style={{ color:"#6C47FF",fontWeight:600,textDecoration:"none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
