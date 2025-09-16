import { NextRequest, NextResponse } from "next/server";
import {jwtDecode} from "jwt-decode";
import path from "path";

const publicRoutes = [
  {path: '/login', whenAuthenticated: 'redirect'},
  {path: '/resetPassword', whenAuthenticated: 'next'},
] as const

const adminRoutes = [
  {path: '/users', whenAuthenticated: 'next'},
  {path: '/manageProducts', whenAuthenticated: 'next'},

] as const

type JwtPayload = {
  exp: number;
  user?: {
    role?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

type TokenStatus = {
  expired: boolean;
  isAdmin: boolean;
  payload?: JwtPayload;
};

export function checkTokenStatus(token: string): TokenStatus {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Math.floor(Date.now() / 1000);
    const sixHours = 6 * 60 * 60;

    // Considera o token expirado se o tempo atual for maior que o exp ou se o exp for maior que 6h
    const expired = decoded.exp < now || decoded.exp > now + sixHours;

    return {
      expired,
      isAdmin: decoded.role === 'Administrador',
      payload: decoded
    };
  } catch {
    return { expired: true, isAdmin: false };
  }
}

export function middleware(req: NextRequest){
  const pathname = req.nextUrl.pathname

  // Permite todas as requisições para rotas API
  if (pathname.startsWith('/api/')) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      const response = NextResponse.next()
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }
    
    return NextResponse.next()
  }

  console.log('Middleware:', pathname)

  const publicRoute = publicRoutes.find(route => route.path === pathname)
  const adminRoute = adminRoutes.find(route => route.path === pathname)
  const authToken = req.cookies.get('lisToken')?.value

  //Usuario não esta autenticado e a rota é publica
  if(!authToken && publicRoute){
    return NextResponse.next()
  }

  //Usuario não esta autenticado e a rota não é publica
  if(!authToken && !publicRoute){

    //Redireciona para o login
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
    
  }

  //Usuario esta autenticado e a rota é publica e o comportamento é redirecionar
  if(authToken && publicRoute && publicRoute.whenAuthenticated === 'redirect'){

    //Redireciona direto para a home
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  //Usuario esta autenticado e a rota é privada
  if(authToken && !publicRoute && !adminRoute){

    //Verifica se o token é valido
    const { expired } = checkTokenStatus(authToken);

    if (expired) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      req.cookies.delete('lisToken')
      return NextResponse.redirect(redirectUrl)
    }
    
    return NextResponse.next()
  }

  //Usuario esta autenticado e a rota é privada e admin
  if(authToken && !publicRoute && adminRoute){

    //Verifica se o usuario é admin e esta valido
    const { expired,  isAdmin } = checkTokenStatus(authToken);

    if (expired) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      req.cookies.delete('lisToken')
      return NextResponse.redirect(redirectUrl)
    }

    // Se o usuário não for admin, redireciona para a home
    if (!isAdmin) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
    
    return NextResponse.next()
  }


  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/|_next/|static/|images/|favicon.ico|\.).*)',
  ],
}
export default middleware
