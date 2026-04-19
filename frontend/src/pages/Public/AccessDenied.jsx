import React from "react";

function AccessDenied() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-4 text-center ">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    </div>
  );
}

export default AccessDenied;
