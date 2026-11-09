import { ImageResponse } from 'next/og';
export const runtime = 'nodejs';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';
export const alt = 'MR. ASAD: know exactly what to fix before you spend another penny';
export default function Image(){return new ImageResponse(
  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, width: '100%', height: '100%', background: '#101214', color: '#ece8e0', fontFamily: 'sans-serif'}}>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{fontSize: 40, fontWeight: 900, letterSpacing: -1}}>MR. ASAD</div>
      <div style={{display: 'flex', width: 220, height: 16, borderRadius: 8, background: 'linear-gradient(90deg,#e9a19a,#f4f093,#cbe2c7,#8bbee5)'}}/>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', fontSize: 84, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3}}>
      <span>know exactly what to fix</span>
      <span style={{display: 'flex'}}><span style={{background: '#f4f093', color: '#101214', borderRadius: 12, padding: '0 14px'}}>before you spend another penny.</span></span>
    </div>
    <div style={{fontSize: 30, color: '#adb1af'}}>a private one to one call with Asad. from £250.</div>
  </div>, size);}
