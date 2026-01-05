import { createContext, useContext, ReactNode } from 'react';
import { JSX } from 'react/jsx-runtime';
import Home from '../pages/Home'
import About from '../pages/About'

export interface Page {
    route: string;
    title: string;
    element: JSX.Element;
}

interface RoutingContextType {
    routing: Page[];
}

const RoutingContext = createContext<RoutingContextType | undefined>(undefined);

export const RoutingProvider = ({ children }: {children: ReactNode}) => {
    const routing = [
        { route: '/', title: 'Home', element: <Home /> },
        { route: '/about', title: 'About', element: <About /> },
    ];

    return (
        <RoutingContext.Provider value={{ routing }}>
            {children}
        </RoutingContext.Provider>
    );
}


// custom routing hook
export const useRouting = () => {
    const context = useContext(RoutingContext);
    if (!context) {
        throw new Error('useRouting must be used within a routing context provider')
    }
    return context;
}