/* eslint-disable @next/next/no-img-element */

import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

type JwtPayload = {
    exp: number;
    role?: string;
    [key: string]: any;
};

const AppMenu = () => {
    const { layoutConfig, user } = useContext(LayoutContext);

    const isAdmin = user?.role === 'Administrador';


    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [
                { label: 'Produtos', icon: 'pi pi-fw pi-box', to: '/' },
                { label: 'Vendas', icon: 'pi pi-fw pi-shopping-cart', to: '/orders' },
                { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/clients' },

            ]
        },
        ...(isAdmin
            ? [
                {
                    label: 'Administração',
                    items: [
                        { label: 'Relatórios', icon: 'pi pi-fw pi-chart-line', to: '/reports' },
                        { label: 'Usuários', icon: 'pi pi-fw pi-user', to: '/users' },
                        { label: 'Controle de Produtos', icon: 'pi pi-fw pi-box', to: '/manageProducts' },
                    ]
                },
            ]
            : [])

    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
