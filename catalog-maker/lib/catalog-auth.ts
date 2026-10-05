import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {SESSION_COOKIE,validSession} from './admin-session';
export async function isAdmin(){const user=await getChatGPTUser();const allowed=String((env as any).ADMIN_EMAILS||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);if(user&&allowed.includes(user.email.toLowerCase()))return true;return validSession((await cookies()).get(SESSION_COOKIE)?.value);}
export function validOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin;}
