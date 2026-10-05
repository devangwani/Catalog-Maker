import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'Catalog Maker | The Rug Edit',description:'Browse rugs, save your favourites, and enquire on WhatsApp.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
