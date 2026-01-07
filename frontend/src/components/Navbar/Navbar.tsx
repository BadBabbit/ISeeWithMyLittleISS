import React, { FC } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { JSX } from 'react/jsx-runtime';
import { useRouting, Page } from '../../contexts/RoutingContext'

const Navbar = () => {
    const { routing } = useRouting();
    return (
        <>
            {/* nav links and routes for pages retrieved from context */}
            <nav>
                {routing.map((page: Page) => (
                    // using react fragment with key prop allows react to know what page each link refers to without having to look inside. or so i'm told.
                    <React.Fragment key={page.route}> 
                        <Link to={page.route}>{page.title}</Link> |{" "}
                    </React.Fragment>
                ))}         
            </nav>
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