import React, {FC} from 'react';
import APIStatusLight from '../APIStatusLight/APIStatusLight'
import Navbar from '../Navbar/Navbar'
import { JSX } from 'react/jsx-runtime';


const Banner = () => {
    return (
        <>
            <Navbar />
            <APIStatusLight />
        </>
    )
} 

export default Banner