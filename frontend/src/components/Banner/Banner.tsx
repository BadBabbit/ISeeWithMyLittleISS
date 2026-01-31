import React, {FC} from 'react';
import APIStatusLight from '../APIStatusLight/APIStatusLight'
import Navbar from '../Navbar/Navbar'
import { JSX } from 'react/jsx-runtime';
import styles from './Banner.module.css'

const Banner = () => {
    return (
        <div className={`${styles['banner']}`}>
            <Navbar />
            <APIStatusLight />
        </div>
    )
} 

export default Banner