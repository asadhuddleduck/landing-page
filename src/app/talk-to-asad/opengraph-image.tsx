import { ImageResponse } from 'next/og';
export const runtime='nodejs';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{display:'flex',flexDirection:'column',justifyContent:'space-between',padding:75,width:'100%',height:'100%',background:'#f6f7f2',color:'#08140f',fontFamily:'sans-serif'}}><div style={{fontSize:28,color:'#138361'}}>HUDDLE DUCK · TALK TO ASAD</div><div style={{display:'flex',flexDirection:'column',fontSize:88,fontWeight:700,lineHeight:1.05,letterSpacing:-4}}>One conversation.<br/>A clear next move.</div><div style={{fontSize:27}}>Private marketing advice with Asad Shah</div></div>,size);}
