import { Metadata } from 'next';
import AppConfig from '../../layout/AppConfig';
import React from 'react';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    metadataBase: new URL('http://localhost:3000'),
    title: 'Lis Hub',
    description: 'Lis Hub - A sua plataforma de gestão financeira',
};

export default function SimpleLayout({ children }: SimpleLayoutProps) {
    return (
        <React.Fragment>
            {children}
            <AppConfig simple />
        </React.Fragment>
    );
}
