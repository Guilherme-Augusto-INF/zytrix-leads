import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Zytrix Leads — oportunidades comerciais',description:'Pesquisa e organização privada de leads com evidências e controle de contato.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}
