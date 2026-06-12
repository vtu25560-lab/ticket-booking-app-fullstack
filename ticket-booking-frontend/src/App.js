import React, { useState, useRef } from 'react';
import './App.css';
import { jsPDF } from "jspdf";
import QRCode from "react-qr-code"; 

function App() {
  // --- Core Application State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false); 

  // --- Auth & User State ---
  const [roleSelected, setRoleSelected] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  // --- Student Booking Information ---
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentId, setStudentId] = useState('');

  // --- NEW: OTP Verification State ---
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  // --- Events Data ---
  const [events, setEvents] = useState([
    { 
      id: 1, title: "Codeathon 2026", venue: "GK HALL", students: 1, date: "2026-05-27", price: 200, 
      registeredList: [{ name: "Priya", email: "priya@campus.edu", sid: "CS101" }] 
    },
    { id: 2, title: "Cyber Workshop", venue: "Lab 04", students: 0, date: "2026-06-12", price: 150, registeredList: [] },
    { id: 3, title: "AI Summit", venue: "Grand Hall", students: 0, date: "2026-07-19", price: 500, registeredList: [] },
    { id: 4, title: "UI/UX Meetup", venue: "Design Lab", students: 0, date: "2026-08-05", price: 100, registeredList: [] },
    { id: 5, title: "Robotics Expo", venue: "Tech Arena", students: 0, date: "2026-09-10", price: 250, registeredList: [] },
    { id: 6, title: "Cloud Connect", venue: "Seminar Room", students: 0, date: "2026-10-15", price: 350, registeredList: [] }
  ]);
  const [newEvent, setNewEvent] = useState({ title: '', venue: '', price: '', date: '' });

  // Ref for the hidden canvas used for QR conversion
  const qrCanvasRef = useRef(null);

  // ---------------------------------------------------------
  // 1. QR CODE GENERATION LOGIC
  // ---------------------------------------------------------
  const generateQRValue = (event) => {
    return JSON.stringify({
      event: event.title,
      name: studentName,
      email: studentEmail,
      studentId: studentId,
      tickets: ticketCount,
      amount: event.price * ticketCount,
      otp: enteredOtp // Included OTP in QR payload for extra security
    });
  };

  // ---------------------------------------------------------
  // 2. PDF GENERATION LOGIC (UPDATED WITH OTP IN TICKET)
  // ---------------------------------------------------------
  const downloadTicketPDF = (event, validatedOtp) => {
    // Snapshots of current state to prevent clear-out issues during PDF generation
    const snapName = studentName;
    const snapEmail = studentEmail;
    const snapId = studentId;
    const snapCount = ticketCount;

    const doc = new jsPDF();
    const svg = document.getElementById("qr-code-downloadable");
    
    if (svg) {
      // 1. Clone the SVG to avoid altering the DOM
      const svgClone = svg.cloneNode(true);
      
      // 2. Force strict pixel dimensions to prevent 0x0 rendering bug
      svgClone.setAttribute("width", "200");
      svgClone.setAttribute("height", "200");
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const canvas = document.createElement("canvas"); 
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        // Ensure a solid white background behind the QR code
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 200, 200);
        
        const qrImageBase64 = canvas.toDataURL("image/png");
        
        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("TECHFEST 2026", 105, 20, { align: "center" });
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("--------------------------------------------------", 105, 30, { align: "center" });
        
        // Left Side Text Details
        doc.text(`EVENT: ${event.title}`, 20, 45);
        doc.text(`ATTENDEE: ${snapName}`, 20, 55);
        doc.text(`EMAIL: ${snapEmail}`, 20, 65);
        doc.text(`ID: ${snapId}`, 20, 75);
        doc.text(`VENUE: ${event.venue}`, 20, 85);
        doc.text(`DATE: ${event.date}`, 20, 95);
        doc.text(`TICKETS: ${snapCount}`, 20, 105);
        
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL PAID: INR ${event.price * snapCount}`, 20, 120);
        
        // Right Side QR Code Placement
        doc.addImage(qrImageBase64, 'PNG', 140, 45, 50, 50);
        
        // NEW: Print OTP directly under the QR code
        doc.setFontSize(12);
        doc.setTextColor(255, 0, 0); // Make OTP stand out slightly
        doc.text(`OTP: ${validatedOtp}`, 165, 102, { align: "center" });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text("SCAN FOR ENTRY", 165, 110, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("This is a computer generated ticket.", 20, 140);
        doc.text("Valid ID proof & OTP required at entrance.", 20, 145);
        
        doc.save(`${snapName.replace(/\s+/g, '_')}_Ticket.pdf`);
      };
      
      // Use Base64 encoding to prevent parsing errors
      img.src = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svgData)));
    } else {
      // Fallback if no SVG is found
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("TECHFEST 2026", 105, 20, { align: "center" });
      doc.save(`${studentName}_Ticket.pdf`);
    }
  };

  // ---------------------------------------------------------
  // 3. BACKEND CONNECTIVITY
  // ---------------------------------------------------------
  const handleLogin = async () => {
    if (roleSelected === 'admin') {
      if (username === 'admin' && password === 'admin123') {
        setUserRole('admin');
        setIsLoggedIn(true);
        setError('');
      } else {
        setError('Invalid Admin Credentials');
      }
    }
    if (roleSelected === 'student') {
      try {
        const response = await fetch("http://localhost:8080/api/students/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
          setUserRole('student');
          setIsLoggedIn(true);
          setError('');
        } else {
          setError('Invalid Student Credentials');
        }
      } catch (err) {
        setError("Backend Server not reachable.");
      }
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/api/students/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        setError("");
        alert("Registration Successful!");
        setIsRegister(false);
      } else {
        setError("User already exists or registration failed.");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  // ---------------------------------------------------------
  // 4. EVENT MANAGEMENT (ADMIN)
  // ---------------------------------------------------------
  const createEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.venue || !newEvent.price || !newEvent.date) {
      alert("All fields required!");
      return;
    }
    const eventData = {
      id: Date.now(),
      title: newEvent.title,
      venue: newEvent.venue,
      price: Number(newEvent.price),
      date: newEvent.date,
      students: 0,
      registeredList: []
    };
    setEvents(prev => [...prev, eventData]);
    setShowCreateForm(false);
    setNewEvent({ title: '', venue: '', price: '', date: '' });
  };

  const deleteEvent = (id) => {
    if (window.confirm("Remove this event?")) {
      setEvents(events.filter(ev => ev.id !== id));
    }
  };

  // ---------------------------------------------------------
  // 5. BOOKING LOGIC WITH OTP (STUDENT)
  // ---------------------------------------------------------
  
  // Step 1: Initiate Booking & Send OTP
  const initiateBooking = () => {
    if (!studentName || !studentEmail || !studentId) {
      alert("Enter all student details!");
      return;
    }
    
    // Generate 4-digit OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setShowOtpInput(true); // Switch view to OTP screen

    // Simulate SMS/Email notification
    alert(`🔐 PAYMENT VERIFICATION \n\nYour OTP for payment is: ${newOtp}`);
  };

  // Step 2: Verify OTP & Confirm Booking
  const handleVerifyAndBook = () => {
    if (enteredOtp !== generatedOtp) {
      alert("❌ Invalid OTP! Please try again.");
      return;
    }

    const updatedEvents = events.map(ev =>
      ev.id === selectedEvent.id
        ? { 
            ...ev, 
            students: ev.students + ticketCount,
            registeredList: [...ev.registeredList, { name: studentName, email: studentEmail, sid: studentId, tickets: ticketCount }]
          }
        : ev
    );
    
    setEvents(updatedEvents);
    
    // Download PDF passing the validated OTP
    downloadTicketPDF(selectedEvent, enteredOtp);
    alert("✅ Booking Confirmed & PDF Downloaded!");
    
    // Reset Form Data completely
    setSelectedEvent(null);
    setTicketCount(1);
    setStudentName('');
    setStudentEmail('');
    setStudentId('');
    setShowOtpInput(false);
    setGeneratedOtp('');
    setEnteredOtp('');
  };

  // ---------------------------------------------------------
  // UI RENDERING
  // ---------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="auth-overlay">
        <div className="glass-card animate-pop">
          <h1>🎟 TECHFEST</h1>
          <p>Event Management System</p>
          {!roleSelected ? (
            <div className="btn-stack">
              <button className="btn btn-admin" onClick={() => setRoleSelected('admin')}>Admin Login</button>
              <button className="btn btn-student" onClick={() => setRoleSelected('student')}>Student Login</button>
            </div>
          ) : (
            <div className="vertical-form">
              <h3>{roleSelected.toUpperCase()} {isRegister ? 'REGISTER' : 'LOGIN'}</h3>
              <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
              <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
              {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}
              <button className="btn btn-primary" onClick={isRegister ? handleRegister : handleLogin}>
                {isRegister ? 'Sign Up' : 'Sign In'}
              </button>
              {roleSelected === 'student' && (
                <span className="toggle-auth" style={{ cursor: 'pointer', color: 'blue' }} onClick={() => setIsRegister(!isRegister)}>
                  {isRegister ? 'Back to Login' : 'New User? Register'}
                </span>
              )}
              <button className="back-btn" onClick={() => setRoleSelected(null)}>← Back</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${userRole === 'admin' ? 'admin-bg' : 'student-bg'}`}>
      <header className="navbar">
        <div className="logo">TECH<span>FEST</span></div>
        <div className="nav-controls">
          {userRole === 'admin' && (
            <button className="dashboard-toggle-btn" onClick={() => setShowDashboard(!showDashboard)}>
              {showDashboard ? "View Cards" : "📊 Dashboard"}
            </button>
          )}
          <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
        </div>
      </header>
      
      <main className="wrapper">
        {/* --- ADMIN VIEW --- */}
        {userRole === 'admin' && (
          <div className="admin-section">
            <div className="dash-header">
              <h2>{showDashboard ? "Registered Student List" : "Event Manager"}</h2>
              {!showDashboard && <button className="btn-add" onClick={() => setShowCreateForm(true)}>+ Create Event</button>}
            </div>
            
            {showDashboard ? (
              <div className="student-dashboard-table animate-pop">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Registrations</th>
                      <th>Student Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(ev => (
                      <tr key={ev.id}>
                        <td><strong>{ev.title}</strong></td>
                        <td><span className="badge">{ev.students}</span></td>
                        <td>
                          {ev.registeredList.length > 0 ? (
                            <ul className="inner-student-list">
                              {ev.registeredList.map((s, i) => (
                                <li key={i}>{s.name} ({s.sid}) - {s.email} [Tickets: {s.tickets || 1}]</li>
                              ))}
                            </ul>
                          ) : "No registrations"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="events-grid">
                {events.map(ev => (
                  <div key={ev.id} className="admin-card-pro">
                    <h3>{ev.title}</h3>
                    <p>📍 {ev.venue}</p>
                    <p>📅 {ev.date}</p>
                    <p>👨‍🎓 Registered: {ev.students}</p>
                    <div className="price-tag">₹{ev.price}</div>
                    <button className="delete-btn" onClick={() => deleteEvent(ev.id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- CREATE EVENT FORM --- */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="glass-card">
              <h3>Post New Event</h3>
              <form onSubmit={createEvent} className="vertical-form">
                <input type="text" placeholder="Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                <input type="text" placeholder="Venue" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} />
                <input type="number" placeholder="Price" value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: e.target.value})} />
                <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                <button type="submit" className="btn btn-admin">Create</button>
                <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        {/* --- STUDENT VIEW --- */}
        {userRole === 'student' && !selectedEvent && (
          <div className="student-section">
            <h2 className="section-title">Available Events</h2>
            <div className="events-grid">
              {events.map(ev => (
                <div key={ev.id} className="student-card enhanced-card">
                  <h3>{ev.title}</h3>
                  <p>📍 {ev.venue}</p>
                  <p>📅 {ev.date}</p>
                  <div className="pro-price">₹{ev.price}</div>
                  <button className="btn btn-student" onClick={() => setSelectedEvent(ev)}>Book Ticket</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ENHANCED BOOKING MODAL WITH OTP INTEGRATION --- */}
        {selectedEvent && (
          <div className="modal-overlay">
            <div className="glass-card">
              
              {!showOtpInput ? (
                // --- STEP 1: FORM INPUTS ---
                <>
                  <h2>Registration: {selectedEvent.title}</h2>
                  <div className="vertical-form">
                    <input type="text" placeholder="Your Name" value={studentName} onChange={e => setStudentName(e.target.value)} />
                    <input type="email" placeholder="Your Email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} />
                    <input type="text" placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '15px 0', padding: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 10px 0', color: '#555' }}>Base Price: ₹{selectedEvent.price} / ticket</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button onClick={() => setTicketCount(prev => Math.max(1, prev - 1))} style={{ padding: '5px 15px', fontSize: '18px', cursor: 'pointer' }}>-</button>
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{ticketCount}</span>
                        <button onClick={() => setTicketCount(prev => prev + 1)} style={{ padding: '5px 15px', fontSize: '18px', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                    <div className="total-payable-card" style={{ textAlign: 'center', marginBottom: '10px' }}>
                      <h3 style={{ color: '#2ecc71', margin: 0 }}>Total Amount: ₹{selectedEvent.price * ticketCount}</h3>
                    </div>
                    
                    <div style={{ marginTop: "10px", textAlign: "center", position: "relative" }}>
                      {/* Hidden QR generation for the PDF capture */}
                      <div style={{ position: 'absolute', opacity: 0, zIndex: -1 }}>
                        <QRCode id="qr-code-downloadable" value={generateQRValue(selectedEvent)} size={150} />
                      </div>
                    </div>
                    
                    <button className="btn btn-student" onClick={initiateBooking}>Proceed to Pay</button>
                    <button className="back-btn" onClick={() => { setSelectedEvent(null); setTicketCount(1); }}>Cancel</button>
                  </div>
                </>
              ) : (
                // --- STEP 2: OTP VERIFICATION ---
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <h2 style={{ marginBottom: '15px' }}>Verify Payment</h2>
                  <p style={{ color: '#555', marginBottom: '20px', lineHeight: '1.5' }}>
                    Please enter the 4-digit OTP sent to your registered device to confirm a payment of <strong style={{ color: '#2ecc71' }}>₹{selectedEvent.price * ticketCount}</strong>.
                  </p>
                  
                  <input 
                    type="text" 
                    placeholder="Enter 4-Digit OTP" 
                    value={enteredOtp} 
                    onChange={e => setEnteredOtp(e.target.value)}
                    maxLength={4}
                    style={{ 
                      textAlign: 'center', 
                      fontSize: '24px', 
                      letterSpacing: '5px', 
                      fontWeight: 'bold', 
                      padding: '15px',
                      marginBottom: '25px',
                      width: '80%',
                      boxSizing: 'border-box'
                    }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <button className="btn btn-student" style={{ width: '80%', background: '#2ecc71' }} onClick={handleVerifyAndBook}>
                      Verify & Download Ticket
                    </button>
                    <button className="back-btn" onClick={() => { setShowOtpInput(false); setEnteredOtp(''); }}>
                      Cancel & Go Back
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;