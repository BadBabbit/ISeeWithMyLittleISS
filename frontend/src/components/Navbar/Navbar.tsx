import React, { FC } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { JSX } from 'react/jsx-runtime';
import { useRouting, Page } from '../../contexts/RoutingContext'

const Navbar = () => {
    const { routing } = useRouting();
    return (
        <>
            {/* nav links for the pages passed as props */}
            <nav>
                {routing.map((page: Page) => (
                    // using react fragment with key prop allows react to know what page each link refers to without having to look inside.
                    <React.Fragment key={page.route}> 
                        <Link to={page.route}>{page.title}</Link> |{" "}
                    </React.Fragment>
                ))}
            </nav>
            {/* routes for the pages passed as props */}
            <Routes>
                {routing.map((page: Page) => (
                    <React.Fragment key={page.route}>
                        <Route path={page.route} element={page.element}/>
                    </React.Fragment>
                ))}
            </Routes>
        </>
    );
};

export default Navbar;