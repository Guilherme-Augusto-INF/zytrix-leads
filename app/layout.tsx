import type {Metadata,Viewport} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Zytrix Leads — oportunidades comerciais',description:'Pesquisa e organização privada de leads com evidências e controle de contato.',robots:{index:false,follow:false},manifest:'/manifest.webmanifest',applicationName:'Zytrix Leads',appleWebApp:{capable:true,title:'Zytrix Leads',statusBarStyle:'black-translucent'},icons:{icon:'/favicon.svg',apple:'/icons/apple-touch-icon.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#10111b'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}
