import React, { FC } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { JSX } from 'react/jsx-runtime';

interface Page {
    route: string;
    title: string;
    element: JSX.Element;
}

interface NavbarProps {
    pages: Page[];
}

const Navbar: FC<NavbarProps> = ({pages}) => {
    return (
        <>
            {/* nav links for the pages passed as props */}
            <nav>
                {pages.map(page => (
                    // using react fragment with key prop allows react to know what page each link refers to without having to look inside.
                    <React.Fragment key={page.route}> 
                        <Link to={page.route}>{page.title}</Link> |{" "}
                    </React.Fragment>
                ))}
            </nav>
            {/* routes for the pages passed as props */}
            <Routes>
                {pages.map(page => (
                    <React.Fragment key={page.route}>
                        <Route path={page.route} element={page.element}/>
                    </React.Fragment>
                ))}
            </Routes>
        </>
    );
};

export default Navbar;