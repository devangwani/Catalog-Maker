import {redirect} from 'next/navigation';
import {isAdmin} from '@/lib/catalog-auth';
import {chatGPTSignInPath} from '@/app/chatgpt-auth';
import LoginForm from './form';
export const dynamic='force-dynamic';
export default async function Page(){if(await isAdmin())redirect('/admin');return <LoginForm ownerSignIn={chatGPTSignInPath('/admin')}/>;}
