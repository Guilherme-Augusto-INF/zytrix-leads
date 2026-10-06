'use client';
import {useEffect,useRef,useState} from 'react';
import {Download,WifiOff,X} from 'lucide-react';

type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export default function PwaClient(){
  const [offline,setOffline]=useState(false),[installed,setInstalled]=useState(false),[canInstall,setCanInstall]=useState(false),[installing,setInstalling]=useState(false),[message,setMessage]=useState('');
  const install=useRef<InstallEvent|null>(null),help=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const media=window.matchMedia('(display-mode: standalone)');
    const connectivity=()=>setOffline(!navigator.onLine);
    const standalone=()=>setInstalled(media.matches||!!(navigator as Navigator&{standalone?:boolean}).standalone);
    const before=(e:Event)=>{e.preventDefault();install.current=e as InstallEvent;setCanInstall(true);};
    const done=()=>{install.current=null;setCanInstall(false);setInstalled(true);};
    const initial=setTimeout(()=>{connectivity();standalone();},0);
    window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);
    window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',done);
    media.addEventListener('change',standalone);
    if('serviceWorker' in navigator&&window.isSecureContext){void navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{setMessage('Instalação offline indisponível neste navegador. Você pode continuar usando o site.');});}
    return()=>{clearTimeout(initial);window.removeEventListener('online',connectivity);window.removeEventListener('offline',connectivity);window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done);media.removeEventListener('change',standalone);};
  },[]);
  const requestInstall=async()=>{
    const event=install.current;if(!event){help.current?.showModal();return;}
    install.current=null;setCanInstall(false);setInstalling(true);
    try{await event.prompt();await event.userChoice;}catch{help.current?.showModal();}finally{setInstalling(false);}
  };
  return <>
    {offline&&<div className="alert offline-banner" role="status"><WifiOff size={20}/><span>Sem conexão. Consultas e alterações precisam de internet. Nenhuma alteração será enviada automaticamente.</span></div>}
    {!installed&&<section className="install-strip" aria-label="Instalar aplicação"><div><b>Zytrix no seu celular</b><small>Acesso pela tela inicial. Sua conta continua protegida.</small></div><button disabled={installing||offline} onClick={()=>void requestInstall()}><Download size={17}/>{canInstall?'Instalar app':'Como instalar'}</button></section>}
    {message&&<p className="muted" role="status">{message}</p>}
    <dialog className="install-help" ref={help} aria-labelledby="install-title"><div className="mobile-menu-head"><h2 id="install-title">Instalar Zytrix Leads</h2><button aria-label="Fechar instruções" onClick={()=>help.current?.close()}><X/></button></div><p>Abra o endereço no navegador do celular e entre com a sua conta.</p><ol><li><b>Android (Chrome):</b> menu ⋮ → Adicionar à tela inicial → Instalar, quando disponível.</li><li><b>iPhone (Safari):</b> Compartilhar → Adicionar à Tela de Início → Adicionar.</li></ol><p>Se o botão não aparecer, use o menu do navegador. Navegadores internos de redes sociais podem não permitir instalação.</p><p className="muted">A busca e o salvamento exigem internet. Os avisos de agenda funcionam com o app aberto. Leads e mensagens não são armazenados no cache offline.</p><button className="primary" onClick={()=>help.current?.close()}>Entendi</button></dialog>
  </>;
}
