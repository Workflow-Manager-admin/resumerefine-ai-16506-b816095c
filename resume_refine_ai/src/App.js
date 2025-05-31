import React, { useState } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  // Simple navigation state: "home" | "signin" | "tool"
  const [page, setPage] = useState('home');
  const [isAuth, setIsAuth] = useState(false);

  // Auth state (mock, not secure)
  const [authLoading, setAuthLoading] = useState(false);
  const [authErr, setAuthErr] = useState('');

  // Resume analysis form states
  const [userName, setUserName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // Color palette & style constants
  const palette = {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#0f3460',
    kaviaOrange: '#E87A41',
  };

  // PUBLIC_INTERFACE
  // Navigation helper
  const goto = nav => setPage(nav);

  // PUBLIC_INTERFACE
  const handleSignIn = e => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErr('');
    // Mock authentication logic, will always "succeed" after delay
    setTimeout(() => {
      setAuthLoading(false);
      setIsAuth(true);
      setPage('tool');
    }, 850);
  };

  // PUBLIC_INTERFACE
  // Fake AI suggestion generator
  const handleAnalyze = e => {
    e.preventDefault();
    if (!userName || !jobRole || !resumeFile) {
      setAiSuggestions({ error: 'Please complete all fields.'});
      return;
    }
    setAiSuggestions(null);
    // Fake async "AI" call
    setTimeout(() => {
      setAiSuggestions({
        success: true,
        tips: [
          "Tailor your summary for the " + jobRole + " role.",
          "Include quantifiable achievements in your experience section.",
          "Highlight skills that match the job description.",
          "Keep formatting clean and readable."
        ],
        // Could add more or mock different outputs by file type/role
      });
    }, 1200);
  };

  // Components - Navbar, Home, SignIn, Tool

  // PUBLIC_INTERFACE
  function Navbar() {
    return (
      <nav className="navbar" style={{background: palette.primary, borderBottom: `1px solid ${palette.accent}`}}>
        <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div className="logo">
            <span className="logo-symbol" style={{color: palette.kaviaOrange, fontSize: 24}}>📝</span> 
            <span>ResumeRefine <span style={{fontWeight: 400, color: palette.kaviaOrange}}>AI</span></span>
          </div>
          <div>
            {isAuth && (
              <button className="btn" onClick={() => {
                setIsAuth(false);
                setAiSuggestions(null);
                setResumeFile(null);
                setJobRole('');
                setUserName('');
                setPage('home');
              }}>Sign out</button>
            )}
            {!isAuth && (
              page === 'signin'
              ? <button className="btn" style={{opacity: 0.8, cursor: 'default'}}>Sign In</button>
              : <button className="btn" onClick={() => setPage('signin')}>Sign In</button>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // PUBLIC_INTERFACE
  function HomePage() {
    return (
      <div 
        style={{
          minHeight: '100vh',
          width: '100%',
          background: `linear-gradient(to top right, ${palette.secondary}AA 65%, ${palette.accent}CC 95%), url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div style={{
          width: '100vw',
          height: '100vh',
          minHeight: '100%',
          background: `rgba(26,26,46,0.7)`, 
          position: 'absolute', left:0, top:0, zIndex:0
        }} />
        <div 
          className="container" 
          style={{
            zIndex: 2, 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent:'center', 
            alignItems: 'center'
          }}
        >
          <div className="hero">
            <div className="subtitle" style={{color: palette.kaviaOrange}}>AI-Powered Resume Analysis</div>
            <h1 className="title" style={{
              textShadow:"0 4px 16px #0008", 
              fontSize: "3rem", 
              color: 'white'
            }}>
              Supercharge your Job Search
            </h1>
            <div className="description" style={{fontSize:"1.22rem", marginBottom: 28}}>
              Unlock actionable insights with ResumeRefine AI.<br />
              Upload your resume and get tailored feedback to help you land your dream job.
            </div>
            <button 
              className="btn btn-large"
              style={{fontWeight:600, background: palette.kaviaOrange, color:'white'}}
              onClick={() => goto('signin')}
            >
              Get Started &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function SignInPage() {
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    return (
      <div 
        style={{
          minHeight: '100vh',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          background: palette.secondary,
        }}
      >
        <form 
          onSubmit={handleSignIn}
          style={{
            minWidth: 320,
            maxWidth: 370,
            width: '90vw',
            background: palette.primary,
            borderRadius: 14,
            padding: '2.2rem 2rem 2rem 2rem',
            boxShadow: "0 2px 16px #0008",
            display:'flex', flexDirection:'column', gap: 22,
            zIndex: 10
          }}>
          <div className="subtitle" style={{textAlign: 'center', fontSize: "1.3rem", marginBottom: 0, color: palette.kaviaOrange}}>
            Sign In
          </div>
          <input
            type="email"
            required
            minLength={3}
            disabled={authLoading}
            placeholder="Email"
            value={email}
            autoFocus
            onChange={e=>setEmail(e.target.value)}
            style={inputStyle()}
          />
          <input
            type="password"
            required
            minLength={2}
            disabled={authLoading}
            autoComplete="current-password"
            placeholder="Password"
            value={pw}
            onChange={e=>setPw(e.target.value)}
            style={inputStyle()}
          />
          <button className="btn btn-large" type="submit" disabled={authLoading} style={{
            background: palette.kaviaOrange,
            opacity: authLoading? 0.8 : 1,
            cursor: authLoading?'progress':'pointer',
            marginTop: 10,
            fontWeight:600
          }}>
            {authLoading ? "Signing in..." : "Sign In"}
          </button>
          {authErr && <div style={{color: 'crimson', fontWeight: 500, marginTop: 8}}>{authErr}</div>}
          <div style={{fontSize: '.98em', color: "#aaa", textAlign:'center'}}>
            Not a real auth system - demo only.<br/>
            <button type="button" className="btn" onClick={()=>goto('home')} style={{background:"none", color:palette.kaviaOrange, boxShadow:"none", border:'none', textDecoration:'underline', fontSize: '1em', marginTop:10}}>Back to Home</button>
          </div>
        </form>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function MainToolPage() {
    // Responsive card layout with form and suggestions
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom right, ${palette.secondary} 65%, ${palette.primary} 100%)`,
        paddingTop: 96,
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'flex-start',
      }}>
        <div 
          className="container"
          style={{
            background: palette.primary,
            borderRadius: 16,
            margin: '32px 0',
            padding: '32px 24px 28px 24px',
            boxShadow: "0 4px 28px #000A",
            maxWidth: 440,
            width: '98vw',
            display:'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div className="subtitle" style={{color: palette.kaviaOrange, marginBottom:6}}>Resume Analyzer</div>
          <form onSubmit={handleAnalyze}>
            <div style={{display:'flex', flexDirection:'column', gap: 13}}>
              <input
                style={inputStyle()}
                required
                minLength={1}
                disabled={false}
                autoFocus
                placeholder="Your Name"
                value={userName}
                onChange={e=>setUserName(e.target.value)}
              />
              <select 
                required
                value={jobRole} 
                onChange={e=>setJobRole(e.target.value)}
                style={inputStyle()}
              >
                <option value="" disabled>Choose target job role</option>
                <option>Software Engineer</option>
                <option>Data Analyst</option>
                <option>Product Manager</option>
                <option>Designer</option>
                <option>Marketing Specialist</option>
                <option>Other...</option>
              </select>
              <label style={{color:'#bbb', marginTop: 4, fontSize:"1em", marginBottom: 8}}>
                <div>Resume File <span style={{color:"#FF8B4D", fontWeight:600}}>*</span></div>
                <input
                  data-testid="resume-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  required
                  style={{
                    ...inputStyle(),
                    padding: '8px 6px',
                    border: 'none',
                    background:'none',
                    boxShadow:'none',
                    color: '#ECECEC',
                  }}
                  onClick={e => {
                    // Reset the input so the same file can be selected again if needed
                    e.target.value = null;
                  }}
                  onChange={e => {
                    // Defensive: Ensure user can select a file (handle both single/none)
                    const fileList = e.target.files;
                    if (fileList && fileList.length > 0) {
                      setResumeFile(fileList[0]);
                    } else {
                      setResumeFile(null);
                    }
                  }}
                />
                {resumeFile && (
                  <span style={{display: "block", fontSize:".97em", color:"#aaa", marginTop:2}}>
                    Selected: {resumeFile.name}
                  </span>
                )}
              </label>
              <button className="btn btn-large" 
                  style={{background:palette.kaviaOrange, fontWeight:600, marginTop:7}}
                  type="submit"
              >
                Analyze My Resume
              </button>
            </div>
          </form>
        </div>
        
        <div 
          className="container"
          style={{
            background: palette.secondary,
            color: 'white',
            borderRadius: 16,
            padding: '28px 22px 22px 22px',
            boxShadow: "0 2px 18px #0007",
            maxWidth: 570,
            width: '99vw',
            marginBottom: 38,
            marginTop: 0,
          }}
        >
          <div className="subtitle" style={{color:palette.kaviaOrange, fontWeight:500, marginBottom:12}}>
            AI Suggestions
          </div>
          {!aiSuggestions && (
            <div style={{color:"#aaa", fontStyle:'italic', fontSize:'1.02em'}}>
              Upload your resume and click analyze to get instant, actionable improvement tips for your {jobRole ? jobRole : '[desired role]'} resume. 
            </div>
          )}
          {aiSuggestions && aiSuggestions.error && (
            <div style={{color:'crimson', fontWeight:600, fontSize:'1.1em', margin:"16px 0"}}>
              {aiSuggestions.error}
            </div>
          )}
          {aiSuggestions && aiSuggestions.success && (
            <ul style={{margin:0, paddingLeft:19, color:"#eee"}}>
              {aiSuggestions.tips.map((tip, idx) =>
                <li key={idx} style={{marginBottom:12, fontSize:'1.06em', lineHeight:'1.5'}}>
                  {tip}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Util style: Inputs
  function inputStyle() {
    return {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 6,
      outline: 'none',
      border: '1.5px solid #393965',
      background: '#232344',
      color: '#fff',
      fontSize: '1.05em',
      marginBottom: 0,
      boxShadow: "0 0 0 #0000",
      marginTop: 0,
      fontFamily: "inherit"
    };
  }

  // Responsive main UI rendering
  return (
    <div className="app" style={{background:palette.primary, color:'white', minHeight:'100vh'}}>
      <Navbar />
      <main style={{paddingTop: 72}}>
        {page === 'home' && <HomePage />}
        {page === 'signin' && <SignInPage />}
        {page === 'tool' && isAuth && <MainToolPage />}
        {page === 'tool' && !isAuth && (
          <div style={{marginTop:120, textAlign:'center', color:'crimson', fontWeight:"700", fontSize:"1.14em"}}>
            Authentication required.<br />
            <button className="btn" onClick={()=>goto('signin')} style={{marginTop:24, background:'#E87A41'}}>Sign In</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
