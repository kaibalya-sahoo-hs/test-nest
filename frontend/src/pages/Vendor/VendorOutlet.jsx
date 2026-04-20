import React, { useEffect } from 'react'
import toast from 'react-hot-toast';
import { Outlet, useNavigate } from 'react-router';
import AccessDenied from '../Public/AccessDenied';

function VendorOutlet() {
  const accessToken = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate()

  useEffect(() => {
    if(!accessToken || !user || user.role !== 'vendor') {
      toast.error('Unauthorized access. Please log in as a vendor.');
      return navigate('/access/denied');
    }

  }, [])


  return (
    <div>
      <Outlet/>
    </div>
  )
}

export default VendorOutlet