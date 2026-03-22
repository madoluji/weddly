'use client';

import DisplayProfile from '@/app/ui/client-components/clientProfile';
import React from 'react';


const Profile: React.FC = ({ }) => {
    return (
        <div >
            <h1 className='text-5xl font-semibold text-center mt-5'>Client Profile</h1>
           <DisplayProfile />
        </div>
    );
};



export default Profile;