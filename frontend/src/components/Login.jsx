import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BACKEND_URL = "https://team-task-manager-redesigned-production.up.railway.app";

export default function Login() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id:   data.user?.id   || data.user?._id,
        name: data.user?.name,
        role: data.user?.role || "user",
      }));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const avatarColors = ["#6C47FF","#FF5F40","#00C9A7","#FFAB00","#0EA5E9"];

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", background:"#F8F7FF", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .auth-input{width:100%;background:#fff;border:1.5px solid #E4DFFF;border-radius:8px;padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#1A1030;outline:none;transition:border-color .18s,box-shadow .18s}
        .auth-input:focus{border-color:#6C47FF;box-shadow:0 0 0 3px rgba(108,71,255,.12)}
        .auth-input::placeholder{color:#9994B8}
        .auth-btn{width:100%;background:#6C47FF;color:#fff;border:none;border-radius:12px;padding:14px;font-family:'DM Sans',sans-serif;font-size:16px;font-weight:600;cursor:pointer;transition:all .18s;box-shadow:0 4px 14px rgba(108,71,255,.35)}
        .auth-btn:hover{background:#4A28D4;transform:translateY(-1px);box-shadow:0 6px 20px rgba(108,71,255,.45)}
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
        <div style={{ position:"relative", zIndex:1, textAlign:"center", color:"white" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:32 }}>
            {avatarColors.map((c,i) => (
              <div key={i} style={{ width:44,height:44,borderRadius:"50%",background:c,border:"3px solid rgba(255,255,255,.4)",marginLeft:i>0?-14:0,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14 }}>
                {["A","T","S","R","M"][i]}
              </div>
            ))}
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:800, lineHeight:1.15, marginBottom:16 }}>
            Your Team's<br/>Command Centre
          </h1>
          <p style={{ fontSize:16, opacity:.85, maxWidth:320, margin:"0 auto", lineHeight:1.6 }}>
            Assign tasks, track progress in real-time, and keep your whole team in sync.
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:40 }}>
            {[{label:"Tasks Done",value:"1,240+",icon:"✅"},{label:"Teams",value:"180+",icon:"👥"}].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,.15)",backdropFilter:"blur(8px)",borderRadius:14,padding:"16px 24px",textAlign:"center",border:"1px solid rgba(255,255,255,.2)" }}>
                <div style={{ fontSize:24 }}>{s.icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,marginTop:4 }}>{s.value}</div>
                <div style={{ fontSize:12,opacity:.75,textTransform:"uppercase",letterSpacing:".05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"48px 40px",overflowY:"auto" }}>
        <div className="fade-up" style={{ width:"100%",maxWidth:420 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:36 }}>
            <div style={{ width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#6C47FF,#FF5F40)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20 }}>T</div>
            <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#1A1030" }}>TaskFlow</span>
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,marginBottom:6,color:"#1A1030" }}>Welcome back 👋</h2>
          <p style={{ color:"#5E5A7A",fontSize:14,marginBottom:28 }}>Sign in to your workspace</p>

          {error && <div style={{ padding:"12px 16px",background:"#FFF0ED",color:"#FF5F40",border:"1px solid rgba(255,95,64,.2)",borderRadius:8,fontSize:13,fontWeight:500,marginBottom:16 }}>{error}</div>}

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#5E5A7A",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em" }}>Email</label>
              <input className="auth-input" type="email" name="email" placeholder="you@company.com" value={form.email} onChange={onChange} required />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#5E5A7A",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em" }}>Password</label>
              <input className="auth-input" type="password" name="password" placeholder="Your password" value={form.password} onChange={onChange} required />
            </div>
            <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop:8 }}>
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign:"center",marginTop:24,fontSize:14,color:"#5E5A7A" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color:"#6C47FF",fontWeight:600,textDecoration:"none" }}>Create one</Link>
          </p>

          <div style={{ marginTop:32,padding:"14px 16px",background:"#F3F0FF",borderRadius:10,border:"1.5px solid #E4DFFF",fontSize:13,color:"#5E5A7A",lineHeight:1.6 }}>
            <span style={{ fontWeight:700,color:"#1A1030" }}>💡 Roles:</span>{" "}
            <strong>Admin</strong> — projects, task assignment & team monitoring.{" "}
            <strong>User</strong> — view and manage assigned tasks.
          </div>
        </div>
      </div>
    </div>
  );
}
