import React from 'react'

const AdminDashboard = () => {
  return (
    <div className="container">
      <div className="mt-8 card">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md">Users: 124</div>
          <div className="p-4 border rounded-md">Pets: 412</div>
          <div className="p-4 border rounded-md">Open Consults: 8</div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
