const express=require('express');const cors=require('cors');const rateLimit=require('express-rate-limit');const {Resend}=require('resend');
const app=express();const PORT=process.env.PORT||3000;
app.set('trust proxy',1);
const allowed=(process.env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
app.use(cors({origin:(origin,cb)=>{if(!origin||!allowed.length||allowed.includes(origin))return cb(null,true);cb(new Error('Origin not allowed'));}}));
app.use(express.json({limit:'20kb'}));app.use('/api/enquiry',rateLimit({windowMs:15*60*1000,max:8,standardHeaders:true,legacyHeaders:false}));
app.use('/api/chat',rateLimit({windowMs:60*1000,max:15,standardHeaders:true,legacyHeaders:false}));
const clean=(v,n)=>String(v??'').trim().slice(0,n);const emailOK=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
app.get('/health',(_,r)=>r.json({ok:true}));
app.post('/api/enquiry',async(req,res)=>{try{if(clean(req.body.website,100))return res.status(400).json({error:'Spam detected.'});
const name=clean(req.body.name,100),email=clean(req.body.email,160),phone=clean(req.body.phone,60),service=clean(req.body.service,120),budget=clean(req.body.budget,120),message=clean(req.body.message,5000);
if(!name||!email||!message)return res.status(400).json({error:'Name, email and message are required.'});if(!emailOK(email))return res.status(400).json({error:'Invalid email.'});
const {RESEND_API_KEY,TO_EMAIL,FROM_EMAIL}=process.env;if(!RESEND_API_KEY||!TO_EMAIL||!FROM_EMAIL)return res.status(500).json({error:'Email service is not configured.'});
const resend=new Resend(RESEND_API_KEY);const {data,error}=await resend.emails.send({from:FROM_EMAIL,to:[TO_EMAIL],replyTo:email,subject:`New BK Software Developers enquiry — ${name}`,html:`<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto"><h2>New Project Enquiry</h2><hr><p><b>Name:</b> ${esc(name)}</p><p><b>Email:</b> ${esc(email)}</p><p><b>Phone / WhatsApp:</b> ${esc(phone||'Not provided')}</p><p><b>Service:</b> ${esc(service||'Not specified')}</p><p><b>Budget:</b> ${esc(budget||'Not specified')}</p><h3>Project message</h3><p style="white-space:pre-wrap">${esc(message)}</p></div>`});
if(error)return res.status(502).json({error:'Email provider rejected the enquiry.'});res.json({ok:true,id:data?.id||null});}catch(e){console.error(e);res.status(500).json({error:'Unexpected server error.'});}});

const CHAT_MODEL='gemini-3.6-flash';
const CHAT_SYSTEM=`You are the website assistant for BK Software Developers, based in Ntinda, Kampala, Uganda. `
  +`They build websites, mobile apps, cloud platforms and HR software for businesses like schools, hospitals and supermarkets. `
  +`Be concise, friendly and helpful. If asked something you're unsure about (exact pricing, timelines for a specific project), `
  +`say a team member can confirm details, and suggest WhatsApp (+256 794 431395) or the contact form. Do not invent facts about the company.`;
app.post('/api/chat',async(req,res)=>{try{
const {GEMINI_API_KEY}=process.env;if(!GEMINI_API_KEY)return res.status(500).json({error:'Chat assistant is not configured.'});
const message=clean(req.body.message,2000);if(!message)return res.status(400).json({error:'Message is required.'});
const history=Array.isArray(req.body.history)?req.body.history.slice(-20):[];
const contents=[...history,{role:'user',parts:[{text:message}]}];
const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent`,{
  method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':GEMINI_API_KEY},
  body:JSON.stringify({contents,systemInstruction:{parts:[{text:CHAT_SYSTEM}]}})
});
if(!r.ok){console.error('Gemini error',r.status,await r.text());return res.status(502).json({error:'Assistant is temporarily unavailable.'});}
const data=await r.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text||"Sorry, I couldn't come up with a reply just now.";
res.json({reply});
}catch(e){console.error(e);res.status(500).json({error:'Unexpected server error.'});}});

app.listen(PORT,()=>console.log(`BK enquiry API listening on ${PORT}`));
